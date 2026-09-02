/**
 * Samarth eGov Admin Portal Controller
 * Full-featured Student Management, Auto-Generative IDs, Manual Passwords,
 * Grade Card Manager, and Connected Helpdesk Grievance Resolution.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tabs Switcher
  const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  window.switchAdminTab = (tabId) => {
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });
    tabPanes.forEach(pane => {
      pane.style.display = pane.id === tabId ? 'block' : 'none';
    });
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchAdminTab(tabId);
    });
  });

  // 2. Auto-Generation Helpers
  function generateAutoEnrolment() {
    const existing = PortalDB.getStudents();
    let code = '';
    do {
      const rand = Math.floor(1000 + Math.random() * 9000);
      code = 'KU2024' + rand;
    } while (existing[code]);
    return code;
  }

  function generateAutoRollNo() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return '223352' + rand;
  }

  function generateSuggestedPassword(name) {
    const cleanName = (name || 'Student').trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const capitalized = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() : 'Student';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${capitalized}@${rand}`;
  }

  // 3. Render Metrics & Tables
  function refreshAdminUI() {
    const students = PortalDB.getStudents();
    const tickets = PortalDB.getTickets();
    const studentList = Object.values(students);

    // Metrics Counters
    let totalGradeCardsCount = 0;
    studentList.forEach(s => {
      const gcs = PortalDB.getGradeCards(s.enrolment);
      totalGradeCardsCount += gcs.length;
    });

    const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

    const metricStu = document.getElementById('metricTotalStudents');
    const metricGC = document.getElementById('metricTotalGradeCards');
    const metricTkt = document.getElementById('metricOpenTickets');
    const badgePending = document.getElementById('pendingBadge');

    if (metricStu) metricStu.textContent = studentList.length;
    if (metricGC) metricGC.textContent = totalGradeCardsCount;
    if (metricTkt) metricTkt.textContent = openTicketsCount;
    if (badgePending) badgePending.textContent = openTicketsCount;

    // Overview Recent Tickets Table
    const overviewTable = document.getElementById('overviewTicketsTableBody');
    if (overviewTable) {
      overviewTable.innerHTML = tickets.slice(0, 5).map(t => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${t.studentName || t.studentId}</td>
          <td><code style="color:#0284c7;">${t.studentId}</code></td>
          <td>${t.category}</td>
          <td>${t.subject}</td>
          <td>
            <span class="badge-status ${t.status === 'Resolved' ? 'badge-resolved' : t.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}">
              ${t.status}
            </span>
          </td>
          <td>
            <button class="btn-admin-primary" style="padding:4px 10px; font-size:0.78rem;" onclick="openTicketReplyModal('${t.id}')">
              Respond
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Render Student Database Table
    renderStudentsTable();

    // Student Dropdown in Grade Card Manager
    const gcSelect = document.getElementById('gradeCardStudentSelect');
    const gcModalSelect = document.getElementById('gcEnrolment');
    if (gcSelect && gcModalSelect) {
      const opts = studentList.map(s => `<option value="${s.enrolment}">${s.name} (${s.enrolment})</option>`).join('');
      gcSelect.innerHTML = opts;
      gcModalSelect.innerHTML = opts;
      renderGradeCardsForSelectedStudent();
    }

    // All Grievances Table
    const grievancesTable = document.getElementById('allGrievancesTableBody');
    if (grievancesTable) {
      grievancesTable.innerHTML = tickets.map(t => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td style="font-size:0.8rem; color:#64748b;">${t.createdAt}</td>
          <td>
            <strong>${t.studentName || t.studentId}</strong><br>
            <span style="font-size:0.78rem; color:#0284c7;">${t.studentId}</span>
          </td>
          <td>${t.category}</td>
          <td>
            <strong>${t.subject}</strong>
            <p style="font-size:0.82rem; color:#475569; margin-top:2px;">${t.description}</p>
            ${t.adminReply ? `<div style="background:#ecfdf5; border-left:3px solid #10b981; padding:4px 8px; font-size:0.78rem; color:#065f46; margin-top:4px;"><strong>Admin Reply:</strong> ${t.adminReply}</div>` : ''}
          </td>
          <td>
            <span class="badge-status ${t.status === 'Resolved' ? 'badge-resolved' : t.status === 'In Progress' ? 'badge-progress' : 'badge-pending'}">
              ${t.status}
            </span>
          </td>
          <td>
            <button class="btn-admin-primary" style="padding:4px 10px; font-size:0.8rem;" onclick="openTicketReplyModal('${t.id}')">
              ${t.status === 'Resolved' ? 'Update Reply' : 'Resolve'}
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // 4. Render Students Table with Search
  function renderStudentsTable(filterQuery = '') {
    const students = PortalDB.getStudents();
    let studentList = Object.values(students);

    if (filterQuery.trim() !== '') {
      const q = filterQuery.toLowerCase();
      studentList = studentList.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.enrolment && s.enrolment.toLowerCase().includes(q)) ||
        (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
        (s.programme && s.programme.toLowerCase().includes(q)) ||
        (s.college && s.college.toLowerCase().includes(q))
      );
    }

    const studentTable = document.getElementById('studentTableBody');
    if (!studentTable) return;

    if (studentList.length === 0) {
      studentTable.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:24px;">No students found matching your search.</td></tr>`;
      return;
    }

    studentTable.innerHTML = studentList.map(s => `
      <tr>
        <td><strong style="color:#0284c7;">${s.enrolment}</strong></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.rollNo || '-'}</td>
        <td>${s.programme || 'B.COM.'}</td>
        <td style="font-size:0.82rem; color:#475569;">${s.college || 'Kumaun University'}</td>
        <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700; color:#1e293b;">${s.password || '******'}</code></td>
        <td><span class="badge-status badge-resolved">${s.status || 'Active'}</span></td>
        <td style="white-space: nowrap;">
          <button class="btn-admin-primary" style="padding:3px 8px; font-size:0.75rem;" onclick="viewStudentProfile('${s.enrolment}')" title="View Full Profile">👁️ View</button>
          <button class="btn-admin-primary" style="padding:3px 8px; font-size:0.75rem; background:#475569;" onclick="editStudent('${s.enrolment}')" title="Edit Student">✏️ Edit</button>
          <button class="btn-admin-danger" style="padding:3px 8px; font-size:0.75rem;" onclick="deleteStudentAccount('${s.enrolment}')" title="Remove Student">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // Real-time Search listener
  const searchInput = document.getElementById('searchStudentInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderStudentsTable(e.target.value);
    });
  }

  // 5. Grade Cards Rendering for selected student
  function renderGradeCardsForSelectedStudent() {
    const gcSelect = document.getElementById('gradeCardStudentSelect');
    const tableBody = document.getElementById('gradeCardsTableBody');
    if (!gcSelect || !tableBody) return;

    const selectedEnrolment = gcSelect.value;
    const cards = PortalDB.getGradeCards(selectedEnrolment);

    if (cards.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">No grade cards issued yet for this student.</td></tr>`;
      return;
    }

    tableBody.innerHTML = cards.map(c => `
      <tr>
        <td><strong>${selectedEnrolment}</strong></td>
        <td>${c.programme || 'B.COM'}</td>
        <td>Year ${c.term} (${c.termType || 'YEAR'})</td>
        <td><strong>${c.year}</strong></td>
        <td><span style="color:#15803d; font-weight:700;">${c.result || 'PASS'}</span></td>
        <td>
          <a href="${c.pdfUrl || '#'}" target="_blank" class="btn-admin-primary" style="padding:3px 8px; font-size:0.75rem; text-decoration:none;">View PDF</a>
        </td>
        <td>
          <button class="btn-admin-danger" style="padding:3px 8px; font-size:0.75rem;" onclick="removeGradeCard('${selectedEnrolment}', '${c.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  const gcSelectEl = document.getElementById('gradeCardStudentSelect');
  if (gcSelectEl) {
    gcSelectEl.addEventListener('change', renderGradeCardsForSelectedStudent);
  }

  // 6. View Student Profile Modal
  window.viewStudentProfile = (enrolment) => {
    const s = PortalDB.getStudentById(enrolment);
    if (!s) return;
    const viewModal = document.getElementById('viewStudentModal');
    const content = document.getElementById('viewStudentContent');
    if (viewModal && content) {
      content.innerHTML = `
        <div style="display:flex; gap:16px; align-items:center; background:#f8fafc; padding:14px; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:14px;">
          <img src="${s.photo || 'assets/student_photo.png'}" alt="${s.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid #0284c7;">
          <div>
            <h3 style="font-size:1.1rem; color:#0f172a; margin-bottom:2px;">${s.name}</h3>
            <div style="font-size:0.85rem; color:#0284c7; font-weight:700;">Login ID / Enrolment: ${s.enrolment}</div>
            <div style="font-size:0.8rem; color:#64748b;">Roll No: ${s.rollNo || '-'} • Gender: ${s.gender || 'Male'}</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:0.85rem;">
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">MANUAL PASSWORD</div>
            <div style="font-weight:700; color:#dc2626;">${s.password || 'Not set'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">PROGRAMME / COURSE</div>
            <div style="font-weight:600;">${s.programme || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">FATHER'S NAME</div>
            <div style="font-weight:600;">${s.fatherName || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">MOTHER'S NAME</div>
            <div style="font-weight:600;">${s.motherName || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">MOBILE NUMBER</div>
            <div style="font-weight:600;">${s.mobile || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">EMAIL ID</div>
            <div style="font-weight:600;">${s.email || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">DATE OF BIRTH</div>
            <div style="font-weight:600;">${s.dob || '-'}</div>
          </div>
          <div style="background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">BLOOD GROUP & CATEGORY</div>
            <div style="font-weight:600;">${s.bloodGroup || 'B+'} • ${s.category || 'General'}</div>
          </div>
          <div style="grid-column: span 2; background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">CAMPUS / COLLEGE</div>
            <div style="font-weight:600;">${s.college || 'Kumaun University'}</div>
          </div>
          <div style="grid-column: span 2; background:#fff; border:1px solid #f1f5f9; padding:8px 10px; border-radius:4px;">
            <div style="font-size:0.75rem; color:#94a3b8; font-weight:700;">ACADEMIC STATUS</div>
            <div style="font-weight:700; color:#15803d;">${s.status || 'Active'}</div>
          </div>
        </div>
      `;
      viewModal.classList.add('open');
    }
  };

  document.getElementById('btnCloseViewModal')?.addEventListener('click', () => document.getElementById('viewStudentModal')?.classList.remove('open'));
  document.getElementById('btnCloseViewModalBtn')?.addEventListener('click', () => document.getElementById('viewStudentModal')?.classList.remove('open'));

  // 7. Auto-generate Buttons in Modal
  document.getElementById('btnAutoGenerateEnrol')?.addEventListener('click', () => {
    document.getElementById('stuEnrolment').value = generateAutoEnrolment();
  });

  document.getElementById('btnAutoGenerateRoll')?.addEventListener('click', () => {
    document.getElementById('stuRollNo').value = generateAutoRollNo();
  });

  document.getElementById('btnSuggestPassword')?.addEventListener('click', () => {
    const nameVal = document.getElementById('stuName')?.value;
    document.getElementById('stuPassword').value = generateSuggestedPassword(nameVal);
  });

  // 8. Student Modal Add / Edit Actions
  const studentModal = document.getElementById('studentModal');
  const studentForm = document.getElementById('studentForm');

  document.getElementById('btnOpenAddStudentModal')?.addEventListener('click', () => {
    studentForm.reset();
    document.getElementById('studentModalTitle').textContent = '➕ Add New Student';
    document.getElementById('stuEnrolment').readOnly = false;
    
    // Auto-generate credentials immediately upon opening
    document.getElementById('stuEnrolment').value = generateAutoEnrolment();
    document.getElementById('stuRollNo').value = generateAutoRollNo();
    document.getElementById('stuPassword').value = 'Student@2024';
    
    studentModal.classList.add('open');
  });

  document.getElementById('btnCloseStudentModal')?.addEventListener('click', () => studentModal.classList.remove('open'));
  document.getElementById('btnCancelStudentModal')?.addEventListener('click', () => studentModal.classList.remove('open'));

  studentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const enrolment = document.getElementById('stuEnrolment').value.trim();
    const studentData = {
      enrolment: enrolment,
      password: document.getElementById('stuPassword').value.trim(),
      name: document.getElementById('stuName').value.trim(),
      fatherName: document.getElementById('stuFather').value.trim(),
      motherName: document.getElementById('stuMother')?.value.trim() || '',
      rollNo: document.getElementById('stuRollNo').value.trim(),
      dob: document.getElementById('stuDob').value,
      gender: document.getElementById('stuGender')?.value || 'Male',
      bloodGroup: document.getElementById('stuBloodGroup')?.value || 'B+',
      category: document.getElementById('stuCategory')?.value || 'General',
      email: document.getElementById('stuEmail').value.trim(),
      mobile: document.getElementById('stuMobile').value.trim(),
      programme: document.getElementById('stuProgramme').value.trim() || 'Bachelor of Commerce (B.COM.)',
      batch: document.getElementById('stuBatch').value.trim() || '2022 – 2024',
      college: document.getElementById('stuCollege').value.trim() || 'Sardar Bhagat Singh Govt. P.G. College Rudrapur',
      status: document.getElementById('stuStatus').value,
      photo: 'assets/student_photo.png'
    };

    PortalDB.saveStudent(studentData);
    studentModal.classList.remove('open');
    refreshAdminUI();
    alert(`Student ${studentData.name} saved successfully!\n\nLogin Credentials:\n• Enrolment (Login ID): ${enrolment}\n• Password: ${studentData.password}\n\nStudent can now log in to the portal immediately.`);
  });

  window.editStudent = (enrolment) => {
    const s = PortalDB.getStudentById(enrolment);
    if (!s) return;
    document.getElementById('studentModalTitle').textContent = '✏️ Edit Student Details';
    document.getElementById('stuEnrolment').value = s.enrolment;
    document.getElementById('stuEnrolment').readOnly = true;
    document.getElementById('stuPassword').value = s.password || '';
    document.getElementById('stuName').value = s.name || '';
    document.getElementById('stuFather').value = s.fatherName || '';
    if (document.getElementById('stuMother')) document.getElementById('stuMother').value = s.motherName || '';
    document.getElementById('stuRollNo').value = s.rollNo || '';
    document.getElementById('stuDob').value = s.dob || '';
    if (document.getElementById('stuGender')) document.getElementById('stuGender').value = s.gender || 'Male';
    if (document.getElementById('stuBloodGroup')) document.getElementById('stuBloodGroup').value = s.bloodGroup || 'B+';
    if (document.getElementById('stuCategory')) document.getElementById('stuCategory').value = s.category || 'General';
    document.getElementById('stuEmail').value = s.email || '';
    document.getElementById('stuMobile').value = s.mobile || '';
    document.getElementById('stuProgramme').value = s.programme || '';
    document.getElementById('stuBatch').value = s.batch || '';
    document.getElementById('stuCollege').value = s.college || '';
    document.getElementById('stuStatus').value = s.status || 'Active / Regular';
    studentModal.classList.add('open');
  };

  window.deleteStudentAccount = (enrolment) => {
    if (confirm(`Are you sure you want to permanently remove student enrolment ${enrolment}?`)) {
      PortalDB.deleteStudent(enrolment);
      refreshAdminUI();
    }
  };

  // 9. Grade Card Actions
  const gcModal = document.getElementById('gradeCardModal');
  const gcForm = document.getElementById('gradeCardForm');

  document.getElementById('btnOpenAddGradeCardModal')?.addEventListener('click', () => {
    gcForm.reset();
    gcModal.classList.add('open');
  });

  document.getElementById('btnCloseGCModal')?.addEventListener('click', () => gcModal.classList.remove('open'));
  document.getElementById('btnCancelGCModal')?.addEventListener('click', () => gcModal.classList.remove('open'));

  gcForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const enrolment = document.getElementById('gcEnrolment').value;
    const cardData = {
      programme: document.getElementById('gcProgramme').value.trim(),
      term: document.getElementById('gcTerm').value.trim(),
      termType: document.getElementById('gcTermType').value,
      year: document.getElementById('gcYear').value.trim(),
      result: document.getElementById('gcResult').value.trim(),
      pdfUrl: document.getElementById('gcPdf').value.trim()
    };

    PortalDB.addGradeCard(enrolment, cardData);
    gcModal.classList.remove('open');
    refreshAdminUI();
    alert('Grade Card uploaded and assigned successfully!');
  });

  window.removeGradeCard = (enrolment, cardId) => {
    if (confirm('Delete this grade card record?')) {
      PortalDB.deleteGradeCard(enrolment, cardId);
      refreshAdminUI();
    }
  };

  // 10. Grievance Reply Actions
  const ticketModal = document.getElementById('ticketModal');
  const replyForm = document.getElementById('ticketReplyForm');

  window.openTicketReplyModal = (ticketId) => {
    const tickets = PortalDB.getTickets();
    const t = tickets.find(item => item.id === ticketId);
    if (!t) return;

    document.getElementById('replyTicketId').value = t.id;
    document.getElementById('ticketStudentInfo').textContent = `${t.studentName || 'Student'} (${t.studentId})`;
    document.getElementById('ticketSubjectDesc').innerHTML = `
      <strong>[${t.category}] ${t.subject}</strong>
      <p style="margin-top:6px;">${t.description}</p>
    `;
    document.getElementById('adminReplyText').value = t.adminReply || '';
    document.getElementById('ticketStatusSelect').value = t.status || 'Resolved';

    ticketModal.classList.add('open');
  };

  document.getElementById('btnCloseTicketModal')?.addEventListener('click', () => ticketModal.classList.remove('open'));
  document.getElementById('btnCancelTicketModal')?.addEventListener('click', () => ticketModal.classList.remove('open'));

  replyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = document.getElementById('replyTicketId').value;
    const replyText = document.getElementById('adminReplyText').value.trim();
    const status = document.getElementById('ticketStatusSelect').value;

    PortalDB.resolveTicket(ticketId, replyText, status);
    ticketModal.classList.remove('open');
    refreshAdminUI();
    alert(`Resolution dispatched for Ticket ${ticketId}! Student portal will update in real-time.`);
  });

  // Initial Load
  refreshAdminUI();
});
