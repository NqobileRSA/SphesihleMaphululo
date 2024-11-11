// Form navigation and validation
let currentStep = 1;
const forms = {
  1: document.getElementById('parentForm'),
  2: document.getElementById('childForm'),
  3: document.getElementById('paymentForm'),
};

function showStep(step) {
  Object.values(forms).forEach((form) => form.classList.remove('active'));
  forms[step].classList.add('active');

  // Update progress bar
  document.querySelectorAll('.step').forEach((stepEl, index) => {
    if (index + 1 <= step) {
      stepEl.classList.add('active');
    } else {
      stepEl.classList.remove('active');
    }
  });
}

function showValidationError(message) {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: 'top',
    position: 'right',
    style: {
      background: '#e74c3c',
    },
  }).showToast();
}

function validateStep(step) {
  const currentForm = forms[step];
  const requiredFields = currentForm.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      showValidationError(
        `${field.previousElementSibling.textContent.replace(
          ' *',
          ''
        )} is required`
      );
    } else {
      field.classList.remove('error');
    }
  });

  return isValid;
}

function nextStep(currentStepNumber) {
  if (validateStep(currentStepNumber)) {
    currentStep = currentStepNumber + 1;
    showStep(currentStep);
    window.scrollTo(0, 0);

    Toastify({
      text: 'Step saved successfully',
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      style: {
        background: '#2ecc71',
      },
    }).showToast();
  }
}

function previousStep(currentStepNumber) {
  currentStep = currentStepNumber - 1;
  showStep(currentStep);
  window.scrollTo(0, 0);
}

