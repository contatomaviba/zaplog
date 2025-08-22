// Background script for Zaplog extension
const APP_URL = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for WhatsApp Web
  chrome.contextMenus.create({
    id: "zaplog-start-tracking",
    title: "Iniciar Acompanhamento Zaplog",
    contexts: ["all"],
    documentUrlPatterns: ["https://web.whatsapp.com/*"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "zaplog-start-tracking") {
    // Check if tab is WhatsApp Web
    if (tab.url && tab.url.includes('web.whatsapp.com')) {
      // Send message to content script to extract contact info
      chrome.tabs.sendMessage(tab.id, {
        action: "extractContactInfo"
      }).catch(error => {
        console.log('Content script not ready, injecting...');
        // If content script is not ready, inject it manually
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-script.js']
        }).then(() => {
          // Try sending message again after injection
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
              action: "extractContactInfo"
            });
          }, 500);
        });
      });
    } else {
      // Not on WhatsApp Web, open WhatsApp Web first
      chrome.tabs.create({
        url: 'https://web.whatsapp.com'
      });
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openDashboard") {
    // Open dashboard web app in new tab
    chrome.tabs.create({
      url: APP_URL
    });
  } else if (request.action === "openWhatsApp") {
    // Open WhatsApp Web with specific contact
    const phone = request.phone.replace(/\D/g, ''); // Remove non-digits
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${phone}`;
    chrome.tabs.create({
      url: whatsappUrl
    });
  } else if (request.action === "createTrip") {
    // Forward trip creation to web dashboard
    handleCreateTrip(request.tripData)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

// Handle creating trip via API
async function handleCreateTrip(tripData) {
  try {
    // Get user token from storage
    const result = await chrome.storage.local.get(['zaplogUser']);
    const user = result.zaplogUser;
    
    if (!user || !user.token) {
      throw new Error('Usuário não logado');
    }

    const response = await fetch(`${APP_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar viagem');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
}

// Handle storage changes to sync between extension components
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.contactData) {
    // Notify popup that contact data is available (only if popup is open)
    chrome.runtime.sendMessage({
      action: "contactDataUpdated",
      data: changes.contactData.newValue
    }).catch(() => {
      // Ignore errors if popup is not open
    });
  }
});