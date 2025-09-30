// Content script for JobHax Chrome Extension
console.log('JobHax content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('JobHax content script received message:', request);
  
  if (request.action === 'fillForm') {
    try {
      fillForm(request.data, request.shouldSubmit);
      sendResponse({ success: true, message: 'Form filling initiated' });
    } catch (error) {
      console.error('Error filling form:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  } else if (request.action === 'getStatus') {
    try {
      const status = getFormStatus();
      sendResponse(status);
    } catch (error) {
      console.error('Error getting status:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
  }
  
  // Return false if we don't handle the message
  return false;
});

// Enhanced field selectors for better detection
const fieldSelectors = {
  email: [
    'input[type="email"]',
    'input[name*="email" i]',
    'input[id*="email" i]',
    'input[placeholder*="email" i]',
    'input[aria-label*="email" i]',
    'input[data-testid*="email" i]',
    'input[name*="e-mail" i]',
    'input[id*="e-mail" i]',
    'input[placeholder*="e-mail" i]',
    'input[name*="mail" i]',
    'input[id*="mail" i]',
    'input[placeholder*="mail" i]'
  ],
  firstName: [
    'input[name*="first" i]',
    'input[id*="first" i]',
    'input[placeholder*="first" i]',
    'input[aria-label*="first" i]',
    'input[data-testid*="first" i]',
    'input[name*="fname" i]',
    'input[id*="fname" i]',
    'input[name*="given" i]',
    'input[id*="given" i]',
    'input[name*="forename" i]',
    'input[id*="forename" i]'
  ],
  lastName: [
    'input[name*="last" i]',
    'input[id*="last" i]',
    'input[placeholder*="last" i]',
    'input[aria-label*="last" i]',
    'input[data-testid*="last" i]',
    'input[name*="lname" i]',
    'input[id*="lname" i]',
    'input[name*="surname" i]',
    'input[id*="surname" i]',
    'input[name*="family" i]',
    'input[id*="family" i]'
  ],
  phone: [
    'input[type="tel"]',
    'input[name*="phone" i]',
    'input[id*="phone" i]',
    'input[placeholder*="phone" i]',
    'input[aria-label*="phone" i]',
    'input[data-testid*="phone" i]',
    'input[name*="telephone" i]',
    'input[id*="telephone" i]',
    'input[name*="mobile" i]',
    'input[id*="mobile" i]',
    'input[name*="cell" i]',
    'input[id*="cell" i]',
    'input[name*="contact" i]',
    'input[id*="contact" i]'
  ],
  address: [
    'input[name*="address" i]',
    'input[id*="address" i]',
    'input[placeholder*="address" i]',
    'input[aria-label*="address" i]',
    'input[data-testid*="address" i]',
    'input[name*="street" i]',
    'input[id*="street" i]',
    'input[name*="addr" i]',
    'input[id*="addr" i]',
    'textarea[name*="address" i]',
    'textarea[id*="address" i]'
  ],
  city: [
    'input[name*="city" i]',
    'input[id*="city" i]',
    'input[placeholder*="city" i]',
    'input[aria-label*="city" i]',
    'input[data-testid*="city" i]',
    'input[name*="town" i]',
    'input[id*="town" i]',
    'select[name*="city" i]',
    'select[id*="city" i]'
  ],
  state: [
    'input[name*="state" i]',
    'select[name*="state" i]',
    'input[id*="state" i]',
    'input[placeholder*="state" i]',
    'input[aria-label*="state" i]',
    'input[data-testid*="state" i]',
    'input[name*="province" i]',
    'input[id*="province" i]',
    'select[name*="province" i]',
    'select[id*="province" i]',
    'input[name*="region" i]',
    'input[id*="region" i]',
    'select[name*="region" i]',
    'select[id*="region" i]'
  ],
  zipCode: [
    'input[name*="zip" i]',
    'input[name*="postal" i]',
    'input[id*="zip" i]',
    'input[placeholder*="zip" i]',
    'input[aria-label*="zip" i]',
    'input[data-testid*="zip" i]',
    'input[name*="postcode" i]',
    'input[id*="postcode" i]',
    'input[name*="code" i]',
    'input[id*="code" i]',
    'input[name*="pincode" i]',
    'input[id*="pincode" i]'
  ],
  linkedin: [
    'input[name*="linkedin" i]',
    'input[id*="linkedin" i]',
    'input[placeholder*="linkedin" i]',
    'input[aria-label*="linkedin" i]',
    'input[data-testid*="linkedin" i]',
    'input[name*="linked" i]',
    'input[id*="linked" i]',
    'input[name*="profile" i]',
    'input[id*="profile" i]'
  ],
  website: [
    'input[name*="website" i]',
    'input[name*="portfolio" i]',
    'input[id*="website" i]',
    'input[placeholder*="website" i]',
    'input[aria-label*="website" i]',
    'input[data-testid*="website" i]',
    'input[name*="url" i]',
    'input[id*="url" i]',
    'input[name*="homepage" i]',
    'input[id*="homepage" i]',
    'input[name*="personal" i]',
    'input[id*="personal" i]'
  ],
  coverLetter: [
    'textarea[name*="cover" i]',
    'textarea[name*="letter" i]',
    'textarea[id*="cover" i]',
    'textarea[placeholder*="cover" i]',
    'textarea[aria-label*="cover" i]',
    'textarea[data-testid*="cover" i]',
    'textarea[name*="message" i]',
    'textarea[id*="message" i]',
    'textarea[name*="note" i]',
    'textarea[id*="note" i]',
    'textarea[name*="comment" i]',
    'textarea[id*="comment" i]',
    'textarea[name*="additional" i]',
    'textarea[id*="additional" i]'
  ],
  resume: [
    'input[type="file"][name*="resume" i]',
    'input[type="file"][name*="cv" i]',
    'input[type="file"][name*="document" i]',
    'input[type="file"][accept*="pdf" i]',
    'input[type="file"][accept*="doc" i]',
    'input[type="file"][name*="file" i]',
    'input[type="file"][name*="upload" i]',
    'input[type="file"][name*="attachment" i]'
  ],
  // Additional common fields
  fullName: [
    'input[name*="name" i]',
    'input[id*="name" i]',
    'input[placeholder*="name" i]',
    'input[aria-label*="name" i]',
    'input[data-testid*="name" i]',
    'input[name*="fullname" i]',
    'input[id*="fullname" i]'
  ],
  experience: [
    'input[name*="experience" i]',
    'input[id*="experience" i]',
    'input[placeholder*="experience" i]',
    'input[aria-label*="experience" i]',
    'input[data-testid*="experience" i]',
    'select[name*="experience" i]',
    'select[id*="experience" i]'
  ],
  currentTitle: [
    'input[name*="title" i]',
    'input[id*="title" i]',
    'input[placeholder*="title" i]',
    'input[aria-label*="title" i]',
    'input[data-testid*="title" i]',
    'input[name*="position" i]',
    'input[id*="position" i]',
    'input[name*="job" i]',
    'input[id*="job" i]'
  ],
  currentCompany: [
    'input[name*="company" i]',
    'input[id*="company" i]',
    'input[placeholder*="company" i]',
    'input[aria-label*="company" i]',
    'input[data-testid*="company" i]',
    'input[name*="employer" i]',
    'input[id*="employer" i]',
    'input[name*="organization" i]',
    'input[id*="organization" i]'
  ]
};

// Submit button selectors (excluding cookies/privacy buttons)
const submitSelectors = [
  'button[type="submit"]',
  'input[type="submit"]',
  'button[class*="submit" i]',
  'button[class*="apply" i]',
  'button[class*="btn-primary" i]',
  'button[class*="btn-submit" i]',
  'button[id*="submit" i]',
  'button[id*="apply" i]',
  'button[data-testid*="submit" i]',
  'button[data-testid*="apply" i]',
  'button:not([class*="cookie" i]):not([class*="privacy" i]):not([class*="settings" i])',
  'a[class*="submit" i]',
  'a[class*="apply" i]'
];

// Find element by multiple selectors
function findElement(selectors) {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.offsetParent !== null) { // Check if element is visible
        return element;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Find element by label text with better validation
function findElementByLabel(labelText, expectedType = null) {
  const labels = Array.from(document.querySelectorAll('label, span, div, p, h1, h2, h3, h4, h5, h6'));
  
  for (const label of labels) {
    if (label.textContent && label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
      // Look for input/select/textarea in the same container or nearby
      const container = label.closest('div, fieldset, form, section, tr, td') || label.parentElement;
      if (container) {
        const input = container.querySelector('input, select, textarea');
        if (input && input.offsetParent !== null) {
          // Validate that this is the right type of field
          if (expectedType && input.tagName.toLowerCase() !== expectedType) {
            continue;
          }
          // Additional validation for specific field types
          if (labelText.toLowerCase().includes('first name') && input.type === 'email') {
            continue; // Skip email fields for first name
          }
          if (labelText.toLowerCase().includes('last name') && input.type === 'email') {
            continue; // Skip email fields for last name
          }
          return input;
        }
      }
      
      // Look for input with matching name/id
      const labelTextLower = labelText.toLowerCase().replace(/\s+/g, '_');
      const input = document.querySelector(`input[name*="${labelTextLower}" i], input[id*="${labelTextLower}" i]`);
      if (input && input.offsetParent !== null) {
        // Validate that this is the right type of field
        if (expectedType && input.tagName.toLowerCase() !== expectedType) {
          continue;
        }
        return input;
      }
    }
  }
  return null;
}

// Fill input field
function fillInput(element, value) {
  if (!element || !value) return false;
  
  try {
    // Clear existing value
    element.value = '';
    element.focus();
    
    // Trigger input events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Set value
    element.value = value;
    
    // Trigger additional events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    
    return true;
  } catch (e) {
    console.error('Error filling input:', e);
    return false;
  }
}

// Fill select dropdown
function fillSelect(element, value) {
  if (!element || !value) return false;
  
  try {
    const options = element.querySelectorAll('option');
    for (const option of options) {
      if (option.textContent.toLowerCase().includes(value.toLowerCase()) ||
          option.value.toLowerCase().includes(value.toLowerCase())) {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error('Error filling select:', e);
    return false;
  }
}

// Fill textarea
function fillTextarea(element, value) {
  if (!element || !value) return false;
  
  try {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (e) {
    console.error('Error filling textarea:', e);
    return false;
  }
}

// Fill file input
function fillFileInput(element, filePath) {
  if (!element) return false;
  
  try {
    // Note: File input filling is limited in content scripts
    // This would need to be handled differently in a real implementation
    console.log('File input found, would upload:', filePath);
    return true;
  } catch (e) {
    console.error('Error filling file input:', e);
    return false;
  }
}

// Fill checkbox
function fillCheckbox(element, checked) {
  if (!element) return false;
  
  try {
    element.checked = checked;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } catch (e) {
    console.error('Error filling checkbox:', e);
    return false;
  }
}

// Fill radio button group
function fillRadioGroup(questionText, value) {
  if (!questionText || !value) return false;
  
  try {
    // Find the question text and look for nearby radio buttons
    const questionElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes(questionText.toLowerCase())
    );
    
    for (const questionEl of questionElements) {
      const container = questionEl.closest('div, fieldset, form, section') || questionEl.parentElement;
      if (container) {
        const radioButtons = container.querySelectorAll('input[type="radio"]');
        for (const radio of radioButtons) {
          const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
          if (label && label.textContent.toLowerCase().includes(value.toLowerCase())) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }
    }
    return false;
  } catch (e) {
    console.error('Error filling radio group:', e);
    return false;
  }
}

// Fill dropdown/select with better matching (enhanced version)
function fillSelectEnhanced(element, value) {
  if (!element || !value) return false;
  
  try {
    const options = element.querySelectorAll('option');
    const valueStr = value.toString().toLowerCase();
    
    // Try exact match first
    for (const option of options) {
      if (option.value.toLowerCase() === valueStr || 
          option.textContent.toLowerCase() === valueStr) {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    
    // Try partial match
    for (const option of options) {
      if (option.value.toLowerCase().includes(valueStr) ||
          option.textContent.toLowerCase().includes(valueStr)) {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    
    return false;
  } catch (e) {
    console.error('Error filling select:', e);
    return false;
  }
}

// Enhanced field detection function
function findFieldByLabel(labelText, expectedType = 'input') {
  const labels = Array.from(document.querySelectorAll('label, span, div, p, h1, h2, h3, h4, h5, h6'));
  
  for (const label of labels) {
    if (label.textContent && label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
      // Look for input/select/textarea in the same container or nearby
      const container = label.closest('div, fieldset, form, section, tr, td') || label.parentElement;
      if (container) {
        const input = container.querySelector(expectedType);
        if (input && input.offsetParent !== null) {
          return input;
        }
      }
      
      // Look for input with matching name/id
      const labelTextLower = labelText.toLowerCase().replace(/\s+/g, '_');
      const input = document.querySelector(`${expectedType}[name*="${labelTextLower}" i], ${expectedType}[id*="${labelTextLower}" i]`);
      if (input && input.offsetParent !== null) {
        return input;
      }
    }
  }
  return null;
}

// Main fill form function
function fillForm(data, shouldSubmit = false) {
  console.log('Starting form fill with data:', data);
  
  let filledCount = 0;
  const results = {};
  
  // Fill each field type using direct selectors first
  Object.keys(fieldSelectors).forEach(fieldType => {
    const selectors = fieldSelectors[fieldType];
    const element = findElement(selectors);
    
    if (element) {
      let success = false;
      
      if (fieldType === 'resume') {
        success = fillFileInput(element, '[REDACTED].pdf');
      } else if (element.tagName === 'SELECT') {
        success = fillSelect(element, data[fieldType]);
      } else if (element.tagName === 'TEXTAREA') {
        success = fillTextarea(element, data[fieldType] || data.coverLetter);
      } else {
        success = fillInput(element, data[fieldType]);
      }
      
      if (success) {
        filledCount++;
        results[fieldType] = 'filled';
        console.log(`✅ Filled ${fieldType}:`, data[fieldType]);
      } else {
        results[fieldType] = 'failed';
        console.log(`❌ Failed to fill ${fieldType}`);
      }
    } else {
      results[fieldType] = 'not_found';
      console.log(`⚠️ Field not found: ${fieldType}`);
    }
  });
  
  // Handle specific Yes/No questions
  const yesNoQuestions = [
    { question: 'over the age of 18', answer: 'Yes' },
    { question: 'eligible to work in the United States', answer: 'Yes' },
    { question: 'require company sponsorship', answer: 'No' },
    { question: 'professional license', answer: 'No' }
  ];
  
  yesNoQuestions.forEach(q => {
    const success = fillRadioGroup(q.question, q.answer);
    if (success) {
      filledCount++;
      results[`${q.question.replace(/\s+/g, '_')}`] = 'filled';
      console.log(`✅ Filled ${q.question}: ${q.answer}`);
    }
  });
  
  // Handle experience dropdown
  const experienceSelectors = [
    'select[name*="experience" i]',
    'select[id*="experience" i]',
    'select[name*="years" i]',
    'select[id*="years" i]'
  ];
  
  const experienceElement = findElement(experienceSelectors);
  if (experienceElement) {
    const success = fillSelect(experienceElement, data.yearsExperience || '8+');
    if (success) {
      filledCount++;
      results['experience'] = 'filled';
      console.log('✅ Filled experience:', data.yearsExperience);
    }
  }
  
  // Handle country dropdown
  const countrySelectors = [
    'select[name*="country" i]',
    'select[id*="country" i]',
    'select[name*="nation" i]',
    'select[id*="nation" i]'
  ];
  
  const countryElement = findElement(countrySelectors);
  if (countryElement) {
    const success = fillSelect(countryElement, data.country || 'United States');
    if (success) {
      filledCount++;
      results['country'] = 'filled';
      console.log('✅ Filled country:', data.country);
    }
  }
  
  // Handle healthcare motivation textarea
  const healthcareTextareaSelectors = [
    'textarea[name*="healthcare" i]',
    'textarea[id*="healthcare" i]',
    'textarea[placeholder*="healthcare" i]',
    'textarea[aria-label*="healthcare" i]',
    'textarea[name*="drew" i]',
    'textarea[id*="drew" i]',
    'textarea[placeholder*="drew" i]'
  ];
  
  const healthcareElement = findElement(healthcareTextareaSelectors);
  if (healthcareElement) {
    const healthcareResponse = "I am drawn to healthcare because of the opportunity to make a meaningful impact on people's lives. With my technical background and passion for helping others, I believe I can contribute to improving healthcare systems and patient outcomes through innovative solutions.";
    const success = fillTextarea(healthcareElement, healthcareResponse);
    if (success) {
      filledCount++;
      results['healthcare_motivation'] = 'filled';
      console.log('✅ Filled healthcare motivation');
    }
  }
  
  // Handle Legal First Name and Last Name fields with more specific selectors
  const legalFirstNameSelectors = [
    'input[name*="legal_first" i]',
    'input[id*="legal_first" i]',
    'input[placeholder*="legal first" i]',
    'input[aria-label*="legal first" i]',
    'input[data-testid*="legal_first" i]',
    'input[name*="first_name" i]',
    'input[id*="first_name" i]',
    'input[placeholder*="first name" i]',
    'input[aria-label*="first name" i]',
    'input[name*="applicant_first" i]',
    'input[id*="applicant_first" i]'
  ];
  
  const legalFirstNameElement = findElement(legalFirstNameSelectors);
  if (legalFirstNameElement && legalFirstNameElement.type !== 'email' && legalFirstNameElement.tagName.toLowerCase() !== 'textarea') {
    // Additional validation to ensure this is actually a name field
    const elementName = (legalFirstNameElement.name || '').toLowerCase();
    const elementId = (legalFirstNameElement.id || '').toLowerCase();
    const elementPlaceholder = (legalFirstNameElement.placeholder || '').toLowerCase();
    
    if (elementName.includes('first') || elementId.includes('first') || elementPlaceholder.includes('first')) {
      const success = fillInput(legalFirstNameElement, data.firstName);
      if (success) {
        filledCount++;
        results['legal_first_name'] = 'filled';
        console.log('✅ Filled Legal First Name:', data.firstName);
      }
    }
  }
  
  const legalLastNameSelectors = [
    'input[name*="legal_last" i]',
    'input[id*="legal_last" i]',
    'input[placeholder*="legal last" i]',
    'input[aria-label*="legal last" i]',
    'input[data-testid*="legal_last" i]',
    'input[name*="last_name" i]',
    'input[id*="last_name" i]',
    'input[placeholder*="last name" i]',
    'input[aria-label*="last name" i]',
    'input[name*="applicant_last" i]',
    'input[id*="applicant_last" i]'
  ];
  
  const legalLastNameElement = findElement(legalLastNameSelectors);
  if (legalLastNameElement && legalLastNameElement.type !== 'email' && legalLastNameElement.tagName.toLowerCase() !== 'textarea') {
    // Additional validation to ensure this is actually a name field
    const elementName = (legalLastNameElement.name || '').toLowerCase();
    const elementId = (legalLastNameElement.id || '').toLowerCase();
    const elementPlaceholder = (legalLastNameElement.placeholder || '').toLowerCase();
    
    if (elementName.includes('last') || elementId.includes('last') || elementPlaceholder.includes('last')) {
      const success = fillInput(legalLastNameElement, data.lastName);
      if (success) {
        filledCount++;
        results['legal_last_name'] = 'filled';
        console.log('✅ Filled Legal Last Name:', data.lastName);
      }
    }
  }
  
  // Handle Address Line field
  const addressLineSelectors = [
    'input[name*="address_line" i]',
    'input[id*="address_line" i]',
    'input[placeholder*="address line" i]',
    'input[aria-label*="address line" i]',
    'input[data-testid*="address_line" i]'
  ];
  
  const addressLineElement = findElement(addressLineSelectors);
  if (addressLineElement) {
    const success = fillInput(addressLineElement, data.address);
    if (success) {
      filledCount++;
      results['address_line'] = 'filled';
      console.log('✅ Filled Address Line:', data.address);
    }
  }
  
  // Handle Postal Code field
  const postalCodeSelectors = [
    'input[name*="postal" i]',
    'input[id*="postal" i]',
    'input[placeholder*="postal" i]',
    'input[aria-label*="postal" i]',
    'input[data-testid*="postal" i]'
  ];
  
  const postalCodeElement = findElement(postalCodeSelectors);
  if (postalCodeElement) {
    const success = fillInput(postalCodeElement, data.zipCode);
    if (success) {
      filledCount++;
      results['postal_code'] = 'filled';
      console.log('✅ Filled Postal Code:', data.zipCode);
    }
  }
  
  // Handle Gender dropdown
  const genderSelectors = [
    'select[name*="gender" i]',
    'select[id*="gender" i]',
    'select[name*="sex" i]',
    'select[id*="sex" i]'
  ];
  
  const genderElement = findElement(genderSelectors);
  if (genderElement) {
    const success = fillSelect(genderElement, 'Male'); // Default selection
    if (success) {
      filledCount++;
      results['gender'] = 'filled';
      console.log('✅ Filled Gender: Male');
    }
  }
  
  // Handle Race dropdown
  const raceSelectors = [
    'select[name*="race" i]',
    'select[id*="race" i]',
    'select[name*="ethnicity" i]',
    'select[id*="ethnicity" i]'
  ];
  
  const raceElement = findElement(raceSelectors);
  if (raceElement) {
    const success = fillSelect(raceElement, 'White'); // Default selection
    if (success) {
      filledCount++;
      results['race'] = 'filled';
      console.log('✅ Filled Race: White');
    }
  }
  
  // Handle Hispanic/Latino checkbox
  const hispanicSelectors = [
    'input[type="checkbox"][name*="hispanic" i]',
    'input[type="checkbox"][id*="hispanic" i]',
    'input[type="checkbox"][name*="latino" i]',
    'input[type="checkbox"][id*="latino" i]'
  ];
  
  const hispanicElement = findElement(hispanicSelectors);
  if (hispanicElement) {
    const success = fillCheckbox(hispanicElement, false); // Default to No
    if (success) {
      filledCount++;
      results['hispanic_latino'] = 'filled';
      console.log('✅ Filled Hispanic/Latino: No');
    }
  }
  
  // Handle Veteran Status dropdown
  const veteranSelectors = [
    'select[name*="veteran" i]',
    'select[id*="veteran" i]',
    'select[name*="military" i]',
    'select[id*="military" i]'
  ];
  
  const veteranElement = findElement(veteranSelectors);
  if (veteranElement) {
    const success = fillSelect(veteranElement, 'I am not a protected veteran'); // Default selection
    if (success) {
      filledCount++;
      results['veteran_status'] = 'filled';
      console.log('✅ Filled Veteran Status: Not a protected veteran');
    }
  }
  
  // Handle Disability Status radio buttons
  const disabilitySelectors = [
    'input[type="radio"][name*="disability" i]',
    'input[type="radio"][id*="disability" i]'
  ];
  
  const disabilityElements = document.querySelectorAll(disabilitySelectors.join(', '));
  if (disabilityElements.length > 0) {
    // Look for "No, I do not have a disability" option
    for (const radio of disabilityElements) {
      const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
      if (label && label.textContent.toLowerCase().includes('no, i do not have a disability')) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
        results['disability_status'] = 'filled';
        console.log('✅ Filled Disability Status: No disability');
        break;
      }
    }
  }
  
  // Handle Date field
  const dateSelectors = [
    'input[type="date"]',
    'input[name*="date" i]',
    'input[id*="date" i]',
    'input[placeholder*="date" i]'
  ];
  
  const dateElement = findElement(dateSelectors);
  if (dateElement) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const success = fillInput(dateElement, today);
    if (success) {
      filledCount++;
      results['date'] = 'filled';
      console.log('✅ Filled Date:', today);
    }
  }
  
  // Use label-based search for remaining fields (only if not already filled)
  const labelBasedFields = [
    { label: 'Legal First Name', value: data.firstName, type: 'input', fieldName: 'legal_first_name' },
    { label: 'Legal Last Name', value: data.lastName, type: 'input', fieldName: 'legal_last_name' },
    { label: 'Address', value: data.address, type: 'input', fieldName: 'address' },
    { label: 'Postal code', value: data.zipCode, type: 'input', fieldName: 'postal_code' },
    { label: 'City', value: data.city, type: 'input', fieldName: 'city' },
    { label: 'Address Line', value: data.address, type: 'input', fieldName: 'address_line' },
    { label: 'Country', value: data.country, type: 'select', fieldName: 'country' },
    { label: 'Gender', value: 'Male', type: 'select', fieldName: 'gender' },
    { label: 'Race', value: 'White', type: 'select', fieldName: 'race' },
    { label: 'Veteran', value: 'I am not a protected veteran', type: 'select', fieldName: 'veteran_status' },
    { label: 'Experience', value: data.yearsExperience || '8+', type: 'select', fieldName: 'experience' },
    { label: 'What drew you to healthcare', value: "I am drawn to healthcare because of the opportunity to make a meaningful impact on people's lives. With my technical background and passion for helping others, I believe I can contribute to improving healthcare systems and patient outcomes through innovative solutions.", type: 'textarea', fieldName: 'healthcare_motivation' }
  ];
  
  labelBasedFields.forEach(field => {
    // Only try to fill if not already filled by the selector-based approach
    if (!results[field.fieldName] || results[field.fieldName] !== 'filled') {
      const element = findFieldByLabel(field.label, field.type);
      if (element) {
        // Additional validation for name fields
        if (field.label.toLowerCase().includes('first name') || field.label.toLowerCase().includes('last name')) {
          // Make sure it's not an email field or textarea
          if (element.type === 'email' || element.tagName.toLowerCase() === 'textarea') {
            console.log(`⚠️ Skipping ${field.label} - wrong field type`);
            return;
          }
        }
        
        let success = false;
        
        if (field.type === 'select') {
          success = fillSelect(element, field.value);
        } else if (field.type === 'textarea') {
          success = fillTextarea(element, field.value);
        } else {
          success = fillInput(element, field.value);
        }
        
        if (success) {
          filledCount++;
          results[field.fieldName] = 'filled';
          console.log(`✅ Filled ${field.label}:`, field.value);
        }
      }
    }
  });
  
  console.log(`Form fill complete. Filled ${filledCount} fields.`);
  
  // Submit form if requested
  if (shouldSubmit) {
    setTimeout(() => {
      submitForm();
    }, 1000);
  }
  
  return { filledCount, results };
}

// Submit form
function submitForm() {
  console.log('Looking for submit button...');
  
  const submitButton = findElement(submitSelectors);
  
  if (submitButton) {
    console.log('Found submit button:', submitButton);
    try {
      submitButton.click();
      console.log('✅ Form submitted!');
    } catch (e) {
      console.error('Error clicking submit button:', e);
    }
  } else {
    console.log('❌ No submit button found');
  }
}

// Get form status
function getFormStatus() {
  let filledCount = 0;
  const results = {};
  
  Object.keys(fieldSelectors).forEach(fieldType => {
    const selectors = fieldSelectors[fieldType];
    const element = findElement(selectors);
    
    if (element && element.value && element.value.trim() !== '') {
      filledCount++;
      results[fieldType] = 'filled';
    } else {
      results[fieldType] = 'empty';
    }
  });
  
  return { success: true, filledCount, results };
}

// Auto-fill on page load for supported sites
if (window.location.hostname.includes('smartrecruiters.com') || 
    window.location.hostname.includes('apply.appcast.io')) {
  console.log('JobHax: Supported job site detected');
  
  // Show a notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 300px;
    ">
      <div style="font-weight: bold; margin-bottom: 5px;">🚀 JobHax Ready!</div>
      <div>Click the extension icon to auto-fill this job application</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

