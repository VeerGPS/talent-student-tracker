/**
 * Talent Tution Classes Student Tracker - Upcoming Tests & Test Result Generator
 * Clean Excel import/export pipelines, auto-parsing for student tallies,
 * marks ingestion, and SMS/WhatsApp result distribution.
 */

let upcomingTestsFilter = 'all';

// Initialize Tests Module
function initTestsModule() {
  renderUpcomingTests();
  populateTestEntryDropdowns();
}

// -------------------------------------------------------------
// UPCOMING TESTS SECTION
// -------------------------------------------------------------
function renderUpcomingTests() {
  const container = document.getElementById('upcoming-tests-list');
  if (!container) return;

  let tests = [...DB.upcomingTests];

  // If teacher logged in, highlight or filter by their subjects
  const teacher = (DB.activeSession && DB.activeSession.role === 'teacher') ? DB.activeSession.teacher : null;
  const teacherSubjects = teacher ? teacher.subjects : [];

  if (upcomingTestsFilter === 'my' && teacherSubjects.length > 0) {
    tests = tests.filter(t => teacherSubjects.includes(t.subject));
  }

  // Sort tests by date ascending
  tests.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (tests.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 glass-card rounded-3xl p-8">
        <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500 text-2xl">
          <i class="fa-regular fa-calendar-xmark"></i>
        </div>
        <h4 class="text-lg font-bold text-slate-700">No Scheduled Tests</h4>
        <p class="text-xs text-slate-500 mt-1">Click the button below to schedule an upcoming assessment.</p>
        <button onclick="openNewTestModal()" class="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/30 transition-all">
          <i class="fa-solid fa-plus mr-1.5"></i> Schedule New Test
        </button>
      </div>
    `;
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  container.innerHTML = tests.map(t => {
    const isTeacherSubject = teacherSubjects.includes(t.subject);
    const testDate = new Date(t.date);
    const isPast = t.date < todayStr;
    const isToday = t.date === todayStr;

    let badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
    let badgeText = 'Upcoming';
    if (isToday) {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse';
      badgeText = 'Today!';
    } else if (isPast) {
      badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
      badgeText = 'Completed';
    }

    return `
      <div class="glass-card rounded-3xl p-6 relative overflow-hidden border-t-4 ${isTeacherSubject ? 'border-indigo-500' : 'border-slate-300'} shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${badgeClass}">
            ${badgeText}
          </span>
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-bold text-slate-400">Class ${t.std}-${t.section || 'A'}</span>
            <button onclick="deleteUpcomingTest(${t.id})" class="text-slate-300 hover:text-rose-500 p-1 transition-colors" title="Delete Test">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-1">
            <h4 class="text-xl font-black text-slate-800">${t.subject}</h4>
            ${isTeacherSubject ? '<span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">My Subject</span>' : ''}
          </div>
          <p class="text-sm font-semibold text-slate-600 mb-4">${t.topic}</p>
        </div>

        <div class="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4 font-medium">
          <div class="flex items-center justify-between">
            <span><i class="fa-regular fa-calendar text-indigo-500 mr-2"></i>Date:</span>
            <strong class="text-slate-800">${t.date}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span><i class="fa-solid fa-award text-amber-500 mr-2"></i>Max Marks:</span>
            <strong class="text-slate-800">${t.totalMarks} Marks</strong>
          </div>
          ${t.room ? `
          <div class="flex items-center justify-between">
            <span><i class="fa-solid fa-location-dot text-rose-500 mr-2"></i>Hall / Room:</span>
            <strong class="text-slate-800">${t.room}</strong>
          </div>` : ''}
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button onclick="prepareTestMarksEntry('${t.subject}', '${t.std}', '${t.section || 'A'}', '${t.topic}', '${t.date}', ${t.totalMarks})"
            class="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center border border-indigo-200">
            <i class="fa-solid fa-pen-to-square mr-1.5"></i> Enter Results
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterUpcomingTests(type) {
  upcomingTestsFilter = type;
  document.querySelectorAll('.upcoming-filter-btn').forEach(btn => {
    if (btn.dataset.filter === type) {
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white', 'text-slate-600');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.add('bg-white', 'text-slate-600');
    }
  });
  renderUpcomingTests();
}

function openNewTestModal() {
  const modal = document.getElementById('new-test-modal');
  if (!modal) return;

  // Populate subject options from teacher's subjects or default subjects
  const subSelect = document.getElementById('new-test-subject');
  let subjects = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Gujarati', 'Computer', 'Sanskrit'];
  if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
    if (DB.activeSession.teacher.subjects && DB.activeSession.teacher.subjects.length > 0) {
      subjects = DB.activeSession.teacher.subjects;
    }
  }

  subSelect.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');

  // Populate class options
  const classSelect = document.getElementById('new-test-class');
  let classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
    classes = DB.activeSession.teacher.classrooms.map(c => c.classNumber);
  }
  classSelect.innerHTML = classes.map(c => `<option value="${c}">Class ${c}</option>`).join('');

  document.getElementById('new-test-date').value = new Date().toISOString().split('T')[0];
  modal.classList.remove('hidden');
}

function closeNewTestModal() {
  const modal = document.getElementById('new-test-modal');
  if (modal) modal.classList.add('hidden');
}

function saveNewUpcomingTest() {
  const subject = document.getElementById('new-test-subject').value;
  const std = document.getElementById('new-test-class').value;
  const section = document.getElementById('new-test-section').value.trim() || 'A';
  const topic = document.getElementById('new-test-topic').value.trim();
  const date = document.getElementById('new-test-date').value;
  const totalMarks = parseFloat(document.getElementById('new-test-total').value) || 50;
  const room = document.getElementById('new-test-room').value.trim();

  if (!topic || !date) {
    if (window.showToast) window.showToast('Please enter test topic and date.', 'warning');
    return;
  }

  const newTest = {
    id: Date.now(),
    subject,
    std,
    section,
    topic,
    date,
    totalMarks,
    room: room || 'Main Hall'
  };

  DB.upcomingTests.push(newTest);
  saveDatabase();
  closeNewTestModal();
  renderUpcomingTests();
  if (window.showToast) window.showToast(`Test scheduled for ${subject} (Class ${std})!`, 'success');
}

function deleteUpcomingTest(id) {
  if (window.openConfirmModal) {
    window.openConfirmModal('Delete Test Notice', 'Are you sure you want to cancel this scheduled test?', () => {
      DB.upcomingTests = DB.upcomingTests.filter(t => t.id !== id);
      saveDatabase();
      renderUpcomingTests();
      if (window.showToast) window.showToast('Test cancelled.', 'info');
    });
  } else {
    DB.upcomingTests = DB.upcomingTests.filter(t => t.id !== id);
    saveDatabase();
    renderUpcomingTests();
  }
}

// -------------------------------------------------------------
// TEST RESULT GENERATOR (MANUAL & EXCEL BULK UPLOAD)
// -------------------------------------------------------------
function populateTestEntryDropdowns() {
  const stdInput = document.getElementById('entry-std');
  const subjInput = document.getElementById('entry-subject');
  if (!stdInput || !subjInput) return;

  if (DB.activeSession && DB.activeSession.role === 'teacher' && DB.activeSession.teacher) {
    const teacher = DB.activeSession.teacher;
    if (teacher.classrooms && teacher.classrooms.length > 0 && !stdInput.value) {
      stdInput.value = teacher.classrooms[0].classNumber;
    }
    if (teacher.subjects && teacher.subjects.length > 0 && !subjInput.value) {
      subjInput.value = teacher.subjects[0];
    }
  }
}

function prepareTestMarksEntry(subject, std, section, topic, date, totalMarks) {
  // Navigate to Data Entry / Result Generator tab
  if (window.switchTab) window.switchTab('data-entry');

  document.getElementById('entry-std').value = std;
  document.getElementById('entry-subject').value = subject;
  document.getElementById('entry-topic').value = topic;
  document.getElementById('entry-date').value = date;
  document.getElementById('entry-total').value = totalMarks;

  // Automatically trigger class roster generator
  setTimeout(() => {
    loadMassEntryList();
  }, 250);
}

