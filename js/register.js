const SHEET_ID = 'YOUR_SHEET_ID';
const SHEET_NAME = 'Registrations';

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);

    // Format data for sheet
    const rowData = [
      new Date(), // Timestamp
      data.parent.firstName,
      data.parent.lastName,
      data.parent.idNumber,
      data.parent.email,
      data.parent.phone,
      data.parent.address,
      data.parent.emergencyContact.name,
      data.parent.emergencyContact.phone,
      data.child.firstName,
      data.child.lastName,
      data.child.dateOfBirth,
      data.child.gender,
      data.child.program,
      data.child.medicalInfo.conditions,
      data.child.medicalInfo.allergies,
      data.child.medicalInfo.medications,
    ];

    sheet.appendRow(rowData);

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: 'Registration saved successfully',
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Updated JavaScript for your web page
document.addEventListener('DOMContentLoaded', function () {
  const parentForm = document.getElementById('parentForm');
  const childForm = document.getElementById('childForm');
  const steps = document.querySelectorAll('.step');

  // Replace this URL with your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

  function nextStep() {
    if (validateParentForm()) {
      parentForm.classList.remove('active');
      childForm.classList.add('active');
      steps[1].classList.add('active');
      window.scrollTo(0, 0);
    }
  }

  function previousStep() {
    childForm.classList.remove('active');
    parentForm.classList.add('active');
    steps[1].classList.remove('active');
    window.scrollTo(0, 0);
  }

  function validateParentForm() {
    const requiredFields = parentForm.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    if (!isValid) {
      alert('Please fill in all required fields');
    }

    return isValid;
  }

  function validateChildForm() {
    const requiredFields = childForm.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });

    if (!isValid) {
      alert('Please fill in all required fields');
    }

    return isValid;
  }

  // Handle form submission
  childForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateChildForm()) {
      return;
    }

    const formData = {
      parent: {
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
      },
      child: {
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
      },
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Registration submitted successfully!');
        window.location.href = '/registration-success.html';
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(
        'There was an error submitting the registration. Please try again later.'
      );
    }
  });

  // Input validation helpers
  document
    .getElementById('parentPhone')
    .addEventListener('input', function (e) {
      this.value = this.value.replace(/[^\d+]/g, '');
    });

  document
    .getElementById('emergencyPhone')
    .addEventListener('input', function (e) {
      this.value = this.value.replace(/[^\d+]/g, '');
    });

  document.getElementById('parentID').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^\d]/g, '');
  });

  // Add click event listeners for navigation buttons
  document.querySelector('.next-btn').addEventListener('click', nextStep);
  document.querySelector('.back-btn').addEventListener('click', previousStep);
});
