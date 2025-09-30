
"""
Mock implementation of py_interaction for testing
"""

class HostDevice:
    """Mock HostDevice class"""
    
    def __init__(self):
        self.current_url = ""
        self.page_content = ""
    
    def navigate_to(self, url):
        """Mock navigation"""
        self.current_url = url
        print(f"Mock: Navigated to {url}")
    
    def fill_field(self, field_id, value):
        """Mock field filling"""
        print(f"Mock: Filled {field_id} with {value}")
        return True
    
    def click_element(self, element_id):
        """Mock element clicking"""
        print(f"Mock: Clicked {element_id}")
        return True
    
    def upload_file(self, field_id, file_path):
        """Mock file upload"""
        print(f"Mock: Uploaded {file_path} to {field_id}")
        return True
    
    def get_page_content(self):
        """Mock page content retrieval"""
        return self.page_content
    
    def take_screenshot(self, filename):
        """Mock screenshot"""
        print(f"Mock: Screenshot saved as {filename}")
        return True

class VNCClient:
    """Mock VNCClient class"""
    
    def __init__(self, host, port):
        self.host = host
        self.port = port
    
    def connect(self):
        """Mock VNC connection"""
        print(f"Mock: Connected to VNC at {self.host}:{self.port}")
        return True
    
    def disconnect(self):
        """Mock VNC disconnection"""
        print("Mock: Disconnected from VNC")
        return True
