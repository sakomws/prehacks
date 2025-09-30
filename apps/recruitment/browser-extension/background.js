// Background script for JobHax Chrome Extension
console.log('JobHax background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('JobHax extension installed');
    
    // Set default storage values
    chrome.storage.sync.set({
      resumeData: {
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
      }
    });
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a supported job site
    const supportedSites = [
      'smartrecruiters.com',
      'apply.appcast.io',
      'jobs.lever.co',
      'boards.greenhouse.io',
      'workday.com',
      'taleo.net'
    ];
    
    const isSupported = supportedSites.some(site => tab.url.includes(site));
    
    if (isSupported) {
      console.log('JobHax: Supported job site detected:', tab.url);
      
      // Inject content script if not already injected
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        // Script might already be injected
        console.log('Content script already injected or error:', err);
      });
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('JobHax log:', request.message);
  } else if (request.action === 'formFilled') {
    console.log('Form filled successfully:', request.data);
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.svg',
      title: 'JobHax',
      message: `Successfully filled ${request.data.filledCount} fields!`
    });
  }
});

// Context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'jobhax-fill',
    title: '🚀 Auto-Fill with JobHax',
    contexts: ['editable']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'jobhax-fill') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      data: {
        firstName: '[REDACTED]',
        lastName: '[REDACTED]',
        email: '[REDACTED]',
        phone: '[REDACTED]'
      }
    });
  }
});

