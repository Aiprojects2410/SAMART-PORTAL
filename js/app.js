/**
 * Samarth eGov / Kumaun University Student Portal
 * Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Captcha Management
  let currentCaptcha = '';
  const captchaDisplay = document.getElementById('captchaText');
  const captchaWrapper = document.getElementById('captchaCanvasWrap');
  const refreshCaptchaBtn = document.getElementById('btnRefreshCaptcha');
  const captchaInput = document.getElementById('inputCaptcha');

  function generateCaptcha() {
    // Generate a 7-digit number as shown in the screenshot (e.g. 7285867)
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

  if (captchaWrapper) {
    captchaWrapper.addEventListener('click', generateCaptcha);
  }
  if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener('click', generateCaptcha);
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
      rootHtml.style.setProperty('--font-base-size', '12.5px');
      setActiveFontBtn(fontDecrease);
    });
  }

  if (fontNormal) {
    fontNormal.addEventListener('click', () => {
      rootHtml.style.setProperty('--font-base-size', '14px');
      setActiveFontBtn(fontNormal);
    });
  }

  if (fontIncrease) {
    fontIncrease.addEventListener('click', () => {
      rootHtml.style.setProperty('--font-base-size', '15.5px');
      setActiveFontBtn(fontIncrease);
    });
  }

  // 3. Form Validation & Submission
  const loginForm = document.getElementById('loginForm');
  const inputEnrolment = document.getElementById('inputEnrolment');
  const errorEnrolment = document.getElementById('errorEnrolment');
  const inputPassword = document.getElementById('inputPassword');

  function validateEnrolment() {
    if (!inputEnrolment) return true;
    const val = inputEnrolment.value.trim();
    if (val === '') {
      inputEnrolment.classList.add('is-invalid');
      if (errorEnrolment) {
        errorEnrolment.textContent = 'Enrolment Number cannot be blank.';
        errorEnrolment.classList.add('visible');
      }
      return false;
    } else {
      inputEnrolment.classList.remove('is-invalid');
      if (errorEnrolment) {
        errorEnrolment.classList.remove('visible');
      }
      return true;
    }
  }

  if (inputEnrolment) {
    inputEnrolment.addEventListener('input', () => {
      if (inputEnrolment.value.trim() !== '') {
        inputEnrolment.classList.remove('is-invalid');
        if (errorEnrolment) errorEnrolment.classList.remove('visible');
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

      if (!inputPassword || inputPassword.value.trim() === '') {
        alert('Please enter your Password.');
        inputPassword?.focus();
        return;
      }

      const enteredCaptcha = captchaInput?.value.trim();
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

      // Successful demo simulation
      alert(`Login Successful!\nWelcome Enrolment No: ${inputEnrolment.value.trim()}`);
    });
  }

  // 4. Modal Controls (Instructions, Public Notice, Registration)
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = 'auto';
    }
  }

  // Attach modal triggers
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

  // Close modals on click close-btn or backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modalId = closeBtn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });
});
