/**
 * Samarth eGov / Kumaun University Student & Admin Authentication
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Captcha Management
  let currentCaptcha = '';
  const captchaDisplay = document.getElementById('captchaText');
  const captchaInput = document.getElementById('inputCaptcha');

  function generateCaptcha() {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    currentCaptcha = code;
    if (captchaDisplay) {
      captchaDisplay.textContent = code;
    }
    if (captchaInput) {
      captchaInput.value = '';
    }
  }

  if (captchaDisplay) {
    captchaDisplay.addEventListener('click', generateCaptcha);
  }

  generateCaptcha();

  // 2. Font Resizer (A-, A, A+)
  const fontDecrease = document.getElementById('fontDecrease');
  const fontNormal = document.getElementById('fontNormal');
  const fontIncrease = document.getElementById('fontIncrease');
  const rootHtml = document.documentElement;

  const fontButtons = [fontDecrease, fontNormal, fontIncrease];

  function setActiveFontBtn(activeBtn) {
    fontButtons.forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');
  }

  if (fontDecrease) {
    fontDecrease.addEventListener('click', () => {
      rootHtml.style.setProperty('--font-base', '12px');
      setActiveFontBtn(fontDecrease);
    });
  }

  if (fontNormal) {
    fontNormal.addEventListener('click', () => {
      rootHtml.style.setProperty('--font-base', '13.5px');
      setActiveFontBtn(fontNormal);
    });
  }

  if (fontIncrease) {
    fontIncrease.addEventListener('click', () => {
      rootHtml.style.setProperty('--font-base', '15px');
      setActiveFontBtn(fontIncrease);
    });
  }

  // 3. Form Validation & Authentication
  const loginForm = document.getElementById('loginForm');
  const inputEnrolment = document.getElementById('inputEnrolment');
  const errorEnrolment = document.getElementById('errorEnrolment');
  const inputPassword = document.getElementById('inputPassword');

  function validateEnrolment() {
    if (!inputEnrolment) return true;
    const val = inputEnrolment.value.trim();
    if (val === '') {
      inputEnrolment.classList.add('has-error');
      if (errorEnrolment) {
        errorEnrolment.textContent = 'Enrolment Number cannot be blank.';
        errorEnrolment.classList.add('show');
      }
      return false;
    } else {
      inputEnrolment.classList.remove('has-error');
      if (errorEnrolment) {
        errorEnrolment.classList.remove('show');
      }
      return true;
    }
  }

  if (inputEnrolment) {
    inputEnrolment.addEventListener('input', () => {
      if (inputEnrolment.value.trim() !== '') {
        inputEnrolment.classList.remove('has-error');
        if (errorEnrolment) errorEnrolment.classList.remove('show');
      }
    });

    inputEnrolment.addEventListener('blur', () => {
      if (inputEnrolment.value.trim() === '') {
        validateEnrolment();
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEnrolmentValid = validateEnrolment();

      if (!isEnrolmentValid) {
        inputEnrolment.focus();
        return;
      }

      const enteredId = inputEnrolment.value.trim();
      const enteredPassword = inputPassword?.value.trim();
      const enteredCaptcha = captchaInput?.value.trim();

      if (!enteredPassword) {
        alert('Please enter your Password.');
        inputPassword?.focus();
        return;
      }

      if (!enteredCaptcha) {
        alert('Please enter the Captcha code shown above.');
        captchaInput?.focus();
        return;
      }

      if (enteredCaptcha !== currentCaptcha) {
        alert('Invalid Captcha! Please enter the exact digits shown.');
        generateCaptcha();
        captchaInput?.focus();
        return;
      }

      // Check for Admin Login
      if (enteredId.toLowerCase() === 'admin' && (enteredPassword === 'admin123' || enteredPassword === 'Admin@123')) {
        alert('Admin Authentication Successful! Redirecting to Admin Console...');
        window.location.href = 'admin.html';
        return;
      }

      // Check in PortalDB Students
      const student = window.PortalDB ? PortalDB.getStudentById(enteredId) : null;
      if (student) {
        if (student.password === enteredPassword) {
          PortalDB.setCurrentUser(student);
          window.location.href = 'profile.html';
          return;
        } else {
          alert('Invalid Password for enrolment ' + enteredId);
          inputPassword?.focus();
          return;
        }
      } else {
        // Fallback for demo student
        if (enteredId.toUpperCase() === 'KU20247319') {
          window.location.href = 'profile.html';
        } else {
          alert('Enrolment number not found in university records. Please check or register as a New User.');
        }
      }
    });
  }

  // 4. Modal Controls
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('is-active');
      document.body.style.overflow = 'auto';
    }
  }

  document.getElementById('btnGeneralInstructions')?.addEventListener('click', () => openModal('instructionsModal'));
  document.getElementById('btnPublicNotice')?.addEventListener('click', () => openModal('noticeModal'));
  document.getElementById('btnForgotPass')?.addEventListener('click', (e) => { e.preventDefault(); openModal('forgotModal'); });
  
  [document.getElementById('btnRegisterNav'), document.getElementById('btnRegisterBody')].forEach(btn => {
    btn?.addEventListener('click', (e) => { e.preventDefault(); openModal('registerModal'); });
  });

  document.getElementById('navLoginBtn')?.addEventListener('click', () => inputEnrolment?.focus());

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('is-active');
        document.body.style.overflow = 'auto';
      }
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });
});
