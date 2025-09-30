"""
Browser management utilities using py_interaction library.
"""

import logging
import time
from typing import Optional, List, Dict, Any
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

from core.config import BrowserConfig
from core.models import BrowserAction


class BrowserManager:
    """Manages browser automation using Selenium."""
    
    def __init__(self, headless: bool = False):
        self.logger = logging.getLogger(__name__)
        self.headless = headless
        self.driver = None
        self.wait = None
        self.current_url = None
        
    def initialize(self) -> bool:
        """Initialize the browser instance."""
        try:
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            
            self.logger.info("Browser initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize browser: {e}")
            return False
    
    def navigate_to(self, url: str) -> bool:
        """Navigate to a specific URL."""
        try:
            if not self.driver:
                if not self.initialize():
                    return False
            
            self.driver.get(url)
            self.current_url = url
            self.logger.info(f"Navigated to: {url}")
            time.sleep(2)  # Wait for page to load
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to navigate to {url}: {e}")
            return False
    
    def find_element(self, selector: str, by: str = "xpath") -> Optional[Any]:
        """Find an element on the page."""
        try:
            if by == "xpath":
                return self.driver.find_element(By.XPATH, selector)
            elif by == "css":
                return self.driver.find_element(By.CSS_SELECTOR, selector)
            elif by == "id":
                return self.driver.find_element(By.ID, selector)
            elif by == "class":
                return self.driver.find_element(By.CLASS_NAME, selector)
            elif by == "text":
                return self.driver.find_element(By.LINK_TEXT, selector)
            else:
                self.logger.warning(f"Unsupported selector type: {by}")
                return None
                
        except NoSuchElementException:
            self.logger.warning(f"Element not found: {selector}")
            return None
        except Exception as e:
            self.logger.error(f"Failed to find element {selector} by {by}: {e}")
            return None
    
    def find_elements(self, selector: str, by: str = "xpath") -> List[Any]:
        """Find multiple elements on the page."""
        try:
            if by == "xpath":
                return self.browser.find_elements_by_xpath(selector)
            elif by == "css":
                return self.browser.find_elements_by_css_selector(selector)
            elif by == "class":
                return self.browser.find_elements_by_class_name(selector)
            else:
                self.logger.warning(f"Unsupported selector type: {by}")
                return []
                
        except Exception as e:
            self.logger.error(f"Failed to find elements {selector} by {by}: {e}")
            return []
    
    def click_element(self, element: Any) -> bool:
        """Click an element."""
        try:
            element.click()
            self.logger.info("Element clicked successfully")
            time.sleep(1)  # Wait for action to complete
            return True
        except Exception as e:
            self.logger.error(f"Failed to click element: {e}")
            return False
    
    def fill_input(self, element: Any, value: str) -> bool:
        """Fill an input field with a value."""
        try:
            element.clear()
            element.send_keys(value)
            self.logger.info(f"Filled input with: {value}")
            time.sleep(0.5)  # Wait for input to be processed
            return True
        except Exception as e:
            self.logger.error(f"Failed to fill input: {e}")
            return False
    
    def select_dropdown(self, element: Any, value: str) -> bool:
        """Select a value from a dropdown."""
        try:
            from selenium.webdriver.support.ui import Select
            select = Select(element)
            select.select_by_visible_text(value)
            self.logger.info(f"Selected dropdown value: {value}")
            time.sleep(0.5)
            return True
        except Exception as e:
            self.logger.error(f"Failed to select dropdown value: {e}")
            return False
    
    def upload_file(self, element: Any, file_path: str) -> bool:
        """Upload a file to a file input."""
        try:
            element.send_keys(file_path)
            self.logger.info(f"Uploaded file: {file_path}")
            time.sleep(1)  # Wait for file upload
            return True
        except Exception as e:
            self.logger.error(f"Failed to upload file {file_path}: {e}")
            return False
    
    def wait_for_element(self, selector: str, by: str = "xpath", timeout: int = 10) -> Optional[Any]:
        """Wait for an element to appear on the page."""
        try:
            start_time = time.time()
            while time.time() - start_time < timeout:
                element = self.find_element(selector, by)
                if element:
                    return element
                time.sleep(0.5)
            
            self.logger.warning(f"Element {selector} not found within {timeout} seconds")
            return None
            
        except Exception as e:
            self.logger.error(f"Error waiting for element {selector}: {e}")
            return None
    
    def wait_for_page_load(self, timeout: int = 30) -> bool:
        """Wait for page to fully load."""
        try:
            start_time = time.time()
            while time.time() - start_time < timeout:
                if self.browser.execute_script("return document.readyState") == "complete":
                    return True
                time.sleep(0.5)
            
            self.logger.warning(f"Page did not load within {timeout} seconds")
            return False
            
        except Exception as e:
            self.logger.error(f"Error waiting for page load: {e}")
            return False
    
    def get_page_source(self) -> str:
        """Get the current page source."""
        try:
            return self.browser.page_source
        except Exception as e:
            self.logger.error(f"Failed to get page source: {e}")
            return ""
    
    def get_current_url(self) -> str:
        """Get the current URL."""
        try:
            return self.browser.current_url
        except Exception as e:
            self.logger.error(f"Failed to get current URL: {e}")
            return ""
    
    def take_screenshot(self, filename: str = None) -> Optional[str]:
        """Take a screenshot of the current page."""
        try:
            if not filename:
                timestamp = int(time.time())
                filename = f"screenshot_{timestamp}.png"
            
            screenshot_path = Path("screenshots") / filename
            screenshot_path.parent.mkdir(exist_ok=True)
            
            self.browser.save_screenshot(str(screenshot_path))
            self.logger.info(f"Screenshot saved: {screenshot_path}")
            return str(screenshot_path)
            
        except Exception as e:
            self.logger.error(f"Failed to take screenshot: {e}")
            return None
    
    def execute_script(self, script: str) -> Any:
        """Execute JavaScript on the current page."""
        try:
            return self.browser.execute_script(script)
        except Exception as e:
            self.logger.error(f"Failed to execute script: {e}")
            return None
    
    def scroll_to_element(self, element: Any) -> bool:
        """Scroll to a specific element."""
        try:
            self.browser.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(1)
            return True
        except Exception as e:
            self.logger.error(f"Failed to scroll to element: {e}")
            return False
    
    def scroll_to_bottom(self) -> bool:
        """Scroll to the bottom of the page."""
        try:
            self.browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            return True
        except Exception as e:
            self.logger.error(f"Failed to scroll to bottom: {e}")
            return False
    
    def execute_action(self, action: BrowserAction) -> bool:
        """Execute a browser action."""
        try:
            if action.action_type == "click":
                element = self.find_element(action.target, "xpath")
                if element:
                    return self.click_element(element)
            elif action.action_type == "fill":
                element = self.find_element(action.target, "xpath")
                if element:
                    return self.fill_input(element, action.value)
            elif action.action_type == "select":
                element = self.find_element(action.target, "xpath")
                if element:
                    return self.select_dropdown(element, action.value)
            elif action.action_type == "upload":
                element = self.find_element(action.target, "xpath")
                if element:
                    return self.upload_file(element, action.value)
            elif action.action_type == "wait":
                time.sleep(action.wait_time)
                return True
            elif action.action_type == "navigate":
                return self.navigate_to(action.target)
            else:
                self.logger.warning(f"Unknown action type: {action.action_type}")
                return False
                
        except Exception as e:
            self.logger.error(f"Failed to execute action {action.action_type}: {e}")
            return False
    
    def cleanup(self):
        """Clean up browser resources."""
        try:
            if self.browser:
                self.browser.quit()
                self.logger.info("Browser cleaned up successfully")
        except Exception as e:
            self.logger.error(f"Error during browser cleanup: {e}")
