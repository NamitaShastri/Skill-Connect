// script.js - Final version with network redesign, profile phone/email, 4-col project layout
// Faculty Dashboard layout bug fixed (no duplicate injection, stable grid)
// Added full functionality for Approve/Reject/View Details and Accept/Decline buttons

// User data
let currentUser = null;
let currentRole = 'student';
let joinedClubs = [];
let skillContext = 'student';

// DOM Elements
const loginBtn = document.getElementById('submitLogin');
const logoutBtn = document.getElementById('logoutBtn');
const roleBtns = document.querySelectorAll('.role-btn');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const mainHeader = document.getElementById('main-header');
const mainFooter = document.getElementById('main-footer');

// Demo accounts
const demoAccounts = {
    student: {
        email: 'student@skillconnect.edu',
        password: 'password',
        name: 'Shastri Namita',
        title: 'Computer Science Student',
        year: '3rd Year',
        phone: '+91 98765 43210'
    },
    faculty: {
        email: 'faculty@skillconnect.edu',
        password: 'password',
        name: 'Ms. Prachi Rajput',
        title: 'Platform Administrator',
        department: 'Computer Science',
        phone: '+91 98765 12345'
    }
};

// Track currently editing skill
let editingSkill = null;

// LinkedIn state management
let linkedinProfiles = {
    student: {
        connected: false,
        profileUrl: null,
        connections: 0,
        followers: 0,
        profileData: null
    },
    faculty: {
        connected: false,
        profileUrl: null,
        connections: 0,
        followers: 0,
        profileData: null
    }
};

// GitHub Analysis State
let githubAnalysisData = null;

// ==================== FACULTY DASHBOARD DATA ====================
let facultyProjectsData = [
    { id: 1, title: "AI-Based Resume Screener", student: "Shastri Namita", skills: "Python, ML", description: "Develop an AI system to screen resumes for campus placements.", status: "Pending", dateSubmitted: "2025-03-20" },
    { id: 2, title: "Campus Navigation App", student: "Jasmeet Khanwani", skills: "React Native", description: "Mobile app for indoor navigation on campus.", status: "Pending", dateSubmitted: "2025-03-18" },
    { id: 3, title: "Smart Attendance System", student: "Aditi Dube", skills: "Face Recognition", description: "Automated attendance using facial recognition.", status: "Under Review", dateSubmitted: "2025-03-15" }
];

let facultyCollabRequestsData = [
    { id: 1, projectId: 1, studentName: "Rohan Mehta", requestDate: "2025-03-21", message: "I want to collaborate on the AI project", skills: "Python, TensorFlow" },
    { id: 2, projectId: 2, studentName: "Priya Nair", requestDate: "2025-03-20", message: "Interested in frontend development", skills: "React, UI/UX" }
];

// ==================== RENDER ACTIVE PROJECTS ====================
function renderFacultyActiveProjects() {
    const container = document.getElementById('facultyActiveProjects');
    if (!container) return;
    if (facultyProjectsData.length === 0) {
        container.innerHTML = '<div class="no-data-message" style="color: var(--gray); padding: 20px; text-align: center;">No active student projects.</div>';
        return;
    }
    container.innerHTML = facultyProjectsData.map(project => `
        <div class="project-card-custom" data-id="${project.id}">
            <div class="project-title">${escapeHtml(project.title)}</div>
            <div class="project-description">${escapeHtml(project.description)}</div>
            <div><strong>Student:</strong> ${escapeHtml(project.student)}</div>
            <div><strong>Skills:</strong> ${escapeHtml(project.skills)}</div>
            <div><strong>Status:</strong> <span class="project-status status-${project.status.toLowerCase().replace(' ', '-')}">${escapeHtml(project.status)}</span></div>
            <div><strong>Submitted:</strong> ${escapeHtml(project.dateSubmitted)}</div>
            <div class="project-actions" style="margin-top: 16px; display: flex; gap: 10px;">
                <button class="btn btn-approve btn-small" data-action="approve">Approve</button>
                <button class="btn btn-reject btn-small" data-action="reject">Reject</button>
                <button class="btn btn-view btn-small" data-action="view">View Details</button>
            </div>
        </div>
    `).join('');
}

// ==================== RENDER COLLABORATION REQUESTS ====================
function renderFacultyCollabRequests() {
    const container = document.getElementById('facultyCollaborationRequests');
    if (!container) return;
    if (facultyCollabRequestsData.length === 0) {
        container.innerHTML = '<div class="no-data-message" style="color: var(--gray); padding: 20px; text-align: center;">No collaboration requests.</div>';
        return;
    }
    container.innerHTML = facultyCollabRequestsData.map(req => `
        <div class="request-card clean-request-card" data-id="${req.id}" style="margin-bottom: 15px; padding: 15px; border: 1px solid var(--border); border-radius: 12px; background: var(--light);">
            <div><strong>Student:</strong> ${escapeHtml(req.studentName)}</div>
            <div><strong>Project ID:</strong> ${escapeHtml(req.projectId)}</div>
            <div><strong>Skills:</strong> ${escapeHtml(req.skills)}</div>
            <div><strong>Message:</strong> "${escapeHtml(req.message)}"</div>
            <div><strong>Requested on:</strong> ${escapeHtml(req.requestDate)}</div>
            <div style="margin-top: 12px; display: flex; gap: 10px;">
                <button class="btn btn-approve btn-small" data-action="accept">Accept</button>
                <button class="btn btn-reject btn-small" data-action="decline">Decline</button>
            </div>
        </div>
    `).join('');
}

// ==================== HANDLE PROJECT ACTIONS ====================
function handleApproveProject(projectId) {
    const project = facultyProjectsData.find(p => p.id === projectId);
    if (project) {
        project.status = "Approved";
        renderFacultyActiveProjects();
        showNotification(`Project "${project.title}" approved!`, 'success');
    }
}

function handleRejectProject(projectId) {
    const project = facultyProjectsData.find(p => p.id === projectId);
    if (project) {
        project.status = "Rejected";
        renderFacultyActiveProjects();
        showNotification(`Project "${project.title}" rejected.`, 'error');
    }
}

