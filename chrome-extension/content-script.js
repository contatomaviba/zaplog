// Content script for WhatsApp Web integration
(function() {
  'use strict';

  // Wait for WhatsApp Web to load
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      function check() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(check, 100);
        }
      }
      
      check();
    });
  }

  // Extract contact information from current chat
  function extractContactInfo() {
    try {
      let name = '';
      let phone = '';

      // Wait a bit for the page to load
      waitForElement('[data-testid="conversation-header"]', 2000).then(() => {
        // Try multiple selectors for contact name
        const nameSelectors = [
          '[data-testid="conversation-header"] span[title]',
          '[data-testid="conversation-header"] span[dir="auto"]',
          'header span[title]',
          '[data-testid="conversation-panel-header"] span'
        ];

        for (const selector of nameSelectors) {
          const nameElement = document.querySelector(selector);
          if (nameElement && nameElement.textContent.trim()) {
            name = nameElement.textContent.trim();
            // Remove suffixes like " - ELITE OP", " (você)", etc.
            name = name.replace(/\\s*-\\s*.*$/, '').replace(/\\s*\\(.*\\)$/, '').trim();
            break;
          }
        }

        // If still no name, try getting from URL
        if (!name) {
          const urlMatch = window.location.href.match(/\\/(\\d+)/);
          if (urlMatch) {
            phone = urlMatch[1];
            name = `Contato ${phone.slice(-4)}`;
          }
        }

        // Try to extract phone number
        const phoneSelectors = [
          '[title*="+55"]',
          '[title*="+"]',
          'span[title*="("]',
          '[data-testid="conversation-header"]'
        ];

        for (const selector of phoneSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const text = (el.getAttribute('title') || el.textContent || '').trim();
            const phoneMatch = text.match(/\\+?(\\d{2,3})?\\s*\\(?(\\d{2,3})\\)?\\s*(\\d{4,5})\\-?(\\d{4})/);
            if (phoneMatch) {
              phone = text.replace(/\\D/g, '');
              if (phone.length >= 10) {
                break;
              }
            }
          }
          if (phone) break;
        }

        // If no phone found in DOM, try to extract from URL
        if (!phone) {
          const urlMatch = window.location.href.match(/\\/(\\d{10,})/);
          if (urlMatch) {
            phone = urlMatch[1];
          }
        }
      }).catch(() => {
        // Fallback if elements not found
        name = 'Contato WhatsApp';
        phone = '';
      });

      // Immediate extraction attempt
      const headerElement = document.querySelector('[data-testid="conversation-header"]');
      if (headerElement) {
        const titleElement = headerElement.querySelector('span[title], span[dir="auto"]');
        if (titleElement && titleElement.textContent.trim()) {
          name = titleElement.textContent.trim();
          // Clean the name
          name = name.replace(/\\s*-\\s*.*$/, '').replace(/\\s*\\(.*\\)$/, '').trim();
        }
      }

      // If still no name, use a default
      if (!name) {
        name = 'Contato WhatsApp';
      }

      return { name, phone };
    } catch (error) {
      console.error('Error extracting contact info:', error);
      return { name: 'Contato WhatsApp', phone: '' };
    }
  }

  // Send location request message
  function sendLocationRequest() {
    try {
      const messageInput = document.querySelector('[contenteditable="true"][data-testid="message-compose"]');
      if (messageInput) {
        const message = "Olá! Por favor, envie sua localização atual para acompanhamento da viagem. Obrigado!";
        
        // Set the message
        messageInput.textContent = message;
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        messageInput.dispatchEvent(inputEvent);
        
        // Find and click send button
        setTimeout(() => {
          const sendButton = document.querySelector('[data-testid="send"]');
          if (sendButton) {
            sendButton.click();
          }
        }, 100);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending location request:', error);
      return false;
    }
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractContactInfo") {
      const contactInfo = extractContactInfo();
      
      // Store contact info in Chrome storage
      chrome.storage.local.set({ 
        contactData: {
          ...contactInfo,
          timestamp: Date.now()
        }
      });
      
      // Show trip form notification
      showTripFormNotification(contactInfo);
      
      sendResponse({ success: true, data: contactInfo });
    } else if (request.action === "sendLocationRequest") {
      const success = sendLocationRequest();
      sendResponse({ success });
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Show trip form notification
  function showTripFormNotification(contactInfo) {
    const notification = document.createElement('div');
    notification.id = 'zaplog-trip-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563EB;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-family: Inter, sans-serif;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 320px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M9.78 12l4.44-4.44L12.81 6.15 6.96 12l5.85 5.85 1.41-1.41L9.78 12z"/>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">Zaplog</div>
          <div style="font-size: 13px; opacity: 0.9;">Contato extraído: ${contactInfo.name || 'Nome não encontrado'}</div>
          <div style="font-size: 12px; opacity: 0.8;">Clique na extensão para criar viagem</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; opacity: 0.8;">×</button>
      </div>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 8000);
  }

  function initialize() {
    console.log('Zaplog content script loaded on WhatsApp Web');
    
    // Add visual indicator that Zaplog is active
    waitForElement('body').then(() => {
      if (!document.getElementById('zaplog-indicator')) {
        const indicator = document.createElement('div');
        indicator.id = 'zaplog-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: #2563EB;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: Inter, sans-serif;
          z-index: 9999;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        indicator.textContent = 'Zaplog Ativo';
        document.body.appendChild(indicator);
        
        // Hide indicator after 3 seconds
        setTimeout(() => {
          indicator.style.opacity = '0';
          indicator.style.transition = 'opacity 0.3s';
          setTimeout(() => indicator.remove(), 300);
        }, 3000);
      }
    });
  }
})();