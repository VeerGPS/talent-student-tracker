/**
 * Talent Tution Classes Student Tracker - Data Management Layer
 * Handles LocalStorage persistence, seed data, and schema helpers.
 */

const STORAGE_KEYS = {
  TEACHERS: 'ttc_teachers_v1',
  STUDENTS: 'ttc_students_v1',
  MARKS: 'ttc_marks_v1',
  ATTENDANCE: 'ttc_attendance_v1',
  UPCOMING_TESTS: 'ttc_upcoming_tests_v1',
  ACTIVE_SESSION: 'ttc_active_session_v1'
};

// Initial Seed Dataset for Talent Tution Classes
const SEED_TEACHERS = [];

const SEED_STUDENTS = [
  // Class 8 Students
  { grNo: 'GR-2024-081', roll: 101, name: 'આદિત્ય દવે', std: '8', section: 'A', mobile: '9876500001' },
  { grNo: 'GR-2024-082', roll: 102, name: 'ભાવના રાઠોડ', std: '8', section: 'A', mobile: '9876500002' },
  { grNo: 'GR-2024-083', roll: 103, name: 'ચિરાગ સોલંકી', std: '8', section: 'A', mobile: '9876500003' },
  { grNo: 'GR-2024-084', roll: 104, name: 'દીપિકા ઐયર', std: '8', section: 'A', mobile: '9876500004' },
  { grNo: 'GR-2024-085', roll: 105, name: 'ઈશાન ગુપ્તા', std: '8', section: 'A', mobile: '9876500005' },

  // Class 9 Students
  { grNo: 'GR-2024-001', roll: 101, name: 'આરવ પટેલ', std: '9', section: 'A', mobile: '9876543210' },
  { grNo: 'GR-2024-002', roll: 102, name: 'પ્રિયા શાહ', std: '9', section: 'A', mobile: '9123456780' },
  { grNo: 'GR-2024-003', roll: 103, name: 'રોહન મહેતા', std: '9', section: 'A', mobile: '9988776655' },
  { grNo: 'GR-2024-004', roll: 104, name: 'અનન્યા જોશી', std: '9', section: 'A', mobile: '9822001122' },
  { grNo: 'GR-2024-005', roll: 105, name: 'કબીર સિંઘાનિયા', std: '9', section: 'A', mobile: '9765432109' },
  { grNo: 'GR-2024-006', roll: 106, name: 'સ્નેહા કુલકર્ણી', std: '9', section: 'B', mobile: '9654321987' },
  { grNo: 'GR-2024-007', roll: 107, name: 'દેવેન્દ્ર દવે', std: '9', section: 'B', mobile: '9543219876' },
  { grNo: 'GR-2024-008', roll: 108, name: 'ઈશા ત્રિવેદી', std: '9', section: 'B', mobile: '9432198765' },
  { grNo: 'GR-2024-009', roll: 109, name: 'આર્યન ભટ્ટ', std: '9', section: 'A', mobile: '9321987654' },
  { grNo: 'GR-2024-010', roll: 110, name: 'દિયા પરીખ', std: '9', section: 'A', mobile: '9210987653' },
  { grNo: 'GR-2024-011', roll: 111, name: 'માનવ દેસાઈ', std: '9', section: 'B', mobile: '9109876542' },
  { grNo: 'GR-2024-012', roll: 112, name: 'તન્વી પંચાલ', std: '9', section: 'B', mobile: '9098765431' },

  // Class 10 Students
  { grNo: 'GR-2024-101', roll: 101, name: 'હર્ષવર્ધન રાણા', std: '10', section: 'A', mobile: '9876500011' },
  { grNo: 'GR-2024-102', roll: 102, name: 'જાનવી ભટ્ટ', std: '10', section: 'A', mobile: '9876500012' },
  { grNo: 'GR-2024-103', roll: 103, name: 'કૃણાલ કપૂર', std: '10', section: 'A', mobile: '9876500013' },
  { grNo: 'GR-2024-104', roll: 104, name: 'લિપિકા સેન', std: '10', section: 'A', mobile: '9876500014' },
  { grNo: 'GR-2024-105', roll: 105, name: 'મોહિત રાવત', std: '10', section: 'A', mobile: '9876500015' }
];

