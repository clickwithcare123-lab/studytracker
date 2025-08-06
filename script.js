// Academic Tracker - script.js
// All data is stored in localStorage. No backend required.

// ========== Data Model ==========
const STORAGE_KEY = 'academic-tracker-courses-v1';

class Course {
  constructor({ id, name, code, semester, credits, status, updatedAt }) {
    this.id = id || crypto.randomUUID();
    this.name = name;
    this.code = code;
    this.semester = semester;
    this.credits = Number(credits);
    this.status = status; // 'completed' or 'ongoing'
    this.updatedAt = updatedAt || Date.now();
  }
}

// ========== State ==========
let courses = [];
let currentEditId = null;

// ========== DOM Elements ==========
const navLinks = document.querySelectorAll('.nav-link');
const sections = {
  dashboard: document.getElementById('dashboard'),
  courses: document.getElementById('courses'),
  about: document.getElementById('about'),
};
const dashboardEls = {
  totalCourses: document.getElementById('totalCourses'),
  totalCredits: document.getElementById('totalCredits'),
  currentSemester: document.getElementById('currentSemester'),
  recentCoursesList: document.getElementById('recentCoursesList'),
};
const addCourseBtn = document.getElementById('addCourseBtn');
const courseModal = document.getElementById('courseModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const courseForm = document.getElementById('courseForm');
const coursesListContainer = document.getElementById('coursesListContainer');
const searchInput = document.getElementById('searchInput');
const filterSemester = document.getElementById('filterSemester');
const filterStatus = document.getElementById('filterStatus');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const toast = document.getElementById('toast');
const darkModeToggle = document.getElementById('darkModeToggle');

// ========== Navigation ==========
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'page');
    Object.values(sections).forEach(sec => sec.hidden = true);
    const target = link.getAttribute('href').replace('#', '');
    sections[target].hidden = false;
    sections[target].focus();
  });
});

// ========== Dark Mode ==========
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('academic-tracker-theme', theme);
  darkModeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}
darkModeToggle.addEventListener('click', toggleTheme);
(function initTheme() {
  const saved = localStorage.getItem('academic-tracker-theme');
  setTheme(saved || 'light');
})();

// ========== Toast Notifications ==========
function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, duration);
}

// ========== Data Persistence ==========
function saveCourses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}
function loadCourses() {
  const data = localStorage.getItem(STORAGE_KEY);
  courses = data ? JSON.parse(data) : [];
}

// ========== Course CRUD ==========
function openCourseModal(editId = null) {
  courseModal.hidden = false;
  courseModal.querySelector('.modal-content').focus();
  if (editId) {
    const course = courses.find(c => c.id === editId);
    if (course) {
      courseForm.courseName.value = course.name;
      courseForm.courseCode.value = course.code;
      courseForm.semester.value = course.semester;
      courseForm.credits.value = course.credits;
      courseForm.status.value = course.status;
      courseForm.courseId.value = course.id;
      currentEditId = course.id;
      document.getElementById('modalTitle').textContent = 'Edit Course';
    }
  } else {
    courseForm.reset();
    courseForm.courseId.value = '';
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Course';
  }
}
function closeCourseModal() {
  courseModal.hidden = true;
  courseForm.reset();
  currentEditId = null;
}
addCourseBtn.addEventListener('click', () => openCourseModal());
closeModalBtn.addEventListener('click', closeCourseModal);
courseModal.addEventListener('click', e => {
  if (e.target === courseModal) closeCourseModal();
});
document.addEventListener('keydown', e => {
  if (!courseModal.hidden && e.key === 'Escape') closeCourseModal();
});
courseForm.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const courseData = {
    id: form.courseId.value || undefined,
    name: form.courseName.value.trim(),
    code: form.courseCode.value.trim(),
    semester: form.semester.value.trim(),
    credits: form.credits.value,
    status: form.status.value,
    updatedAt: Date.now(),
  };
  if (!courseData.name || !courseData.code || !courseData.semester || !courseData.credits) {
    showToast('Please fill all fields.', 2000);
    return;
  }
  if (currentEditId) {
    // Edit
    const idx = courses.findIndex(c => c.id === currentEditId);
    if (idx !== -1) {
      courses[idx] = new Course(courseData);
      showToast('Course updated!');
    }
  } else {
    // Add
    courses.unshift(new Course(courseData));
    showToast('Course added!');
  }
  saveCourses();
  renderAll();
  closeCourseModal();
});

function handleEditCourse(id) {
  openCourseModal(id);
}
function handleDeleteCourse(id) {
  if (confirm('Delete this course?')) {
    courses = courses.filter(c => c.id !== id);
    saveCourses();
    renderAll();
    showToast('Course deleted.');
  }
}
function handleToggleStatus(id) {
  const course = courses.find(c => c.id === id);
  if (course) {
    course.status = course.status === 'completed' ? 'ongoing' : 'completed';
    course.updatedAt = Date.now();
    saveCourses();
    renderAll();
    showToast(`Marked as ${course.status}.`);
  }
}