// Form submission handler with fixes
document
  .getElementById('registrationForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    const submitButton = document.querySelector('.submit-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    // Create a loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(255, 255, 255, 0.8);
display: flex;
justify-content: center;
align-items: center;
z-index: 9999;
`;
    loadingOverlay.innerHTML =
      '<div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h3>Processing Registration...</h3></div>';
    document.body.appendChild(loadingOverlay);

    try {
      const formData = new FormData();

      // Handle file upload
      const fileInput = document.getElementById('proofOfPayment');
      const file = fileInput.files[0];
      formData.append('proofOfPayment', file);

      // Prepare parent data
      const parentData = {
        firstName: document.getElementById('parentFirstName').value,
        lastName: document.getElementById('parentLastName').value,
        idNumber: document.getElementById('parentID').value,
        email: document.getElementById('parentEmail').value,
        phone: document.getElementById('parentPhone').value,
        address: document.getElementById('parentAddress').value,
        emergencyContact: {
          name: document.getElementById('emergencyContact').value,
          phone: document.getElementById('emergencyPhone').value,
        },
      };
      formData.append('parent', JSON.stringify(parentData));

      // Prepare child data
      const childData = {
        firstName: document.getElementById('childFirstName').value,
        lastName: document.getElementById('childLastName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        program: document.getElementById('program').value,
        medicalInfo: {
          conditions: document.getElementById('medicalConditions').value,
          allergies: document.getElementById('allergies').value,
          medications: document.getElementById('medications').value,
        },
      };
      formData.append('child', JSON.stringify(childData));

      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // Remove loading overlay
      document.body.removeChild(loadingOverlay);

      if (result.success) {
        // Show success state
        submitButton.textContent = 'Registration Successful! ✓';
        submitButton.style.backgroundColor = '#4CAF50';

        // Replace the entire form with success message
        const registrationSection = document.querySelector(
          '.registration-section'
        );
        registrationSection.innerHTML = `
  <div class="container">
    <div style="
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    ">
      <h2 style="color: #4CAF50; margin-bottom: 20px;">Registration Successful!</h2>
      <p style="margin-bottom: 20px;">Thank you for registering with Latter Glory Day Care.</p>
      <p style="margin-bottom: 20px;">We have received your registration and proof of payment.</p>
      <p style="margin-bottom: 30px;">Our team will review your application and contact you within 2-3 business days.</p>
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
        <p style="margin: 0;"><strong>Registration Reference:</strong> LGDC_${
          childData.firstName
        }_${new Date().getTime().toString().slice(-6)}</p>
      </div>
      <p style="color: #666;">Please save this reference number for future correspondence.</p>
    </div>
  </div>
`;

        // Prevent form resubmission on page refresh
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);

      // Remove loading overlay if still present
      if (document.body.contains(loadingOverlay)) {
        document.body.removeChild(loadingOverlay);
      }

      // Show error toast
      Toastify({
        text: error.message || 'Registration failed. Please try again.',
        duration: 6000,
        close: true,
        gravity: 'top',
        position: 'right',
        style: {
          background: '#e74c3c',
        },
      }).showToast();

      // Reset submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
// Field validation functions
function validatePhoneNumber(input) {
  const phoneRegex = /^\+?\d{10,12}$/;
  const value = input.value.trim();

  if (!phoneRegex.test(value)) {
    input.classList.add('error');
    showValidationError('Please enter a valid phone number (10-12 digits)');
    return false;
  }
  input.classList.remove('error');
  return true;
}

function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const value = input.value.trim();

  if (!emailRegex.test(value)) {
    input.classList.add('error');
    showValidationError('Please enter a valid email address');
    return false;
  }
  input.classList.remove('error');
  return true;
}

function validateIDNumber(input) {
  const value = input.value.trim();

  if (value.length !== 13 || !/^\d+$/.test(value)) {
    input.classList.add('error');
    showValidationError('ID number must be exactly 13 digits');
    return false;
  }
  input.classList.remove('error');
  return true;
}

function validateFileUpload(input) {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!input.files || !input.files[0]) {
    input.classList.add('error');
    showValidationError('Please select a file');
    return false;
  }

  const file = input.files[0];

  if (!allowedTypes.includes(file.type)) {
    input.classList.add('error');
    showValidationError('Please upload a PDF, JPG, or PNG file');
    return false;
  }

  if (file.size > maxSize) {
    input.classList.add('error');
    showValidationError('File size must be less than 5MB');
    return false;
  }

  input.classList.remove('error');
  return true;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function () {
  // Phone number validation
  document
    .getElementById('parentPhone')
    .addEventListener('input', function (e) {
      this.value = this.value.replace(/[^\d+]/g, '');
      validatePhoneNumber(this);
    });

  document
    .getElementById('emergencyPhone')
    .addEventListener('input', function (e) {
      this.value = this.value.replace(/[^\d+]/g, '');
      validatePhoneNumber(this);
    });

  // ID number validation
  document.getElementById('parentID').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^\d]/g, '');
    validateIDNumber(this);
  });

  // Email validation
  document
    .getElementById('parentEmail')
    .addEventListener('input', function (e) {
      validateEmail(this);
    });

  // File upload validation
  document
    .getElementById('proofOfPayment')
    .addEventListener('change', function (e) {
      validateFileUpload(this);
    });

  // Date of birth validation
  const dateOfBirth = document.getElementById('dateOfBirth');
  const today = new Date().toISOString().split('T')[0];
  dateOfBirth.setAttribute('max', today);

  dateOfBirth.addEventListener('change', function (e) {
    const today = new Date();
    const birthDate = new Date(this.value);
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age > 6) {
      this.classList.add('error');
      showValidationError('Child must be 6 years or younger');
    } else if (birthDate > today) {
      this.classList.add('error');
      showValidationError('Date cannot be in the future');
    } else {
      this.classList.remove('error');
    }
  });

  // Add blur event listeners for real-time validation feedback
  const requiredInputs = document.querySelectorAll(
    'input[required], select[required], textarea[required]'
  );
  requiredInputs.forEach((input) => {
    input.addEventListener('blur', function () {
      if (!this.value.trim()) {
        this.classList.add('error');
        showValidationError(
          `${this.previousElementSibling.textContent.replace(
            ' *',
            ''
          )} is required`
        );
      } else {
        this.classList.remove('error');
      }
    });
  });
});