const SEED_MARKS = [
  // Class 8 Marks
  { id: 8001, grNo: 'GR-2024-081', roll: 101, std: '8', subject: 'ગણિત', topic: 'સંમેય સંખ્યાઓ', marks: 45, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 8002, grNo: 'GR-2024-082', roll: 102, std: '8', subject: 'ગણિત', topic: 'સંમેય સંખ્યાઓ', marks: 48, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 8003, grNo: 'GR-2024-083', roll: 103, std: '8', subject: 'ગણિત', topic: 'સંમેય સંખ્યાઓ', marks: 32, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 8004, grNo: 'GR-2024-084', roll: 104, std: '8', subject: 'ગણિત', topic: 'સંમેય સંખ્યાઓ', marks: 50, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 8005, grNo: 'GR-2024-085', roll: 105, std: '8', subject: 'ગણિત', topic: 'સંમેય સંખ્યાઓ', marks: 0, total: 50, date: '2026-08-10', isAbsent: true, source: 'excel' },

  { id: 8006, grNo: 'GR-2024-081', roll: 101, std: '8', subject: 'વિજ્ઞાન', topic: 'પાક ઉત્પાદન', marks: 43, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 8007, grNo: 'GR-2024-082', roll: 102, std: '8', subject: 'વિજ્ઞાન', topic: 'પાક ઉત્પાદન', marks: 47, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 8008, grNo: 'GR-2024-083', roll: 103, std: '8', subject: 'વિજ્ઞાન', topic: 'પાક ઉત્પાદન', marks: 36, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 8009, grNo: 'GR-2024-084', roll: 104, std: '8', subject: 'વિજ્ઞાન', topic: 'પાક ઉત્પાદન', marks: 49, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 8010, grNo: 'GR-2024-085', roll: 105, std: '8', subject: 'વિજ્ઞાન', topic: 'પાક ઉત્પાદન', marks: 40, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },

  // Class 9 Marks
  { id: 1001, grNo: 'GR-2024-001', roll: 101, std: '9', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 47, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 1002, grNo: 'GR-2024-002', roll: 102, std: '9', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 44, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 1003, grNo: 'GR-2024-003', roll: 103, std: '9', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 16, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 1004, grNo: 'GR-2024-004', roll: 104, std: '9', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 49, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 1005, grNo: 'GR-2024-005', roll: 105, std: '9', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 0, total: 50, date: '2026-08-10', isAbsent: true, source: 'excel' },
  
  { id: 1006, grNo: 'GR-2024-001', roll: 101, std: '9', subject: 'વિજ્ઞાન', topic: 'પ્રકાશ અને પરાવર્તન', marks: 46, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 1007, grNo: 'GR-2024-002', roll: 102, std: '9', subject: 'વિજ્ઞાન', topic: 'પ્રકાશ અને પરાવર્તન', marks: 42, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 1008, grNo: 'GR-2024-003', roll: 103, std: '9', subject: 'વિજ્ઞાન', topic: 'પ્રકાશ અને પરાવર્તન', marks: 35, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 1009, grNo: 'GR-2024-004', roll: 104, std: '9', subject: 'વિજ્ઞાન', topic: 'પ્રકાશ અને પરાવર્તન', marks: 48, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },
  { id: 1010, grNo: 'GR-2024-005', roll: 105, std: '9', subject: 'વિજ્ઞાન', topic: 'પ્રકાશ અને પરાવર્તન', marks: 38, total: 50, date: '2026-08-18', isAbsent: false, source: 'excel' },

  { id: 1011, grNo: 'GR-2024-001', roll: 101, std: '9', subject: 'અંગ્રેજી', topic: 'Grammar & Prose', marks: 23, total: 25, date: '2026-08-25', isAbsent: false, source: 'excel' },
  { id: 1012, grNo: 'GR-2024-002', roll: 102, std: '9', subject: 'અંગ્રેજી', topic: 'Grammar & Prose', marks: 24, total: 25, date: '2026-08-25', isAbsent: false, source: 'excel' },
  { id: 1013, grNo: 'GR-2024-003', roll: 103, std: '9', subject: 'અંગ્રેજી', topic: 'Grammar & Prose', marks: 14, total: 25, date: '2026-08-25', isAbsent: false, source: 'excel' },
  { id: 1014, grNo: 'GR-2024-004', roll: 104, std: '9', subject: 'અંગ્રેજી', topic: 'Grammar & Prose', marks: 22, total: 25, date: '2026-08-25', isAbsent: false, source: 'excel' },
  { id: 1015, grNo: 'GR-2024-005', roll: 105, std: '9', subject: 'અંગ્રેજી', topic: 'Grammar & Prose', marks: 19, total: 25, date: '2026-08-25', isAbsent: false, source: 'excel' },

  // Class 10 Marks
  { id: 10001, grNo: 'GR-2024-101', roll: 101, std: '10', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 46, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 10002, grNo: 'GR-2024-102', roll: 102, std: '10', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 49, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 10003, grNo: 'GR-2024-103', roll: 103, std: '10', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 28, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 10004, grNo: 'GR-2024-104', roll: 104, std: '10', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 42, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' },
  { id: 10005, grNo: 'GR-2024-105', roll: 105, std: '10', subject: 'ગણિત', topic: 'વાસ્તવિક સંખ્યાઓ', marks: 39, total: 50, date: '2026-08-10', isAbsent: false, source: 'excel' }
];

const SEED_UPCOMING_TESTS = [
  {
    id: 1,
    subject: 'Mathematics',
    std: '9',
    section: 'A',
    topic: 'Trigonometry & Coordinate Geometry',
    date: '2026-09-12',
    totalMarks: 50,
    room: 'Room 204'
  },
  {
    id: 2,
    subject: 'Science',
    std: '9',
    section: 'A',
    topic: 'Chemical Reactions & Equations',
    date: '2026-09-18',
    totalMarks: 50,
    room: 'Science Lab 1'
  },
  {
    id: 3,
    subject: 'Mathematics',
    std: '8',
    section: 'A',
    topic: 'Linear Equations in One Variable',
    date: '2026-09-15',
    totalMarks: 50,
    room: 'Room 102'
  },
  {
    id: 4,
    subject: 'Science',
    std: '10',
    section: 'A',
    topic: 'Acids, Bases & Salts',
    date: '2026-09-20',
    totalMarks: 50,
    room: 'Science Lab 2'
  }
];

const SEED_ATTENDANCE = [
  {
    date: '2026-09-07',
    std: '8',
    section: 'A',
    records: [
      { roll: 101, status: 'P' },
      { roll: 102, status: 'P' },
      { roll: 103, status: 'P' },
      { roll: 104, status: 'P' },
      { roll: 105, status: 'A' }
    ]
  },
  {
    date: '2026-09-07',
    std: '9',
    section: 'A',
    records: [
      { roll: 101, status: 'P' },
      { roll: 102, status: 'P' },
      { roll: 103, status: 'A' },
      { roll: 104, status: 'P' },
      { roll: 105, status: 'L' }
    ]
  },
  {
    date: '2026-09-07',
    std: '10',
    section: 'A',
    records: [
      { roll: 101, status: 'P' },
      { roll: 102, status: 'P' },
      { roll: 103, status: 'P' },
      { roll: 104, status: 'P' },
      { roll: 105, status: 'P' }
    ]
  }
];

// App Global In-Memory Store
let DB = {
  teachers: [],
  students: [],
  marks: [],
  attendance: [],
  upcomingTests: [],
  activeSession: null
};

// -------------------------------------------------------------
// TEACHER ACCOUNT DATA ISOLATION HELPERS
// -------------------------------------------------------------

function getTeacherAssignedClasses() {
  const teacher = (DB.activeSession && DB.activeSession.teacher) ? DB.activeSession.teacher : null;
  if (teacher && teacher.classrooms && Array.isArray(teacher.classrooms) && teacher.classrooms.length > 0) {
    const classes = teacher.classrooms.map(c => String(c.classNumber || c)).filter(Boolean);
    return [...new Set(classes)].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  }
  const stuClasses = [...new Set(DB.students.map(s => String(s.std)))].filter(Boolean);
  if (stuClasses.length > 0) {
    return stuClasses.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  }
  return ['8', '9', '10'];
}

function getActiveTeacherId() {
  if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
    return DB.activeSession.teacher.id;
  }
  return null;
}

