import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Literal, Dict, Any

from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv

load_dotenv()

# --- LLM & browser-use ---
from browser_use import Agent, Browser, ChatOpenAI

# --- REQUIRED local device controller ---
from py_interaction import HostDevice

APP = FastAPI(title="Autonomous Job Application Agent", version="1.1.0")

ART_DIR = Path("artifacts"); ART_DIR.mkdir(parents=True, exist_ok=True)
SCR_DIR = ART_DIR / "screens"; SCR_DIR.mkdir(parents=True, exist_ok=True)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class ApplyRequest(BaseModel):
    job_url: HttpUrl
    test_data_path: Path = Path("data/test_data.json")
    cv_path: Optional[Path] = None
    session_mode: Literal["host"] = "host"
    timeout_seconds: int = 600
    user_data_dir: Optional[Path] = None
    profile_directory: Optional[str] = "Default"
    # Optional: force “site accelerator” hints for known hosts
    site_hint: Optional[Literal["appcast", "smartrecruiters"]] = None

class ApplyResponse(BaseModel):
    run: Dict[str, Any]

# ---------- UPDATED SYSTEM PROMPT ----------
SYSTEM_PROMPT = """
You are an autonomous web-application agent that controls a real browser via the provided device.
MISSION: Fill ALL required fields on the FIRST page of a job application using provided candidate data,
then click Next/Continue to reach page 2. STOP immediately on page 2 and return artifacts.

HARD CONSTRAINTS
- Use py_interaction.HostDevice (and ONLY that path) for: click, type, select, scroll, upload, wait,
  switch_iframe, and screenshot. Do not modify user data or files.
- If a resume uploader exists and cv_path is provided, upload and wait for processing.
- Never navigate away from the application host except internal steps of the flow.

DISCOVERY & MAPPING
- Build a field catalog: label/aria/placeholder/nearby text → input type.
- Determine required via asterisks, aria-required, or inline errors.
- Normalize fields: question_text, control_type (text|textarea|select|radio|checkbox|date|file|address|email|phone|upload-resume),
  required flag, options, locator css/xpath, inferred_key.
- Map values SEMANTICALLY:
  * Motivation/free-text → motivation.what_drew_you_to_healthcare (DO NOT use digits-only values here).
  * Over 18 → eligibility.over_18 (Yes/No radios).
  * Sponsorship → eligibility.require_sponsorship (No means false).
  * Professional license → eligibility.professional_license.
  * Years of experience → experience.years_related_role (select matching “8+ years” or closest).
  * Email/phone/address → personal_information.{email,phone,address}.
- If multiple candidates for a label exist, prefer the one whose synonyms match:
  * {“what drew you”, “motivation”, “why healthcare”} → motivation.what_drew_you_to_healthcare
  * {“years”, “experience”, "related role"} → experience.years_related_role

VALIDATION & ADVANCE
- After filling required fields, blur to trigger validation; fix simple format hints.
- Ensure checkboxes (e.g., consents) are ticked if required.
- Find enabled Next/Continue button (by role/text). Click it.
- Detect page 2 via ANY: URL change, title/headline change, step indicator advance, or new form root node.
- STOP IMMEDIATELY after page 2 detected.

TRACES & PRIVACY
- For each action: ts, action, target (css/xpath/text_snippet), value (mask PII), screenshot at milestones.
- Mask PII in traces (emails/phones/addresses). Do NOT mask values you type into the form.

OUTPUT JSON (return this object)
meta: job_url, session_mode, start_ts, end_ts, duration_seconds
page1: { questions[], resume_upload{}, advance{} }
page2_detection: { detected, signal, details }
traces[], errors[]
"""

