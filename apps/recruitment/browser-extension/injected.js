// Injected script for JobHax Chrome Extension
// This script runs in the page context and has access to all page variables

console.log('JobHax injected script loaded');

// Enhanced form filling with better SmartRecruiters support
function enhancedFillForm(data) {
  console.log('Enhanced form filling started with data:', data);
  
  let filledCount = 0;
  const results = {};
  
  // More comprehensive selectors for SmartRecruiters
  const enhancedSelectors = {
    email: [
      'input[type="email"]',
      'input[name*="email" i]',
      'input[id*="email" i]',
      'input[placeholder*="email" i]',
      'input[aria-label*="email" i]',
      'input[data-testid*="email" i]',
      'input[class*="email" i]',
      'input[ng-model*="email" i]',
      'input[formcontrolname*="email" i]'
    ],
    firstName: [
      'input[name*="first" i]',
      'input[id*="first" i]',
      'input[placeholder*="first" i]',
      'input[aria-label*="first" i]',
      'input[data-testid*="first" i]',
      'input[class*="first" i]',
      'input[ng-model*="first" i]',
      'input[formcontrolname*="first" i]'
    ],
    lastName: [
      'input[name*="last" i]',
      'input[id*="last" i]',
      'input[placeholder*="last" i]',
      'input[aria-label*="last" i]',
      'input[data-testid*="last" i]',
      'input[class*="last" i]',
      'input[ng-model*="last" i]',
      'input[formcontrolname*="last" i]'
    ],
    phone: [
      'input[type="tel"]',
      'input[name*="phone" i]',
      'input[id*="phone" i]',
      'input[placeholder*="phone" i]',
      'input[aria-label*="phone" i]',
      'input[data-testid*="phone" i]',
      'input[class*="phone" i]',
      'input[ng-model*="phone" i]',
      'input[formcontrolname*="phone" i]'
    ]
  };
  
  // Fill each field type
  Object.keys(enhancedSelectors).forEach(fieldType => {
    const selectors = enhancedSelectors[fieldType];
    let element = null;
    
    // Try each selector
    for (const selector of selectors) {
      try {
        element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (element) {
      try {
        // Clear and focus
        element.focus();
        element.value = '';
        
        // Set value
        element.value = data[fieldType] || '';
        
        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        filledCount++;
        results[fieldType] = 'filled';
        console.log(`✅ Enhanced fill ${fieldType}:`, data[fieldType]);
      } catch (e) {
        console.error(`Error filling ${fieldType}:`, e);
        results[fieldType] = 'error';
      }
    } else {
      results[fieldType] = 'not_found';
      console.log(`⚠️ Enhanced selector not found: ${fieldType}`);
    }
  });
  
  console.log(`Enhanced form fill complete. Filled ${filledCount} fields.`);
  return { filledCount, results };
}

// Listen for messages from content script
window.addEventListener('message', function(event) {
  if (event.data.action === 'enhancedFill') {
    const result = enhancedFillForm(event.data.data);
    event.source.postMessage({
      action: 'enhancedFillComplete',
      result: result
    }, '*');
  }
});

// Auto-detect and fill forms on page load
function autoDetectAndFill() {
  // Check if this looks like a job application form
  const formIndicators = [
    'input[type="email"]',
    'input[name*="first" i]',
    'input[name*="last" i]',
    'input[type="tel"]',
    'input[type="file"]'
  ];
  
  let hasForm = false;
  formIndicators.forEach(selector => {
    if (document.querySelector(selector)) {
      hasForm = true;
    }
  });
  
  if (hasForm) {
    console.log('JobHax: Job application form detected');
    
    // Show auto-fill button
    const autoFillBtn = document.createElement('button');
    autoFillBtn.innerHTML = '🚀 Auto-Fill with JobHax';
    autoFillBtn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Segoe UI', sans-serif;
    `;
    
    autoFillBtn.onclick = function() {
      const data = {
        firstName: '[REDACTED]',
        lastName: '[REDACTED]',
        email: '[REDACTED]',
        phone: '[REDACTED]'
      };
      
      const result = enhancedFillForm(data);
      alert(`JobHax filled ${result.filledCount} fields!`);
    };
    
    document.body.appendChild(autoFillBtn);
    
    // Remove button after 10 seconds
    setTimeout(() => {
      if (autoFillBtn.parentNode) {
        autoFillBtn.parentNode.removeChild(autoFillBtn);
      }
    }, 10000);
  }
}

// Run auto-detection
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoDetectAndFill);
} else {
  autoDetectAndFill();
}