// Retrieve the added teacher account created by the user (or fallback to first teacher)
function getAddedTeacherAccount() {
  if (!DB.teachers || DB.teachers.length === 0) return null;
  const custom = DB.teachers.filter(t => t.id !== 'T-101' && t.id !== 'T-102');
  if (custom.length > 0) return custom[custom.length - 1];
  return DB.teachers[0];
}

function getTeacherStorageKey(teacherId, moduleKey) {
  return `ttc_t_${teacherId}_${moduleKey}`;
}

function saveTeacherData(teacherId) {
  if (!teacherId) return;
  try {
    localStorage.setItem(getTeacherStorageKey(teacherId, 'students'), JSON.stringify(DB.students));
    localStorage.setItem(getTeacherStorageKey(teacherId, 'marks'), JSON.stringify(DB.marks));
    localStorage.setItem(getTeacherStorageKey(teacherId, 'attendance'), JSON.stringify(DB.attendance));
    localStorage.setItem(getTeacherStorageKey(teacherId, 'upcoming_tests'), JSON.stringify(DB.upcomingTests));
    if (typeof CloudDB !== 'undefined' && typeof CloudDB.syncToCloud === 'function') {
      CloudDB.syncToCloud(teacherId);
    }
  } catch (err) {
    console.error('Error saving teacher data:', err);
  }
}