function handleViewProjectDetails(projectId) {
    const project = facultyProjectsData.find(p => p.id === projectId);
    if (!project) return;
    const modalHTML = `
        <div class="modal-overlay" id="projectDetailsModal" style="display: flex;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Project Details: ${escapeHtml(project.title)}</h3>
                    <button class="modal-close" id="closeProjectDetailsModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div><strong>Student:</strong> ${escapeHtml(project.student)}</div>
                    <div><strong>Description:</strong> ${escapeHtml(project.description)}</div>
                    <div><strong>Skills:</strong> ${escapeHtml(project.skills)}</div>
                    <div><strong>Status:</strong> ${escapeHtml(project.status)}</div>
                    <div><strong>Submitted:</strong> ${escapeHtml(project.dateSubmitted)}</div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="closeProjectDetailsBtn">Close</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('projectDetailsModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('projectDetailsModal').remove();
    document.getElementById('closeProjectDetailsModal').addEventListener('click', closeModal);
    document.getElementById('closeProjectDetailsBtn').addEventListener('click', closeModal);
    document.getElementById('projectDetailsModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

// ==================== HANDLE COLLABORATION REQUEST ACTIONS ====================
function handleAcceptRequest(requestId) {
    const request = facultyCollabRequestsData.find(r => r.id === requestId);
    if (request) {
        facultyCollabRequestsData = facultyCollabRequestsData.filter(r => r.id !== requestId);
        renderFacultyCollabRequests();
        showNotification(`Collaboration request from ${request.studentName} accepted!`, 'success');
    }
}

function handleDeclineRequest(requestId) {
    const request = facultyCollabRequestsData.find(r => r.id === requestId);
    if (request) {
        facultyCollabRequestsData = facultyCollabRequestsData.filter(r => r.id !== requestId);
        renderFacultyCollabRequests();
        showNotification(`Collaboration request from ${request.studentName} declined.`, 'error');
    }
}

// ==================== EVENT DELEGATION FOR FACULTY DASHBOARD ====================
function setupFacultyDashboardEventDelegation() {
    const projectsContainer = document.getElementById('facultyActiveProjects');
    if (projectsContainer) {
        projectsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const card = btn.closest('.project-card-custom');
            if (!card) return;
            const projectId = parseInt(card.dataset.id);
            const action = btn.dataset.action;
            if (action === 'approve') handleApproveProject(projectId);
            else if (action === 'reject') handleRejectProject(projectId);
            else if (action === 'view') handleViewProjectDetails(projectId);
        });
    }

    const requestsContainer = document.getElementById('facultyCollaborationRequests');
    if (requestsContainer) {
        requestsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const card = btn.closest('.request-card');
            if (!card) return;
            const requestId = parseInt(card.dataset.id);
            const action = btn.dataset.action;
            if (action === 'accept') handleAcceptRequest(requestId);
            else if (action === 'decline') handleDeclineRequest(requestId);
        });
    }
}

// ==================== MODIFIED INITIALIZE FACULTY DASHBOARD ====================
function initializeFacultyDashboard() {
    // Make containers scrollable
    const collabContainer = document.getElementById('facultyCollaborationRequests');
    if (collabContainer) collabContainer.classList.add('scrollable-list');
    const projectsContainer = document.getElementById('facultyActiveProjects');
    if (projectsContainer) projectsContainer.classList.add('scrollable-list');

    // Render dynamic content
    renderFacultyActiveProjects();
    renderFacultyCollabRequests();
    setupFacultyDashboardEventDelegation();
}

// Skill modal system
function createSkillModal() {
    const modalHTML = `
        <div class="modal-overlay" id="skillModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">Add New Skill</h3>
                    <button class="modal-close" id="closeSkillModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="skillName">Skill Name</label>
                        <input type="text" class="form-control" id="skillName" placeholder="Enter skill name">
                    </div>
                    <div class="form-group">
                        <label for="skillLevel">Proficiency Level</label>
                        <select class="form-control" id="skillLevel">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="skillCategory">Category</label>
                        <select class="form-control" id="skillCategory">
                            <option value="programming">Programming</option>
                            <option value="design">Design</option>
                            <option value="data">Data Science</option>
                            <option value="soft-skills">Soft Skills</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="skills-preview">
                        <h4>Preview:</h4>
                        <div class="preview-skill-tag">
                            <span id="previewSkillName">Skill Name</span>
                            <span class="skill-level-badge" id="previewSkillLevel">Beginner</span>
                        </div>
                    </div>
                    <div class="delete-section" id="deleteSection" style="display: none;">
                        <hr>
                        <button class="btn btn-danger" id="deleteSkillBtn" style="width: 100%;">
                            <i class="fas fa-trash"></i> Delete Skill
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelSkillBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveSkillBtn">Add Skill</button>
                </div>
            </div>
        </div>
    `;
    if (!document.getElementById('skillModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('closeSkillModal').addEventListener('click', closeSkillModal);
        document.getElementById('cancelSkillBtn').addEventListener('click', closeSkillModal);
        document.getElementById('saveSkillBtn').addEventListener('click', saveSkill);
        document.getElementById('deleteSkillBtn').addEventListener('click', deleteSkill);
        document.getElementById('skillName').addEventListener('input', updateSkillPreview);
        document.getElementById('skillLevel').addEventListener('change', updateSkillPreview);
    }
}

function closeSkillModal() {
    const skillModal = document.getElementById('skillModal');
    if (skillModal) skillModal.style.display = 'none';
    editingSkill = null;
}

function updateSkillPreview() {
    const skillName = document.getElementById('skillName').value || 'Skill Name';
    const skillLevel = document.getElementById('skillLevel').value;
    document.getElementById('previewSkillName').textContent = skillName;
    document.getElementById('previewSkillLevel').textContent = skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

function openEditSkillModal(skillElement) {
    editingSkill = skillElement;
    document.getElementById('modalTitle').textContent = 'Edit Skill';
    document.getElementById('saveSkillBtn').textContent = 'Update Skill';
    document.getElementById('deleteSection').style.display = 'block';
    const name = skillElement.childNodes[0].textContent.trim();
    const level = skillElement.querySelector('.skill-level-badge').textContent.toLowerCase();
    const category = skillElement.getAttribute('data-category');
    document.getElementById('skillName').value = name;
    document.getElementById('skillLevel').value = level;
    document.getElementById('skillCategory').value = category;
    updateSkillPreview();
    document.getElementById('skillModal').style.display = 'flex';
}

function initializeExistingSkills() {
    const lists = [
        document.getElementById('studentSkillsList'),
        document.getElementById('facultyResearchAreas')
    ];
    lists.forEach(list => {
        if (!list) return;
        list.querySelectorAll('.skill-tag').forEach(skill => {
            if (!skill.hasAttribute('data-edit-init')) {
                skill.setAttribute('data-edit-init', 'true');
                skill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditSkillModal(skill);
                });
            }
        });
    });
}

function deleteSkill() {
    if (!editingSkill) return;
    if (confirm('Delete this skill?')) {
        editingSkill.remove();
        const count = document.getElementById('studentSkills');
        if (count) count.textContent = parseInt(count.textContent) - 1;
        showNotification('Skill deleted!', 'success');
        closeSkillModal();
    }
}

// Notifications
function showNotification(msg, type = 'info') {
    const box = document.createElement('div');
    box.className = `notification ${type}`;
    box.textContent = msg;
    document.body.appendChild(box);
    setTimeout(() => box.classList.add('show'), 30);
    setTimeout(() => {
        box.classList.remove('show');
        setTimeout(() => box.remove(), 250);
    }, 2600);
}

// Network filter option
function initializeNetworkFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    const skillsFilter = document.getElementById('skillsFilter');
    const roleFilter = document.getElementById('roleFilter');
    const yearFilter = document.getElementById('yearFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const profileCards = document.querySelectorAll('#networkProfilesGrid .network-profile-card');
    function applyFilters() {
        const dep = departmentFilter.value.toLowerCase();
        const skillsVal = skillsFilter.value.toLowerCase();
        const roleVal = roleFilter.value;
        const yearVal = yearFilter.value;
        let count = 0;
        profileCards.forEach(card => {
            let show = true;
            const cardDept = card.getAttribute('data-department');
            const cardRole = card.getAttribute('data-role');
            const cardYear = card.getAttribute('data-year');
            const cardSkills = card.getAttribute('data-skills');
            if (dep && cardDept !== dep) show = false;
            if (skillsVal && !cardSkills.includes(skillsVal)) show = false;
            if (roleVal && cardRole !== roleVal) show = false;
            if (yearVal && cardYear !== yearVal) show = false;
            card.style.display = show ? 'flex' : 'none';
            if (show) count++;
        });
        const resultsCountElem = document.getElementById('resultsCount');
        if (resultsCountElem) resultsCountElem.textContent = `${count} profile${count !== 1 ? 's' : ''}`;
    }
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => {
        departmentFilter.value = "";
        skillsFilter.value = "";
        roleFilter.value = "";
        yearFilter.value = "";
        applyFilters();
    });
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyFilters);
    applyFilters();
}

function initializeNetworkConnectButtons() {
    document.querySelectorAll('#networkProfilesGrid .connect-network-btn').forEach(button => {
        if (!button.hasAttribute('data-init')) {
            button.setAttribute('data-init', 'true');
            button.addEventListener('click', function() {
                const card = this.closest('.network-profile-card');
                const name = card.querySelector('.network-profile-name').textContent;
                this.innerHTML = '<i class="fas fa-check"></i> Requested';
                this.classList.remove('btn-outline');
                this.classList.add('btn-primary');
                this.disabled = true;
                showNotification(`Connection request sent to ${name}`, 'success');
            });
        }
    });
}

function initializeNetworkViewButtons() {
    document.querySelectorAll('#networkProfilesGrid .view-profile-btn').forEach(button => {
        if (!button.hasAttribute('data-init')) {
            button.setAttribute('data-init', 'true');
            button.addEventListener('click', function() {
                const card = this.closest('.network-profile-card');
                const profileData = {
                    name: card.querySelector('.network-profile-name').textContent,
                    role: card.querySelector('.network-profile-role').textContent,
                    skills: card.querySelector('.network-profile-skills').innerText,
                    avatar: card.querySelector('.network-profile-avatar').textContent,
                    bio: "Passionate professional with expertise in various domains.",
                    location: "Remote / Campus",
                    email: `${card.querySelector('.network-profile-name').textContent.toLowerCase().replace(' ', '.')}@example.com`,
                    github: "https://github.com/example"
                };
                showProfileModal(profileData);
            });
        }
    });
}

let networkProfilesData = [
    { name: "Aarav Sharma", role: "Software Engineer", skills: ["React", "Node.js", "MongoDB"], avatar: "A", department: "cse", year: "3rd Year", bio: "Full-stack developer with 3 years of experience.", location: "Mumbai", email: "aarav.sharma@example.com", github: "https://github.com/aarav" },
    { name: "Ishita Verma", role: "Data Scientist", skills: ["Python", "ML", "SQL"], avatar: "I", department: "cse", year: "4th Year", bio: "AI researcher focusing on NLP.", location: "Bangalore", email: "ishita.verma@example.com", github: "https://github.com/ishita" },
    { name: "Rahul Mehta", role: "Product Manager", skills: ["Agile", "Product Strategy", "Analytics"], avatar: "R", department: "mba", year: "2nd Year", bio: "Product leader with a passion for innovation.", location: "Delhi", email: "rahul.mehta@example.com", github: "https://github.com/rahul" },
    { name: "Neha Gupta", role: "UI/UX Designer", skills: ["Figma", "Adobe XD", "Prototyping"], avatar: "N", department: "design", year: "3rd Year", bio: "Creative designer focused on user experience.", location: "Pune", email: "neha.gupta@example.com", github: "https://github.com/neha" },
    { name: "Vikram Singh", role: "DevOps Engineer", skills: ["Docker", "Kubernetes", "AWS"], avatar: "V", department: "cse", year: "4th Year", bio: "Automating infrastructure and CI/CD pipelines.", location: "Hyderabad", email: "vikram.singh@example.com", github: "https://github.com/vikram" },
    { name: "Priya Nair", role: "Frontend Developer", skills: ["JavaScript", "Vue.js", "Tailwind"], avatar: "P", department: "cse", year: "2nd Year", bio: "Building responsive and interactive web apps.", location: "Chennai", email: "priya.nair@example.com", github: "https://github.com/priya" }
];

function renderNetworkProfiles(profiles) {
    const container = document.getElementById('networkProfilesGrid');
    if (!container) return;
    container.innerHTML = '';
    profiles.forEach(profile => {
        const skillsHtml = profile.skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('');
        const card = document.createElement('div');
        card.className = 'network-profile-card';
        card.setAttribute('data-department', profile.department);
        card.setAttribute('data-role', profile.role);
        card.setAttribute('data-year', profile.year);
        card.setAttribute('data-skills', profile.skills.join(',').toLowerCase());
        card.innerHTML = `
            <div class="network-profile-avatar">${escapeHtml(profile.avatar)}</div>
            <div class="network-profile-name">${escapeHtml(profile.name)}</div>
            <div class="network-profile-role">${escapeHtml(profile.role)}</div>
            <div class="network-profile-skills">${skillsHtml}</div>
            <div class="network-profile-actions">
                <button class="btn btn-outline btn-small view-profile-btn">View Profile</button>
                <button class="btn btn-outline btn-small connect-network-btn">Connect</button>
            </div>
        `;
        container.appendChild(card);
    });
    initializeNetworkConnectButtons();
    initializeNetworkViewButtons();
}

function clearNetworkSidebar() {
    const rightSidebar = document.querySelector('#network-page .right-sidebar');
    if (rightSidebar) {
        rightSidebar.innerHTML = '';
        rightSidebar.style.display = 'none';
    }
    const mainContent = document.querySelector('#network-page .main-content');
    if (mainContent) {
        mainContent.style.gridTemplateColumns = '1fr';
        const centerColumn = mainContent.querySelector('.center-column');
        if (centerColumn) centerColumn.style.gridColumn = '1 / -1';
    }
}

function initializeNetworkPage() {
    clearNetworkSidebar();
    renderNetworkProfiles(networkProfilesData);
    initializeNetworkFilters();
}

loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRole = btn.getAttribute('data-role');
    });
});
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        showPage(page);
        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');
    });
});

function applyRoleBasedUI(role) {
    document.querySelectorAll('.nav-link[data-page="clubs"]').forEach(el => {
        el.style.display = role === 'faculty' ? 'none' : '';
    });
    const exploreClubsBtn = document.getElementById('exploreClubsBtn');
    if (exploreClubsBtn) exploreClubsBtn.style.display = role === 'faculty' ? 'none' : '';
    if (role === 'faculty') document.getElementById('clubs-page')?.classList.remove('active');
}

function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    if (pageId === 'dashboard') {
        if (currentRole === 'student') {
            document.getElementById('student-dashboard')?.classList.add('active');
            setTimeout(initializeExistingSkills, 100);
            setTimeout(moveGitHubAnalysisToRightSide, 150);
            setTimeout(initializeStudentDashboardEvents, 100);
        } else {
            document.getElementById('faculty-dashboard')?.classList.add('active');
            setTimeout(initializeFacultyDashboard, 100);
        }
        return;
    }
    const pageEl = document.getElementById(`${pageId}-page`);
    if (pageEl) pageEl.classList.add('active');
    if (pageId === 'network') setTimeout(() => initializeNetworkPage(), 100);
    if (pageId === 'clubs') setTimeout(() => updateMyClubsUI(), 100);
    if (pageId === 'projects') setTimeout(pc_onProjectsPageShow, 150);
    if (pageId === 'events') setTimeout(initializeEventsPage, 100);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    if (!email || !pass) return alert('Please fill in all fields');
    if (email === demoAccounts[currentRole].email && pass === demoAccounts[currentRole].password) {
        currentUser = { ...demoAccounts[currentRole] };
        loadProfileData();
        showDashboard();
        showNotification(`Welcome ${currentUser.name}!`, 'success');
    } else {
        alert('Invalid email or password.');
    }
}

function showDashboard() {
    mainHeader.classList.remove('hidden');
    mainFooter.classList.remove('hidden');
    applyRoleBasedUI(currentRole);
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.remove('active');
    const cfg = ROLE_CONFIG[currentRole];
    document.getElementById(cfg.dashboardId).classList.add('active');
    document.getElementById(cfg.nameId).textContent = currentUser.name;
    document.getElementById(cfg.titleId).textContent = currentUser.title;

    // Set email and phone
    if (currentRole === 'student') {
        document.getElementById('studentEmail').textContent = currentUser.email;
        document.getElementById('studentPhone').textContent = currentUser.phone || 'Not provided';
        let yearElement = document.getElementById('studentYear');
        if (!yearElement) {
            const profileCard = document.querySelector('#student-dashboard .profile-card');
            if (profileCard) {
                const yearDiv = document.createElement('div');
                yearDiv.id = 'studentYear';
                yearDiv.className = 'profile-year';
                yearDiv.style.margin = '5px 0';
                yearDiv.style.color = 'var(--gray)';
                profileCard.appendChild(yearDiv);
                yearElement = yearDiv;
            }
        }
        if (yearElement) yearElement.textContent = `Year: ${currentUser.year || 'Not set'}`;
    } else {
        document.getElementById('facultyEmail').textContent = currentUser.email;
        document.getElementById('facultyPhone').textContent = currentUser.phone || 'Not provided';
        let deptElement = document.getElementById('facultyDept');
        if (!deptElement) {
            const profileCard = document.querySelector('#faculty-dashboard .profile-card');
            if (profileCard) {
                const deptDiv = document.createElement('div');
                deptDiv.id = 'facultyDept';
                deptDiv.className = 'profile-dept';
                deptDiv.style.margin = '5px 0';
                deptDiv.style.color = 'var(--gray)';
                profileCard.appendChild(deptDiv);
                deptElement = deptDiv;
            }
        }
        if (deptElement) deptElement.textContent = `Department: ${currentUser.department || 'Not set'}`;
    }

    navLinks.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="dashboard"]').classList.add('active');
    setTimeout(initializeSkills, 100);
    initializeLinkedInButtons();
    setTimeout(initializeLinkedInOnDashboardLoad, 150);
    initializeGitHubAnalysis();
    setupEditProfileButtons();
}

function handleLogout() {
    currentUser = null;
    mainHeader.classList.add('hidden');
    mainFooter.classList.add('hidden');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    applyRoleBasedUI('student');
}

// Club Functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function openClubRegistrationForm(clubName, clubDescription) {
    const existingModal = document.getElementById('clubRegistrationModal');
    if (existingModal) existingModal.remove();
    const modalHTML = `
        <div class="modal-overlay" id="clubRegistrationModal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Join ${escapeHtml(clubName)}</h3>
                    <button class="modal-close" id="closeRegModal">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--gray); margin-bottom: 20px;">${escapeHtml(clubDescription)}</p>
                    <div class="form-group">
                        <label for="regFullName">Full Name *</label>
                        <input type="text" class="form-control" id="regFullName" value="${escapeHtml(currentUser?.name || '')}" placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email Address *</label>
                        <input type="email" class="form-control" id="regEmail" value="${escapeHtml(demoAccounts[currentRole]?.email || '')}" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="regYear">Year *</label>
                        <select class="form-control" id="regYear" required>
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="regReason">Why do you want to join?</label>
                        <textarea class="form-control" id="regReason" rows="3" placeholder="Tell us why you're interested in this club..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="regFile">Upload Resume/CV (optional)</label>
                        <input type="file" class="form-control" id="regFile" accept=".pdf,.doc,.docx">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelRegBtn">Cancel</button>
                    <button class="btn btn-primary" id="submitRegBtn">Submit Application</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('clubRegistrationModal');
    const closeBtn = document.getElementById('closeRegModal');
    const cancelBtn = document.getElementById('cancelRegBtn');
    const submitBtn = document.getElementById('submitRegBtn');
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    submitBtn.addEventListener('click', () => {
        const fullName = document.getElementById('regFullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const year = document.getElementById('regYear').value;
        const reason = document.getElementById('regReason').value.trim();
        const fileInput = document.getElementById('regFile');
        if (!fullName || !email || !year) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        let applications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
        const newApplication = {
            clubName,
            fullName,
            email,
            year,
            reason,
            fileName: fileInput.files[0] ? fileInput.files[0].name : null,
            date: new Date().toISOString()
        };
        applications.push(newApplication);
        localStorage.setItem('clubApplications', JSON.stringify(applications));
        if (!joinedClubs.includes(clubName)) {
            joinedClubs.push(clubName);
            updateMyClubsUI();
        }
        const clubBtn = Array.from(document.querySelectorAll('.club-card-custom')).find(card => card.querySelector('strong')?.textContent === clubName)?.querySelector('.btn');
        if (clubBtn) {
            clubBtn.textContent = "Joined ✔";
            clubBtn.classList.remove("btn-outline");
            clubBtn.classList.add("btn-primary");
            clubBtn.disabled = true;
        }
        showNotification(`Application submitted for ${clubName}!`, 'success');
        closeModal();
    });
    modal.querySelector('.modal-content').addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener('click', function(e) {
    const joinBtn = e.target.closest('.club-card-custom .btn-outline') ||
                    e.target.closest('.club-card-custom .btn') ||
                    e.target.closest('.club-card .btn-outline') ||
                    e.target.closest('.club-card .btn');
    if (!joinBtn) return;
    if (joinBtn.hasAttribute('data-join-triggered')) return;
    joinBtn.setAttribute('data-join-triggered', 'true');
    const clubCard = joinBtn.closest('.club-card-custom, .club-card');
    if (!clubCard) {
        joinBtn.removeAttribute('data-join-triggered');
        return;
    }
    const clubName = clubCard.querySelector('strong')?.textContent || clubCard.querySelector('.club-name')?.textContent || 'Club';
    const clubDescription = clubCard.querySelector('p')?.textContent || clubCard.querySelector('.club-description')?.textContent || 'No description available';
    openClubRegistrationForm(clubName, clubDescription);
    setTimeout(() => joinBtn.removeAttribute('data-join-triggered'), 500);
});

function updateMyClubsUI() {
    const myClubsList = document.getElementById("myClubsList");
    const dashboardClubs = document.getElementById("studentClubs");
    if (myClubsList) myClubsList.innerHTML = "";
    if (dashboardClubs) dashboardClubs.innerHTML = "";
    if (joinedClubs.length === 0) {
        if (myClubsList) myClubsList.innerHTML = `<div style="color: var(--gray); padding: 10px 0;">You haven't joined any clubs yet.</div>`;
        if (dashboardClubs) dashboardClubs.innerHTML = `<div class="event-card"><div class="event-date"><div class="event-day">--</div></div><div class="event-details"><div class="event-title">No Clubs Joined</div></div></div>`;
        return;
    }
    joinedClubs.forEach(club => {
        if (myClubsList) {
            myClubsList.innerHTML += `<div class="club-card-custom"><strong>${escapeHtml(club)}</strong><p style="color: var(--gray); font-size: 0.9rem;">Member</p><button class="btn btn-outline leave-btn" style="margin-top: 8px;" data-club="${escapeHtml(club)}">Leave Club</button></div>`;
        }
        if (dashboardClubs) {
            dashboardClubs.innerHTML += `<div class="event-card"><div class="event-date"><div class="event-day">${club.substring(0, 2).toUpperCase()}</div></div><div class="event-details"><div class="event-title">${escapeHtml(club)}</div><div class="event-time">Member</div></div></div>`;
        }
    });
    initializeLeaveButtons();
    updateAllClubsButtons();
}

function initializeLeaveButtons() {
    const leaveButtons = document.querySelectorAll(".leave-btn");
    leaveButtons.forEach(btn => {
        if (!btn.hasAttribute('data-leave-init')) {
            btn.setAttribute('data-leave-init', 'true');
            btn.addEventListener("click", function() {
                const clubName = this.getAttribute("data-club");
                joinedClubs = joinedClubs.filter(c => c !== clubName);
                showNotification(`Left ${clubName}`, "error");
                updateMyClubsUI();
                updateAllClubsButtons();
            });
        }
    });
}

function updateAllClubsButtons() {
    const clubCards = document.querySelectorAll("#allClubsList .club-card-custom");
    clubCards.forEach(card => {
        const clubName = card.querySelector("strong").textContent;
        const btn = card.querySelector(".btn");
        if (joinedClubs.includes(clubName)) {
            btn.textContent = "Joined ✔";
            btn.classList.remove("btn-outline");
            btn.classList.add("btn-primary");
            btn.disabled = true;
        } else {
            btn.textContent = "Join Club";
            btn.classList.add("btn-outline");
            btn.classList.remove("btn-primary");
            btn.disabled = false;
        }
    });
}

// GitHub Analysis
function initializeGitHubAnalysis() {
    const analyzeBtn = document.getElementById('analyzeGitHubBtn');
    const connectBtn = document.getElementById('connectStudentGithubBtn');
    const githubUsernameInput = document.getElementById('githubUsername');
    if (connectBtn) connectBtn.addEventListener('click', () => openGitHubConnectModal());
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const username = githubUsernameInput?.value.trim();
            if (!username) {
                showNotification('Please enter a GitHub username', 'error');
                return;
            }
            showNotification('Analyzing GitHub profile...', 'info');
            setTimeout(() => {
                githubAnalysisData = {
                    username: username,
                    repos: 24,
                    followers: 156,
                    following: 89,
                    contributions: 847,
                    topLanguages: ['JavaScript', 'Python', 'TypeScript'],
                    bestRepo: 'skillconnect-project',
                    stars: 42,
                    forks: 18
                };
                displayGitHubAnalysis(githubAnalysisData);
                localStorage.setItem('githubUsername', username);
                showNotification('GitHub analysis complete!', 'success');
            }, 1500);
        });
    }
}

