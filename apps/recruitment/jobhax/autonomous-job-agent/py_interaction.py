"""
Mock implementation of py_interaction library for testing purposes.
This provides the HostDevice class that the main application expects.
"""

import time
import asyncio
from typing import Optional, Dict, Any, List
from pathlib import Path


class HostDevice:
    """
    Mock HostDevice class that simulates browser interaction capabilities.
    In a real implementation, this would control an actual browser on the local host.
    """
    
    def __init__(self):
        self.screenshots_taken = 0
        self.actions_performed = []
        self.current_url = None
        
    async def click(self, x: int, y: int, button: str = "left") -> bool:
        """Simulate clicking at coordinates (x, y)"""
        action = {"type": "click", "x": x, "y": y, "button": button, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock click at ({x}, {y}) with {button} button")
        await asyncio.sleep(0.1)  # Simulate delay
        return True
        
    async def type(self, text: str, delay: float = 0.05) -> bool:
        """Simulate typing text"""
        action = {"type": "type", "text": text, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock typing: {text}")
        await asyncio.sleep(delay * len(text))  # Simulate typing delay
        return True
        
    async def select(self, option_text: str, dropdown_selector: str) -> bool:
        """Simulate selecting an option from a dropdown"""
        action = {"type": "select", "option": option_text, "selector": dropdown_selector, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock select: '{option_text}' from '{dropdown_selector}'")
        await asyncio.sleep(0.2)  # Simulate selection delay
        return True
        
    async def scroll(self, direction: str = "down", amount: int = 3) -> bool:
        """Simulate scrolling"""
        action = {"type": "scroll", "direction": direction, "amount": amount, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock scroll: {direction} by {amount}")
        await asyncio.sleep(0.1)  # Simulate scroll delay
        return True
        
    async def upload(self, file_path: str, upload_selector: str) -> bool:
        """Simulate file upload"""
        action = {"type": "upload", "file_path": file_path, "selector": upload_selector, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock upload: {file_path} to {upload_selector}")
        await asyncio.sleep(0.5)  # Simulate upload delay
        return True
        
    async def wait(self, seconds: float) -> bool:
        """Simulate waiting"""
        action = {"type": "wait", "seconds": seconds, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock wait: {seconds} seconds")
        await asyncio.sleep(seconds)
        return True
        
    async def switch_iframe(self, iframe_selector: str) -> bool:
        """Simulate switching to iframe"""
        action = {"type": "switch_iframe", "selector": iframe_selector, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock switch to iframe: {iframe_selector}")
        await asyncio.sleep(0.1)
        return True
        
    async def screenshot(self, filename: Optional[str] = None) -> str:
        """Simulate taking a screenshot"""
        self.screenshots_taken += 1
        if not filename:
            filename = f"mock_screenshot_{self.screenshots_taken}.png"
        
        action = {"type": "screenshot", "filename": filename, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock screenshot: {filename}")
        await asyncio.sleep(0.1)
        return filename
        
    async def navigate(self, url: str) -> bool:
        """Simulate navigating to a URL"""
        action = {"type": "navigate", "url": url, "timestamp": time.time()}
        self.actions_performed.append(action)
        self.current_url = url
        print(f"Mock navigate to: {url}")
        await asyncio.sleep(1.0)  # Simulate page load time
        return True
        
    async def find_element(self, selector: str, timeout: float = 5.0) -> Optional[Dict[str, Any]]:
        """Simulate finding an element"""
        action = {"type": "find_element", "selector": selector, "timestamp": time.time()}
        self.actions_performed.append(action)
        print(f"Mock find element: {selector}")
        await asyncio.sleep(0.1)
        # Return a mock element
        return {
            "tag": "input",
            "type": "text",
            "value": "",
            "selector": selector,
            "visible": True,
            "enabled": True
        }
        
    async def get_page_source(self) -> str:
        """Simulate getting page source"""
        action = {"type": "get_page_source", "timestamp": time.time()}
        self.actions_performed.append(action)
        print("Mock get page source")
        await asyncio.sleep(0.1)
        return "<html><body>Mock page content</body></html>"
        
    async def get_current_url(self) -> str:
        """Get current URL"""
        return self.current_url or "about:blank"
        
    def get_actions(self) -> List[Dict[str, Any]]:
        """Get list of all actions performed"""
        return self.actions_performed.copy()
        
    def clear_actions(self):
        """Clear action history"""
        self.actions_performed.clear()
