(function() {
  'use strict';

  // DOM elements
  const elements = {
    notLoggedIn: document.getElementById('not-logged-in'),
    tripForm: document.getElementById('trip-form'),
    successState: document.getElementById('success-state'),
    errorState: document.getElementById('error-state'),
    form: document.getElementById('trip-details-form'),
    driverName: document.getElementById('driver-name'),
    driverPhone: document.getElementById('driver-phone'),
    plate: document.getElementById('plate'),
    origin: document.getElementById('origin'),
    destination: document.getElementById('destination'),
    observations: document.getElementById('observations'),
    cancelBtn: document.getElementById('cancel-btn'),
    retryBtn: document.getElementById('retry-btn'),
    errorMessage: document.getElementById('error-message'),
    openDashboardBtn: document.getElementById('open-dashboard-btn'),
    openDashboardSuccessBtn: document.getElementById('open-dashboard-success-btn'),
    dashboardFooterBtn: document.getElementById('dashboard-footer-btn')
  };

  // State management
  let currentUser = null;
  let contactData = null;

  // Show specific state
  function showState(stateName) {
    Object.values(elements).forEach(el => {
      if (el && el.classList.contains('state-container')) {
        el.classList.add('hidden');
      }
    });

    const stateElement = elements[stateName];
    if (stateElement) {
      stateElement.classList.remove('hidden');
    }
  }

  // Initialize popup
  async function initialize() {
    try {
      // Check if user is logged in
      const result = await chrome.storage.local.get(['zaplogUser', 'contactData']);
      currentUser = result.zaplogUser;
      contactData = result.contactData;

      if (currentUser) {
        // User is logged in, check if we have contact data to show form
        if (contactData && Date.now() - contactData.timestamp < 300000) { // 5 minutes
          showTripForm();
        } else {
          showState('notLoggedIn');
        }
      } else {
        showState('notLoggedIn');
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
      showState('notLoggedIn');
    }
  }

  // Show trip form with extracted contact data
  function showTripForm() {
    if (contactData) {
      elements.driverName.value = contactData.name || '';
      elements.driverPhone.value = contactData.phone || '';
    }
    showState('tripForm');
  }

  // Create trip via background script
  async function createTrip(tripData) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'createTrip',
        tripData: tripData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
      showError('Você precisa estar logado para criar uma viagem');
      return;
    }

    const formData = new FormData(elements.form);
    const tripData = {
      driverName: elements.driverName.value.trim(),
      phone: elements.driverPhone.value.trim(),
      plate: elements.plate.value.trim().toUpperCase(),
      origin: elements.origin.value.trim(),
      destination: elements.destination.value.trim(),
      observations: elements.observations.value.trim(),
      status: 'pending',
      isActive: true
    };

    // Validate required fields
    if (!tripData.driverName || !tripData.phone || !tripData.plate || !tripData.origin || !tripData.destination) {
      showError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Disable form and show loading
      const submitBtn = elements.form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Criando...';

      await createTrip(tripData);
      
      // Clear contact data
      chrome.storage.local.remove('contactData');
      
      showState('successState');
    } catch (error) {
      showError(error.message);
    } finally {
      // Re-enable form
      const submitBtn = elements.form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar Viagem';
    }
  }

  // Show error state
  function showError(message) {
    elements.errorMessage.textContent = message;
    showState('errorState');
  }

  // Open dashboard
  function openDashboard() {
    chrome.runtime.sendMessage({ action: 'openDashboard' });
    window.close();
  }

  // Event listeners
  elements.form?.addEventListener('submit', handleFormSubmit);
  elements.cancelBtn?.addEventListener('click', () => {
    chrome.storage.local.remove('contactData');
    showState('notLoggedIn');
  });
  elements.retryBtn?.addEventListener('click', () => showTripForm());
  elements.openDashboardBtn?.addEventListener('click', openDashboard);
  elements.openDashboardSuccessBtn?.addEventListener('click', openDashboard);
  elements.dashboardFooterBtn?.addEventListener('click', openDashboard);

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.zaplogUser) {
        currentUser = changes.zaplogUser.newValue;
        if (!currentUser) {
          showState('notLoggedIn');
        }
      }
      if (changes.contactData) {
        contactData = changes.contactData.newValue;
        if (contactData && currentUser) {
          showTripForm();
        }
      }
    }
  });

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showTripForm') {
      contactData = request.contactInfo;
      if (currentUser) {
        showTripForm();
      }
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();