// ========== Semester Grouping & Progress ==========
function getSemesters() {
  const semesters = [...new Set(courses.map(c => c.semester))].sort();
  return semesters;
}
function getSemesterStats(semester) {
  const group = courses.filter(c => c.semester === semester);
  const completed = group.filter(c => c.status === 'completed');
  const totalCredits = group.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = completed.reduce((sum, c) => sum + c.credits, 0);
  return {
    total: group.length,
    completed: completed.length,
    percent: group.length ? Math.round((completed.length / group.length) * 100) : 0,
    credits: totalCredits,
    completedCredits,
    percentCredits: totalCredits ? Math.round((completedCredits / totalCredits) * 100) : 0,
  };
}

// ========== Dashboard Rendering ==========
function renderDashboard() {
  dashboardEls.totalCourses.textContent = courses.length;
  dashboardEls.totalCredits.textContent = courses.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.credits, 0);
  // Current semester = most recent semester with ongoing courses, else most recent
  let currentSem = '';
  const ongoing = courses.filter(c => c.status === 'ongoing');
  if (ongoing.length) {
    currentSem = ongoing[0].semester;
  } else if (courses.length) {
    currentSem = courses[0].semester;
  } else {
    currentSem = '-';
  }
  dashboardEls.currentSemester.textContent = currentSem;
  // Recent courses (last 5 updated)
  const recent = [...courses].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  dashboardEls.recentCoursesList.innerHTML = recent.map(c => `<li><span>${c.name} (${c.code})</span><span class="status-badge ${c.status}">${c.status}</span></li>`).join('');
}

// ========== Courses Rendering ==========
function renderCourses() {
  // Populate semester filter
  const semesters = getSemesters();
  filterSemester.innerHTML = '<option value="">All Semesters</option>' + semesters.map(s => `<option value="${s}">${s}</option>`).join('');
  // Filter/search
  let filtered = [...courses];
  const search = searchInput.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search));
  }
  if (filterSemester.value) {
    filtered = filtered.filter(c => c.semester === filterSemester.value);
  }
  if (filterStatus.value) {
    filtered = filtered.filter(c => c.status === filterStatus.value);
  }
  // Group by semester
  const grouped = {};
  filtered.forEach(c => {
    if (!grouped[c.semester]) grouped[c.semester] = [];
    grouped[c.semester].push(c);
  });
  // Render
  coursesListContainer.innerHTML = '';
  Object.keys(grouped).sort().forEach(semester => {
    const stats = getSemesterStats(semester);
    const group = grouped[semester];
    const groupEl = document.createElement('div');
    groupEl.className = 'semester-group';
    groupEl.innerHTML = `
      <div class="semester-header">
        <span class="semester-title">${semester}</span>
        <div class="progress-bar" aria-label="${stats.percent}% courses completed">
          <div class="progress" style="width:${stats.percent}%"></div>
        </div>
        <span>${stats.completed}/${stats.total} completed</span>
      </div>
      <table class="courses-table" aria-label="Courses for ${semester}">
        <thead>
          <tr>
            <th>Name</th><th>Code</th><th>Credits</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${group.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.code}</td>
              <td>${c.credits}</td>
              <td><span class="status-badge ${c.status}">${c.status}</span></td>
              <td>
                <div class="action-btns">
                  <button title="Edit" aria-label="Edit ${c.name}" onclick="window._editCourse('${c.id}')">✏️</button>
                  <button title="Delete" aria-label="Delete ${c.name}" onclick="window._deleteCourse('${c.id}')">🗑️</button>
                  <button title="Toggle Status" aria-label="Toggle status for ${c.name}" onclick="window._toggleStatus('${c.id}')">🔄</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    coursesListContainer.appendChild(groupEl);
  });
  if (!filtered.length) {
    coursesListContainer.innerHTML = '<p>No courses found.</p>';
  }
}
// Expose handlers for inline onclick
window._editCourse = handleEditCourse;
window._deleteCourse = handleDeleteCourse;
window._toggleStatus = handleToggleStatus;

// ========== Search & Filter ==========
searchInput.addEventListener('input', renderCourses);
filterSemester.addEventListener('change', renderCourses);
filterStatus.addEventListener('change', renderCourses);

// ========== Import/Export ==========
exportBtn.addEventListener('click', () => {
  const data = JSON.stringify(courses, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'academic-tracker-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Data exported as JSON.');
});
importBtn.addEventListener('click', () => {
  importFile.value = '';
  importFile.click();
});
importFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data) && data.every(c => c.name && c.code && c.semester)) {
        courses = data.map(c => new Course(c));
        saveCourses();
        renderAll();
        showToast('Data imported!');
      } else {
        showToast('Invalid data format.', 3000);
      }
    } catch {
      showToast('Failed to import data.', 3000);
    }
  };
  reader.readAsText(file);
});

// ========== Accessibility Enhancements ==========
courseModal.addEventListener('keydown', e => {
  if (!courseModal.hidden && e.key === 'Tab') {
    // Trap focus inside modal
    const focusable = courseModal.querySelectorAll('input,select,button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// ========== Initial Render ==========
function renderAll() {
  renderDashboard();
  renderCourses();
}
loadCourses();
renderAll();
// Show dashboard by default
sections.dashboard.hidden = false;
sections.courses.hidden = true;
sections.about.hidden = true;