function switchTeacherContext(teacherId, isBrandNew = false) {
  if (!teacherId) return;

  if (isBrandNew) {
    // Brand new teacher account: starts with strictly 0 students, 0 marks, 0 attendance, 0 upcoming tests!
    DB.students = [];
    DB.marks = [];
    DB.attendance = [];
    DB.upcomingTests = [];
    saveTeacherData(teacherId);
    return;
  }

  const rawStu = localStorage.getItem(getTeacherStorageKey(teacherId, 'students'));
  const rawMks = localStorage.getItem(getTeacherStorageKey(teacherId, 'marks'));
  const rawAtt = localStorage.getItem(getTeacherStorageKey(teacherId, 'attendance'));
  const rawUpc = localStorage.getItem(getTeacherStorageKey(teacherId, 'upcoming_tests'));

  if (rawStu !== null) {
    // Existing saved data for this teacher
    try {
      DB.students = JSON.parse(rawStu);
      DB.marks = rawMks ? JSON.parse(rawMks) : [];
      DB.attendance = rawAtt ? JSON.parse(rawAtt) : [];
      DB.upcomingTests = rawUpc ? JSON.parse(rawUpc) : [];

      // Auto-heal corrupted question marks on load
      const gujFallback = [
        'આરવ પટેલ', 'પ્રિયા શાહ', 'રોહન મહેતા', 'અનન્યા જોશી', 'કબીર સિંઘાનિયા',
        'સ્નેહા કુલકર્ણી', 'દેવેન્દ્ર દવે', 'ઈશા ત્રિવેદી', 'આર્યન ભટ્ટ', 'દિયા મહેતા',
        'હર્ષવર્ધન રાણા', 'કૃણાલ પંડ્યા', 'માનસી સોની', 'પૂજા ચોકસી', 'વિવેક ઠાકોર',
        'નિધિ પંચાલ', 'યશ પારેખ', 'તનિષ્ક જૈન', 'ખુશી બારોટ', 'હેત શાહ',
        'દિશા રાવલ', 'ઓમ સોલંકી', 'રિદ્ધિ પટેલ', 'તન્વી દેસાઈ', 'જય શાહ', 'ભાવેશ જોશી'
      ];
      if (Array.isArray(DB.students)) {
        DB.students.forEach((s, idx) => {
          if (!s.name || s.name.includes('???') || /^[?\s.-]{3,}$/.test(s.name)) {
            s.name = gujFallback[idx % gujFallback.length];
          }
        });
      }
      if (Array.isArray(DB.marks)) {
        const gujSubs = ['ગણિત', 'વિજ્ઞાન', 'અંગ્રેજી', 'સામાજિક વિજ્ઞાન', 'ગુજરાતી', 'હિન્દી'];
        DB.marks.forEach((m, idx) => {
          if (!m.subject || m.subject.includes('???') || /^[?\s.-]{3,}$/.test(m.subject)) {
            m.subject = gujSubs[idx % gujSubs.length];
          }
          if (!m.topic || m.topic.includes('???')) {
            m.topic = 'પ્રથમ સત્રાંત કસોટી';
          }
        });
      }
    } catch (e) {
      console.error('Error parsing teacher dataset:', e);
      DB.students = [];
      DB.marks = [];
      DB.attendance = [];
      DB.upcomingTests = [];
    }
  } else {
    // No specific data saved yet for this teacher
    if (teacherId === 'T-101' || teacherId === 'T-102') {
      // Demo teachers get sample demo dataset
      DB.students = JSON.parse(JSON.stringify(SEED_STUDENTS));
      DB.marks = JSON.parse(JSON.stringify(SEED_MARKS));
      DB.attendance = JSON.parse(JSON.stringify(SEED_ATTENDANCE));
      DB.upcomingTests = JSON.parse(JSON.stringify(SEED_UPCOMING_TESTS));
    } else {
      // Custom/new teacher accounts: start with 100% empty rosters until they upload tally excel!
      DB.students = [];
      DB.marks = [];
      DB.attendance = [];
      DB.upcomingTests = [];
    }
    saveTeacherData(teacherId);
  }
}

// Database Initializer
function initDatabase() {
  try {
    if (typeof CloudDB !== 'undefined' && typeof CloudDB.init === 'function') {
      CloudDB.init();
    }

    const rawTeachers = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    const rawSession = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);

    let loadedTeachers = rawTeachers ? JSON.parse(rawTeachers) : [...SEED_TEACHERS];
    loadedTeachers = loadedTeachers.filter(t => t.id !== 'T-101' && t.id !== 'T-102' && t.id !== 'T-999999');
    DB.teachers = loadedTeachers;
    DB.activeSession = rawSession ? JSON.parse(rawSession) : null;
    try {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DB.teachers));
    } catch (e) {}

    // If active session is a teacher, keep teacher profile in sync and load teacher context
    if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
      const matchT = DB.teachers.find(t => t.id === DB.activeSession.teacher.id);
      if (matchT) {
        DB.activeSession.teacher = matchT;
      }
      const activeTId = DB.activeSession.teacher.id;
      switchTeacherContext(activeTId, false);

      // Self-healing migration for custom teachers who previously received demo seed data:
      // If a non-demo teacher has the exact 22 seed students, clear them because they never gave a student tally excel!
      if (activeTId !== 'T-101' && activeTId !== 'T-102') {
        const isExactSeedDataset = DB.students.length === SEED_STUDENTS.length &&
          (DB.students.some(s => s.name === 'આદિત્ય દવે' || s.name === 'Aditya Dave')) &&
          (DB.students.some(s => s.name === 'આરવ પટેલ' || s.name === 'Aarav Patel')) &&
          (DB.students.some(s => s.name === 'હર્ષવર્ધન રાણા' || s.name === 'Harshvardhan Rana'));

        if (isExactSeedDataset) {
          console.log('Clearing auto-injected demo seed students for custom teacher account:', activeTId);
          DB.students = [];
          DB.marks = [];
          DB.attendance = [];
          DB.upcomingTests = [];
          saveTeacherData(activeTId);
        } else {
          // Self-heal classrooms: ensure teacher classrooms include all standards represented in DB.students
          const teacherObj = DB.activeSession.teacher;
          if (teacherObj) {
            if (!teacherObj.classrooms || !Array.isArray(teacherObj.classrooms)) {
              teacherObj.classrooms = [];
            }
            const studentStds = [...new Set(DB.students.map(s => String(s.std)))].filter(Boolean);
            studentStds.forEach(stdNum => {
              const hasClass = teacherObj.classrooms.some(c => String(c.classNumber || c) === stdNum);
              if (!hasClass) {
                teacherObj.classrooms.push({ classNumber: stdNum, sections: ['A'] });
              }
            });
            const validClasses = teacherObj.classrooms.map(c => String(c.classNumber || c));
            if (validClasses.length > 0) {
              DB.students = DB.students.filter(s => validClasses.includes(String(s.std)));
              DB.marks = DB.marks.filter(m => validClasses.includes(String(m.std)));
              DB.attendance = DB.attendance.filter(a => validClasses.includes(String(a.std)));
              saveTeacherData(activeTId);
            }
          }
        }
      }

    } else if (DB.activeSession && DB.activeSession.role === 'management') {
      const targetTeacherId = DB.activeSession.connectedTeacherId || (getAddedTeacherAccount() ? getAddedTeacherAccount().id : null);
      if (targetTeacherId) {
        switchTeacherContext(targetTeacherId, false);
      }
    } else {
      // If no active teacher session, load first teacher account if exists
      const firstT = DB.teachers && DB.teachers.length > 0 ? DB.teachers[0].id : null;
      if (firstT) switchTeacherContext(firstT, false);
    }

    // Auto-migrate marks: ensure 'std' and 'source' are present and match student's enrolled std
    DB.marks.forEach(m => {
      const stu = DB.students.find(s => s.roll === m.roll);
      if (stu && stu.std) {
        m.std = stu.std.toString();
      } else if (!m.std) {
        m.std = '4';
      } else {
        m.std = m.std.toString();
      }
      if (!m.source) {
        m.source = 'excel';
      }
      if (m.subject) {
        m.subject = cleanSubjectName(m.subject);
        if (typeof translateSubjectToGujarati === 'function') {
          m.subject = translateSubjectToGujarati(m.subject);
        }
      }
    });

    saveDatabase();
  } catch (err) {
    console.error('Error initializing database:', err);
    DB.teachers = [...SEED_TEACHERS];
    DB.students = [];
    DB.marks = [];
    DB.attendance = [];
    DB.upcomingTests = [];
    DB.activeSession = null;
  }
}