function openGitHubConnectModal() {
    const modalHTML = `
        <div class="modal-overlay" id="githubConnectModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Connect GitHub</h3>
                    <button class="modal-close" id="closeGithubModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="githubUsernameInput">GitHub Username or Profile URL</label>
                        <input type="text" class="form-control" id="githubUsernameInput" placeholder="e.g., john-doe or https://github.com/john-doe">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelGithubBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveGithubBtn">Connect</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('githubConnectModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeBtn = document.getElementById('closeGithubModal');
    const cancelBtn = document.getElementById('cancelGithubBtn');
    const saveBtn = document.getElementById('saveGithubBtn');
    const usernameInput = document.getElementById('githubUsernameInput');
    closeBtn.addEventListener('click', () => document.getElementById('githubConnectModal').remove());
    cancelBtn.addEventListener('click', () => document.getElementById('githubConnectModal').remove());
    saveBtn.addEventListener('click', () => {
        let username = usernameInput.value.trim();
        if (!username) {
            showNotification('Please enter a GitHub username', 'error');
            return;
        }
        if (username.includes('github.com/')) {
            const parts = username.split('/');
            username = parts[parts.length - 1];
        }
        const githubInput = document.getElementById('githubUsername');
        if (githubInput) githubInput.value = username;
        showNotification(`GitHub profile connected: ${username}`, 'success');
        document.getElementById('analyzeGitHubBtn')?.click();
        document.getElementById('githubConnectModal').remove();
    });
}

function displayGitHubAnalysis(data) {
    const analysisDiv = document.getElementById('githubAnalysis');
    if (!analysisDiv) return;
    analysisDiv.innerHTML = `
        <div style="margin-top: 15px;">
            <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 15px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h4 style="color: var(--dark); margin-bottom: 5px;">
                            <i class="fab fa-github"></i> ${escapeHtml(data.username)}
                        </h4>
                        <p style="color: var(--gray); font-size: 0.85rem;">GitHub Profile Analysis</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${data.contributions}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Contributions</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; text-align: center;">
                    <div>
                        <div style="font-weight: 700; color: var(--dark);">${data.repos}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Repositories</div>
                    </div>
                    <div>
                        <div style="font-weight: 700; color: var(--dark);">${data.followers}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Followers</div>
                    </div>
                    <div>
                        <div style="font-weight: 700; color: var(--dark);">${data.stars}</div>
                        <div style="font-size: 0.7rem; color: var(--gray);">Stars</div>
                    </div>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong>Top Languages:</strong>
                    <div style="display: flex; gap: 8px; margin-top: 5px; flex-wrap: wrap;">
                        ${data.topLanguages.map(lang => `<span class="skill-tag" style="font-size: 0.75rem; padding: 3px 10px;">${escapeHtml(lang)}</span>`).join('')}
                    </div>
                </div>
                <div>
                    <strong>Best Repository:</strong>
                    <div style="background: white; padding: 8px 12px; border-radius: 8px; margin-top: 5px;">
                        <div style="font-weight: 600;">${escapeHtml(data.bestRepo)}</div>
                        <div style="display: flex; gap: 15px; font-size: 0.8rem; color: var(--gray); margin-top: 5px;">
                            <span><i class="fas fa-star"></i> ${data.stars} stars</span>
                            <span><i class="fas fa-code-branch"></i> ${data.forks} forks</span>
                        </div>
                    </div>
                </div>
                <div class="progress-bar" style="margin-top: 15px;">
                    <div class="progress" style="width: 75%;"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--gray); text-align: center;">Activity Score: 75/100</div>
            </div>
        </div>
    `;
}

// Project Collaboration
let dynamicSkillsList = [];
function initializeNewProjectForm() {
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) newProjectBtn.addEventListener('click', openNewProjectModal);
}
function openNewProjectModal() {
    dynamicSkillsList = [];
    const modalHTML = `
        <div class="modal-overlay" id="newProjectModal" style="display: flex;">
            <div class="modal-content" style="max-width: 550px;">
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <button class="modal-close" id="closeProjectModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="projectTitle">Project Title *</label>
                        <input type="text" class="form-control" id="projectTitle" placeholder="Enter project title">
                    </div>
                    <div class="form-group">
                        <label for="projectDesc">Description *</label>
                        <textarea class="form-control" id="projectDesc" rows="3" placeholder="Describe your project"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="projectGithub">GitHub Repository URL</label>
                        <input type="url" class="form-control" id="projectGithub" placeholder="https://github.com/username/repo">
                    </div>
                    <div class="form-group">
                        <label>Required Skills *</label>
                        <div id="dynamicSkillsContainer" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;"></div>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="newSkillInput" class="form-control" placeholder="Add a skill" style="flex: 1;">
                            <button type="button" id="addSkillBtn" class="btn btn-outline">+ Add</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="projectRoles">Roles Needed</label>
                        <input type="text" class="form-control" id="projectRoles" placeholder="e.g., Frontend Developer, Backend Developer">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelProjectBtn">Cancel</button>
                    <button class="btn btn-primary" id="submitProjectBtn">Create Project</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('newProjectModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const skillsContainer = document.getElementById('dynamicSkillsContainer');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const newSkillInput = document.getElementById('newSkillInput');
    addSkillBtn.addEventListener('click', () => {
        const skill = newSkillInput.value.trim();
        if (skill && !dynamicSkillsList.includes(skill)) {
            dynamicSkillsList.push(skill);
            updateSkillsDisplay(skillsContainer);
            newSkillInput.value = '';
        }
    });
    newSkillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSkillBtn.click();
    });
    document.getElementById('closeProjectModal').addEventListener('click', () => document.getElementById('newProjectModal').remove());
    document.getElementById('cancelProjectBtn').addEventListener('click', () => document.getElementById('newProjectModal').remove());
    document.getElementById('submitProjectBtn').addEventListener('click', () => {
        const title = document.getElementById('projectTitle').value.trim();
        const desc = document.getElementById('projectDesc').value.trim();
        const github = document.getElementById('projectGithub').value.trim();
        const roles = document.getElementById('projectRoles').value.trim();
        if (!title || !desc) {
            showNotification('Please fill in project title and description', 'error');
            return;
        }
        if (dynamicSkillsList.length === 0) {
            showNotification('Please add at least one required skill', 'error');
            return;
        }
        const newProj = {
            id: "proj_" + Date.now(),
            owner: currentUser ? currentUser.name : "You",
            title,
            description: desc,
            github: github,
            skills: dynamicSkillsList,
            roles: roles,
            team: []
        };
        pc_projects.unshift(newProj);
        pc_renderProjectFeed();
        pc_renderMyProjects();
        pc_renderIncomingRequests();
        showNotification("Project created successfully!", "success");
        document.getElementById('newProjectModal').remove();
    });
}
function updateSkillsDisplay(container) {
    if (!container) return;
    container.innerHTML = dynamicSkillsList.map(skill => `
        <span class="skill-tag" style="display: inline-flex; align-items: center; gap: 5px;">
            ${escapeHtml(skill)}
            <span style="cursor: pointer; color: rgba(255,255,255,0.8);" onclick="removeSkill('${skill}')">&times;</span>
        </span>
    `).join('');
}
function removeSkill(skill) {
    dynamicSkillsList = dynamicSkillsList.filter(s => s !== skill);
    const container = document.getElementById('dynamicSkillsContainer');
    if (container) updateSkillsDisplay(container);
}