function loadMassEntryList() {
  const std = document.getElementById('entry-std').value.trim();
  const sub = document.getElementById('entry-subject').value.trim();
  const topic = document.getElementById('entry-topic').value.trim();
  const total = parseFloat(document.getElementById('entry-total').value) || 50;

  if (!std || !sub || !topic) {
    if (window.showToast) window.showToast('Standard, Subject and Test Topic are required.', 'warning');
    return;
  }

  let classStudents = DB.students.filter(s => s.std == std);
  if (classStudents.length === 0) {
    if (window.showToast) window.showToast(`No students enrolled in Std '${std}'.`, 'warning');
    return;
  }

  classStudents.sort((a, b) => a.roll - b.roll);

  // Check if any existing marks for this test
  const existingMarks = DB.marks.filter(m => m.subject === sub && m.topic === topic);

  const container = document.getElementById('mass-entry-list');
  container.innerHTML = classStudents.map(s => {
    const ex = existingMarks.find(m => m.roll === s.roll);
    let val = '';
    if (ex) {
      val = ex.isAbsent ? 'AB' : ex.marks;
    }

    return `
      <div class="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
        <div class="flex items-center space-x-3">
          <span class="font-mono font-black text-xs text-indigo-500 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">${s.roll}</span>
          <div>
            <div class="font-bold text-slate-800 text-sm">${s.name}</div>
            <div class="text-[10px] text-slate-400 font-semibold">${s.grNo || 'GR: -'} | Sec: ${s.section || 'A'}</div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input type="text" 
            class="mass-entry-input w-24 border-2 border-slate-200 rounded-xl px-3 py-1.5 text-center font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            data-roll="${s.roll}"
            data-gr="${s.grNo || ''}"
            value="${val}"
            placeholder="Marks / AB">
          <span class="text-xs font-bold text-slate-400">/ ${total}</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('mass-entry-container').classList.remove('hidden');
  if (window.showToast) window.showToast(`Loaded ${classStudents.length} students for Class ${std}.`, 'info');
}

function saveMassEntry() {
  const std = (document.getElementById('entry-std') ? document.getElementById('entry-std').value.trim() : '') || (window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : '9');
  const sub = document.getElementById('entry-subject') ? document.getElementById('entry-subject').value.trim() : '';
  const topic = document.getElementById('entry-topic') ? document.getElementById('entry-topic').value.trim() : '';
  const dt = document.getElementById('entry-date') ? document.getElementById('entry-date').value : '';
  const tot = parseFloat(document.getElementById('entry-total') ? document.getElementById('entry-total').value : 50);

  if (!dt || isNaN(tot) || tot <= 0) {
    if (window.showToast) window.showToast('Please enter a valid Test Date and Max Marks.', 'warning');
    return;
  }

  let count = 0;
  const inputs = document.querySelectorAll('.mass-entry-input');

  inputs.forEach(input => {
    const val = input.value.trim();
    if (val !== '') {
      const isAb = (val.toLowerCase() === 'ab');
      const marks = isAb ? 0 : parseFloat(val);
      const roll = parseInt(input.dataset.roll);
      const grNo = input.dataset.gr;

      if (isAb || (!isNaN(marks) && marks >= 0 && marks <= tot)) {
        let cleanSub = typeof cleanSubjectName === 'function' ? cleanSubjectName(sub) : sub;
        if (typeof translateSubjectToGujarati === 'function') {
          cleanSub = translateSubjectToGujarati(cleanSub);
        }
        const targetGuj = typeof translateSubjectToGujarati === 'function' ? translateSubjectToGujarati(cleanSub) : cleanSub;
        const ex = DB.marks.find(m => 
          (m.std ? m.std.toString() === std.toString() : true) && 
          m.roll === roll && 
          (m.subject === cleanSub || (typeof translateSubjectToGujarati === 'function' && translateSubjectToGujarati(m.subject) === targetGuj) || (typeof cleanSubjectName === 'function' && cleanSubjectName(m.subject) === cleanSub)) && 
          m.date === dt
        );
        if (ex) {
          ex.marks = marks;
          ex.total = tot;
          ex.isAbsent = isAb;
          ex.std = std.toString();
          ex.source = 'manual';
          if (grNo && !ex.grNo) ex.grNo = grNo;
          count++;
        } else {
          DB.marks.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            grNo: grNo || '',
            roll: roll,
            std: std.toString(),
            subject: cleanSub,
            topic: topic || 'Unit Test',
            marks: marks,
            total: tot,
            date: dt,
            isAbsent: isAb,
            source: 'manual',
            enteredAt: new Date().toISOString()
          });
          count++;
        }
      }
    }
  });

  if (count > 0) {
    saveDatabase();
    if (window.showToast) window.showToast(`Saved manual marks for ${count} students in Class ${std} successfully!`, 'success');
    const container = document.getElementById('mass-entry-container');
    if (container) container.classList.add('hidden');
    if (window.updateDashboard) window.updateDashboard();
  } else {
    if (window.showToast) window.showToast('No valid marks entered.', 'warning');
  }
}

// =============================================================
// SYSTEM 1: DEDICATED STUDENT TALLY EXCEL (BULK ROSTER IMPORT / EXPORT)
// =============================================================

function downloadStudentTallyExcel(std = null) {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading, please retry.', 'warning');
    return;
  }

  const assignedClasses = (typeof getTeacherAssignedClasses === 'function') ? getTeacherAssignedClasses() : ['8', '9', '10'];
  const targetStd = (std || (document.getElementById('tally-target-std') ? document.getElementById('tally-target-std').value : null) || (window.currentTeacherWorkspaceClass && window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : (assignedClasses[0] || '9'))).toString();

  const wb = XLSX.utils.book_new();

  const headers = ['GR No.', 'Roll No', 'Full Name', 'Class', 'Section', 'Mobile (WhatsApp)'];
  
  const sampleRows = [
    headers,
    [`GR-2024-${targetStd.padStart(2, '0')}1`, 101, `Student One Class ${targetStd}`, targetStd, 'A', '9876543210'],
    [`GR-2024-${targetStd.padStart(2, '0')}2`, 102, `Student Two Class ${targetStd}`, targetStd, 'A', '9876543211'],
    [`GR-2024-${targetStd.padStart(2, '0')}3`, 103, `Student Three Class ${targetStd}`, targetStd, 'A', '9876543212']
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleRows);
  ws['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, `Student_Tally_Class_${targetStd}`);
  XLSX.writeFile(wb, `Talent_Tution_Classes_Student_Tally_Class_${targetStd}_Template.xlsx`);

  if (window.showToast) window.showToast(`Student Tally Excel template for Class ${targetStd} downloaded!`, 'success');
}

function exportCurrentStudentTally(std = 'all') {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading, please retry.', 'warning');
    return;
  }

  const targetStd = (std || (document.getElementById('tally-target-std') ? document.getElementById('tally-target-std').value : 'all')).toString();
  let students = [...DB.students];
  if (targetStd !== 'all') {
    students = students.filter(s => s.std.toString() === targetStd);
  }

  if (students.length === 0) {
    if (window.showToast) window.showToast(`No students enrolled in Class ${targetStd} to export.`, 'warning');
    return;
  }

  const wb = XLSX.utils.book_new();
  const rows = [
    ['TALENT TUTION CLASSES - OFFICIAL STUDENT TALLY & ROSTER'],
    ['Exported On:', new Date().toLocaleString(), 'Class Filter:', targetStd === 'all' ? 'All Classes' : `Class ${targetStd}`],
    [],
    ['GR No.', 'Roll No', 'Full Name', 'Class', 'Section', 'Mobile (WhatsApp)']
  ];

  students.sort((a, b) => {
    if (a.std !== b.std) return parseInt(a.std) - parseInt(b.std);
    return a.roll - b.roll;
  }).forEach(s => {
    rows.push([s.grNo || '', s.roll, s.name, s.std, s.section || 'A', s.mobile || '']);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 28 }, { wch: 10 }, { wch: 10 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, `Roster_Class_${targetStd}`);
  XLSX.writeFile(wb, `Talent_Tution_Classes_Student_Roster_Class_${targetStd}_${Date.now()}.xlsx`);

  if (window.showToast) window.showToast(`Exported ${students.length} student tally records successfully!`, 'success');
}

function processParsedStudentTallyRows(rows, explicitStd = null) {
  if (!rows || rows.length <= 1) {
    if (window.showToast) window.showToast('Uploaded Student Tally sheet is empty.', 'warning');
    return;
  }

  const assignedClasses = (typeof getTeacherAssignedClasses === 'function') ? getTeacherAssignedClasses() : ['8', '9', '10'];
  const targetStd = (explicitStd || (document.getElementById('tally-target-std') ? document.getElementById('tally-target-std').value : null) || (window.currentTeacherWorkspaceClass && window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : (assignedClasses[0] || '9'))).toString();

  // Find header row (first row with recognizable columns in English or Gujarati)
  let headerRowIdx = 0;
  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const rowStr = (rows[r] || []).join(' ').toLowerCase();
    if (rowStr.includes('name') || rowStr.includes('roll') || rowStr.includes('gr') ||
        rowStr.includes('નામ') || rowStr.includes('વિદ્યાર્થી') || rowStr.includes('રોલ') || 
        rowStr.includes('અનુક્રમ') || rowStr.includes('જીઆર') || rowStr.includes('જી.આર') || rowStr.includes('રજીસ્ટર')) {
      headerRowIdx = r;
      break;
    }
  }

  const headers = (rows[headerRowIdx] || []).map(h => (h ? h.toString().trim().toLowerCase() : ''));
  const grIdx = headers.findIndex(h => h.includes('gr') || h.includes('g.r') || h.includes('general') || h.includes('જીઆર') || h.includes('જી.આર') || h.includes('રજીસ્ટર') || h.includes('નોંધણી'));
  const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('રોલ') || h.includes('અનુક્રમ') || h.includes('ક્રમ') || h.includes('નંબર'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student') || h.includes('નામ') || h.includes('વિદ્યાર્થી'));
  let stdIdx = headers.findIndex(h => h.includes('class') || h.includes('std') || h.includes('standard') || h.includes('ધોરણ'));
  const secIdx = headers.findIndex(h => h.includes('sec') || h.includes('division') || h.includes('વિભાગ') || h.includes('વર્ગખંડ') || h.includes('શાખા') || h.includes('ટુકડી') || (h.includes('વર્ગ') && !h.includes('ધોરણ')));
  if (stdIdx === -1 && secIdx !== -1) {
    stdIdx = headers.findIndex((h, idx) => idx !== secIdx && (h.includes('class') || h.includes('std')));
  } else if (stdIdx === -1) {
    stdIdx = headers.findIndex(h => h.includes('વર્ગ'));
  }
  const mobIdx = headers.findIndex(h => h.includes('mob') || h.includes('phone') || h.includes('contact') || h.includes('whatsapp') || h.includes('મોબાઈલ') || h.includes('ફોન') || h.includes('સંપર્ક'));

  if (nameIdx === -1 && rollIdx === -1 && grIdx === -1) {
    if (window.showToast) window.showToast("Sheet must contain 'Full Name' (નામ), 'Roll No' (રોલ નં), or 'GR No.' (જી.આર. નં)", 'error');
    return;
  }

  let addedCount = 0;
  let updatedCount = 0;
  const toEngDigits = typeof gujaratiToEnglishDigits === 'function' ? gujaratiToEnglishDigits : (v => v);

  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rowName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].toString().trim() : '';
    const rollStr = rollIdx !== -1 && row[rollIdx] ? toEngDigits(row[rollIdx].toString().trim()) : '';
    const rawRoll = rollStr ? parseInt(rollStr.replace(/[^0-9]/g, '')) : null;
    const rowGr = grIdx !== -1 && row[grIdx] ? toEngDigits(row[grIdx].toString().trim()) : '';
    
    let rowStdRaw = (stdIdx !== -1 && row[stdIdx] && row[stdIdx].toString().trim()) ? toEngDigits(row[stdIdx].toString().trim()) : targetStd;
    let rowStd = rowStdRaw.replace(/[^0-9]/g, '') || targetStd;

    let rowSec = secIdx !== -1 && row[secIdx] ? row[secIdx].toString().trim().toUpperCase() : 'A';
    if (rowSec === 'અ' || rowSec === 'A') rowSec = 'A';
    else if (rowSec === 'બ' || rowSec === 'B') rowSec = 'B';
    else if (rowSec === 'ક' || rowSec === 'C') rowSec = 'C';
    else if (rowSec === 'ડ' || rowSec === 'D') rowSec = 'D';
    else if (!rowSec) rowSec = 'A';

    const rowMob = mobIdx !== -1 && row[mobIdx] ? toEngDigits(row[mobIdx].toString().trim()).replace(/[^0-9+]/g, '') : '';

    if (!rowName && !rawRoll && !rowGr) continue;

    const isCorruptName = !rowName || rowName.includes('???') || /^[?\s.-]{3,}$/.test(rowName.trim());

    // 1. Match strictly by (same class, same section, same roll)
    let existing = null;
    if (rawRoll) {
      existing = DB.students.find(s => 
        String(s.std).trim() === String(rowStd).trim() && 
        String(s.section || 'A').trim().toUpperCase() === rowSec.toUpperCase() && 
        s.roll === rawRoll
      );
    }

    // 2. Next match strictly by (same class, matching GR number)
    if (!existing && rowGr) {
      const normGr = String(rowGr).trim().toLowerCase();
      existing = DB.students.find(s => 
        String(s.std).trim() === String(rowStd).trim() && 
        s.grNo && String(s.grNo).trim().toLowerCase() === normGr &&
        (!rowName || !s.name || s.name.trim().toLowerCase() === rowName.toLowerCase() || s.name.includes('???') || rowName.includes('???') || isCorruptName || s.roll === rawRoll)
      );
    }

    // 3. Fallback: match by (same class, same section, exact name)
    if (!existing && rowName && !isCorruptName && rowName.length > 2) {
      existing = DB.students.find(s => 
        String(s.std).trim() === String(rowStd).trim() && 
        String(s.section || 'A').trim().toUpperCase() === rowSec.toUpperCase() && 
        s.name && String(s.name).trim().toLowerCase() === rowName.toLowerCase()
      );
    }

    let roll = rawRoll;
    const sectionRolls = DB.students
      .filter(s => String(s.std).trim() === String(rowStd).trim() && String(s.section || 'A').trim().toUpperCase() === rowSec.toUpperCase())
      .map(s => s.roll)
      .filter(r => typeof r === 'number' && !isNaN(r));

    if (!existing) {
      if (!roll) {
        roll = sectionRolls.length > 0 ? Math.max(...sectionRolls) + 1 : 1;
      } else if (sectionRolls.includes(roll)) {
        const maxRoll = sectionRolls.length > 0 ? Math.max(...sectionRolls) : 0;
        roll = maxRoll + 1;
      }
    } else {
      if (rawRoll && (!sectionRolls.includes(rawRoll) || existing.roll === rawRoll)) {
        roll = rawRoll;
      } else {
        roll = existing.roll;
      }
    }

    const grNo = rowGr || (existing && existing.grNo) || `GR-${new Date().getFullYear()}-${rowStd}-${String(roll).padStart(3, '0')}`;

    let name = rowName || `વિદ્યાર્થી ${roll}`;
    if (isCorruptName) {
      if (existing && existing.name && !existing.name.includes('???') && !/^[?\s.-]{3,}$/.test(existing.name.trim())) {
        name = existing.name;
      } else {
        const gujFallback = [
          'આરવ પટેલ', 'પ્રિયા શાહ', 'રોહન મહેતા', 'અનન્યા જોશી', 'કબીર સિંઘાનિયા',
          'સ્નેહા કુલકર્ણી', 'દેવેન્દ્ર દવે', 'ઈશા ત્રિવેદી', 'આર્યન ભટ્ટ', 'દિયા મહેતા',
          'હર્ષવર્ધન રાણા', 'કૃણાલ પંડ્યા', 'માનસી સોની', 'પૂજા ચોકસી', 'વિવેક ઠાકોર',
          'નિધિ પંચાલ', 'યશ પારેખ', 'તનિષ્ક જૈન', 'ખુશી બારોટ', 'હેત શાહ',
          'દિશા રાવલ', 'ઓમ સોલંકી', 'રિદ્ધિ પટેલ', 'તન્વી દેસાઈ', 'જય શાહ', 'ભાવેશ જોશી'
        ];
        name = gujFallback[(roll - 1) % gujFallback.length] || `વિદ્યાર્થી ${roll}`;
      }
    }

    if (existing) {
      existing.name = name;
      existing.std = rowStd.toString();
      existing.section = rowSec || existing.section || 'A';
      existing.roll = roll;
      if (rowMob) existing.mobile = rowMob;
      if (rowGr) existing.grNo = rowGr;
      updatedCount++;
    } else {
      DB.students.push({
        id: Date.now() + Math.floor(Math.random() * 1000000),
        grNo: grNo,
        roll: roll,
        name: name,
        std: rowStd.toString(),
        section: rowSec,
        mobile: rowMob
      });
      addedCount++;
    }
  }

  saveDatabase();
  if (window.showToast) {
    window.showToast(`Student Tally for Class ${targetStd}: ${addedCount} enrolled, ${updatedCount} updated!`, 'success');
  }

  if (window.renderStudentsTable) window.renderStudentsTable();
  if (window.updateDashboard) window.updateDashboard();
  if (window.updateStudentTallyBadges) window.updateStudentTallyBadges();
  if (window.renderTeacherWorkspaceBar) window.renderTeacherWorkspaceBar();
}

function handleStudentTallyUpload(event, explicitStd = null) {
  if (Array.isArray(event)) {
    return processParsedStudentTallyRows(event, explicitStd);
  }

  const file = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      let workbook;
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt');
      if (isCsv) {
        try {
          const text = new TextDecoder('utf-8').decode(data);
          workbook = XLSX.read(text, { type: 'string' });
        } catch (err) {
          workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
        }
      } else {
        workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      // Check if file contains corrupted '???'
      const hasCorruptedNames = rows.some(r => Array.isArray(r) && r.some(cell => cell && typeof cell === 'string' && (cell.includes('???') || /^[?\s.-]{3,}$/.test(cell))));
      if (hasCorruptedNames && window.showToast) {
        window.showToast("ધ્યાન આપો: ફાઈલમાં '???' દેખાય છે. એક્સેલમાં 'Excel Workbook (.xlsx)' તરીકે સેવ કરો.", 'warning');
      }

      processParsedStudentTallyRows(rows, explicitStd);
    } catch (err) {
      console.error('Student tally upload error:', err);
      if (window.showToast) window.showToast('Failed to parse Student Tally file.', 'error');
    }
    if (event.target) event.target.value = '';
  };
  reader.readAsArrayBuffer(file);
}

// =============================================================
// SYSTEM 2: REPORT CARD GENERATION EXCEL (BULK MARKS UPLOAD & TEMPLATES)
// =============================================================

function downloadFormatExcel(type) {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading, please retry.', 'warning');
    return;
  }

  const wb = XLSX.utils.book_new();

  if (type === 'randomized-multi') {
    // Multi-subject format with: Subject name, then topic name, then date, and then out of marks:
    const headers = [
      'Gr No.',
      'Name',
      'Roll No',
      'ગણિત - વાસ્તવિક સંખ્યાઓ - 2026-09-12 (50)',
      'વિજ્ઞાન - પ્રકાશ અને પરાવર્તન - 2026-09-18 (50)',
      'અંગ્રેજી - Grammar & Prose - 2026-09-22 (25)',
      'સામાજિક વિજ્ઞાન - ભારતનો વારસો - 2026-09-25 (50)',
      'ગુજરાતી - કાવ્ય અને વ્યાકરણ - 2026-09-28 (50)',
      'હિન્દી - કહાની અને વ્યાકરણ - 2026-09-30 (50)'
    ];
    const sampleRows = [
      headers,
      ['GR-2024-001', 'આરવ પટેલ', 101, 48, 45, 23, 46, 44, 42],
      ['GR-2024-002', 'પ્રિયા શાહ', 102, 42, 40, 24, 44, 47, 45],
      ['GR-2024-003', 'રોહન મહેતા', 103, 18, 22, 14, 30, 28, 30],
      ['GR-2024-004', 'અનન્યા જોશી', 104, 49, 48, 25, 47, 49, 48],
      ['GR-2024-005', 'કબીર સિંઘાનિયા', 105, 'AB', 34, 19, 40, 38, 36]
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 38 }, { wch: 40 }, { wch: 38 }, { wch: 40 }, { wch: 40 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Multi_Subject_Marks');
    XLSX.writeFile(wb, 'Template_GrNo_Name_Roll_MultiSubject.xlsx');
  } else {
    // Single test format
    const headers = ['Gr No.', 'Name', 'Roll No', 'Class', 'Subject', 'Topic', 'Date', 'Marks (or AB)', 'Total'];
    const sampleRows = [
      headers,
      ['GR-2024-001', 'Aarav Patel', 101, 9, 'Mathematics', 'Algebra Test', '2026-09-07', 48, 50],
      ['GR-2024-002', 'Priya Shah', 102, 9, 'Mathematics', 'Algebra Test', '2026-09-07', 42, 50],
      ['GR-2024-003', 'Rohan Mehta', 103, 9, 'Mathematics', 'Algebra Test', '2026-09-07', 'AB', 50]
    ];
    const ws = XLSX.utils.aoa_to_sheet(sampleRows);
    ws['!cols'] = [{ wch: 15 }, { wch: 22 }, { wch: 10 }, { wch: 8 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Single_Test_Marks');
    XLSX.writeFile(wb, 'Template_Single_Test_Marks.xlsx');
  }

  if (window.showToast) window.showToast('Sample template downloaded!', 'success');
}

/**
 * Downloads a class-specific Marks Template pre-populated with the ACTUAL enrolled students of that class!
 * The teacher never needs to re-enter student names or roll numbers.
 */
function downloadClassMarksTemplate(std = null) {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading, please retry.', 'warning');
    return;
  }

  const assignedClasses = (typeof getTeacherAssignedClasses === 'function') ? getTeacherAssignedClasses() : ['9'];
  const targetStd = (std || (document.getElementById('marks-target-std') ? document.getElementById('marks-target-std').value : null) || (window.currentTeacherWorkspaceClass && window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : (assignedClasses[0] || '9'))).toString();

  const classStudents = DB.students.filter(s => s.std.toString() === targetStd).sort((a, b) => a.roll - b.roll);

  const wb = XLSX.utils.book_new();
  const stdNum = parseInt(targetStd) || 9;
  const headers = [
    'જી.આર. નં',
    'વિદ્યાર્થીનું નામ',
    'રોલ નં',
    'ગણિત - વાસ્તવિક સંખ્યાઓ - 2026-09-12 (50)',
    (stdNum <= 5 ? 'આસપાસ - મારી આસપાસ - 2026-09-18 (50)' : 'વિજ્ઞાન - પ્રકાશ અને પરાવર્તન - 2026-09-18 (50)'),
    'અંગ્રેજી - Grammar & Prose - 2026-09-22 (25)',
    'સામાજિક વિજ્ઞાન - ભારતનો વારસો - 2026-09-25 (50)',
    'ગુજરાતી - કાવ્ય અને વ્યાકરણ - 2026-09-28 (50)',
    'હિન્દી - કહાની અને વ્યાકરણ - 2026-09-30 (50)'
  ];

  const rows = [headers];

  if (classStudents.length > 0) {
    classStudents.forEach(s => {
      rows.push([s.grNo || '', s.name, s.roll, '', '', '', '', '', '']);
    });
  } else {
    // Provide sample rows if no students enrolled yet
    rows.push([`GR-2026-${targetStd}-001`, `આરવ પટેલ`, 1, 45, 42, 22, 44, 46, 40]);
    rows.push([`GR-2026-${targetStd}-002`, `પ્રિયા શાહ`, 2, 48, 46, 24, 48, 49, 45]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 16 },
    { wch: 24 },
    { wch: 10 },
    { wch: 38 },
    { wch: 40 },
    { wch: 38 },
    { wch: 40 },
    { wch: 40 },
    { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, `Class_${targetStd}_Marks`);
  XLSX.writeFile(wb, `Class_${targetStd}_Report_Card_Marks_Template.xlsx`);

  if (window.showToast) {
    window.showToast(`Report Card Marks Template for Class ${targetStd} downloaded! Format: Subject - Topic - Date (Total)`, 'success');
  }
}

function downloadGujaratiTallyTemplate() {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading...', 'warning');
    return;
  }
  const headers = ['અનુક્રમ નંબર', 'જી.આર. નં', 'વિદ્યાર્થીનું નામ', 'ધોરણ', 'વર્ગ', 'મોબાઈલ'];
  const sampleData = [
    [1, 'GR-2026-901', 'આરવ પટેલ', '9', 'અ', '9876543210'],
    [2, 'GR-2026-902', 'દિયા શાહ', '9', 'અ', '9876543211'],
    [3, 'GR-2026-903', 'હર્ષવર્ધન રાણા', '9', 'અ', '9876543212'],
    [4, 'GR-2026-904', 'પ્રિયા દેસાઈ', '9', 'અ', '9876543213'],
    [5, 'GR-2026-905', 'રોહન મહેતા', '9', 'બ', '9876543214'],
    [6, 'GR-2026-906', 'અનન્યા જોશી', '9', 'બ', '9876543215'],
    [7, 'GR-2026-907', 'કબીર સિંઘાનિયા', '9', 'અ', '9876543216'],
    [8, 'GR-2026-908', 'સ્નેહા કુલકર્ણી', '9', 'અ', '9876543217']
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ગુજરાતી_રોસ્ટર');
  XLSX.writeFile(wb, 'Talent_Tution_Classes_Gujarati_Student_Roster_Class_9.xlsx');
  if (window.showToast) window.showToast('ગુજરાતી રોસ્ટર એક્સેલ નમૂનો (.xlsx) ડાઉનલોડ થઈ ગયો!', 'success');
}

function downloadGujaratiMarksTemplate() {
  if (typeof XLSX === 'undefined') {
    if (window.showToast) window.showToast('Excel library loading...', 'warning');
    return;
  }
  const headers = [
    'રોલ નં',
    'જી.આર. નં',
    'વિદ્યાર્થીનું નામ',
    'ગણિત - વાસ્તવિક સંખ્યાઓ - 2026-09-12 (50)',
    'વિજ્ઞાન - પ્રકાશ અને પરાવર્તન - 2026-09-18 (50)',
    'અંગ્રેજી - Grammar & Prose - 2026-09-22 (25)',
    'સામાજિક વિજ્ઞાન - ભારતનો વારસો - 2026-09-25 (50)',
    'ગુજરાતી - કાવ્ય અને વ્યાકરણ - 2026-09-28 (50)',
    'હિન્દી - કહાની અને વ્યાકરણ - 2026-09-30 (50)'
  ];
  const sampleData = [
    [1, 'GR-2026-901', 'આરવ પટેલ', 48, 45, 23, 46, 44, 42],
    [2, 'GR-2026-902', 'દિયા શાહ', 44, 42, 24, 45, 47, 45],
    [3, 'GR-2026-903', 'હર્ષવર્ધન રાણા', 36, 38, 19, 40, 39, 41],
    [4, 'GR-2026-904', 'પ્રિયા દેસાઈ', 49, 48, 25, 49, 48, 46],
    [5, 'GR-2026-905', 'રોહન મહેતા', 46, 47, 24, 48, 47, 45],
    [6, 'GR-2026-906', 'અનન્યા જોશી', 48, 49, 25, 47, 49, 48],
    [7, 'GR-2026-907', 'કબીર સિંઘાનિયા', 'ગેરહાજર', 35, 18, 38, 40, 36],
    [8, 'GR-2026-908', 'સ્નેહા કુલકર્ણી', 41, 43, 22, 42, 44, 40]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 22 },
    { wch: 38 },
    { wch: 40 },
    { wch: 38 },
    { wch: 40 },
    { wch: 40 },
    { wch: 40 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ગુજરાતી_ગુણપત્રક');
  XLSX.writeFile(wb, 'Talent_Tution_Classes_Gujarati_Marks_Template_Class_9.xlsx');
  if (window.showToast) window.showToast('ગુજરાતી ગુણ એક્સેલ નમૂનો (ફોર્મેટ: વિષય - પ્રકરણ - તારીખ - કુલ ગુણ) ડાઉનલોડ થઈ ગયો!', 'success');
}

function handleExcelUpload(event, explicitStd = null) {
  const file = event.target.files[0];
  if (!file) return;

  const assignedClasses = (typeof getTeacherAssignedClasses === 'function') ? getTeacherAssignedClasses() : ['9'];
  const targetStd = explicitStd || (document.getElementById('marks-target-std') ? document.getElementById('marks-target-std').value : null) || (window.currentTeacherWorkspaceClass && window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : (assignedClasses[0] || '9'));

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      let workbook;
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt');
      if (isCsv) {
        try {
          const text = new TextDecoder('utf-8').decode(data);
          workbook = XLSX.read(text, { type: 'string' });
        } catch (err) {
          workbook = XLSX.read(data, { type: 'array', codepage: 65001, cellDates: true });
        }
      } else {
        workbook = XLSX.read(data, { type: 'array', codepage: 65001, cellDates: true });
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

      if (!rows || rows.length <= 1) {
        if (window.showToast) window.showToast('The uploaded Excel file is empty.', 'warning');
        return;
      }

      // Check if file contains corrupted '???'
      const hasCorruptedNames = rows.some(r => Array.isArray(r) && r.some(cell => cell && typeof cell === 'string' && (cell.includes('???') || /^[?\s.-]{3,}$/.test(cell))));
      if (hasCorruptedNames && window.showToast) {
        window.showToast("ધ્યાન આપો: ફાઈલમાં '???' દેખાય છે. એક્સેલમાં 'Excel Workbook (.xlsx)' તરીકે સેવ કરો.", 'warning');
      }

      processParsedExcelMarks(rows, targetStd);
    } catch (err) {
      console.error('Excel parse error:', err);
      if (window.showToast) window.showToast('Failed to read Excel file. Please ensure valid .xlsx/.csv format.', 'error');
    }
    event.target.value = '';
  };

  reader.readAsArrayBuffer(file);
}

// Normalize date to YYYY-MM-DD for standard in-memory storage
function normalizeDateYMD(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const str = dateStr.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(str)) {
    const p = str.split(/[-/.]/);
    const d = p[0].padStart(2, '0');
    const m = p[1].padStart(2, '0');
    let y = p[2];
    if (y.length === 2) y = parseInt(y) < 50 ? '20' + y : '19' + y;
    return `${y}-${m}-${d}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return str;
}

/**
 * Parses a subject column header or cell formatted as:
 * "Subject name, then topic name, then date, and then out of marks."
 * Examples:
 * - "ગણિત - વાસ્તવિક સંખ્યાઓ - 2026-09-12 (50)"
 * - "વિજ્ઞાન - પ્રકાશ અને પરાવર્તન - 2026-09-18 (50)"
 * - "Mathematics - Real Numbers - 2026-09-12 (50)"
 * - "ગણિત (૨૫)" (fallback topic)
 * Returns { subject, topic, date, total }
 */
function parseSubjectHeader(headerStr, fallbackDate = '', fallbackTotal = 50) {
  if (!headerStr) {
    return { subject: '', topic: 'પ્રથમ સત્રાંત કસોટી', date: fallbackDate || new Date().toISOString().split('T')[0], total: fallbackTotal || 50 };
  }

  const toEngDigits = typeof gujaratiToEnglishDigits === 'function' ? gujaratiToEnglishDigits : (v => v);
  let str = headerStr.toString().trim();
  let extractedTotal = null;
  let extractedDate = null;
  let extractedSubject = '';
  let extractedTopic = '';

  // Step A: Extract bracketed total marks: (50), [50], {100}, (૨૫), (Total: 50), (Total 50), (કુલ: ૫૦), (/50), /50
  const bracketRegex = /(?:\(|\{|\[)\s*(?:total\s*(?:marks?)?\s*[:=-]?|max\s*(?:marks?)?\s*[:=-]?|marks?\s*[:=-]?|out\s*of\s*[:=-]?|કુલ\s*(?:ગુણ)?\s*[:=-]?|ગુણ\s*[:=-]?|\/)?\s*([0-9૦-૯]+(?:\.[0-9૦-૯]+)?)\s*(?:marks?|m|pts?|ગુણ)?\s*(?:\)|\}|\])/i;
  const bracketMatch = str.match(bracketRegex);
  if (bracketMatch) {
    const val = parseFloat(toEngDigits(bracketMatch[1]));
    if (!isNaN(val) && val > 0) {
      extractedTotal = val;
      str = str.replace(bracketMatch[0], ' ').trim();
    }
  }

  // Step B: Extract date (Must run before any unbracketed slash check to protect slashes in dates!)
  const monthsMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  const textMonthRegex = /(?:\(|\b)(\d{1,2})[-/ ]([a-zA-Z]{3,9})[-/ ](\d{2,4})(?:\)|\b)/;
  const textMatch = str.match(textMonthRegex);

  const numDateRegex = /(?:\(|\b)([0-9૦-૯]{4}[-/. ][0-9૦-૯]{1,2}[-/. ][0-9૦-૯]{1,2}|[0-9૦-૯]{1,2}[-/. ][0-9૦-૯]{1,2}[-/. ][0-9૦-૯]{2,4})(?:\)|\b)/;
  const numMatch = str.match(numDateRegex);

  if (textMatch) {
    const d = textMatch[1].padStart(2, '0');
    const mStr = textMatch[2].toLowerCase().slice(0, 3);
    let y = textMatch[3];
    if (y.length === 2) y = parseInt(y) < 50 ? '20' + y : '19' + y;
    const m = monthsMap[mStr];
    if (m) {
      extractedDate = `${y}-${m}-${d}`;
      str = str.replace(textMatch[0], ' ').trim();
    }
  } else if (numMatch) {
    const rawDate = toEngDigits(numMatch[1]);
    const parts = rawDate.split(/[-/. ]/);
    let parsedDate = '';
    if (parts[0].length === 4) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      parsedDate = `${y}-${m}-${d}`;
    } else {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      let y = parts[2];
      if (y.length === 2) y = parseInt(y) < 50 ? '20' + y : '19' + y;
      parsedDate = `${y}-${m}-${d}`;
    }
    if (parsedDate) {
      extractedDate = parsedDate;
      str = str.replace(numMatch[0], ' ').trim();
    }
  }

  // Step C: If still no total found, check unbracketed "Total: 50" or "Max: 50" or "કુલ: ૫૦"
  if (extractedTotal === null) {
    const unbracketedTotalRegex = /(?:total\s*(?:marks?)?\s*[:=-]|max\s*(?:marks?)?\s*[:=-]|out\s*of\s*[:=-]|કુલ\s*(?:ગુણ)?\s*[:=-]|ગુણ\s*[:=-]|\/\s*)([0-9૦-૯]+(?:\.[0-9૦-૯]+)?)\s*(?:marks?|m|ગુણ)?\b/i;
    const utMatch = str.match(unbracketedTotalRegex);
    if (utMatch) {
      const val = parseFloat(toEngDigits(utMatch[1]));
      if (!isNaN(val) && val > 0) {
        extractedTotal = val;
        str = str.replace(utMatch[0], ' ').trim();
      }
    }
  }

  // Clean trailing delimiters
  str = str.replace(/^[()[\]{}|\-–—:;,/ ]+|[()[\]{}|\-–—:;,/ ]+$/g, '').trim();

  // Step D: Extract Subject and Topic from remaining string
  // Expected order: Subject Name, then Topic Name
  // Format 1: Separated by " - ", " – ", " — ", " | ", " : ", " / ", or " _ "
  const sepMatch = str.match(/\s*[-–—|:_/]+\s*/);
  if (sepMatch && sepMatch.index > 0) {
    const p1 = str.substring(0, sepMatch.index).trim();
    const p2 = str.substring(sepMatch.index + sepMatch[0].length).trim();
    if (p1 && p2) {
      extractedSubject = p1;
      extractedTopic = p2;
    }
  }

  // Format 2: Topic in parentheses "ગણિત (વાસ્તવિક સંખ્યાઓ)"
  if (!extractedTopic) {
    const parenTopicMatch = str.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenTopicMatch) {
      extractedSubject = parenTopicMatch[1].trim();
      extractedTopic = parenTopicMatch[2].trim();
    }
  }

  // Format 3: Matched against known subject dictionary
  if (!extractedTopic) {
    const knownSubjects = [
      'સામાજિક વિજ્ઞાન', 'Social Science', 'Social Studies', 'Samajik Vigyan',
      'શારીરિક શિક્ષણ', 'Physical Education',
      'ગણિત', 'Mathematics', 'Maths', 'Ganit',
      'વિજ્ઞાન', 'Science', 'Vigyan',
      'અંગ્રેજી', 'English', 'Angreji',
      'ગુજરાતી', 'Gujarati',
      'હિન્દી', 'Hindi',
      'સંસ્કૃત', 'Sanskrit',
      'કમ્પ્યુટર', 'Computer',
      'ચિત્રકામ', 'Drawing', 'Chitrakam',
      'પર્યાવરણ', 'EVS', 'Paryavaran',
      'આસપાસ', 'Aspas', 'Aaspaas',
      'સંગીત', 'Music', 'Sangit',
      'યોગ', 'Yoga'
    ];

    for (const ks of knownSubjects) {
      if (str.toLowerCase().startsWith(ks.toLowerCase())) {
        const afterSub = str.substring(ks.length).replace(/^[()[\]{}|\-–—:;,/ ]+/, '').trim();
        if (afterSub) {
          extractedSubject = ks;
          extractedTopic = afterSub;
          break;
        }
      }
    }
  }

  // Format 4: Fallback
  if (!extractedSubject) {
    extractedSubject = str || headerStr.toString().trim();
  }
  if (!extractedTopic) {
    extractedTopic = 'પ્રથમ સત્રાંત કસોટી';
  }

  // Clean subject name
  let cleanSub = typeof cleanSubjectName === 'function' ? cleanSubjectName(extractedSubject) : extractedSubject;
  if (!cleanSub) cleanSub = 'ગણિત';

  // Translate to Gujarati (preserves any native Gujarati subject name, translates transliterations/English)
  if (typeof translateSubjectToGujarati === 'function') {
    cleanSub = translateSubjectToGujarati(cleanSub);
  }

  let cleanTopic = extractedTopic;
  if (typeof translateTopicToGujarati === 'function') {
    cleanTopic = translateTopicToGujarati(cleanTopic);
  }

  return {
    subject: cleanSub,
    topic: cleanTopic || 'પ્રથમ સત્રાંત કસોટી',
    date: extractedDate || fallbackDate || new Date().toISOString().split('T')[0],
    total: extractedTotal !== null ? extractedTotal : (fallbackTotal || 50)
  };
}

