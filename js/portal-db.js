/**
 * Samarth eGov Portal Unified Database
 * Handles persistent storage for Students, Grade Cards, and Helpdesk Tickets
 */

const PortalDB = (() => {
  const STORAGE_KEY_STUDENTS = 'samarth_students';
  const STORAGE_KEY_GRADECARDS = 'samarth_gradecards';
  const STORAGE_KEY_TICKETS = 'samarth_tickets';
  const STORAGE_KEY_ADMIN = 'samarth_admin';

  // Default seed student
  const defaultStudents = {
    'KU20247319': {
      enrolment: 'KU20247319',
      rollNo: '2233524680',
      password: 'Mohsin@8080',
      name: 'MOHD MOHSIN KHAN',
      fatherName: 'BABBAN KHAN',
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
        pdfUrl: 'assets/gradecards/BCOM_PART1_2022.pdf',
        imageUrl: 'assets/gradecards/part1_marksheet.png'
      },
      {
        id: 'gc-2',
        term: '2',
        termType: 'YEAR',
        year: '2023',
        programme: 'B.COM',
        result: 'PASS (230/300)',
        pdfUrl: 'assets/gradecards/BCOM_PART2_2023.pdf',
        imageUrl: 'assets/gradecards/part2_marksheet.png'
      },
      {
        id: 'gc-3',
        term: '3',
        termType: 'YEAR',
        year: '2024',
        programme: 'B.COM',
        result: 'FIRST DIVISION (232/300 - Total 684/900)',
        pdfUrl: 'assets/gradecards/BCOM_PART3_2024.pdf',
        imageUrl: 'assets/gradecards/part3_marksheet.png'
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

  // Initialize DB if not present
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
  }

  init();

  return {
    // --- Students API ---
    getStudents: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || defaultStudents;
      } catch (e) {
        return defaultStudents;
      }
    },
    getStudentById: (enrolment) => {
      const students = PortalDB.getStudents();
      return students[enrolment] || null;
    },
    saveStudent: (studentData) => {
      const students = PortalDB.getStudents();
      students[studentData.enrolment] = studentData;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      return true;
    },
    deleteStudent: (enrolment) => {
      const students = PortalDB.getStudents();
      if (students[enrolment]) {
        delete students[enrolment];
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        return true;
      }
      return false;
    },

    // --- Grade Cards API ---
    getGradeCards: (enrolment) => {
      try {
        const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS)) || defaultGradeCards;
        return allCards[enrolment] || [];
      } catch (e) {
        return defaultGradeCards[enrolment] || [];
      }
    },
    addGradeCard: (enrolment, gradeCardData) => {
      const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS)) || defaultGradeCards;
      if (!allCards[enrolment]) {
        allCards[enrolment] = [];
      }
      gradeCardData.id = 'gc-' + Date.now();
      allCards[enrolment].push(gradeCardData);
      localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(allCards));
      return true;
    },
    deleteGradeCard: (enrolment, cardId) => {
      const allCards = JSON.parse(localStorage.getItem(STORAGE_KEY_GRADECARDS)) || defaultGradeCards;
      if (allCards[enrolment]) {
        allCards[enrolment] = allCards[enrolment].filter(c => c.id !== cardId);
        localStorage.setItem(STORAGE_KEY_GRADECARDS, JSON.stringify(allCards));
        return true;
      }
      return false;
    },

    // --- Helpdesk Grievances API ---
    getTickets: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_TICKETS)) || defaultTickets;
      } catch (e) {
        return defaultTickets;
      }
    },
    getTicketsByStudent: (studentId) => {
      const tickets = PortalDB.getTickets();
      return tickets.filter(t => t.studentId === studentId);
    },
    createTicket: (ticketData) => {
      const tickets = PortalDB.getTickets();
      const newTicket = {
        id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toLocaleString(),
        status: 'Pending',
        adminReply: '',
        ...ticketData
      };
      tickets.unshift(newTicket);
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
      return newTicket;
    },
    resolveTicket: (ticketId, replyText, newStatus = 'Resolved') => {
      const tickets = PortalDB.getTickets();
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        ticket.adminReply = replyText;
        ticket.status = newStatus;
        ticket.resolvedAt = new Date().toLocaleString();
        localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
        return true;
      }
      return false;
    },

    // --- Session / Active User ---
    getCurrentUser: () => {
      try {
        const user = sessionStorage.getItem('loggedInUser');
        return user ? JSON.parse(user) : PortalDB.getStudentById('KU20247319');
      } catch (e) {
        return PortalDB.getStudentById('KU20247319');
      }
    },
    setCurrentUser: (userData) => {
      sessionStorage.setItem('loggedInUser', JSON.stringify(userData));
    },
    clearCurrentUser: () => {
      sessionStorage.removeItem('loggedInUser');
    }
  };
})();

window.PortalDB = PortalDB;
