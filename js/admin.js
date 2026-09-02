/**
 * Samarth eGov Admin Portal Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tabs switcher
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

  // Render Metrics & Tables
  function refreshAdminUI() {
    const students = PortalDB.getStudents();
    const tickets = PortalDB.getTickets();
    const studentList = Object.values(students);

    // 1. Metrics
    let totalGradeCardsCount = 0;
    studentList.forEach(s => {
      const gcs = PortalDB.getGradeCards(s.enrolment);
      totalGradeCardsCount += gcs.length;
    });

    const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

    document.getElementById('metricTotalStudents').textContent = studentList.length;
    document.getElementById('metricTotalGradeCards').textContent = totalGradeCardsCount;
    document.getElementById('metricOpenTickets').textContent = openTicketsCount;
    document.getElementById('pendingBadge').textContent = openTicketsCount;

    // 2. Overview Recent Tickets Table
    const overviewTable = document.getElementById('overviewTicketsTableBody');
    if (overviewTable) {
      overviewTable.innerHTML = tickets.slice(0, 5).map(t => `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td>${t.studentName || t.studentId}</td>
          <td><code>${t.studentId}</code></td>
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

    // 3. All Students Table
    const studentTable = document.getElementById('studentTableBody');
    if (studentTable) {
      studentTable.innerHTML = studentList.map(s => `
        <tr>
          <td><strong>${s.enrolment}</strong></td>
          <td>${s.name}</td>
          <td>${s.rollNo || '-'}</td>
          <td>${s.programme || '-'}</td>
          <td>${s.college || 'Kumaun University'}</td>
          <td><span class="badge-status badge-resolved">${s.status || 'Active'}</span></td>
          <td>
            <button class="btn-admin-primary" style="padding:4px 8px; font-size:0.75rem;" onclick="editStudent('${s.enrolment}')">Edit</button>
            <button class="btn-admin-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteStudentAccount('${s.enrolment}')">Remove</button>
          </td>
        </tr>
      `).join('');
    }

    // 4. Student dropdown for Grade Card Manager
    const gcSelect = document.getElementById('gradeCardStudentSelect');
    const gcModalSelect = document.getElementById('gcEnrolment');
    if (gcSelect && gcModalSelect) {
      const opts = studentList.map(s => `<option value="${s.enrolment}">${s.name} (${s.enrolment})</option>`).join('');
      gcSelect.innerHTML = opts;
      gcModalSelect.innerHTML = opts;
      renderGradeCardsForSelectedStudent();
    }

    // 5. All Grievances Table
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

  // Grade Cards rendering for selected student
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

  // --- Student Management Actions ---
  const studentModal = document.getElementById('studentModal');
  const studentForm = document.getElementById('studentForm');

  document.getElementById('btnOpenAddStudentModal')?.addEventListener('click', () => {
    studentForm.reset();
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    document.getElementById('stuEnrolment').readOnly = false;
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
      rollNo: document.getElementById('stuRollNo').value.trim(),
      dob: document.getElementById('stuDob').value,
      email: document.getElementById('stuEmail').value.trim(),
      mobile: document.getElementById('stuMobile').value.trim(),
      programme: document.getElementById('stuProgramme').value.trim(),
      batch: document.getElementById('stuBatch').value.trim(),
      college: document.getElementById('stuCollege').value.trim(),
      status: document.getElementById('stuStatus').value,
      photo: 'assets/student_photo.png'
    };

    PortalDB.saveStudent(studentData);
    studentModal.classList.remove('open');
    refreshAdminUI();
    alert(`Student ${studentData.name} (${enrolment}) saved successfully!`);
  });

  window.editStudent = (enrolment) => {
    const s = PortalDB.getStudentById(enrolment);
    if (!s) return;
    document.getElementById('studentModalTitle').textContent = 'Edit Student Details';
    document.getElementById('stuEnrolment').value = s.enrolment;
    document.getElementById('stuEnrolment').readOnly = true;
    document.getElementById('stuPassword').value = s.password || '';
    document.getElementById('stuName').value = s.name || '';
    document.getElementById('stuFather').value = s.fatherName || '';
    document.getElementById('stuRollNo').value = s.rollNo || '';
    document.getElementById('stuDob').value = s.dob || '';
    document.getElementById('stuEmail').value = s.email || '';
    document.getElementById('stuMobile').value = s.mobile || '';
    document.getElementById('stuProgramme').value = s.programme || '';
    document.getElementById('stuBatch').value = s.batch || '';
    document.getElementById('stuCollege').value = s.college || '';
    document.getElementById('stuStatus').value = s.status || 'Active / Regular';
    studentModal.classList.add('open');
  };

  window.deleteStudentAccount = (enrolment) => {
    if (confirm(`Are you sure you want to remove student enrolment ${enrolment}?`)) {
      PortalDB.deleteStudent(enrolment);
      refreshAdminUI();
    }
  };

  // --- Grade Card Actions ---
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

  // --- Ticket Grievance Reply Actions ---
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