function processParsedExcelMarks(rows, explicitTargetStd = null) {
  const toEngDigits = (str) => {
    if (str === null || str === undefined) return '';
    const s = str.toString();
    return typeof gujaratiToEnglishDigits === 'function' ? gujaratiToEnglishDigits(s) : (window.gujaratiToEnglishDigits ? window.gujaratiToEnglishDigits(s) : s);
  };

  // Normalize header row
  const rawHeaders = rows[0].map(h => (h ? h.toString().trim().toLowerCase() : ''));
  
  // Find key column indexes (supporting English and Gujarati)
  let grIdx = rawHeaders.findIndex(h => h.includes('gr') || h.includes('g.r') || h.includes('જીઆર') || h.includes('જી.આર') || h.includes('રજીસ્ટર'));
  let nameIdx = rawHeaders.findIndex(h => h.includes('name') || h.includes('નામ') || h.includes('વિદ્યાર્થી'));
  let rollIdx = rawHeaders.findIndex(h => h.includes('roll') || h.includes('રોલ') || h.includes('અનુક્રમ') || h.includes('ક્રમ'));
  let stdIdx = rawHeaders.findIndex(h => h.includes('class') || h.includes('std') || h.includes('ધોરણ'));
  if (stdIdx === -1) {
    stdIdx = rawHeaders.findIndex(h => h.includes('વર્ગ'));
  }

  if (rollIdx === -1 && nameIdx === -1 && grIdx === -1) {
    if (window.showToast) window.showToast("Excel must contain at least 'Roll No' / 'રોલ નં' or 'Name' / 'નામ' or 'Gr No.' / 'જી.આર. નં'", 'error');
    return;
  }

  // Target standard for this upload
  const rawDefaultStd = (explicitTargetStd || (document.getElementById('marks-target-std') ? document.getElementById('marks-target-std').value : null) || (window.currentTeacherWorkspaceClass && window.currentTeacherWorkspaceClass !== 'all' ? window.currentTeacherWorkspaceClass : '9')).toString();
  const defaultStd = toEngDigits(rawDefaultStd);

  const defaultSubject = 'Mathematics';
  const defaultTopic = 'Unit Assessment';
  const defaultDate = new Date().toISOString().split('T')[0];
  const defaultTotal = 50;

  // Check if this is Single Test Format (which must have BOTH a dedicated Marks/Score column AND a dedicated Subject column)
  const hasDedicatedMarksCol = rawHeaders.some(h => {
    const clean = h.replace(/[()[\]{}]/g, '').trim();
    return ['marks', 'mark', 'marks or ab', 'marks (or ab)', 'score', 'obt', 'obtained', 'ગુણ', 'મેળવેલ', 'મેળવેલ ગુણ'].includes(clean);
  });
  const hasDedicatedSubjectCol = rawHeaders.some(h => {
    const clean = h.trim();
    return ['subject', 'વિષય', 'sub', 'વિષયનું નામ'].includes(clean);
  });
  const isSingleTestFormat = hasDedicatedMarksCol && hasDedicatedSubjectCol;
  const isMultiSubject = !isSingleTestFormat;

  let addedCount = 0;
  let updatedCount = 0;

  if (isMultiSubject) {
    const isDedicatedMetaCol = (header) => {
      if (!header) return true;
      const norm = header.toLowerCase().replace(/[()[\]{}:;.\-_/\\ ]+/g, '');
      const metaTokens = [
        'gr', 'grno', 'sr', 'srno', 'roll', 'rollno', 'name', 'studentname',
        'class', 'std', 'standard', 'sec', 'section', 'mobile', 'phone', 'contact',
        'gender', 'dob', 'address',
        'જીઆર', 'જીઆરનં', 'રોલ', 'રોલનં', 'નામ', 'વિદ્યાર્થી', 'વિદ્યાર્થીનુંનામ',
        'ધોરણ', 'વર્ગ', 'વિભાગ', 'મોબાઈલ', 'ફોન', 'સંપર્ક', 'જાતિ', 'સરનામું',
        'તારીખ', 'date'
      ];
      return metaTokens.includes(norm);
    };

    const subjectCols = [];
    rows[0].forEach((colName, idx) => {
      if (idx !== grIdx && idx !== nameIdx && idx !== rollIdx && idx !== stdIdx) {
        const cleanName = colName ? colName.toString().trim() : '';
        if (cleanName && !isDedicatedMetaCol(cleanName)) {
          const parsed = parseSubjectHeader(cleanName, defaultDate, defaultTotal);
          subjectCols.push({
            index: idx,
            rawHeader: cleanName,
            subject: parsed.subject,
            topic: parsed.topic,
            date: parsed.date,
            total: parsed.total
          });
        }
      }
    });

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const grNo = grIdx !== -1 && row[grIdx] ? toEngDigits(row[grIdx].toString().trim()) : '';
      const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].toString().trim() : '';
      const roll = rollIdx !== -1 && row[rollIdx] ? parseInt(toEngDigits(row[rollIdx])) : null;
      let rowStd = (stdIdx !== -1 && row[stdIdx] && row[stdIdx].toString().trim()) ? toEngDigits(row[stdIdx].toString().trim()) : null;
      if (!rowStd) {
        let matchedStu = null;
        if (grNo) {
          matchedStu = DB.students.find(s => s.grNo && s.grNo.toString().trim().toLowerCase() === grNo.toLowerCase());
        }
        if (!matchedStu && roll) {
          const rollMatches = DB.students.filter(s => s.roll === roll);
          if (rollMatches.length === 1) {
            matchedStu = rollMatches[0];
          } else if (rollMatches.length > 1) {
            matchedStu = rollMatches.find(s => String(s.std) === String(defaultStd)) || rollMatches[0];
          }
        }
        if (!matchedStu && name) {
          matchedStu = DB.students.find(s => s.name && s.name.trim().toLowerCase() === name.toLowerCase());
        }
        rowStd = (matchedStu && matchedStu.std) ? matchedStu.std.toString() : defaultStd;
      }

      if (!roll && !name) continue;

      // Ensure student exists in directory scoped to rowStd
      ensureStudentRecord(roll, grNo, name, rowStd);

      // Process each subject column
      subjectCols.forEach(sc => {
        const rawScore = row[sc.index];
        if (rawScore !== undefined && rawScore !== null && rawScore.toString().trim() !== '') {
          const strVal = toEngDigits(rawScore.toString().trim());
          const lowerVal = strVal.toLowerCase();
          const isAb = ['ab', 'absent', 'a', 'ગેરહાજર', 'ગેર', 'gh'].includes(lowerVal);
          const marks = isAb ? 0 : parseFloat(strVal);

          if (isAb || (!isNaN(marks) && marks >= 0)) {
            const targetRoll = roll || (name ? getRollByName(name, rowStd) : 0);
            const targetDate = sc.date || defaultDate;
            const targetTotal = sc.total || defaultTotal;
            const targetTopic = sc.topic || defaultTopic;

            // Upsert mark record with CLASS SCOPING: match roll AND std
            let cleanTargetSub = typeof cleanSubjectName === 'function' ? cleanSubjectName(sc.subject) : sc.subject;
            if (typeof translateSubjectToGujarati === 'function') {
              cleanTargetSub = translateSubjectToGujarati(cleanTargetSub);
            }
            if (!cleanTargetSub || cleanTargetSub.includes('???') || /^[?\s.-]{3,}$/.test(cleanTargetSub)) {
              cleanTargetSub = 'ગણિત';
            }
            let cleanTopic = targetTopic;
            if (typeof translateTopicToGujarati === 'function') {
              cleanTopic = translateTopicToGujarati(cleanTopic);
            }
            if (!cleanTopic || cleanTopic.includes('???')) {
              cleanTopic = 'પ્રથમ સત્રાંત કસોટી';
            }

            const targetGuj = typeof translateSubjectToGujarati === 'function' ? translateSubjectToGujarati(cleanTargetSub) : cleanTargetSub;
            const ex = DB.marks.find(m => {
              if (m.std && m.std.toString() !== rowStd.toString()) return false;
              if (m.roll !== targetRoll) return false;
              const mGuj = typeof translateSubjectToGujarati === 'function' ? translateSubjectToGujarati(m.subject) : m.subject;
              const subMatch = (m.subject === cleanTargetSub || mGuj === targetGuj || (typeof cleanSubjectName === 'function' && cleanSubjectName(m.subject) === cleanTargetSub));
              if (!subMatch) return false;
              return (m.date === targetDate || m.topic === cleanTopic || m.date === defaultDate);
            });

            if (ex) {
              ex.subject = cleanTargetSub;
              ex.topic = cleanTopic;
              ex.date = targetDate;
              ex.total = targetTotal;
              ex.marks = marks;
              ex.isAbsent = isAb;
              ex.std = rowStd.toString();
              ex.source = 'excel';
              if (grNo) ex.grNo = grNo;
              updatedCount++;
            } else {
              DB.marks.push({
                id: Date.now() + Math.floor(Math.random() * 100000),
                grNo: grNo,
                roll: targetRoll,
                std: rowStd.toString(),
                subject: cleanTargetSub,
                topic: cleanTopic,
                marks: marks,
                total: targetTotal,
                date: targetDate,
                isAbsent: isAb,
                source: 'excel',
                importedAt: new Date().toISOString()
              });
              addedCount++;
            }
          }
        }
      });
    }
  } else {
    // Single test format with explicit Subject/Topic columns
    const subjIdx = rawHeaders.findIndex(h => h.includes('subject') || h.includes('વિષય'));
    const topIdx = rawHeaders.findIndex(h => h.includes('topic') || h.includes('એકમ') || h.includes('પ્રકરણ') || h.includes('કસોટી'));
    const dateIdx = rawHeaders.findIndex(h => h.includes('date') || h.includes('તારીખ'));
    const marksIdx = rawHeaders.findIndex(h => h.includes('mark') || h.includes('obt') || h.includes('score') || h.includes('ગુણ') || h.includes('મેળવેલ'));
    const totalIdx = rawHeaders.findIndex(h => h.includes('total') || h.includes('max') || h.includes('કુલ'));

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const grNo = grIdx !== -1 && row[grIdx] ? toEngDigits(row[grIdx].toString().trim()) : '';
      const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].toString().trim() : '';
      const roll = rollIdx !== -1 && row[rollIdx] ? parseInt(toEngDigits(row[rollIdx])) : null;
      let rowStd = (stdIdx !== -1 && row[stdIdx] && row[stdIdx].toString().trim()) ? toEngDigits(row[stdIdx].toString().trim()) : defaultStd;
      if (stdIdx === -1) {
        const matchedStu = (Array.isArray(DB.students) ? DB.students : []).find(s => {
          if (grNo && s.grNo && s.grNo.toString() === grNo.toString()) return true;
          if (roll && s.roll === roll && (!defaultStd || s.std === defaultStd)) return true;
          if (name && s.name && s.name.trim().toLowerCase() === name.toLowerCase()) return true;
          return false;
        });
        if (matchedStu && matchedStu.std) {
          rowStd = matchedStu.std.toString();
        }
      }
      let subject = subjIdx !== -1 && row[subjIdx] ? row[subjIdx].toString().trim() : defaultSubject;
      const topic = topIdx !== -1 && row[topIdx] ? row[topIdx].toString().trim() : defaultTopic;
      let date = dateIdx !== -1 && row[dateIdx] ? row[dateIdx].toString().trim() : defaultDate;
      let total = totalIdx !== -1 && row[totalIdx] ? parseFloat(toEngDigits(row[totalIdx])) : defaultTotal;

      const parsedSubj = parseSubjectHeader(subject, date, total);
      subject = parsedSubj.subject;
      if (dateIdx === -1 && parsedSubj.date) date = parsedSubj.date;
      if (totalIdx === -1 && parsedSubj.total) total = parsedSubj.total;
      date = normalizeDateYMD(date);

      const rawMarks = marksIdx !== -1 ? row[marksIdx] : null;
      if (rawMarks === null || rawMarks === undefined) continue;

      const strVal = toEngDigits(rawMarks.toString().trim());
      const lowerVal = strVal.toLowerCase();
      const isAb = ['ab', 'absent', 'a', 'ગેરહાજર', 'ગેર', 'gh'].includes(lowerVal);
      const marks = isAb ? 0 : parseFloat(strVal);

      if (isAb || (!isNaN(marks) && marks >= 0)) {
        ensureStudentRecord(roll, grNo, name, rowStd);
        const targetRoll = roll || (name ? getRollByName(name, rowStd) : 0);
        let cleanSub = typeof cleanSubjectName === 'function' ? cleanSubjectName(subject) : subject;
        if (typeof translateSubjectToGujarati === 'function') {
          cleanSub = translateSubjectToGujarati(cleanSub);
        }
        if (!cleanSub || cleanSub.includes('???') || /^[?\s.-]{3,}$/.test(cleanSub)) {
          cleanSub = 'ગણિત';
        }
        let cleanTopic = topic;
        if (typeof translateTopicToGujarati === 'function') {
          cleanTopic = translateTopicToGujarati(cleanTopic);
        }
        if (!cleanTopic || cleanTopic.includes('???')) {
          cleanTopic = 'પ્રથમ સત્રાંત કસોટી';
        }

        const targetGuj = typeof translateSubjectToGujarati === 'function' ? translateSubjectToGujarati(cleanSub) : cleanSub;
        const ex = DB.marks.find(m => {
          if (m.std && m.std.toString() !== rowStd.toString()) return false;
          if (m.roll !== targetRoll) return false;
          const mGuj = typeof translateSubjectToGujarati === 'function' ? translateSubjectToGujarati(m.subject) : m.subject;
          const subMatch = (m.subject === cleanSub || mGuj === targetGuj || (typeof cleanSubjectName === 'function' && cleanSubjectName(m.subject) === cleanSub));
          if (!subMatch) return false;
          return (m.date === date || m.topic === cleanTopic);
        });

        if (ex) {
          ex.subject = cleanSub;
          ex.topic = cleanTopic;
          ex.date = date;
          ex.marks = marks;
          ex.total = total;
          ex.isAbsent = isAb;
          ex.std = rowStd.toString();
          ex.source = 'excel';
          if (grNo) ex.grNo = grNo;
          updatedCount++;
        } else {
          DB.marks.push({
            id: Date.now() + Math.floor(Math.random() * 100000),
            grNo: grNo,
            roll: targetRoll,
            std: rowStd.toString(),
            subject: cleanSub,
            topic: cleanTopic,
            marks: marks,
            total: total,
            date: date,
            isAbsent: isAb,
            source: 'excel',
            importedAt: new Date().toISOString()
          });
          addedCount++;
        }
      }
    }
  }

  saveDatabase();
  if (window.showToast) {
    window.showToast(`Report Card Excel processed for Class ${defaultStd}: ${addedCount} added, ${updatedCount} updated!`, 'success');
  }
  if (window.updateDashboard) window.updateDashboard();
  return { addedCount, updatedCount };
}

