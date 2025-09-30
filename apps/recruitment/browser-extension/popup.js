// Popup script for JobHax Chrome Extension
document.addEventListener('DOMContentLoaded', function() {
  const autoApplyBtn = document.getElementById('autoApply');
  const fillFormBtn = document.getElementById('fillForm');
  const fillAndSubmitBtn = document.getElementById('fillAndSubmit');
  const viewDataBtn = document.getElementById('viewData');
  const statusDiv = document.getElementById('status');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const fieldList = document.getElementById('fieldList');
  
  // Monitoring server connection
  let isConnected = false;
  
  // Resume data
  const resumeData = {
    firstName: '[REDACTED]',
    lastName: '[REDACTED]',
    email: '[REDACTED]',
    phone: '[REDACTED]',
    address: '[REDACTED]',
    city: '[REDACTED]',
    state: '[REDACTED]',
    zipCode: '[REDACTED]',
    country: 'United States',
    linkedin: '[REDACTED]',
    website: '[REDACTED]',
    currentTitle: 'Software Engineer',
    currentCompany: 'Tech Corp',
    yearsExperience: '8+',
    coverLetter: 'I am excited to apply for this position. With my experience in software engineering and 8+ years of experience, I believe I would be a great fit for this role. Please find my resume attached for your review.'
  };
  
  // Monitoring server connection functions
  function connectToMonitoring() {
    try {
      console.log('Testing connection to monitoring server...');
      
      // Test if monitoring server is available
      fetch('http://localhost:8081/socket.io/?EIO=4&transport=polling')
        .then(response => {
          if (response.ok) {
            console.log('✅ Monitoring server is available');
            isConnected = true;
            updateConnectionStatus('Monitoring server available', 'success');
          } else {
            throw new Error(`Server responded with status: ${response.status}`);
          }
        })
        .catch(error => {
          console.error('❌ Monitoring server not available:', error);
          isConnected = false;
          updateConnectionStatus('Monitoring server unavailable', 'error');
        });
        
    } catch (error) {
      console.error('❌ Failed to test monitoring server:', error);
      isConnected = false;
      updateConnectionStatus('Connection error: ' + error.message, 'error');
    }
  }
  
  
  function sendProgressUpdate(data) {
    if (isConnected) {
      try {
        // Send progress update via fetch to monitoring server
        fetch('http://localhost:8081/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }).catch(error => {
          console.error('Failed to send progress update:', error);
        });
      } catch (error) {
        console.error('Failed to send progress update:', error);
      }
    }
  }
  
  // Auto Apply function - starts the agent with current URL
  async function autoApply() {
    try {
      updateStatus('Starting autonomous agent...', 'info');
      updateProgress(10);
      
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        updateStatus('No active tab found', 'error');
        return;
      }
      
      const jobUrl = tab.url;
      console.log('Starting agent for URL:', jobUrl);
      
      // Show the URL being processed
      updateStatus(`Processing: ${jobUrl}`, 'info');
      updateProgress(20);
      
      // Send start signal to monitoring system
      if (isConnected) {
        updateStatus('Sending start signal to monitoring server...', 'info');
        updateProgress(40);
        
        // Send start signal via fetch
        fetch('http://localhost:8081/start-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_url: jobUrl
          })
        }).then(() => {
          updateStatus('✅ Agent started! Opening monitoring dashboard...', 'success');
          updateProgress(80);
          
          // Open monitoring dashboard in new tab with auto-start parameters
          const dashboardUrl = `http://localhost:3000?autostart=true&joburl=${encodeURIComponent(jobUrl)}`;
          chrome.tabs.create({
            url: dashboardUrl
          });
          
          updateProgress(100);
        }).catch(error => {
          console.error('Failed to start agent:', error);
          updateStatus('⚠️ Agent start failed. Opening dashboard anyway...', 'warning');
          
          // Open monitoring dashboard in new tab even if start failed
          const dashboardUrl = `http://localhost:3000?autostart=true&joburl=${encodeURIComponent(jobUrl)}`;
          chrome.tabs.create({
            url: dashboardUrl
          });
          
          updateProgress(100);
        });
      } else {
        updateStatus('⚠️ Monitoring server not connected. Opening dashboard...', 'warning');
        
        // Open monitoring dashboard in new tab
        const dashboardUrl = `http://localhost:3000?autostart=true&joburl=${encodeURIComponent(jobUrl)}`;
        chrome.tabs.create({
          url: dashboardUrl
        });
        
        updateProgress(100);
      }
      
      setTimeout(() => {
        hideProgress();
      }, 3000);
      
    } catch (error) {
      console.error('Auto apply error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      hideProgress();
    }
  }
  
  // Update connection status
  function updateConnectionStatus(message, type = 'info') {
    const connectionStatusDiv = document.getElementById('connectionStatus');
    if (connectionStatusDiv) {
      connectionStatusDiv.innerHTML = `<div>${message}</div>`;
      connectionStatusDiv.className = `status ${type}`;
    }
  }
  
  // Update status
  function updateStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
  
  // Update progress
  function updateProgress(percent) {
    progressContainer.style.display = 'block';
    progressBar.style.width = `${percent}%`;
  }
  
  // Hide progress
  function hideProgress() {
    progressContainer.style.display = 'none';
  }
  
  // Show field list
  function showFieldList() {
    fieldList.style.display = 'block';
  }
  
  // Hide field list
  function hideFieldList() {
    fieldList.style.display = 'none';
  }
  
  // Fill form function
  async function fillForm(shouldSubmit = false) {
    try {
      updateStatus('Starting auto-fill process...', 'info');
      updateProgress(10);
      
      // Send initial progress to monitoring
      sendProgressUpdate({
        status: 'Starting',
        progress: 10,
        action: 'Starting auto-fill process',
        timestamp: Date.now()
      });
      
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        updateStatus('No active tab found', 'error');
        sendProgressUpdate({
          status: 'Error',
          progress: 0,
          action: 'No active tab found',
          timestamp: Date.now()
        });
        return;
      }
      
      // Check if it's a supported job site
      const supportedSites = [
        'smartrecruiters.com',
        'apply.appcast.io',
        'jobs.lever.co',
        'boards.greenhouse.io'
      ];
      
      const isSupported = supportedSites.some(site => tab.url.includes(site));
      
      if (!isSupported) {
        updateStatus('This site is not supported yet', 'warning');
        sendProgressUpdate({
          status: 'Warning',
          progress: 0,
          action: 'Site not supported',
          timestamp: Date.now()
        });
        return;
      }
      
      updateProgress(20);
      updateStatus('Injecting auto-fill script...', 'info');
      
      sendProgressUpdate({
        status: 'Running',
        progress: 20,
        action: 'Injecting auto-fill script',
        timestamp: Date.now()
      });
      
      // Inject the auto-fill script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['injected.js']
      });
      
      updateProgress(40);
      updateStatus('Sending resume data...', 'info');
      
      sendProgressUpdate({
        status: 'Running',
        progress: 40,
        action: 'Sending resume data',
        timestamp: Date.now()
      });
      
      // First, try to inject the content script if it's not already loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('Content script injected successfully');
      } catch (injectError) {
        console.log('Content script may already be loaded or injection failed:', injectError);
      }
      
      // Wait a moment for the content script to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Send resume data to content script
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'fillForm',
          data: resumeData,
          shouldSubmit: shouldSubmit
        });
        console.log('Response from content script:', response);
      } catch (error) {
        console.error('Error sending message to content script:', error);
        updateStatus('Error: Content script not loaded. Please refresh the page and try again.', 'error');
        sendProgressUpdate({
          status: 'Error',
          progress: 0,
          action: 'Content script not loaded',
          timestamp: Date.now()
        });
        return;
      }
      
      updateProgress(60);
      updateStatus('Auto-filling form fields...', 'info');
      
      sendProgressUpdate({
        status: 'Running',
        progress: 60,
        action: 'Auto-filling form fields',
        timestamp: Date.now()
      });
      
      // Wait a bit for the filling process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateProgress(80);
      updateStatus('Verifying form completion...', 'info');
      
      sendProgressUpdate({
        status: 'Running',
        progress: 80,
        action: 'Verifying form completion',
        timestamp: Date.now()
      });
      
      // Check form status
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getStatus'
        });
      } catch (error) {
        console.error('Error getting status from content script:', error);
        updateStatus('Warning: Could not verify form completion', 'warning');
        response = { success: false, filledFields: 0 };
      }
      
      updateProgress(100);
      
      if (response && response.success) {
        const filledCount = response.filledFields || 0;
        updateStatus(`✅ Successfully filled ${filledCount} fields!`, 'success');
        showFieldList();
        
        sendProgressUpdate({
          status: 'Completed',
          progress: 100,
          action: `Successfully filled ${filledCount} fields`,
          timestamp: Date.now(),
          filledFields: filledCount
        });
      } else {
        updateStatus('⚠️ Some fields may not have been filled', 'warning');
        showFieldList();
        
        sendProgressUpdate({
          status: 'Warning',
          progress: 100,
          action: 'Some fields may not have been filled',
          timestamp: Date.now()
        });
      }
      
      setTimeout(() => {
        hideProgress();
      }, 3000);
      
    } catch (error) {
      console.error('Error:', error);
      updateStatus(`Error: ${error.message}`, 'error');
      hideProgress();
    }
  }
  
  // Event listeners
  autoApplyBtn.addEventListener('click', autoApply);
  fillFormBtn.addEventListener('click', () => fillForm(false));
  fillAndSubmitBtn.addEventListener('click', () => fillForm(true));
  
  viewDataBtn.addEventListener('click', () => {
    showFieldList();
    updateStatus('Resume data loaded', 'info');
  });
  
  // Load current URL
  async function loadCurrentUrl() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const urlText = document.getElementById('urlText');
        const currentUrlDiv = document.getElementById('currentUrl');
        
        if (urlText && currentUrlDiv) {
          // Truncate long URLs for display
          const displayUrl = tab.url.length > 50 ? 
            tab.url.substring(0, 47) + '...' : 
            tab.url;
          
          urlText.textContent = displayUrl;
          urlText.title = tab.url; // Full URL in tooltip
          currentUrlDiv.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Failed to load current URL:', error);
    }
  }

  // Initialize
  updateStatus('Ready to auto-fill job applications', 'info');
  loadCurrentUrl();
  
  // Try to connect to monitoring system
  try {
    connectToMonitoring();
  } catch (error) {
    console.log('Monitoring system not available, continuing without it');
    updateConnectionStatus('Monitoring not available', 'warning');
  }
});

