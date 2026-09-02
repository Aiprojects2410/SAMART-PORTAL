/**
 * Samarth eGov / Kumaun University Student Portal
 * Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Student Database
  const registeredStudents = {
    'KU20247319': {
      password: 'Mohsin@8080',
      name: 'MOHD MOHSIN KHAN',
      gender: 'MALE',
      email: 'Mohsinkhann495@gmail.com',
      mobile: '+91 96909 41117',
      dob: '22/02/2001',
      role: 'Student',
      dashboardUrl: 'profile.html' // Direct redirect to Student Profile on login
    }
  };

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

  // Initial Captcha Load
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

      // Check registered student credentials
      const student = registeredStudents[enteredId];
      if (student) {
        if (student.password === enteredPassword) {
          // Success authentication -> directly open Student Profile
          sessionStorage.setItem('loggedInUser', JSON.stringify(student));
          window.location.href = 'profile.html';
          return;
        } else {
          alert('Invalid Password for enrolment number ' + enteredId);
          inputPassword?.focus();
          return;
        }
      } else {
        // Generic student login simulation -> Profile
        sessionStorage.setItem('loggedInUser', JSON.stringify({
          name: 'Student User',
          id: enteredId
        }));
        window.location.href = 'profile.html';
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

  const btnInstructions = document.getElementById('btnGeneralInstructions');
  if (btnInstructions) {
    btnInstructions.addEventListener('click', () => openModal('instructionsModal'));
  }

  const btnPublicNotice = document.getElementById('btnPublicNotice');
  if (btnPublicNotice) {
    btnPublicNotice.addEventListener('click', () => openModal('noticeModal'));
  }

  const btnForgotPass = document.getElementById('btnForgotPass');
  if (btnForgotPass) {
    btnForgotPass.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('forgotModal');
    });
  }

  const btnRegisterNav = document.getElementById('btnRegisterNav');
  const btnRegisterBody = document.getElementById('btnRegisterBody');
  [btnRegisterNav, btnRegisterBody].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('registerModal');
      });
    }
  });

  const navLoginBtn = document.getElementById('navLoginBtn');
  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', () => {
      inputEnrolment?.focus();
    });
  }

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