# ---------- SITE ACCELERATOR HINTS ----------
# Lightweight, non-invasive selectors for common widgets to reduce discovery time.
SITE_ACCELERATOR = {
    "appcast": {
        "radio_yes": "//label[normalize-space()='Yes']",
        "radio_no": "//label[normalize-space()='No']",
        "years_dropdown": "//label[contains(.,'How many years')]/following::div[contains(@role,'combobox')][1]",
        "years_option_fmt": "//div[@role='option' and normalize-space()='{label}']",
        "next_btn": "//button[.//text()[contains(.,'Next')] or .//text()[contains(.,'Continue')]]"
    },
    "smartrecruiters": {
        "next_btn": "//button[contains(.,'Next') or contains(.,'Continue')]"
    }
}

def build_task(candidate: dict, job_url: str, cv_path: Optional[Path], site_hint: Optional[str]) -> str:
    return f"""
Apply to: {job_url}

Candidate (read-only):
{json.dumps(candidate, indent=2)}

cv_path: {str(cv_path) if cv_path else None}
site_hint: {site_hint or 'auto'}

Requirements:
- Use HostDevice via Browser(device=HostDevice()).
- Fill all required fields on page 1 correctly, including radios and selects.
- Motivation field MUST use motivation.what_drew_you_to_healthcare (never numbers/ZIP).
- Experience years must choose label equal/closest to "{candidate.get('experience',{}).get('years_related_role','')}".
- Click Next/Continue, detect page 2, STOP, and return JSON artifacts + traces.
"""

async def run_agent(req: ApplyRequest) -> Dict[str, Any]:
    # Load candidate json
    try:
        with open(req.test_data_path, "r") as f:
            candidate = json.load(f)
    except Exception as e:
        raise HTTPException(400, f"Unable to read test_data.json: {e}")

    # Deterministic model settings
    llm = ChatOpenAI(
        model=os.getenv("AGENT_MODEL", "gpt-4.1-mini"),
        temperature=0.2,
        max_tokens=1600,
    )

    # Device + Browser (HostDevice is REQUIRED)
    device = HostDevice()
    browser_kwargs = {}
    if req.user_data_dir:
        browser_kwargs["user_data_dir"] = str(req.user_data_dir)
    if req.profile_directory:
        browser_kwargs["profile_directory"] = req.profile_directory

    # For now, use Browser without device parameter since browser-use doesn't support it
    # In a real implementation, the Browser would be modified to accept HostDevice
    browser = Browser(**browser_kwargs)

    # Build task string
    task = build_task(candidate, str(req.job_url), req.cv_path, req.site_hint)

    # Agent with budgets & paths
    agent = Agent(
        task=task,
        llm=llm,
        browser=browser,
        system_prompt=SYSTEM_PROMPT,
        screenshots_path=str(SCR_DIR),
        max_steps=48,                            # planning/acting budget
        retry_policy={"max": 3, "backoff_ms": 300},  # gentle retries
        site_accelerator=SITE_ACCELERATOR.get(req.site_hint or "", {}),  # optional hint map
    )

    start_ts = now_iso()
    try:
        result = await asyncio.wait_for(agent.run(), timeout=req.timeout_seconds)
    except asyncio.TimeoutError:
        result = {"errors": ["timeout"], "traces": []}
    except Exception as e:
        result = {"errors": [f"agent_error: {e}"], "traces": []}
    end_ts = now_iso()

    # Meta + persistence
    result.setdefault("meta", {})
    result["meta"].update({
        "job_url": str(req.job_url),
        "session_mode": req.session_mode,
        "start_ts": start_ts,
        "end_ts": end_ts,
        "duration_seconds": (datetime.fromisoformat(end_ts) - datetime.fromisoformat(start_ts)).total_seconds()
    })

    out_path = ART_DIR / f"application_run_{int(datetime.now().timestamp())}.json"
    out_path.write_text(json.dumps(result, indent=2))
    result["artifact_path"] = str(out_path)

    return result

@APP.get("/health")
def health():
    return {"ok": True, "time": now_iso()}

@APP.post("/apply", response_model=ApplyResponse)
async def apply_endpoint(payload: ApplyRequest = Body(...)):
    run = await run_agent(payload)
    return ApplyResponse(run=run)