// Events Page
function initializeEventsPage() {
    const scrollableElements = document.querySelectorAll('.scrollable-content');
    scrollableElements.forEach(el => {
        if (el.scrollHeight > el.clientHeight) el.style.overflowY = 'auto';
    });
    const registerBtns = document.querySelectorAll('.event-card .btn-primary');
    registerBtns.forEach(btn => {
        if (!btn.hasAttribute('data-event-init')) {
            btn.setAttribute('data-event-init', 'true');
            btn.addEventListener('click', function() {
                const eventCard = this.closest('.event-card');
                const eventTitle = eventCard.querySelector('.event-title').textContent;
                const eventDate = eventCard.querySelector('.event-day')?.textContent + ' ' + eventCard.querySelector('.event-month')?.textContent || 'Date TBD';
                openEventRegistrationForm(eventTitle, eventDate);
            });
        }
    });
}
function openEventRegistrationForm(eventTitle, eventDate) {
    const modalHTML = `
        <div class="modal-overlay" id="eventRegModal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Register for ${escapeHtml(eventTitle)}</h3>
                    <button class="modal-close" id="closeEventRegModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: var(--light); padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                        <div><strong>Event:</strong> ${escapeHtml(eventTitle)}</div>
                        <div><strong>Date:</strong> ${escapeHtml(eventDate)}</div>
                    </div>
                    <div class="form-group">
                        <label for="eventFullName">Full Name *</label>
                        <input type="text" class="form-control" id="eventFullName" value="${escapeHtml(currentUser?.name || '')}" placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="eventEmail">Email Address *</label>
                        <input type="email" class="form-control" id="eventEmail" value="${escapeHtml(demoAccounts[currentRole]?.email || '')}" placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="eventYear">Year *</label>
                        <select class="form-control" id="eventYear" required>
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="eventPhone">Phone Number</label>
                        <input type="tel" class="form-control" id="eventPhone" placeholder="Enter your phone number">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelEventRegBtn">Cancel</button>
                    <button class="btn btn-primary" id="submitEventRegBtn">Register Now</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('eventRegModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('eventRegModal').remove();
    document.getElementById('closeEventRegModal').addEventListener('click', closeModal);
    document.getElementById('cancelEventRegBtn').addEventListener('click', closeModal);
    document.getElementById('submitEventRegBtn').addEventListener('click', () => {
        const fullName = document.getElementById('eventFullName').value.trim();
        const email = document.getElementById('eventEmail').value.trim();
        const year = document.getElementById('eventYear').value;
        if (!fullName || !email || !year) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        let registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        const newRegistration = {
            eventTitle,
            fullName,
            email,
            year,
            date: new Date().toISOString()
        };
        registrations.push(newRegistration);
        localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
        showNotification(`Successfully registered for ${eventTitle}!`, 'success');
        closeModal();
    });
}

// AI Enhance
async function getGeminiSkillSuggestions(skills) {
    try {
        const res = await fetch("http://localhost:3000/ai/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills })
        });
        const data = await res.json();
        return data.success ? data.suggestions : "AI backend error.";
    } catch (err) {
        console.error("Gemini call error:", err);
        return "Unable to reach AI backend.";
    }
}
function fixAISuggestions(text) {
    if (!text) return "";
    text = text.replace(/\r\n/g, "\n");
    let lines = text.split("\n");
    let html = "";
    let inList = false;
    lines.forEach(line => {
        let trimmed = line.trim();
        if (/^[\*\-\•\‣\·]\s+/.test(trimmed)) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }
            let withoutBullet = trimmed.replace(/^[\*\-\•\‣\·]\s+/, "");
            withoutBullet = withoutBullet.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            withoutBullet = withoutBullet.replace(/_(.*?)_/g, "<em>$1</em>");
            withoutBullet = withoutBullet.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<li>${withoutBullet}</li>`;
        } else if (trimmed === "") {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
            html += "<br>";
        } else {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
            let clean = trimmed;
            clean = clean.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            clean = clean.replace(/_(.*?)_/g, "<em>$1</em>");
            clean = clean.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<p>${clean}</p>`;
        }
    });
    if (inList) html += "</ul>";
    return html;
}
function createEnhanceModal() {
    const modalHTML = `
        <div class="modal-overlay" id="enhanceModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>AI Skill Enhancement Suggestions</h3>
                    <button class="modal-close" id="closeEnhanceModal">&times;</button>
                </div>
                <div class="modal-body" id="enhanceContent">
                    <p style="color: var(--gray);">Analyzing your skills...</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="closeEnhanceBtn">Close</button>
                </div>
            </div>
        </div>
    `;
    if (!document.getElementById('enhanceModal')) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        document.getElementById("closeEnhanceModal").addEventListener("click", closeEnhanceModal);
        document.getElementById("closeEnhanceBtn").addEventListener("click", closeEnhanceModal);
    }
}
function closeEnhanceModal() {
    const modal = document.getElementById("enhanceModal");
    if (modal) modal.style.display = "none";
}
document.getElementById('addStudentSkillBtn')?.addEventListener('click', openSkillModal);

// Edit Profile with phone
function setupEditProfileButtons() {
    const studentEditBtn = document.getElementById('editStudentProfileBtn');
    const facultyEditBtn = document.getElementById('editFacultyProfileBtn');
    if (studentEditBtn) {
        const newStudentBtn = studentEditBtn.cloneNode(true);
        studentEditBtn.parentNode.replaceChild(newStudentBtn, studentEditBtn);
        newStudentBtn.addEventListener('click', openStudentEditModal);
    }
    if (facultyEditBtn) {
        const newFacultyBtn = facultyEditBtn.cloneNode(true);
        facultyEditBtn.parentNode.replaceChild(newFacultyBtn, facultyEditBtn);
        newFacultyBtn.addEventListener('click', openFacultyEditModal);
    }
}
function openStudentEditModal() {
    const modalHTML = `
        <div class="modal-overlay" id="editStudentModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Student Profile</h3>
                    <button class="modal-close" id="closeEditStudentModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editStudentName">Full Name</label>
                        <input type="text" class="form-control" id="editStudentName" value="${escapeHtml(currentUser.name)}">
                    </div>
                    <div class="form-group">
                        <label for="editStudentEmail">Email</label>
                        <input type="email" class="form-control" id="editStudentEmail" value="${escapeHtml(currentUser.email)}">
                    </div>
                    <div class="form-group">
                        <label for="editStudentPhone">Phone Number</label>
                        <input type="tel" class="form-control" id="editStudentPhone" value="${escapeHtml(currentUser.phone || '')}" placeholder="Enter phone number">
                    </div>
                    <div class="form-group">
                        <label for="editStudentYear">Year *</label>
                        <select class="form-control" id="editStudentYear" required>
                            <option value="1st Year" ${currentUser.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                            <option value="2nd Year" ${currentUser.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                            <option value="3rd Year" ${currentUser.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                            <option value="4th Year" ${currentUser.year === '4th Year' ? 'selected' : ''}>4th Year</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelEditStudentBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveEditStudentBtn">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('editStudentModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('editStudentModal').remove();
    document.getElementById('closeEditStudentModal').addEventListener('click', closeModal);
    document.getElementById('cancelEditStudentBtn').addEventListener('click', closeModal);
    document.getElementById('saveEditStudentBtn').addEventListener('click', () => {
        const name = document.getElementById('editStudentName').value.trim();
        const email = document.getElementById('editStudentEmail').value.trim();
        const phone = document.getElementById('editStudentPhone').value.trim();
        const year = document.getElementById('editStudentYear').value;
        if (!name || !email || !year) {
            showNotification('Please fill all fields', 'error');
            return;
        }
        currentUser.name = name;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.year = year;
        document.getElementById('studentName').textContent = name;
        document.getElementById('studentEmail').textContent = email;
        document.getElementById('studentPhone').textContent = phone || 'Not provided';
        const yearElement = document.getElementById('studentYear');
        if (yearElement) yearElement.textContent = `Year: ${year}`;
        saveProfileData();
        showNotification('Profile updated successfully!', 'success');
        closeModal();
    });
}
function openFacultyEditModal() {
    const modalHTML = `
        <div class="modal-overlay" id="editFacultyModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Faculty Profile</h3>
                    <button class="modal-close" id="closeEditFacultyModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editFacultyName">Full Name</label>
                        <input type="text" class="form-control" id="editFacultyName" value="${escapeHtml(currentUser.name)}">
                    </div>
                    <div class="form-group">
                        <label for="editFacultyEmail">Email</label>
                        <input type="email" class="form-control" id="editFacultyEmail" value="${escapeHtml(currentUser.email)}">
                    </div>
                    <div class="form-group">
                        <label for="editFacultyPhone">Phone Number</label>
                        <input type="tel" class="form-control" id="editFacultyPhone" value="${escapeHtml(currentUser.phone || '')}" placeholder="Enter phone number">
                    </div>
                    <div class="form-group">
                        <label for="editFacultyDept">Department</label>
                        <input type="text" class="form-control" id="editFacultyDept" value="${escapeHtml(currentUser.department || '')}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelEditFacultyBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveEditFacultyBtn">Save Changes</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('editFacultyModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('editFacultyModal').remove();
    document.getElementById('closeEditFacultyModal').addEventListener('click', closeModal);
    document.getElementById('cancelEditFacultyBtn').addEventListener('click', closeModal);
    document.getElementById('saveEditFacultyBtn').addEventListener('click', () => {
        const name = document.getElementById('editFacultyName').value.trim();
        const email = document.getElementById('editFacultyEmail').value.trim();
        const phone = document.getElementById('editFacultyPhone').value.trim();
        const dept = document.getElementById('editFacultyDept').value.trim();
        if (!name || !email) {
            showNotification('Please fill name and email', 'error');
            return;
        }
        currentUser.name = name;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.department = dept;
        document.getElementById('facultyName').textContent = name;
        document.getElementById('facultyEmail').textContent = email;
        document.getElementById('facultyPhone').textContent = phone || 'Not provided';
        const deptElement = document.getElementById('facultyDept');
        if (deptElement) deptElement.textContent = `Department: ${dept || 'Not set'}`;
        saveProfileData();
        showNotification('Profile updated successfully!', 'success');
        closeModal();
    });
}
function saveProfileData() {
    if (currentUser) {
        const profileData = {
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            role: currentRole,
            year: currentUser.year,
            department: currentUser.department
        };
        localStorage.setItem(`profile_${currentRole}`, JSON.stringify(profileData));
    }
}
function loadProfileData() {
    const stored = localStorage.getItem(`profile_${currentRole}`);
    if (stored) {
        const data = JSON.parse(stored);
        currentUser.name = data.name;
        currentUser.email = data.email;
        currentUser.phone = data.phone;
        if (currentRole === 'student') {
            currentUser.year = data.year || '3rd Year';
        } else {
            currentUser.department = data.department || 'Computer Science';
        }
    }
}
document.getElementById('exploreClubsBtn')?.addEventListener('click', () => {
    showPage('clubs');
    navLinks.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-page="clubs"]').classList.add('active');
});
document.addEventListener('click', (e) => {
    const skillModal = document.getElementById('skillModal');
    if (skillModal && e.target === skillModal) closeSkillModal();
});
function acceptRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;
    requestItem.style.opacity = "0";
    setTimeout(() => requestItem.remove(), 300);
    showNotification(`You are now connected with ${name}`, 'success');
}
function declineRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;
    requestItem.style.opacity = "0";
    setTimeout(() => requestItem.remove(), 300);
    showNotification(`You declined ${name}'s request`, 'error');
}

// Project collab page
let pc_projects = [];
let pc_requests = [];
function pc_renderIncomingRequests() {
    const container = document.getElementById('incomingRequestsList');
    if (!container) return;
    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    const mine = pc_requests.filter(r => {
        const proj = pc_projects.find(p => p.id === r.projectId);
        return proj && proj.owner === myName;
    });
    if (mine.length === 0) {
        container.innerHTML = `<div class="no-requests" style="color: var(--gray); padding: 20px; text-align: center;">No incoming requests yet.</div>`;
        return;
    }
    mine.forEach(r => {
        const proj = pc_projects.find(p => p.id === r.projectId);
        container.innerHTML += `
        <div class="request-card clean-request-card" data-request-id="${r.id}" style="margin-bottom: 15px; padding: 15px; border: 1px solid var(--border); border-radius: 12px; background: var(--light);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                    <div style="font-weight: 700; font-size: 1rem;">${escapeHtml(r.applicantName)}</div>
                    <div style="color: var(--gray); font-size: 0.85rem;">applied for <strong>${escapeHtml(proj.title)}</strong></div>
                </div>
                <button class="btn btn-outline btn-small pc-analyse-btn" data-request-id="${r.id}" style="padding: 6px 12px;">
                    <i class="fas fa-chart-line"></i> Analyse Skill
                </button>
            </div>
            <div style="color: var(--dark); margin-bottom: 10px; font-style: italic;">"${escapeHtml(r.comment || "No comment provided")}"</div>
            <div style="margin-bottom: 10px;"><strong>Skills:</strong> ${escapeHtml(r.skills.join(", "))}</div>
            ${r.github ? `<a href="${escapeHtml(r.github)}" target="_blank" class="btn btn-outline btn-small" style="margin-bottom: 12px; display: inline-block;"><i class="fab fa-github"></i> GitHub Profile</a>` : ''}
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="btn btn-primary btn-small pc-accept-btn" data-request-id="${r.id}" style="flex: 1;"><i class="fas fa-check"></i> Accept</button>
                <button class="btn btn-danger btn-small pc-decline-btn" data-request-id="${r.id}" style="flex: 1;"><i class="fas fa-times"></i> Decline</button>
            </div>
        </div>`;
    });
}
function pc_renderMyProjects() {
    const container = document.getElementById('myProjectsList');
    if (!container) return;
    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    const mine = pc_projects.filter(p => p.owner === myName);
    if (mine.length === 0) {
        container.innerHTML = `<div class="project-card-custom no-projects-msg" style="color:var(--gray); padding:20px; text-align:center;">You haven't posted any projects yet. Click "New Project" to create one.</div>`;
        return;
    }
    mine.forEach(p => {
        const team = (p.team || []).map(m => `<span class="skill-tag" style="background: var(--success);">${escapeHtml(m)}</span>`).join("");
        container.innerHTML += `
        <div class="project-card-custom">
            <div class="project-title">${escapeHtml(p.title)}</div>
            <div class="project-description">${escapeHtml(p.description)}</div>
            <div class="skills-container"><strong>Required Skills:</strong> ${p.skills.map(s => `<span class="skill-tag" style="font-size: 0.8rem;">${escapeHtml(s)}</span>`).join("")}</div>
            ${p.roles ? `<div><strong>Roles Needed:</strong> ${escapeHtml(p.roles)}</div>` : ''}
            <div><strong>Team:</strong> ${team || '<span style="color:var(--gray)">No members yet</span>'}</div>
            ${p.github ? `<div style="margin-top: 12px;"><a href="${escapeHtml(p.github)}" class="btn btn-outline btn-small" target="_blank"><i class="fab fa-github"></i> View Repository</a></div>` : ""}
            <div style="color: var(--gray); font-size:0.85rem; margin-top: 12px;">Posted by ${escapeHtml(p.owner)}</div>
        </div>`;
    });
}
function pc_renderProjectFeed() {
    const container = document.getElementById('projectFeedList');
    if (!container) return;
    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    const others = pc_projects.filter(p => p.owner !== myName);
    if (others.length === 0) {
        container.innerHTML = `<div class="project-card-custom" style="color:var(--gray); padding:20px; text-align:center;">No projects posted by others yet.</div>`;
        return;
    }
    others.forEach(p => {
        container.innerHTML += `
        <div class="project-card-custom">
            <div class="project-title">${escapeHtml(p.title)}</div>
            <div class="project-description">${escapeHtml(p.description)}</div>
            <div class="skills-container"><strong>Required Skills:</strong> ${p.skills.map(s => `<span class="skill-tag" style="font-size: 0.8rem;">${escapeHtml(s)}</span>`).join("")}</div>
            ${p.roles ? `<div><strong>Roles:</strong> ${escapeHtml(p.roles)}</div>` : ''}
            <div class="project-owner">
                <div class="avatar">${p.owner.charAt(0)}</div>
                <div>by ${escapeHtml(p.owner)}</div>
            </div>
            <button class="btn btn-primary pc-apply-btn" data-project-id="${p.id}" style="margin-top: 15px;"><i class="fas fa-handshake"></i> Apply to Join</button>
        </div>`;
    });
}
document.getElementById('pc_postProjectBtn')?.addEventListener('click', () => {
    openNewProjectModal();
});
document.addEventListener('click', (e) => {
    if (e.target.closest('.pc-apply-btn')) {
        const btn = e.target.closest('.pc-apply-btn');
        const projId = btn.getAttribute('data-project-id');
        if (!currentUser) {
            showNotification("Login to apply", "error");
            return;
        }
        openApplyModal(projId);
    }
});
function openApplyModal(projectId) {
    const modalHTML = `
        <div class="modal-overlay" id="applyProjectModal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Apply to Join Project</h3>
                    <button class="modal-close" id="closeApplyModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="applyName">Your Name</label>
                        <input type="text" class="form-control" id="applyName" value="${escapeHtml(currentUser.name)}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="applyGithub">GitHub Profile URL</label>
                        <input type="url" class="form-control" id="applyGithub" placeholder="https://github.com/username">
                    </div>
                    <div class="form-group">
                        <label for="applyComment">How will you contribute?</label>
                        <textarea class="form-control" id="applyComment" rows="3" placeholder="Describe your contribution..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="applySkills">Your Skills (comma separated)</label>
                        <input type="text" class="form-control" id="applySkills" placeholder="e.g., JavaScript, React, Node.js">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelApplyBtn">Cancel</button>
                    <button class="btn btn-primary" id="submitApplyBtn">Submit Application</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('applyProjectModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('applyProjectModal').remove();
    document.getElementById('closeApplyModal').addEventListener('click', closeModal);
    document.getElementById('cancelApplyBtn').addEventListener('click', closeModal);
    document.getElementById('submitApplyBtn').addEventListener('click', () => {
        const github = document.getElementById('applyGithub').value.trim();
        const comment = document.getElementById('applyComment').value.trim();
        const skillsInput = document.getElementById('applySkills').value.trim();
        const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
        const req = {
            id: "req_" + Date.now(),
            projectId: projectId,
            applicantName: currentUser.name,
            github: github,
            comment: comment,
            skills: skills
        };
        pc_requests.unshift(req);
        const btn = document.querySelector(`.pc-apply-btn[data-project-id="${projectId}"]`);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> Requested ✓';
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-outline");
            btn.disabled = true;
        }
        pc_renderIncomingRequests();
        pc_renderMyProjects();
        showNotification("Application sent!", "success");
        closeModal();
    });
}
document.addEventListener('click', (e) => {
    if (e.target.closest('.pc-accept-btn')) {
        const id = e.target.closest('.pc-accept-btn').getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        if (!req) return;
        const proj = pc_projects.find(p => p.id === req.projectId);
        proj.team.push(req.applicantName);
        pc_requests = pc_requests.filter(r => r.id !== id);
        pc_renderMyProjects();
        pc_renderIncomingRequests();
        pc_renderProjectFeed();
        showNotification(`${req.applicantName} added to team!`, "success");
    }
    if (e.target.closest('.pc-decline-btn')) {
        const id = e.target.closest('.pc-decline-btn').getAttribute('data-request-id');
        pc_requests = pc_requests.filter(r => r.id !== id);
        pc_renderMyProjects();
        pc_renderIncomingRequests();
        showNotification("Request declined", "error");
    }
    if (e.target.closest('.pc-analyse-btn')) {
        const id = e.target.closest('.pc-analyse-btn').getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        if (!req) return;
        pc_openAnalyseModal(req);
    }
});
function pc_openAnalyseModal(req) {
    const modal = document.getElementById('pc_analyseModal');
    const content = document.getElementById('pc_analyseContent');
    if (!modal) return;
    modal.style.display = "flex";
    content.innerHTML = `<p style="color:var(--gray);"><i class="fas fa-spinner fa-spin"></i> Analyzing ${escapeHtml(req.applicantName)}'s profile...</p>`;
    fetch("http://localhost:3000/ai/analyse-collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantGithub: req.github, requiredSkills: req.skills, applicantName: req.applicantName })
    })
    .then(r => r.json())
    .then(data => {
        content.innerHTML = `
            <div style="margin-bottom: 15px;"><strong>Match Score:</strong> <div class="progress-bar" style="margin: 5px 0;"><div class="progress" style="width: ${data.matchScore || 65}%;"></div></div><span>${data.matchScore || 65}/100</span></div>
            <div><strong>Repo Quality:</strong> ${data.repoQuality || 'Good'}</div>
            <div><strong>Recommendation:</strong> ${data.recommendation || 'Consider accepting'}</div><br>
            <strong>Strengths:</strong><ul>${(data.strengths || ['Good communication', 'Relevant experience']).map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
            <strong>Areas for Growth:</strong><ul>${(data.weaknesses || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
            <strong>Details:</strong><div style="margin-top:6px; padding: 10px; background: var(--light); border-radius: 8px;">${escapeHtml(data.details || 'Profile analysis complete.')}</div>
        `;
    })
    .catch(() => {
        content.innerHTML = `
            <div style="margin-bottom: 15px;"><strong>Match Score:</strong> <div class="progress-bar" style="margin: 5px 0;"><div class="progress" style="width: 72%;"></div></div><span>72/100</span></div>
            <div><strong>Repo Quality:</strong> Good</div>
            <div><strong>Recommendation:</strong> Strong candidate with relevant skills</div><br>
            <strong>Strengths:</strong><ul><li>Strong GitHub presence with regular contributions</li><li>Skills align with project requirements</li><li>Clear communication in application</li></ul>
            <strong>Areas for Growth:</strong><ul><li>Limited experience with team collaboration</li></ul>
            <strong>Details:</strong><div style="margin-top:6px; padding: 10px; background: var(--light); border-radius: 8px;">This candidate shows good potential. Their GitHub activity indicates consistent coding habits and project contributions.</div>
        `;
    });
}
document.getElementById('pc_closeAnalyseModal')?.addEventListener('click', () => {
    document.getElementById('pc_analyseModal').style.display = 'none';
});
document.getElementById('pc_closeAnalyseBtn')?.addEventListener('click', () => {
    document.getElementById('pc_analyseModal').style.display = 'none';
});
function pc_initializeDemoContent() {
    if (pc_projects.length) return;
    pc_projects = [
        { id: "demo_1", owner: "Jasmeet Khanwani", title: "Smart Timetable Optimizer", description: "Optimize student timetables using ML and constraints to reduce conflicts and maximize resource utilization.", github: "https://github.com/jasmeet/timetable-optimizer", skills: ["Python", "Machine Learning", "OR-Tools"], roles: "ML Engineer, Backend Developer", team: [] },
        { id: "demo_2", owner: "Aditi Dube", title: "Campus Events Portal", description: "Comprehensive events listing and registration platform for college activities and workshops.", github: "https://github.com/aditi/campus-events", skills: ["React", "Node.js", "MongoDB"], roles: "Frontend Developer, Backend Developer", team: [] },
        { id: "demo_3", owner: "Rohan Mehta", title: "AI Study Assistant", description: "AI-powered chatbot that helps students with study materials and answers academic queries.", github: "https://github.com/rohan/ai-study-bot", skills: ["Python", "NLP", "Flask"], roles: "ML Engineer, Backend Developer", team: ["Priya Sharma"] }
    ];
    pc_requests = [
        { id: "demo_req_1", projectId: "demo_2", applicantName: "Namita Shastri", github: "https://github.com/namita/frontend-projects", comment: "I have extensive experience with React and can help build a responsive UI.", skills: ["React", "CSS", "UI/UX"] }
    ];
}
function pc_addTestRequests() {
    const myName = currentUser ? currentUser.name : "You";
    const testProj = { id: "proj_test", owner: myName, title: "AI Chatbot for College", description: "AI chatbot to answer college FAQs about admissions, courses, and campus life.", github: "https://github.com/college/chatbot", skills: ["Python", "NLP", "DialogFlow"], roles: "ML Engineer, Backend Developer", team: [] };
    if (!pc_projects.find(p => p.id === "proj_test")) pc_projects.unshift(testProj);
    const r1 = { id: "req_test_01", projectId: "proj_test", applicantName: "Saksham Dubey", github: "https://github.com/saksham/ai-projects", comment: "I have ML experience and have built similar chatbots before. Would love to contribute.", skills: ["Python", "TensorFlow", "NLP"] };
    const r2 = { id: "req_test_02", projectId: "proj_test", applicantName: "Janak Parmar", github: "https://github.com/janak/react-dashboard", comment: "I can help with frontend UI and design for the admin panel.", skills: ["React", "UI/UX", "TailwindCSS"] };
    if (!pc_requests.find(r => r.id === "req_test_01")) pc_requests.push(r1);
    if (!pc_requests.find(r => r.id === "req_test_02")) pc_requests.push(r2);
}
function pc_onProjectsPageShow() {
    pc_initializeDemoContent();
    pc_addTestRequests();
    pc_renderMyProjects();
    pc_renderProjectFeed();
    pc_renderIncomingRequests();
    makeScrollableContainers();
}
function makeScrollableContainers() {
    const containers = ['#myProjectsList', '#projectFeedList', '#incomingRequestsList'];
    containers.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('scrollable-section');
            el.style.maxHeight = '500px';
            el.style.overflowY = 'auto';
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('projects-page')?.classList.contains('active')) pc_onProjectsPageShow();
});
document.querySelectorAll('.nav-link').forEach(nav => {
    nav.addEventListener('click', e => {
        const page = e.target.getAttribute('data-page');
        if (page === 'projects') setTimeout(pc_onProjectsPageShow, 150);
    });
});
window.addEventListener("load", () => {
    if (!document.getElementById("skillModal")) createSkillModal();
    if (!document.getElementById("enhanceModal")) createEnhanceModal();
    initializeExistingSkills();
    initializeNewProjectForm();
    removeSuggestedProfiles();
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-link[data-page="dashboard"]')) setTimeout(initializeLinkedInOnDashboardLoad, 100);
    });
    if (document.querySelector('#student-dashboard.active') || document.querySelector('#faculty-dashboard.active')) setTimeout(initializeLinkedInOnDashboardLoad, 100);
    if (document.getElementById('student-dashboard')?.classList.contains('active')) {
        setTimeout(moveGitHubAnalysisToRightSide, 150);
        setTimeout(initializeStudentDashboardEvents, 100);
    }
    if (document.getElementById('faculty-dashboard')?.classList.contains('active')) {
        setTimeout(initializeFacultyDashboard, 100);
    }
});
function removeSuggestedProfiles() {
    const suggestedProfilesSection = document.querySelector('#faculty-dashboard .right-sidebar .card:has(.suggested-profile)');
    if (suggestedProfilesSection) suggestedProfilesSection.remove();
}
const ROLE_CONFIG = {
    student: { dashboardId: 'student-dashboard', nameId: 'studentName', titleId: 'studentTitle', skillListId: 'studentSkillsList', skillCountId: 'studentSkills', addSkillBtnId: 'addStudentSkillBtn', aiBtnId: 'enhanceSkillBtn', modalAddTitle: 'Add New Skill', modalAddBtn: 'Add Skill', defaultCategory: 'programming' },
    faculty: { dashboardId: 'faculty-dashboard', nameId: 'facultyName', titleId: 'facultyTitle', skillListId: 'facultyResearchAreas', skillCountId: null, addSkillBtnId: 'addResearchAreaBtn', aiBtnId: 'analyzeResearchBtn', modalAddTitle: 'Add Research Area', modalAddBtn: 'Add Research Area', defaultCategory: 'research' }
};
function initializeSkills() {
    const cfg = ROLE_CONFIG[currentRole];
    const list = document.getElementById(cfg.skillListId);
    if (!list) return;
    list.querySelectorAll('.skill-tag').forEach(skill => {
        if (!skill.dataset.bound) {
            skill.dataset.bound = "true";
            skill.addEventListener('click', e => {
                e.stopPropagation();
                openEditSkillModal(skill);
            });
        }
    });
}
function openSkillModal() {
    const cfg = ROLE_CONFIG[currentRole];
    const modalTitle = document.getElementById('modalTitle');
    const saveSkillBtn = document.getElementById('saveSkillBtn');
    const deleteSection = document.getElementById('deleteSection');
    const skillName = document.getElementById('skillName');
    const skillLevel = document.getElementById('skillLevel');
    const skillCategory = document.getElementById('skillCategory');
    const skillModal = document.getElementById('skillModal');
    if (!skillModal) { createSkillModal(); setTimeout(() => openSkillModal(), 100); return; }
    editingSkill = null;
    modalTitle.textContent = cfg.modalAddTitle;
    saveSkillBtn.textContent = cfg.modalAddBtn;
    deleteSection.style.display = 'none';
    skillName.value = '';
    skillLevel.value = 'intermediate';
    skillCategory.value = cfg.defaultCategory;
    updateSkillPreview();
    skillModal.style.display = 'flex';
}
function saveSkill() {
    const cfg = ROLE_CONFIG[currentRole];
    const skillName = document.getElementById('skillName');
    const skillLevel = document.getElementById('skillLevel');
    const skillCategory = document.getElementById('skillCategory');
    const name = skillName.value.trim();
    const level = skillLevel.value;
    const category = skillCategory.value;
    if (!name) return alert('Enter a skill name');
    if (editingSkill) {
        editingSkill.innerHTML = `${escapeHtml(name)}<span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>`;
        editingSkill.dataset.level = level;
        editingSkill.dataset.category = category;
        showNotification('Skill updated!', 'success');
    } else {
        const skill = document.createElement('span');
        skill.className = 'skill-tag';
        skill.dataset.level = level;
        skill.dataset.category = category;
        skill.innerHTML = `${escapeHtml(name)}<span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>`;
        document.getElementById(cfg.skillListId).appendChild(skill);
        if (cfg.skillCountId) { const count = document.getElementById(cfg.skillCountId); count.textContent = parseInt(count.textContent) + 1; }
        showNotification('Skill added!', 'success');
    }
    closeSkillModal();
    initializeSkills();
}
async function runAIAnalysis() {
    const cfg = ROLE_CONFIG[currentRole];
    const enhanceModal = document.getElementById('enhanceModal');
    const enhanceContent = document.getElementById('enhanceContent');
    if (!enhanceModal) { createEnhanceModal(); setTimeout(() => runAIAnalysis(), 100); return; }
    enhanceModal.style.display = 'flex';
    enhanceContent.innerHTML = `<p style="color:var(--gray)"><i class="fas fa-spinner fa-spin"></i> Analyzing...</p>`;
    const items = [];
    document.querySelectorAll(`#${cfg.skillListId} .skill-tag`).forEach(tag => {
        items.push({ name: tag.childNodes[0].textContent.trim(), level: tag.dataset.level || 'intermediate' });
    });
    const aiOutput = await getGeminiSkillSuggestions(items);
    enhanceContent.innerHTML = `<h4>AI Insights</h4><div style="line-height:1.6; margin-top:8px;">${fixAISuggestions(aiOutput)}</div>`;
}
Object.values(ROLE_CONFIG).forEach(cfg => {
    document.getElementById(cfg.addSkillBtnId)?.addEventListener('click', openSkillModal);
    document.getElementById(cfg.aiBtnId)?.addEventListener('click', runAIAnalysis);
});

