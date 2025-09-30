#!/usr/bin/env python3
"""
JobHax - Autonomous Job Application Agent
Main entry point for the job application automation system.
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Any, Optional

import click
from loguru import logger

from core.job_application_agent import JobApplicationAgent
from core.config import Config
from utils.data_loader import DataLoader
from utils.browser_manager import BrowserManager


@click.command()
@click.option('--url', required=True, help='Job application URL to process')
@click.option('--data-file', default='data/test_data.json', help='Path to test data JSON file')
@click.option('--cv-file', default='data/cv.pdf', help='Path to CV file')
@click.option('--headless', is_flag=True, help='Run browser in headless mode')
@click.option('--debug', is_flag=True, help='Enable debug logging')
@click.option('--ai-provider', default='openai', type=click.Choice(['openai', 'gemini', 'anthropic']), help='AI provider to use')
def main(url: str, data_file: str, cv_file: str, headless: bool, debug: bool, ai_provider: str):
    """
    JobHax - Autonomous Job Application Agent
    
    Automatically fills job application forms and processes applications
    without human intervention.
    """
    
    # Setup logging
    setup_logging(debug)
    
    # Load configuration
    config = Config(ai_provider=ai_provider)
    
    # Load test data
    data_loader = DataLoader()
    try:
        user_data = data_loader.load_user_data(data_file)
        cv_data = data_loader.load_cv_data(cv_file) if Path(cv_file).exists() else None
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        sys.exit(1)
    
    # Initialize browser manager
    browser_manager = BrowserManager(headless=headless)
    
    # Initialize job application agent
    agent = JobApplicationAgent(
        config=config,
        user_data=user_data,
        cv_data=cv_data,
        browser_manager=browser_manager
    )
    
    # Run the job application process
    try:
        asyncio.run(agent.process_job_application(url))
        logger.success("Job application completed successfully!")
    except Exception as e:
        logger.error(f"Job application failed: {e}")
        sys.exit(1)
    finally:
        browser_manager.cleanup()


def setup_logging(debug: bool):
    """Setup logging configuration."""
    log_level = "DEBUG" if debug else "INFO"
    
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(
        sys.stderr,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True
    )
    
    # Add file handler
    logger.add(
        "logs/job-application-platform.log",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="10 MB",
        retention="7 days"
    )


if __name__ == "__main__":
    main()