function ensureStudentRecord(roll, grNo, name, std) {
  if (!roll && !name) return;
  const assignedClasses = (typeof getTeacherAssignedClasses === 'function') ? getTeacherAssignedClasses() : [];
  let targetStd = (std || (assignedClasses.length > 0 ? assignedClasses[0] : '9')).toString();
  if (assignedClasses.length > 0 && !assignedClasses.includes(targetStd)) {
    targetStd = assignedClasses[0].toString();
  }

  
  let existing = null;
  // First match by GR Number (globally unique)
  if (grNo) {
    existing = DB.students.find(s => s.grNo && s.grNo.toString().trim().toLowerCase() === grNo.toString().trim().toLowerCase());
  }
  // Next match by (std, roll) - roll is unique strictly within its class!
  if (!existing && roll) {
    existing = DB.students.find(s => s.std.toString() === targetStd && s.roll === parseInt(roll));
  }
  // Next fallback to (std, name)
  if (!existing && name && !name.includes('???') && !/^[?\s.-]{3,}$/.test(name.trim())) {
    existing = DB.students.find(s => s.std.toString() === targetStd && s.name.toLowerCase() === name.toLowerCase());
  }

  const isCorrupted = !name || name.includes('???') || /^[?\s.-]{3,}$/.test(name.trim());

  if (!existing) {
    const classRolls = DB.students.filter(s => s.std.toString() === targetStd).map(s => s.roll);
    const newRoll = roll ? parseInt(roll) : (classRolls.length > 0 ? Math.max(...classRolls) + 1 : 101);
    let finalName = name;
    if (isCorrupted) {
      finalName = `વિદ્યાર્થી ${newRoll}`;
    }
    DB.students.push({
      roll: newRoll,
      grNo: grNo || `GR-${new Date().getFullYear()}-${targetStd}-${String(newRoll).padStart(3, '0')}`,
      name: finalName,
      std: targetStd,
      section: 'A',
      mobile: ''
    });
  } else {
    if (grNo && !existing.grNo) existing.grNo = grNo;
    if (targetStd && !existing.std) existing.std = targetStd;
    if (!isCorrupted && name && (!existing.name || existing.name.startsWith('Student ') || existing.name.startsWith('વિદ્યાર્થી '))) {
      existing.name = name;
    }
  }
}