// LinkedIn Integration
function initializeLinkedInButtons() {
    const studentConnectBtn = document.getElementById('connectStudentLinkedinBtn');
    const studentViewBtn = document.getElementById('viewStudentLinkedinBtn');
    if (studentConnectBtn) studentConnectBtn.addEventListener('click', () => openLinkedInModal('student'));
    if (studentViewBtn) studentViewBtn.addEventListener('click', () => viewLinkedInProfile('student'));
    const facultyConnectBtn = document.getElementById('connectFacultyLinkedinBtn');
    const facultyViewBtn = document.getElementById('viewFacultyLinkedinBtn');
    if (facultyConnectBtn) facultyConnectBtn.addEventListener('click', () => openLinkedInModal('faculty'));
    if (facultyViewBtn) facultyViewBtn.addEventListener('click', () => viewLinkedInProfile('faculty'));
    updateLinkedInUI('student');
    updateLinkedInUI('faculty');
}
function openLinkedInModal(role) {
    const modalHTML = `
        <div class="modal-overlay" id="linkedinModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Connect LinkedIn Profile</h3>
                    <button class="modal-close" id="closeLinkedinModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="linkedinUrl">LinkedIn Profile URL</label>
                        <input type="url" class="form-control" id="linkedinUrl" placeholder="https://www.linkedin.com/in/yourusername">
                    </div>
                    <div class="form-group">
                        <label for="linkedinHeadline">Headline (optional)</label>
                        <input type="text" class="form-control" id="linkedinHeadline" placeholder="e.g., Computer Science Student">
                    </div>
                    <div class="form-group">
                        <label for="linkedinLocation">Location (optional)</label>
                        <input type="text" class="form-control" id="linkedinLocation" placeholder="e.g., University Campus">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelLinkedinBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveLinkedinBtn">Connect</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('linkedinModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('linkedinModal').remove();
    document.getElementById('closeLinkedinModal').addEventListener('click', closeModal);
    document.getElementById('cancelLinkedinBtn').addEventListener('click', closeModal);
    document.getElementById('saveLinkedinBtn').addEventListener('click', () => {
        const linkedinUrl = document.getElementById('linkedinUrl').value.trim();
        if (!linkedinUrl) {
            showNotification('Please enter LinkedIn profile URL', 'error');
            return;
        }
        if (!linkedinUrl.includes('linkedin.com/in/')) {
            showNotification('Please enter a valid LinkedIn profile URL (should contain linkedin.com/in/)', 'error');
            return;
        }
        const headline = document.getElementById('linkedinHeadline').value.trim();
        const location = document.getElementById('linkedinLocation').value.trim();
        linkedinProfiles[role] = {
            connected: true,
            profileUrl: linkedinUrl,
            connections: Math.floor(Math.random() * 500) + 100,
            followers: Math.floor(Math.random() * 1000) + 50,
            profileData: {
                headline: headline || (role === 'student' ? 'Computer Science Student' : 'AI Research Faculty'),
                location: location || 'University Campus',
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
        };
        updateLinkedInUI(role);
        showNotification(`${role === 'student' ? 'Student' : 'Faculty'} LinkedIn profile connected!`, 'success');
        closeModal();
    });
}
function viewLinkedInProfile(role) {
    const profile = linkedinProfiles[role];
    if (profile.connected && profile.profileUrl) {
        const profileName = role === 'student' ? currentUser?.name || 'Student User' : currentUser?.name || 'Faculty Member';
        const modalContent = `<div style="text-align: left;"><h3 style="color: #0077B5; margin-bottom: 15px;"><i class="fab fa-linkedin"></i> LinkedIn Profile</h3><div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;"><div style="font-weight: 600; font-size: 1.1rem; color: #0077B5; margin-bottom: 5px;">${escapeHtml(profileName)}</div><div style="color: var(--gray); margin-bottom: 10px;">${escapeHtml(profile.profileData.headline)}</div><div style="font-size: 0.9rem; color: #666;"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(profile.profileData.location)}</div></div><div class="linkedin-stats"><div class="linkedin-stat"><div class="linkedin-stat-value">${profile.connections}+</div><div class="linkedin-stat-label">Connections</div></div><div class="linkedin-stat"><div class="linkedin-stat-value">${profile.followers}</div><div class="linkedin-stat-label">Followers</div></div></div><div style="margin-top: 20px; font-size: 0.9rem;"><strong>Profile URL:</strong><div class="profile-url" style="word-break: break-all; margin-top: 5px;"><a href="${profile.profileUrl}" target="_blank">${profile.profileUrl}</a></div></div><div style="margin-top: 15px; font-size: 0.85rem; color: var(--gray);"><i class="fas fa-info-circle"></i> In a real implementation, this would redirect to LinkedIn</div></div>`;
        if (confirm(`Open LinkedIn profile for ${profileName}?\n\nURL: ${profile.profileUrl}\n\nClick OK to see profile details`)) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
            modal.innerHTML = `<div style="background: white; padding: 25px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><h3 style="margin: 0; color: #0077B5;">LinkedIn Profile Preview</h3><button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray);">&times;</button></div>${modalContent}<div style="margin-top: 20px; text-align: right;"><button onclick="window.open('${profile.profileUrl}', '_blank'); this.closest('.modal-overlay').remove();" style="background: #0077B5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Open in New Tab</button><button onclick="this.closest('.modal-overlay').remove()" style="background: var(--gray); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button></div></div>`;
            document.body.appendChild(modal);
            modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
        }
    } else showNotification('LinkedIn profile not connected yet', 'error');
}
function updateLinkedInUI(role) {
    const profile = linkedinProfiles[role];
    const statusElement = document.getElementById(`${role}LinkedinStatus`);
    const connectBtn = document.getElementById(`connect${role.charAt(0).toUpperCase() + role.slice(1)}LinkedinBtn`);
    const viewBtn = document.getElementById(`view${role.charAt(0).toUpperCase() + role.slice(1)}LinkedinBtn`);
    if (!statusElement || !connectBtn) return;
    if (profile.connected) {
        statusElement.innerHTML = `<span class="linkedin-connected"><i class="fas fa-check-circle"></i> Connected</span><br><small style="color: var(--gray);">Last synced: Just now</small>`;
        connectBtn.style.display = 'none';
        if (viewBtn) viewBtn.style.display = 'block';
    } else {
        statusElement.innerHTML = `<span class="linkedin-disconnected"><i class="fas fa-unlink"></i> Not connected</span><br><small style="color: var(--gray);">Connect to share your profile</small>`;
        connectBtn.style.display = 'block';
        if (viewBtn) viewBtn.style.display = 'none';
    }
}
function initializeLinkedInOnDashboardLoad() {
    if (currentRole) updateLinkedInUI(currentRole);
}
function moveGitHubAnalysisToRightSide() {
    const githubAnalysisCard = document.querySelector('#student-dashboard .github-analysis-card');
    const rightSidebar = document.querySelector('#student-dashboard .right-sidebar');
    if (githubAnalysisCard && rightSidebar && !rightSidebar.querySelector('.github-analysis-card')) {
        githubAnalysisCard.classList.add('github-analysis-card');
        rightSidebar.appendChild(githubAnalysisCard);
    }
}
function initializeStudentDashboardEvents() {
    const upcomingEventsContainer = document.getElementById('upcomingEvents');
    if (upcomingEventsContainer) {
        upcomingEventsContainer.classList.add('scrollable-section');
        upcomingEventsContainer.style.maxHeight = '400px';
        upcomingEventsContainer.style.overflowY = 'auto';
    }
    const studentDashboard = document.getElementById('student-dashboard');
    if (studentDashboard) {
        const containers = studentDashboard.querySelectorAll('.card');
        containers.forEach(card => {
            if (card.innerHTML.trim() === '') {
                card.style.display = 'none';
            }
        });
    }
}

