// API Configuration
const API_BASE_URL = 'http://localhost:8080/api'; // Change this to your Spring Boot backend URL

// Sample data (will be replaced with API calls)
let students = [];
let teachers = [];
let courses = [];
let attendance = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDashboardData();
});

// Initialize Application
function initializeApp() {
    // Load saved settings
    const savedSchoolName = localStorage.getItem('schoolName');
    const savedLogoUrl = localStorage.getItem('schoolLogo');
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    
    if (savedSchoolName) {
        document.getElementById('schoolName').textContent = savedSchoolName;
    }
    
    if (savedLogoUrl) {
        document.getElementById('schoolLogo').src = savedLogoUrl;
    }
    
    if (savedPrimaryColor) {
        document.documentElement.style.setProperty('--primary-color', savedPrimaryColor);
    }
    
    // Set current date for attendance
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Menu Toggle (Mobile)
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
    
    // Add Buttons
    document.getElementById('addStudentBtn').addEventListener('click', () => openStudentModal());
    document.getElementById('addTeacherBtn').addEventListener('click', () => openTeacherModal());
    document.getElementById('addCourseBtn').addEventListener('click', () => openCourseModal());
    
    // Modal Close
    const modal = document.getElementById('formModal');
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
    
    // Settings Form
    document.getElementById('brandingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    // Search Functionality
    document.getElementById('studentSearch').addEventListener('input', function() {
        filterTable('studentsTableBody', this.value);
    });
    
    document.getElementById('teacherSearch').addEventListener('input', function() {
        filterTable('teachersTableBody', this.value);
    });
}

// Navigation
function navigateToPage(pageName) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Show selected page
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
    
    // Load page data
    loadPageData(pageName);
}

// Load Dashboard Data
function loadDashboardData() {
    // These would be API calls in production
    fetchStudents().then(() => {
        document.getElementById('totalStudents').textContent = students.length;
    });
    
    fetchTeachers().then(() => {
        document.getElementById('totalTeachers').textContent = teachers.length;
    });
    
    fetchCourses().then(() => {
        document.getElementById('totalCourses').textContent = courses.length;
    });
    
    // Sample attendance rate
    document.getElementById('attendanceRate').textContent = '92%';
    
    // Load recent activity
    loadRecentActivity();
}

