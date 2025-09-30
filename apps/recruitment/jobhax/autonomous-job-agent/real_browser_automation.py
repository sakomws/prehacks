"""
Real browser automation using Selenium for actual screenshots and form filling.
This replaces the mock py_interaction implementation with real browser control.
"""

import time
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image
import io
import base64
import websockets
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealHostDevice:
    """Real browser automation device using Selenium WebDriver."""
    
    def __init__(self, headless: bool = False, user_data_dir: Optional[str] = None):
        self.driver = None
        self.actions = []
        self.screenshots_dir = Path("artifacts/screenshots")
        self.screenshots_dir.mkdir(parents=True, exist_ok=True)
        self.headless = headless
        self.user_data_dir = user_data_dir
        self._setup_driver()
    
    def _setup_driver(self):
        """Initialize Chrome WebDriver with appropriate options."""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        if self.user_data_dir:
            chrome_options.add_argument(f"--user-data-dir={self.user_data_dir}")
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Chrome WebDriver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Chrome WebDriver: {e}")
            raise
    
    def navigate(self, url: str):
        """Navigate to a URL."""
        logger.info(f"Navigating to: {url}")
        self.driver.get(url)
        self.actions.append({
            "type": "navigate", 
            "url": url, 
            "timestamp": time.time(),
            "success": True
        })
        time.sleep(2)  # Wait for page load
    
    def click(self, x: int, y: int, button: str = "left"):
        """Click at coordinates (for compatibility with mock interface)."""
        logger.info(f"Clicking at ({x}, {y}) with {button} button")
        try:
            ActionChains(self.driver).move_by_offset(x, y).click().perform()
            self.actions.append({
                "type": "click", 
                "x": x, 
                "y": y, 
                "button": button, 
                "timestamp": time.time(),
                "success": True
            })
        except Exception as e:
            logger.error(f"Click failed: {e}")
            self.actions.append({
                "type": "click", 
                "x": x, 
                "y": y, 
                "button": button, 
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
    
    def click_element(self, selector: str, by: By = By.CSS_SELECTOR, timeout: int = 10):
        """Click an element by selector."""
        logger.info(f"Clicking element: {selector}")
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, selector))
            )
            element.click()
            self.actions.append({
                "type": "click_element", 
                "selector": selector, 
                "timestamp": time.time(),
                "success": True
            })
            return True
        except Exception as e:
            logger.error(f"Click element failed: {e}")
            self.actions.append({
                "type": "click_element", 
                "selector": selector, 
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return False
    
    def type(self, text: str, selector: str = None, by: By = By.CSS_SELECTOR, clear_first: bool = True):
        """Type text into an element."""
        logger.info(f"Typing: {text[:50]}...")
        try:
            if selector:
                element = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((by, selector))
                )
            else:
                # If no selector, try to find active element
                element = self.driver.switch_to.active_element
            
            if clear_first:
                element.clear()
            element.send_keys(text)
            
            self.actions.append({
                "type": "type", 
                "text": text, 
                "selector": selector,
                "timestamp": time.time(),
                "success": True
            })
            return True
        except Exception as e:
            logger.error(f"Type failed: {e}")
            self.actions.append({
                "type": "type", 
                "text": text, 
                "selector": selector,
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return False
    
    def select(self, option: str, selector: str, by: By = By.CSS_SELECTOR):
        """Select an option from a dropdown."""
        logger.info(f"Selecting: '{option}' from '{selector}'")
        try:
            select_element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((by, selector))
            )
            select = Select(select_element)
            
            # Try different selection methods
            try:
                select.select_by_visible_text(option)
            except:
                try:
                    select.select_by_value(option)
                except:
                    select.select_by_index(0)  # Fallback to first option
            
            self.actions.append({
                "type": "select", 
                "option": option, 
                "selector": selector,
                "timestamp": time.time(),
                "success": True
            })
            return True
        except Exception as e:
            logger.error(f"Select failed: {e}")
            self.actions.append({
                "type": "select", 
                "option": option, 
                "selector": selector,
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return False
    
    def upload(self, file_path: str, selector: str, by: By = By.CSS_SELECTOR):
        """Upload a file."""
        logger.info(f"Uploading: {file_path}")
        try:
            file_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((by, selector))
            )
            file_input.send_keys(str(Path(file_path).absolute()))
            
            self.actions.append({
                "type": "upload", 
                "file_path": file_path, 
                "selector": selector,
                "timestamp": time.time(),
                "success": True
            })
            return True
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            self.actions.append({
                "type": "upload", 
                "file_path": file_path, 
                "selector": selector,
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return False
    
    def screenshot(self, filename: str):
        """Take a screenshot and save it."""
        logger.info(f"Taking screenshot: {filename}")
        try:
            screenshot_path = self.screenshots_dir / filename
            self.driver.save_screenshot(str(screenshot_path))
            
            # Also save as base64 for web display
            screenshot_base64 = self.driver.get_screenshot_as_base64()
            
            self.actions.append({
                "type": "screenshot", 
                "filename": filename,
                "path": str(screenshot_path),
                "base64": screenshot_base64,
                "timestamp": time.time(),
                "success": True
            })
            
            logger.info(f"Screenshot saved to: {screenshot_path}")
            return str(screenshot_path)
        except Exception as e:
            logger.error(f"Screenshot failed: {e}")
            self.actions.append({
                "type": "screenshot", 
                "filename": filename,
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return None
    
    def wait(self, seconds: float):
        """Wait for specified seconds."""
        logger.info(f"Waiting: {seconds} seconds")
        time.sleep(seconds)
        self.actions.append({
            "type": "wait", 
            "seconds": seconds, 
            "timestamp": time.time(),
            "success": True
        })
    
    def switch_iframe(self, selector: str, by: By = By.CSS_SELECTOR):
        """Switch to an iframe."""
        logger.info(f"Switching to iframe: {selector}")
        try:
            iframe = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((by, selector))
            )
            self.driver.switch_to.frame(iframe)
            self.actions.append({
                "type": "switch_iframe", 
                "selector": selector,
                "timestamp": time.time(),
                "success": True
            })
            return True
        except Exception as e:
            logger.error(f"Switch iframe failed: {e}")
            self.actions.append({
                "type": "switch_iframe", 
                "selector": selector,
                "timestamp": time.time(),
                "success": False,
                "error": str(e)
            })
            return False
    
    def find_elements(self, selector: str, by: By = By.CSS_SELECTOR):
        """Find elements by selector."""
        try:
            elements = self.driver.find_elements(by, selector)
            return elements
        except Exception as e:
            logger.error(f"Find elements failed: {e}")
            return []
    
    def get_page_source(self):
        """Get the current page source."""
        return self.driver.page_source
    
    def get_current_url(self):
        """Get the current URL."""
        return self.driver.current_url
    
    def get_actions(self):
        """Get all recorded actions."""
        return self.actions
    
    def close(self):
        """Close the browser."""
        if self.driver:
            self.driver.quit()
            logger.info("Browser closed")

class RealBrowser:
    """Real browser interface compatible with the mock Browser class."""
    
    def __init__(self, device: RealHostDevice, user_data_dir: str = None, profile_directory: str = None):
        self.device = device
        self.user_data_dir = user_data_dir
        self.profile_directory = profile_directory
        logger.info(f"Real Browser initialized with device: {type(device).__name__}")
    
    async def go_to_url(self, url: str, new_tab: bool = False):
        """Navigate to a URL."""
        self.device.navigate(url)
    
    async def input_text(self, index: int, text: str, clear_existing: bool = True, field_name: str = "input_field"):
        """Input text into a field (compatibility method)."""
        # Try to find input by common selectors
        selectors = [
            "input[type='text']",
            "input[type='email']", 
            "input[type='tel']",
            "input[type='number']",
            "textarea",
            f"input:nth-of-type({index + 1})",
            f"input[data-index='{index}']"
        ]
        
        for selector in selectors:
            elements = self.device.find_elements(selector)
            if elements and index < len(elements):
                element = elements[index]
                if clear_existing:
                    element.clear()
                element.send_keys(text)
                logger.info(f"Input text into {field_name}: {text[:50]}...")
                return True
        
        # Fallback to typing into active element
        return self.device.type(text)
    
    async def click_element_by_index(self, index: int, while_holding_ctrl: bool = False, element_name: str = "element"):
        """Click element by index (compatibility method)."""
        # Try to find clickable elements
        selectors = [
            "button",
            "input[type='submit']",
            "input[type='button']",
            "a",
            "[role='button']",
            "input[type='radio']",
            "input[type='checkbox']"
        ]
        
        for selector in selectors:
            elements = self.device.find_elements(selector)
            if elements and index < len(elements):
                element = elements[index]
                if while_holding_ctrl:
                    ActionChains(self.device.driver).key_down(Keys.CONTROL).click(element).key_up(Keys.CONTROL).perform()
                else:
                    element.click()
                logger.info(f"Clicked {element_name} at index {index}")
                return True
        
        return False
    
    async def select_dropdown_option(self, index: int, text: str, field_name: str = "dropdown"):
        """Select dropdown option (compatibility method)."""
        selectors = ["select", "[role='listbox']", ".dropdown", ".select"]
        
        for selector in selectors:
            elements = self.device.find_elements(selector)
            if elements and index < len(elements):
                element = elements[index]
                select = Select(element)
                try:
                    select.select_by_visible_text(text)
                    logger.info(f"Selected {text} from {field_name}")
                    return True
                except:
                    try:
                        select.select_by_value(text)
                        return True
                    except:
                        pass
        
        return False
    
    async def upload_file(self, index: int, file_path: str, field_name: str = "file_input"):
        """Upload file (compatibility method)."""
        selectors = ["input[type='file']", "[data-testid*='upload']", ".file-input"]
        
        for selector in selectors:
            elements = self.device.find_elements(selector)
            if elements and index < len(elements):
                element = elements[index]
                element.send_keys(str(Path(file_path).absolute()))
                logger.info(f"Uploaded {file_path} to {field_name}")
                return True
        
        return False
    
    async def take_screenshot(self, filename: str):
        """Take a screenshot."""
        return self.device.screenshot(filename)
    
    async def wait(self, seconds: float):
        """Wait for specified time."""
        self.device.wait(seconds)
    
    async def done(self, text: str):
        """Mark task as done."""
        logger.info(f"Task completed: {text}")
    
    async def get_dropdown_options(self, index: int):
        """Get dropdown options (compatibility method)."""
        selectors = ["select", "[role='listbox']"]
        
        for selector in selectors:
            elements = self.device.find_elements(selector)
            if elements and index < len(elements):
                element = elements[index]
                select = Select(element)
                return [option.text for option in select.options]
        
        return []
    
    async def scroll(self, down: bool = True, num_pages: float = 1.0, frame_element_index: Optional[int] = None):
        """Scroll the page."""
        if down:
            self.device.driver.execute_script(f"window.scrollBy(0, {int(num_pages * 1000)})")
        else:
            self.device.driver.execute_script(f"window.scrollBy(0, -{int(num_pages * 1000)})")
    
    async def extract_structured_data(self, query: str, extract_links: bool = False, start_from_char: int = 0):
        """Extract structured data from the page."""
        page_source = self.device.get_page_source()
        if extract_links:
            # Extract links using JavaScript
            links = self.device.driver.execute_script("""
                return Array.from(document.querySelectorAll('a')).map(a => ({
                    text: a.textContent.trim(),
                    href: a.href
                })).filter(link => link.text && link.href);
            """)
            return {"links": links, "content": page_source[start_from_char:]}
        return {"content": page_source[start_from_char:]}

class WebSocketMonitor:
    """WebSocket client to send real-time updates to the monitoring UI."""
    
    def __init__(self, websocket_url: str = "ws://localhost:8081"):
        self.websocket_url = websocket_url
        self.websocket = None
    
    async def connect(self):
        """Connect to WebSocket server."""
        try:
            self.websocket = await websockets.connect(self.websocket_url)
            logger.info("Connected to WebSocket server")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to WebSocket: {e}")
            return False
    
    async def send_update(self, data: Dict[str, Any]):
        """Send update to WebSocket server."""
        if self.websocket:
            try:
                await self.websocket.send(json.dumps(data))
                logger.info("Sent update to WebSocket server")
            except Exception as e:
                logger.error(f"Failed to send WebSocket update: {e}")
    
    async def close(self):
        """Close WebSocket connection."""
        if self.websocket:
            await self.websocket.close()
            logger.info("WebSocket connection closed")

# Export classes for compatibility
HostDevice = RealHostDevice
Browser = RealBrowser