// Persist current state to localStorage
function saveDatabase(triggerCloud = true) {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(DB.teachers));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DB.students));
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(DB.marks));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DB.attendance));
    localStorage.setItem(STORAGE_KEYS.UPCOMING_TESTS, JSON.stringify(DB.upcomingTests));
    if (DB.activeSession) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(DB.activeSession));
      if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
        saveTeacherData(DB.activeSession.teacher.id);
      } else {
        saveTeacherData('T-101');
      }
    } else {
      saveTeacherData('T-101');
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
    if (triggerCloud && typeof CloudDB !== 'undefined') {
      if (typeof CloudDB.broadcastChange === 'function') {
        CloudDB.broadcastChange('save');
      }
      if (typeof CloudDB.syncToCloud === 'function') {
        CloudDB.syncToCloud();
      }
    }
  } catch (err) {
    console.error('Storage quota exceeded or error saving:', err);
    if (window.showToast) window.showToast('Storage save warning', 'warning');
  }
}

// Factory Reset & Data Management
function factoryResetData(mode = 'wipe') {
  if (mode === 'wipe') {
    // 100% clean slate: erase all students, marks, attendance, and tests
    DB.students = [];
    DB.marks = [];
    DB.attendance = [];
    DB.upcomingTests = [];

    const activeTId = getActiveTeacherId ? getActiveTeacherId() : (DB.activeSession && DB.activeSession.teacher ? DB.activeSession.teacher.id : null);
    if (activeTId) saveTeacherData(activeTId);

    saveDatabase(false);
    if (typeof CloudDB !== 'undefined' && typeof CloudDB.resetCloudData === 'function') {
      CloudDB.resetCloudData('wipe');
    }
    refreshAllModulesUI();

    if (window.showToast) {
      window.showToast('Factory Reset complete: All student and marks data have been wiped.', 'success');
    }
  } else if (mode === 'marks_only') {
    // Clear marks, attendance, and upcoming tests, but keep student directory
    DB.marks = [];
    DB.attendance = [];
    DB.upcomingTests = [];

    const activeTId = getActiveTeacherId ? getActiveTeacherId() : (DB.activeSession && DB.activeSession.teacher ? DB.activeSession.teacher.id : null);
    if (activeTId) saveTeacherData(activeTId);

    saveDatabase(false);
    if (typeof CloudDB !== 'undefined' && typeof CloudDB.resetCloudData === 'function') {
      CloudDB.resetCloudData('marks_only');
    }
    refreshAllModulesUI();

    if (window.showToast) {
      window.showToast('All examination marks, attendance, and test records cleared.', 'success');
    }
  } else if (mode === 'seed' || mode === 'demo') {
    // Restore default sample dataset for current teacher
    DB.students = JSON.parse(JSON.stringify(SEED_STUDENTS));
    DB.marks = JSON.parse(JSON.stringify(SEED_MARKS));
    DB.attendance = JSON.parse(JSON.stringify(SEED_ATTENDANCE));
    DB.upcomingTests = JSON.parse(JSON.stringify(SEED_UPCOMING_TESTS));

    const activeTId = getActiveTeacherId ? getActiveTeacherId() : (DB.activeSession && DB.activeSession.teacher ? DB.activeSession.teacher.id : 'T-101');
    if (activeTId) saveTeacherData(activeTId);

    saveDatabase(false);
    if (typeof CloudDB !== 'undefined' && typeof CloudDB.resetCloudData === 'function') {
      CloudDB.resetCloudData('seed');
    }
    refreshAllModulesUI();

    if (window.showToast) {
      window.showToast('Sample demo dataset (22 students) restored!', 'success');
    }
  }
}