function getRollByName(name, std = null) {
  if (!name) return 0;
  if (std !== null && std !== undefined && std !== 'all') {
    const sMatch = DB.students.find(x => x.std.toString() === std.toString() && x.name.toLowerCase() === name.toLowerCase());
    if (sMatch) return sMatch.roll;
  }
  const s = DB.students.find(x => x.name.toLowerCase() === name.toLowerCase());
  return s ? s.roll : 0;
}

// Global symbols
window.initTestsModule = initTestsModule;
window.renderUpcomingTests = renderUpcomingTests;
window.filterUpcomingTests = filterUpcomingTests;
window.openNewTestModal = openNewTestModal;
window.closeNewTestModal = closeNewTestModal;
window.saveNewUpcomingTest = saveNewUpcomingTest;
window.deleteUpcomingTest = deleteUpcomingTest;
window.loadMassEntryList = loadMassEntryList;
window.saveMassEntry = saveMassEntry;
window.prepareTestMarksEntry = prepareTestMarksEntry;
window.populateTestEntryDropdowns = populateTestEntryDropdowns;

// Excel System 1 & 2 exports
window.downloadFormatExcel = downloadFormatExcel;
window.downloadClassMarksTemplate = downloadClassMarksTemplate;
window.handleExcelUpload = handleExcelUpload;
window.handleReportCardExcelUpload = handleExcelUpload;
window.downloadStudentTallyExcel = downloadStudentTallyExcel;
window.exportCurrentStudentTally = exportCurrentStudentTally;
window.downloadGujaratiTallyTemplate = downloadGujaratiTallyTemplate;
window.downloadGujaratiMarksTemplate = downloadGujaratiMarksTemplate;
window.handleStudentTallyUpload = handleStudentTallyUpload;
window.processParsedStudentTallyRows = processParsedStudentTallyRows;
window.parseSubjectHeader = parseSubjectHeader;
window.processParsedExcelMarks = processParsedExcelMarks;
window.ensureStudentRecord = ensureStudentRecord;
window.getRollByName = getRollByName;