// Load Page Data
function loadPageData(pageName) {
    switch(pageName) {
        case 'students':
            fetchStudents().then(renderStudentsTable);
            break;
        case 'teachers':
            fetchTeachers().then(renderTeachersTable);
            break;
        case 'courses':
            fetchCourses().then(renderCoursesGrid);
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// API Calls (Mock - Replace with actual API calls)
async function fetchStudents() {
    try {
        // Mock data - replace with: const response = await fetch(`${API_BASE_URL}/students`);
        students = [
            { id: 1, name: 'John Doe', email: 'john@example.com', guardianName: 'Jane Doe', guardianContact: '123-456-7890' },
            { id: 2, name: 'Alice Smith', email: 'alice@example.com', guardianName: 'Bob Smith', guardianContact: '098-765-4321' },
            { id: 3, name: 'Mike Johnson', email: 'mike@example.com', guardianName: 'Sarah Johnson', guardianContact: '555-123-4567' }
        ];
        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

async function fetchTeachers() {
    try {
        teachers = [
            { id: 1, name: 'Dr. Smith', email: 'smith@school.com', specialization: 'Mathematics' },
            { id: 2, name: 'Prof. Johnson', email: 'johnson@school.com', specialization: 'Physics' },
            { id: 3, name: 'Ms. Williams', email: 'williams@school.com', specialization: 'English' }
        ];
        return teachers;
    } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }
}

async function fetchCourses() {
    try {
        courses = [
            { id: 1, name: 'Mathematics 101', description: 'Basic mathematics course', teacher: 'Dr. Smith', students: 25 },
            { id: 2, name: 'Physics 201', description: 'Advanced physics concepts', teacher: 'Prof. Johnson', students: 20 },
            { id: 3, name: 'English Literature', description: 'Classic literature analysis', teacher: 'Ms. Williams', students: 30 }
        ];
        return courses;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

// Render Functions
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const row = `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.guardianName}</td>
                <td>${student.guardianContact}</td>
                <td>
                    <button class="action-btn edit" onclick="editStudent(${student.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteStudent(${student.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderTeachersTable() {
    const tbody = document.getElementById('teachersTableBody');
    tbody.innerHTML = '';
    
    teachers.forEach(teacher => {
        const row = `
            <tr>
                <td>${teacher.id}</td>
                <td>${teacher.name}</td>
                <td>${teacher.email}</td>
                <td>${teacher.specialization}</td>
                <td>
                    <button class="action-btn edit" onclick="editTeacher(${teacher.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteTeacher(${teacher.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function renderCoursesGrid() {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';
    
    courses.forEach(course => {
        const card = `
            <div class="course-card">
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <div class="course-teacher">Teacher: ${course.teacher}</div>
                <div>Students: ${course.students}</div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="editCourse(${course.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    const activities = [
        'New student John Doe enrolled in Mathematics 101',
        'Prof. Johnson updated Physics 201 syllabus',
        'Attendance recorded for English Literature',
        'Grade report generated for Mathematics 101'
    ];
    
    activityList.innerHTML = '';
    activities.forEach(activity => {
        const item = `<div class="activity-item">${activity}</div>`;
        activityList.innerHTML += item;
    });
}

// Modal Functions
function openStudentModal(studentId = null) {
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('dynamicForm');
    
    modalTitle.textContent = studentId ? 'Edit Student' : 'Add Student';
    
    const student = studentId ? students.find(s => s.id === studentId) : {};
    
    form.innerHTML = `
        <div class="form-group">
            <label for="studentName">Full Name</label>
            <input type="text" id="studentName" class="form-input" value="${student.name || ''}" required>
        </div>
        <div class="form-group">
            <label for="studentEmail">Email</label>
            <input type="email" id="studentEmail" class="form-input" value="${student.email || ''}" required>
        </div>
        <div class="form-group">
            <label for="studentDOB">Date of Birth</label>
            <input type="date" id="studentDOB" class="form-input" value="${student.dob || ''}" required>
        </div>
        <div class="form-group">
            <label for="guardianName">Guardian Name</label>
            <input type="text" id="guardianName" class="form-input" value="${student.guardianName || ''}" required>
        </div>
        <div class="form-group">
            <label for="guardianContact">Guardian Contact</label>
            <input type="tel" id="guardianContact" class="form-input" value="${student.guardianContact || ''}" required>
        </div>
        <button type="submit" class="btn btn-primary">Save Student</button>
    `;
    
    form.onsubmit = (e) => {
        e.preventDefault();
        saveStudent(studentId);
    };
    
    modal.style.display = 'block';
}

function openTeacherModal(teacherId = null) {
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('dynamicForm');
    
    modalTitle.textContent = teacherId ? 'Edit Teacher' : 'Add Teacher';
    
    const teacher = teacherId ? teachers.find(t => t.id === teacherId) : {};
    
    form.innerHTML = `
        <div class="form-group">
            <label for="teacherName">Full Name</label>
            <input type="text" id="teacherName" class="form-input" value="${teacher.name || ''}" required>
        </div>
        <div class="form-group">
            <label for="teacherEmail">Email</label>
            <input type="email" id="teacherEmail" class="form-input" value="${teacher.email || ''}" required>
        </div>
        <div class="form-group">
            <label for="teacherSpecialization">Specialization</label>
            <input type="text" id="teacherSpecialization" class="form-input" value="${teacher.specialization || ''}" required>
        </div>
        <button type="submit" class="btn btn-primary">Save Teacher</button>
    `;
    
    form.onsubmit = (e) => {
        e.preventDefault();
        saveTeacher(teacherId);
    };
    
    modal.style.display = 'block';
}

function openCourseModal(courseId = null) {
    const modal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('dynamicForm');
    
    modalTitle.textContent = courseId ? 'Edit Course' : 'Add Course';
    
    const course = courseId ? courses.find(c => c.id === courseId) : {};
    
    form.innerHTML = `
        <div class="form-group">
            <label for="courseName">Course Name</label>
            <input type="text" id="courseName" class="form-input" value="${course.name || ''}" required>
        </div>
        <div class="form-group">
            <label for="courseDescription">Description</label>
            <textarea id="courseDescription" class="form-input" rows="3" required>${course.description || ''}</textarea>
        </div>
        <div class="form-group">
            <label for="courseTeacher">Assign Teacher</label>
            <select id="courseTeacher" class="form-input" required>
                <option value="">Select Teacher</option>
                ${teachers.map(t => `<option value="${t.id}" ${course.teacher === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Save Course</button>
    `;
    
    form.onsubmit = (e) => {
        e.preventDefault();
        saveCourse(courseId);
    };
    
    modal.style.display = 'block';
}

// CRUD Operations
function saveStudent(studentId) {
    const studentData = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        dob: document.getElementById('studentDOB').value,
        guardianName: document.getElementById('guardianName').value,
        guardianContact: document.getElementById('guardianContact').value
    };
    
    if (studentId) {
        // Update existing student
        // API call: await fetch(`${API_BASE_URL}/students/${studentId}`, { method: 'PUT', body: JSON.stringify(studentData) });
        const index = students.findIndex(s => s.id === studentId);
        students[index] = { ...students[index], ...studentData };
    } else {
        // Add new student
        // API call: await fetch(`${API_BASE_URL}/students`, { method: 'POST', body: JSON.stringify(studentData) });
        const newStudent = { id: students.length + 1, ...studentData };
        students.push(newStudent);
    }
    
    renderStudentsTable();
    document.getElementById('formModal').style.display = 'none';
    showNotification('Student saved successfully!');
}

function saveTeacher(teacherId) {
    const teacherData = {
        name: document.getElementById('teacherName').value,
        email: document.getElementById('teacherEmail').value,
        specialization: document.getElementById('teacherSpecialization').value
    };
    
    if (teacherId) {
        const index = teachers.findIndex(t => t.id === teacherId);
        teachers[index] = { ...teachers[index], ...teacherData };
    } else {
        const newTeacher = { id: teachers.length + 1, ...teacherData };
        teachers.push(newTeacher);
    }
    
    renderTeachersTable();
    document.getElementById('formModal').style.display = 'none';
    showNotification('Teacher saved successfully!');
}

function saveCourse(courseId) {
    const courseData = {
        name: document.getElementById('courseName').value,
        description: document.getElementById('courseDescription').value,
        teacher: teachers.find(t => t.id == document.getElementById('courseTeacher').value)?.name,
        students: 0
    };
    
    if (courseId) {
        const index = courses.findIndex(c => c.id === courseId);
        courses[index] = { ...courses[index], ...courseData };
    } else {
        const newCourse = { id: courses.length + 1, ...courseData };
        courses.push(newCourse);
    }
    
    renderCoursesGrid();
    document.getElementById('formModal').style.display = 'none';
    showNotification('Course saved successfully!');
}

function editStudent(id) {
    openStudentModal(id);
}

function editTeacher(id) {
    openTeacherModal(id);
}

function editCourse(id) {
    openCourseModal(id);
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        renderStudentsTable();
        showNotification('Student deleted successfully!');
    }
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        teachers = teachers.filter(t => t.id !== id);
        renderTeachersTable();
        showNotification('Teacher deleted successfully!');
    }
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        courses = courses.filter(c => c.id !== id);
        renderCoursesGrid();
        showNotification('Course deleted successfully!');
    }
}

// Settings
function loadSettings() {
    document.getElementById('settingsSchoolName').value = localStorage.getItem('schoolName') || 'Brelinx Edusuite';
    document.getElementById('settingsLogoUrl').value = localStorage.getItem('schoolLogo') || '';
    document.getElementById('settingsPrimaryColor').value = localStorage.getItem('primaryColor') || '#4a90e2';
}

function saveSettings() {
    const schoolName = document.getElementById('settingsSchoolName').value;
    const logoUrl = document.getElementById('settingsLogoUrl').value;
    const primaryColor = document.getElementById('settingsPrimaryColor').value;
    
    localStorage.setItem('schoolName', schoolName);
    localStorage.setItem('schoolLogo', logoUrl);
    localStorage.setItem('primaryColor', primaryColor);
    
    // Apply settings
    document.getElementById('schoolName').textContent = schoolName;
    if (logoUrl) {
        document.getElementById('schoolLogo').src = logoUrl;
    }
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    showNotification('Settings saved successfully!');
}

// Attendance
function loadAttendanceData() {
    // Populate courses dropdown
    const select = document.getElementById('attendanceCourse');
    select.innerHTML = '<option value="">Select Course</option>';
    courses.forEach(course => {
        select.innerHTML += `<option value="${course.id}">${course.name}</option>`;
    });
}

// Utility Functions
function filterTable(tbodyId, searchTerm) {
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    }
}

function showNotification(message) {
    // Simple notification - can be enhanced with a toast library
    alert(message);
}

function logout() {
    // Clear session and redirect to login
    // In production, call logout API endpoint
    localStorage.clear();
    window.location.href = 'login.html';
}