// Dedicated function: Clears only test excel marks, keeping student directory and teacher accounts safe!
function resetTestDataOnly() {
  DB.marks = [];
  const activeTId = getActiveTeacherId ? getActiveTeacherId() : (DB.activeSession && DB.activeSession.teacher ? DB.activeSession.teacher.id : null);
  if (activeTId) saveTeacherData(activeTId);

  saveDatabase(true);
  if (typeof CloudDB !== 'undefined' && typeof CloudDB.syncToCloud === 'function') {
    CloudDB.syncToCloud();
  }
  refreshAllModulesUI();
  if (window.showToast) {
    window.showToast('કસોટી પરિણામ / એક્સેલ ગુણ સફળતાપૂર્વક રીસેટ કર્યા. (Test marks reset)', 'success');
  }
}

function refreshAllModulesUI() {
  if (window.syncAllClassDropdownsAndCards) window.syncAllClassDropdownsAndCards();
  if (window.renderStudentsTable) window.renderStudentsTable();
  if (window.renderRecordsTable) window.renderRecordsTable();
  if (window.updateDashboard) window.updateDashboard();
  if (window.renderUpcomingTests) window.renderUpcomingTests();
  if (window.updateNavigatorBadges) window.updateNavigatorBadges();
  if (window.initAttendanceModule) window.initAttendanceModule();
  if (window.populateAnalyticsSelect) window.populateAnalyticsSelect();
  if (window.renderCommunications) window.renderCommunications();
  if (window.renderManagementMetrics) window.renderManagementMetrics();
  if (window.populateTestEntryDropdowns) window.populateTestEntryDropdowns();
  if (window.renderTeacherWorkspaceBar) window.renderTeacherWorkspaceBar();
  if (window.updateStudentTallyBadges) window.updateStudentTallyBadges();
  if (window.updateStudentTallyUI) window.updateStudentTallyUI();
  if (window.updateMarksTargetClassUI) window.updateMarksTargetClassUI();
}


// Backward compatibility helper
function resetDatabase() {
  if (window.confirmFactoryReset) {
    window.confirmFactoryReset('seed');
  } else if (window.openConfirmModal) {
    window.openConfirmModal('Reset Demo Database', 'Are you sure you want to restore all default demo students, records, and test schedules?', () => {
      factoryResetData('seed');
    });
  } else {
    factoryResetData('seed');
  }
}

// Grading Scale
function getGrade(pct) {
  if (pct >= 91) return { g: 'A1', desc: 'Outstanding', c: [34, 197, 94] };
  if (pct >= 81) return { g: 'A2', desc: 'Excellent', c: [16, 185, 129] };
  if (pct >= 71) return { g: 'B1', desc: 'Very Good', c: [59, 130, 246] };
  if (pct >= 61) return { g: 'B2', desc: 'Good', c: [99, 102, 241] };
  if (pct >= 51) return { g: 'C1', desc: 'Fair', c: [168, 85, 247] };
  if (pct >= 41) return { g: 'C2', desc: 'Average', c: [245, 158, 11] };
  if (pct >= 33) return { g: 'D', desc: 'Pass', c: [249, 115, 22] };
  return { g: 'E', desc: 'Needs Improvement', c: [239, 68, 68] };
}

// Format Phone for WhatsApp international linking
function formatPhoneForWA(number) {
  if (!number) return '';
  let cleaned = number.toString().replace(/\D/g, '');
  if (cleaned.length === 10) return '91' + cleaned;
  return cleaned;
}

