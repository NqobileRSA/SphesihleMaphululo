document.addEventListener('DOMContentLoaded', function () {
  const parentForm = document.getElementById('parentForm');
  const childForm = document.getElementById('childForm');
  const paymentForm = document.getElementById('paymentForm');
  const steps = document.querySelectorAll('.step');

  let currentStep = 0;

  function showStep(step) {
    parentForm.classList.remove('active');
    childForm.classList.remove('active');
    paymentForm.classList.remove('active');
    steps.forEach((stepEl) => stepEl.classList.remove('active'));

    if (step === 0) {
      parentForm.classList.add('active');
      steps[0].classList.add('active');
    } else if (step === 1) {
      childForm.classList.add('active');
      steps[1].classList.add('active');
    } else if (step === 2) {
      paymentForm.classList.add('active');
      steps[2].classList.add('active');
    }
  }

  function validateParentForm() {
    return Array.from(parentForm.querySelectorAll('[required]')).every(
      (input) => input.value.trim() !== ''
    );
  }

  function validateChildForm() {
    return Array.from(childForm.querySelectorAll('[required]')).every(
      (input) => input.value.trim() !== ''
    );
  }

  function nextStep() {
    if (currentStep === 0 && validateParentForm()) {
      currentStep = 1;
      showStep(currentStep);
    } else if (currentStep === 1 && validateChildForm()) {
      currentStep = 2;
      showStep(currentStep);
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  showStep(currentStep);

  document.querySelector('.next-btn').addEventListener('click', nextStep);
  document
    .querySelectorAll('.back-btn')
    .forEach((btn) => btn.addEventListener('click', previousStep));

  paymentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

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
      payment: {
        cardholderName: document.getElementById('cardholder_name').value,
      },
    };

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
});
