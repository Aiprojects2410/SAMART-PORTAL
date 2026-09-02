/**
 * Samarth eGov Portal Unified Database with Supabase Cloud Sync
 * Synchronizes Students, Grade Cards, and Helpdesk Grievances with Supabase Cloud & LocalStorage.
 */

const PortalDB = (() => {
  const STORAGE_KEY_STUDENTS = 'samarth_students';
  const STORAGE_KEY_GRADECARDS = 'samarth_gradecards';
  const STORAGE_KEY_TICKETS = 'samarth_tickets';
  const STORAGE_KEY_CURRENT_USER = 'samarth_current_user';

  // Default seed student
  const defaultStudents = {
    'KU20247319': {
      enrolment: 'KU20247319',
      rollNo: '2233524680',
      password: 'Mohsin@8080',
      name: 'MOHD MOHSIN KHAN',
      fatherName: 'BABBAN KHAN',
      motherName: 'Parent Verified',
      gender: 'MALE',
      dob: '2001-02-22',
      email: 'Mohsinkhann495@gmail.com',
      mobile: '+91 96909 41117',
      category: 'General / Minority',
      bloodGroup: 'B+',
      nationality: 'Indian',
      religion: 'Islam',
      address: 'Nainital / Rudrapur, Uttarakhand - 263153',
      programme: 'Bachelor of Commerce (B.COM.)',
      college: 'Sardar Bhagat Singh Govt. P.G. College Rudrapur U.S. Nagar',
      batch: '2022 – 2024',
      status: 'Graduated / Passout (First Division)',
      photo: 'assets/student_photo.png',
      examResult: 'FIRST DIVISION (684/900 - 76.0%)'
    }
  };

  // Default seed grade cards
  const defaultGradeCards = {
    'KU20247319': [
      {
        id: 'gc-1',
        term: '1',
        termType: 'YEAR',
        year: '2022',
        programme: 'B.COM',
        result: 'PASS (222/300)',
        pdfUrl: 'assets/gradecards/BCOM_PART1_2022.pdf'
      },
      {
        id: 'gc-2',
        term: '2',
        termType: 'YEAR',
        year: '2023',
        programme: 'B.COM',
        result: 'PASS (230/300)',
        pdfUrl: 'assets/gradecards/BCOM_PART2_2023.pdf'
      },
      {
        id: 'gc-3',
        term: '3',
        termType: 'YEAR',
        year: '2024',
        programme: 'B.COM',
        result: 'FIRST DIVISION (232/300 - Total 684/900)',
        pdfUrl: 'assets/gradecards/BCOM_PART3_2024.pdf'
      }
    ]
  };

  // Default seed helpdesk tickets
  const defaultTickets = [
    {
      id: 'TKT-1082',
      studentId: 'KU20247319',
      studentName: 'MOHD MOHSIN KHAN',
      category: 'Degree / Marksheet',
      subject: 'Request for Original Degree Certificate dispatch',
      priority: 'High',
      description: 'I have completed my B.Com (Final Year 2024) with First Division. Kindly issue my original degree certificate.',
      status: 'In Progress',
      createdAt: '2024-08-15 11:30 AM',
      adminReply: 'Verification completed by Examination Cell. Degree dispatched to your registered address.'
    }
  ];

  // Initialize DB
  function init() {
    if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(defaultStudents));
    }
    if (!localStorage.getItem(STORAGE_KEY_GRADECARDS)) {
      localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(defaultGradeCards));
    }
    if (!localStorage.getItem(STORAGE_KEY_TICKETS)) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(defaultTickets));
    }

    // Trigger Cloud Sync with Supabase
    syncFromSupabase();
  }

  // Asynchronous Cloud Sync from Supabase
  async function syncFromSupabase() {
    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (!client) return;

      // 1. Fetch Students from Supabase
      const { data: remoteStudents, error: errStu } = await client.from('students').select('*');
      if (!errStu && remoteStudents && remoteStudents.length > 0) {
        const localStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '{}');
        remoteStudents.forEach(rs => {
          localStudents[rs.enrolment] = {
            enrolment: rs.enrolment,
            rollNo: rs.roll_no,
            password: rs.password,
            name: rs.name,
            fatherName: rs.father_name,
            motherName: rs.mother_name,
            dob: rs.dob,
            gender: rs.gender,
            bloodGroup: rs.blood_group,
            category: rs.category,
            email: rs.email,
            mobile: rs.mobile,
            programme: rs.programme,
            batch: rs.batch,
            college: rs.college,
            status: rs.status,
            photo: rs.photo || 'assets/student_photo.png',
            examResult: rs.exam_result
          };
        });
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(localStudents));
      }

      // 2. Fetch Tickets from Supabase
      const { data: remoteTickets, error: errTkt } = await client.from('grievance_tickets').select('*');
      if (!errTkt && remoteTickets && remoteTickets.length > 0) {
        const formatted = remoteTickets.map(rt => ({
          id: rt.id,
          studentId: rt.student_id,
          studentName: rt.student_name,
          category: rt.category,
          priority: rt.priority,
          subject: rt.subject,
          description: rt.description,
          status: rt.status,
          adminReply: rt.admin_reply,
          createdAt: rt.created_at,
          resolvedAt: rt.resolved_at
        }));
        localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(formatted));
      }

      // 3. Fetch Grade Cards from Supabase
      const { data: remoteCards, error: errGC } = await client.from('grade_cards').select('*');
      if (!errGC && remoteCards && remoteCards.length > 0) {
        const localCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS) || '{}');
        remoteCards.forEach(rc => {
          if (!localCards[rc.enrolment]) localCards[rc.enrolment] = [];
          if (!localCards[rc.enrolment].some(c => c.id === rc.id)) {
            localCards[rc.enrolment].push({
              id: rc.id,
              programme: rc.programme,
              term: rc.term,
              termType: rc.term_type,
              year: rc.year,
              result: rc.result,
              pdfUrl: rc.pdf_url
            });
          }
        });
        localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(localCards));
      }
    } catch (e) {
      console.warn('Supabase sync note:', e);
    }
  }

  // --- Student CRUD ---
  function getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '{}');
  }

  function getStudentById(enrolment) {
    const students = getStudents();
    return students[enrolment] || null;
  }

  function saveStudent(studentData) {
    const students = getStudents();
    students[studentData.enrolment] = studentData;
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

    // Cloud push to Supabase
    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (client) {
        client.from('students').upsert({
          enrolment: studentData.enrolment,
          roll_no: studentData.rollNo || null,
          password: studentData.password,
          name: studentData.name,
          father_name: studentData.fatherName || null,
          mother_name: studentData.motherName || null,
          gender: studentData.gender || 'Male',
          dob: studentData.dob || null,
          blood_group: studentData.bloodGroup || 'B+',
          category: studentData.category || 'General',
          email: studentData.email || null,
          mobile: studentData.mobile || null,
          programme: studentData.programme || 'Bachelor of Commerce (B.COM.)',
          batch: studentData.batch || '2022 – 2024',
          college: studentData.college || 'Sardar Bhagat Singh Govt. P.G. College Rudrapur',
          status: studentData.status || 'Graduated / Passout (First Division)',
          photo: studentData.photo || 'assets/student_photo.png',
          exam_result: studentData.examResult || 'FIRST DIVISION (684/900 - 76.0%)'
        }).then(({ error }) => {
          if (error) console.warn('Supabase student save note:', error.message);
          else console.log('✅ Student synced with Supabase cloud:', studentData.enrolment);
        });
      }
    } catch (err) {
      console.warn('Supabase push error:', err);
    }

    return studentData;
  }

  function deleteStudent(enrolment) {
    const students = getStudents();
    delete students[enrolment];
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));

    // Cloud delete from Supabase
    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (client) {
        client.from('students').delete().eq('enrolment', enrolment).then(({ error }) => {
          if (error) console.warn('Supabase student delete note:', error.message);
          else console.log('🗑️ Student deleted from Supabase cloud:', enrolment);
        });
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // --- Grade Cards ---
  function getGradeCards(enrolment) {
    const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS) || '{}');
    return allCards[enrolment] || defaultGradeCards[enrolment] || [];
  }

  function addGradeCard(enrolment, cardData) {
    const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS) || '{}');
    if (!allCards[enrolment]) allCards[enrolment] = [];
    const newCard = {
      id: 'gc-' + Date.now(),
      ...cardData
    };
    allCards[enrolment].push(newCard);
    localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(allCards));

    // Cloud push to Supabase
    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (client) {
        client.from('grade_cards').insert({
          id: newCard.id,
          enrolment: enrolment,
          programme: cardData.programme || 'B.COM',
          term: cardData.term || '1',
          term_type: cardData.termType || 'YEAR',
          year: cardData.year || '2024',
          result: cardData.result || 'PASS',
          pdf_url: cardData.pdfUrl || ''
        }).then(({ error }) => {
          if (error) console.warn('Supabase grade card note:', error.message);
        });
      }
    } catch (err) {
      console.warn('Supabase card error:', err);
    }

    return newCard;
  }

  function deleteGradeCard(enrolment, cardId) {
    const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS) || '{}');
    if (allCards[enrolment]) {
      allCards[enrolment] = allCards[enrolment].filter(c => c.id !== cardId);
      localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(allCards));
    }

    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (client) {
        client.from('grade_cards').delete().eq('id', cardId).then();
      }
    } catch (e) {}
  }

  // --- Grievance Tickets ---
  function getTickets() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS) || '[]');
  }

  function createTicket(ticketData) {
    const tickets = getTickets();
    const newTicket = {
      id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toLocaleString(),
      status: 'Pending',
      adminReply: '',
      ...ticketData
    };
    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));

    // Cloud push to Supabase
    try {
      const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (client) {
        client.from('grievance_tickets').insert({
          id: newTicket.id,
          student_id: newTicket.studentId,
          student_name: newTicket.studentName || 'Student',
          category: newTicket.category,
          priority: newTicket.priority || 'Normal',
          subject: newTicket.subject,
          description: newTicket.description,
          status: 'Pending',
          created_at: newTicket.createdAt
        }).then(({ error }) => {
          if (error) console.warn('Supabase ticket create note:', error.message);
        });
      }
    } catch (e) {}

    return newTicket;
  }

  function resolveTicket(ticketId, adminReply, status = 'Resolved') {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.adminReply = adminReply;
      ticket.status = status;
      ticket.resolvedAt = new Date().toLocaleString();
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));

      // Cloud update in Supabase
      try {
        const client = window.getSupabaseClient ? window.getSupabaseClient() : null;
        if (client) {
          client.from('grievance_tickets').update({
            admin_reply: adminReply,
            status: status,
            resolved_at: ticket.resolvedAt
          }).eq('id', ticketId).then(({ error }) => {
            if (error) console.warn('Supabase ticket resolve note:', error.message);
          });
        }
      } catch (e) {}
    }
    return ticket;
  }

  // --- Session & Current User ---
  function getCurrentUser() {
    const raw = sessionStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
    // Default to seed student Mohd Mohsin Khan
    const students = getStudents();
    return students['KU20247319'] || defaultStudents['KU20247319'];
  }

  function setCurrentUser(student) {
    sessionStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(student));
  }

  function clearCurrentUser() {
    sessionStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }

  // Initialize immediately
  init();

  return {
    init,
    syncFromSupabase,
    getStudents,
    getStudentById,
    saveStudent,
    deleteStudent,
    getGradeCards,
    addGradeCard,
    deleteGradeCard,
    getTickets,
    createTicket,
    resolveTicket,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser
  };
})();

// Attach to window
window.PortalDB = PortalDB;
