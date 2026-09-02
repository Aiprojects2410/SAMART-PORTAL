/**
 * Samarth eGov Unified Core Script
 * Provides global functionality across all Student Portal pages:
 * 1. Font Size Scaler (A-, A, A+)
 * 2. Active Session Management & User info sync
 * 3. Logout handler with session cleanup
 * 4. Active sidebar tab detection
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Font Scaler Controls
  const fontDecrease = document.getElementById('fontDecrease');
  const fontNormal = document.getElementById('fontNormal');
  const fontIncrease = document.getElementById('fontIncrease');
  const rootHtml = document.documentElement;
  const fontButtons = [fontDecrease, fontNormal, fontIncrease];

  function setActiveFont(btn, size) {
    fontButtons.forEach(b => b?.classList.remove('active'));
    btn?.classList.add('active');
    rootHtml.style.setProperty('--font-base', size);
    try { localStorage.setItem('samarth_font_size', size); } catch (e) {}
  }

  // Restore saved font size
  const savedFontSize = localStorage.getItem('samarth_font_size');
  if (savedFontSize === '12px' && fontDecrease) setActiveFont(fontDecrease, '12px');
  else if (savedFontSize === '15px' && fontIncrease) setActiveFont(fontIncrease, '15px');

  fontDecrease?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveFont(fontDecrease, '12px');
  });

  fontNormal?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveFont(fontNormal, '13.5px');
  });

  fontIncrease?.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveFont(fontIncrease, '15px');
  });

  // 2. Sync Active Logged-in User across Navbar and Profile
  if (window.PortalDB) {
    const student = PortalDB.getCurrentUser();
    if (student) {
      // Navbar details
      document.querySelectorAll('.user-tag-name').forEach(el => el.textContent = student.name || 'MOHD MOHSIN KHAN');
      document.querySelectorAll('.user-tag-enrol').forEach(el => el.textContent = student.enrolment || 'KU20247319');
      if (student.photo) {
        document.querySelectorAll('.user-photo-thumb').forEach(img => img.src = student.photo);
      }

      // Dynamic data bindings across profile, id card, admit card
      const bindings = {
        'stu-bind-name': student.name,
        'stu-bind-enrol': student.enrolment,
        'stu-bind-roll': student.rollNo,
        'stu-bind-father': student.fatherName,
        'stu-bind-mother': student.motherName || 'Verified Parent Record',
        'stu-bind-gender': student.gender || 'MALE',
        'stu-bind-dob': student.dob || '22/02/2001',
        'stu-bind-category': student.category || 'General',
        'stu-bind-blood': student.bloodGroup || 'B+',
        'stu-bind-email': student.email,
        'stu-bind-mobile': student.mobile,
        'stu-bind-programme': student.programme || 'Bachelor of Commerce (B.COM.)',
        'stu-bind-college': student.college || 'Sardar Bhagat Singh Govt. P.G. College Rudrapur',
        'stu-bind-batch': student.batch || '2022 – 2024',
        'stu-bind-status': student.status || 'Graduated / Passout (First Division)'
      };

      Object.entries(bindings).forEach(([className, val]) => {
        if (val) {
          document.querySelectorAll('.' + className).forEach(el => el.textContent = val);
        }
      });
    }
  }

  // 3. Logout Handler
  document.querySelectorAll('.btn-logout-portal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.PortalDB) {
        PortalDB.clearCurrentUser();
      }
      window.location.href = 'index.html';
    });
  });

  // 4. Auto-Highlight Active Sidebar Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.portal-sidebar .sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
    } else if (href && !href.startsWith('#')) {
      link.classList.remove('active');
    }
  });
});