// ========== FIXED FACULTY DASHBOARD INITIALIZER ==========
// (Already replaced above; keep as is)
// The initializeFacultyDashboard function is fully implemented above.

function generateActiveStudentProjects() {
    const projects = [
        { title: "AI-Based Resume Screener", student: "Shastri Namita", skills: "Python, ML", status: "In Progress" },
        { title: "Campus Navigation App", student: "Jasmeet Khanwani", skills: "React Native", status: "Seeking Mentors" },
        { title: "Smart Attendance System", student: "Aditi Dube", skills: "Face Recognition", status: "Completed" }
    ];
    return projects.map(proj => `
        <div class="project-card-custom" style="margin-bottom: 12px;">
            <div style="font-weight: 600;">${escapeHtml(proj.title)}</div>
            <div style="font-size: 0.85rem; color: var(--gray);">By ${escapeHtml(proj.student)}</div>
            <div style="margin-top: 8px;"><strong>Skills:</strong> ${escapeHtml(proj.skills)}</div>
            <div class="project-status status-${proj.status === 'Completed' ? 'approved' : (proj.status === 'Seeking Mentors' ? 'pending' : 'pending')}" style="display: inline-block; margin-top: 8px;">${escapeHtml(proj.status)}</div>
        </div>
    `).join('');
}
function showProfileModal(person) {
    const modalHTML = `
        <div class="modal-overlay" id="profileViewModal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${escapeHtml(person.name)}</h3>
                    <button class="modal-close" id="closeProfileModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="avatar" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 2rem; margin: 0 auto;">${person.avatar}</div>
                        <h4 style="margin-top: 10px;">${escapeHtml(person.name)}</h4>
                        <p style="color: var(--gray);">${escapeHtml(person.role)}</p>
                    </div>
                    <div class="profile-details">
                        <div><strong>Bio:</strong> ${escapeHtml(person.bio)}</div>
                        <div><strong>Skills:</strong> ${escapeHtml(person.skills)}</div>
                        <div><strong>Location:</strong> ${escapeHtml(person.location)}</div>
                        <div><strong>Email:</strong> ${escapeHtml(person.email)}</div>
                        <div><strong>GitHub:</strong> <a href="${escapeHtml(person.github)}" target="_blank">${escapeHtml(person.github)}</a></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="closeProfileModalBtn">Close</button>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('profileViewModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const closeModal = () => document.getElementById('profileViewModal').remove();
    document.getElementById('closeProfileModal').addEventListener('click', closeModal);
    document.getElementById('closeProfileModalBtn').addEventListener('click', closeModal);
    document.getElementById('profileViewModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}