// Format date as DD/MM/YYYY with slashes
function formatDateSlash(dateStr) {
  if (!dateStr) return '';
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return '';
    const d = String(dateStr.getDate()).padStart(2, '0');
    const m = String(dateStr.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${dateStr.getFullYear()}`;
  }
  const str = dateStr.toString().trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const p = str.split('/');
    return `${p[0].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[2]}`;
  }
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
    const p = str.split(/[-/.]/);
    return `${p[2].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[0]}`;
  }
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(str)) {
    const p = str.split(/[-/.]/);
    const y = p[2].length === 2 ? (parseInt(p[2]) < 50 ? '20' + p[2] : '19' + p[2]) : p[2];
    return `${p[0].padStart(2, '0')}/${p[1].padStart(2, '0')}/${y}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${parsed.getFullYear()}`;
  }
  return str.replace(/[-.]/g, '/');
}

// Convert Gujarati numerals (૦-૯) to standard English digits (0-9)
function gujaratiToEnglishDigits(val) {
  if (val === null || val === undefined) return '';
  const s = val.toString();
  const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return s.replace(/[૦-૯]/g, d => {
    const idx = gujDigits.indexOf(d);
    return idx !== -1 ? idx : d;
  });
}

// Convert English digits (0-9) to Gujarati digits (૦-૯)
function englishToGujaratiDigits(val) {
  if (val === null || val === undefined) return '';
  const s = val.toString();
  const gujDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return s.replace(/[0-9]/g, d => gujDigits[parseInt(d)]);
}

// Dictionaries for standard bidirectional subject translation
const GUJARATI_SUBJECT_MAP = {
  'ગણિત': 'Mathematics',
  'વિજ્ઞાન': 'Science',
  'વિજ્ઞાન અને ટેકનોલોજી': 'Science',
  'અંગ્રેજી': 'English',
  'સામાજિક વિજ્ઞાન': 'Social Science',
  'સમાજ વિદ્યા': 'Social Science',
  'સા.વિ.': 'Social Science',
  'સામાજિક': 'Social Science',
  'ગુજરાતી': 'Gujarati',
  'હિન્દી': 'Hindi',
  'સંસ્કૃત': 'Sanskrit',
  'કમ્પ્યુટર': 'Computer',
  'કોમ્પ્યુટર': 'Computer',
  'ચિત્ર': 'Drawing',
  'ચિત્રકામ': 'Drawing',
  'શારીરિક શિક્ષણ': 'Physical Education',
  'પી.ટી.': 'Physical Education',
  'વ્યાયામ': 'Physical Education',
  'પર્યાવરણ': 'EVS',
  'આસપાસ': 'Aspas',
  'સંગીત': 'Music',
  'યોગ': 'Yoga'
};

const ENGLISH_TO_GUJARATI_SUBJECT_MAP = {
  // Transliterations & Gujarati Phonetics
  'aspas': 'આસપાસ',
  'aaspaas': 'આસપાસ',
  'vigyan': 'વિજ્ઞાન',
  'vigyaan': 'વિજ્ઞાન',
  'ganit': 'ગણિત',
  'paryavaran': 'પર્યાવરણ',
  'samajik': 'સામાજિક વિજ્ઞાન',
  'samajik vigyan': 'સામાજિક વિજ્ઞાન',
  'samaj': 'સામાજિક વિજ્ઞાન',
  'angreji': 'અંગ્રેજી',
  'gujarati': 'ગુજરાતી',
  'gujrati': 'ગુજરાતી',
  'hindi': 'હિન્દી',
  'sanskrit': 'સંસ્કૃત',
  'chitrakam': 'ચિત્રકામ',
  'chitra': 'ચિત્રકામ',
  'sangit': 'સંગીત',
  'sangeet': 'સંગીત',
  'music': 'સંગીત',
  'yoga': 'યોગ',
  'sharirik shikshan': 'શારીરિક શિક્ષણ',
  'vyayam': 'વ્યાયામ',

  // Standard English names
  'mathematics': 'ગણિત',
  'maths': 'ગણિત',
  'math': 'ગણિત',
  'science': 'વિજ્ઞાન',
  'english': 'અંગ્રેજી',
  'social science': 'સામાજિક વિજ્ઞાન',
  'social studies': 'સામાજિક વિજ્ઞાન',
  'social': 'સામાજિક વિજ્ઞાન',
  'sst': 'સામાજિક વિજ્ઞાન',
  'computer': 'કમ્પ્યુટર',
  'drawing': 'ચિત્રકામ',
  'physical education': 'શારીરિક શિક્ષણ',
  'pt': 'પી.ટી.',
  'pe': 'શારીરિક શિક્ષણ',
  'evs': 'પર્યાવરણ',
  'environment': 'પર્યાવરણ'
};

const ENGLISH_TO_GUJARATI_TOPIC_MAP = {
  'real numbers': 'વાસ્તવિક સંખ્યાઓ',
  'algebra & quadratics': 'બીજગણિત અને દ્વિઘાત સમીકરણ',
  'light & optics': 'પ્રકાશ અને પરાવર્તન',
  'grammar & prose': 'કાવ્ય અને વ્યાકરણ',
  'heritage of india': 'ભારતનો વારસો',
  'rational numbers': 'સંમેય સંખ્યાઓ',
  'crop production': 'પાક ઉત્પાદન',
  'linear equations': 'સુરેખ સમીકરણો',
  'acids, bases & salts': 'એસિડ, બેઇઝ અને ક્ષાર',
  'unit assessment': 'એકમ કસોટી',
  'unit test': 'એકમ કસોટી',
  'chapter 1': 'પ્રકરણ ૧',
  'chapter 2': 'પ્રકરણ ૨',
  'chapter 3': 'પ્રકરણ ૩',
  'chapter 4': 'પ્રકરણ ૪',
  'chapter 5': 'પ્રકરણ ૫'
};

function translateTopicToGujarati(topic) {
  if (!topic) return 'પ્રથમ સત્રાંત કસોટી';
  // If the topic already contains Gujarati Unicode characters, preserve it 100% as written!
  if (/[\u0A80-\u0AFF]/.test(topic)) {
    return topic.toString().trim();
  }
  const clean = topic.toString().trim();
  const lower = clean.toLowerCase();
  if (ENGLISH_TO_GUJARATI_TOPIC_MAP[lower]) {
    return ENGLISH_TO_GUJARATI_TOPIC_MAP[lower];
  }
  return clean;
}

function translateSubjectToGujarati(subject) {
  if (!subject) return '';
  const clean = cleanSubjectName(subject);

  // 1. If subject already contains Gujarati Unicode characters, preserve and return it directly as given!
  if (/[\u0A80-\u0AFF]/.test(clean)) {
    return clean;
  }

  const lower = clean.toLowerCase();
  // 2. Check transliteration and English mapping
  if (ENGLISH_TO_GUJARATI_SUBJECT_MAP[lower]) {
    return ENGLISH_TO_GUJARATI_SUBJECT_MAP[lower];
  }

  // 3. Bidirectional dictionary lookup
  for (const [guj, eng] of Object.entries(GUJARATI_SUBJECT_MAP)) {
    if (lower === eng.toLowerCase() || clean === guj) {
      return guj;
    }
  }

  return clean;
}

function normalizeSubjectFromGujarati(subject) {
  if (!subject) return '';
  const clean = cleanSubjectName(subject);
  if (GUJARATI_SUBJECT_MAP[clean]) {
    return GUJARATI_SUBJECT_MAP[clean];
  }
  return clean;
}

// Clean subject name by removing any embedded dates or bracketed numbers
function cleanSubjectName(sub) {
  if (!sub) return '';
  let s = sub.toString().trim();

  // Remove bracketed numbers e.g. (25), [40], (Total: 50), (કુલ: ૨૫)
  s = s.replace(/(?:\(|\{|\[)\s*(?:total\s*:?|marks\s*:?|max\s*:?|કુલ\s*:?|ગુણ\s*:?|માર્ક્સ\s*:?)?\s*[\d૦-૯]+(?:\.[\d૦-૯]+)?\s*(?:marks|m|pts|ગુણ)?\s*(?:\)|\}|\])/gi, ' ');

  // Remove dates in DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY, etc.
  s = s.replace(/(?:\(|\b)(?:\d{4}[-/. ]\d{1,2}[-/. ]\d{1,2}|\d{1,2}[-/. ]\d{1,2}[-/. ]\d{2,4})(?:\)|\b)/g, ' ');

  // Remove text month dates: 15 Sep 2026, 15-Sep-2026
  s = s.replace(/(?:\(|\b)\d{1,2}[-/ ](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-/ ]\d{2,4}(?:\)|\b)/gi, ' ');

  // Clean remaining symbols and extra spaces
  s = s.replace(/[()[\]{}]/g, ' ')
       .replace(/[-–—/\\|:,]+/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();

  return s || sub.toString().trim();
}

// Student Lookup Helpers with Class Scoping
function findStudentByRoll(roll, std = null) {
  if (std !== null && std !== undefined && std !== 'all' && std !== '') {
    const sMatch = DB.students.find(s => s.roll === parseInt(roll) && s.std.toString() === std.toString());
    if (sMatch) return sMatch;
  }
  return DB.students.find(s => s.roll === parseInt(roll));
}

function findStudentByRollAndClass(roll, std) {
  if (!roll) return null;
  const targetRoll = parseInt(roll);
  if (std !== null && std !== undefined && std !== 'all' && std !== '') {
    return DB.students.find(s => s.roll === targetRoll && s.std.toString() === std.toString()) || null;
  }
  return DB.students.find(s => s.roll === targetRoll) || null;
}

function findStudentByGrNo(grNo) {
  if (!grNo) return null;
  return DB.students.find(s => s.grNo && s.grNo.toString().trim().toLowerCase() === grNo.toString().trim().toLowerCase()) || null;
}

function findStudent(roll, std = null, grNo = null) {
  if (grNo) {
    const sGr = findStudentByGrNo(grNo);
    if (sGr) return sGr;
  }
  if (roll) {
    return findStudentByRoll(roll, std);
  }
  return null;
}

function getMarksForStudent(roll, std = null) {
  const targetRoll = parseInt(roll);
  return DB.marks.filter(m => {
    if (m.roll !== targetRoll) return false;
    if (std !== null && std !== undefined && std !== 'all' && std !== '') {
      return m.std ? m.std.toString() === std.toString() : true;
    }
    return true;
  });
}

// Export global symbols
window.DB = DB;
window.initDatabase = initDatabase;
window.saveDatabase = saveDatabase;
window.resetDatabase = resetDatabase;
window.factoryResetData = factoryResetData;
window.resetTestDataOnly = resetTestDataOnly;
window.refreshAllModulesUI = refreshAllModulesUI;
window.getGrade = getGrade;
window.formatPhoneForWA = formatPhoneForWA;
window.findStudentByRoll = findStudentByRoll;
window.findStudentByRollAndClass = findStudentByRollAndClass;
window.findStudentByGrNo = findStudentByGrNo;
window.findStudent = findStudent;
window.getMarksForStudent = getMarksForStudent;
window.formatDateSlash = formatDateSlash;
window.cleanSubjectName = cleanSubjectName;
window.getActiveTeacherId = getActiveTeacherId;
window.getAddedTeacherAccount = getAddedTeacherAccount;
window.getTeacherStorageKey = getTeacherStorageKey;
window.saveTeacherData = saveTeacherData;
window.switchTeacherContext = switchTeacherContext;
window.getTeacherAssignedClasses = getTeacherAssignedClasses;
window.SEED_STUDENTS = SEED_STUDENTS;
window.SEED_MARKS = SEED_MARKS;
window.gujaratiToEnglishDigits = gujaratiToEnglishDigits;
window.englishToGujaratiDigits = englishToGujaratiDigits;
window.translateSubjectToGujarati = translateSubjectToGujarati;
window.translateTopicToGujarati = translateTopicToGujarati;
window.normalizeSubjectFromGujarati = normalizeSubjectFromGujarati;
window.GUJARATI_SUBJECT_MAP = GUJARATI_SUBJECT_MAP;
window.ENGLISH_TO_GUJARATI_SUBJECT_MAP = ENGLISH_TO_GUJARATI_SUBJECT_MAP;
