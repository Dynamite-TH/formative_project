const el = {};
let adminToken = '';

/* Remove all contents from a given element */
function removeContentFrom(what) {
    what.textContent = '';
}

/* Add an array of projects to the page */
function showProjects(projects, where) {
    for (const project of projects) {
        const li = document.createElement('button');
        li.type = 'button';
        li.textContent = project.name;
        li.dataset.id = project.id;
        li.classList.add('project');
        li.addEventListener('click', () => openProjectModal(project));
        where.append(li);
    }
}

function openProjectModal(project) {
    el.modalTitle.textContent = project.name ?? 'Untitled';
    el.modalDescription.textContent = project.description ?? 'Not provided';
    el.modalSkills.textContent = Array.isArray(project.skills)
        ? (project.skills.join(', ') || 'Not provided')
        : (project.skills || 'Not provided');
    el.modal.classList.remove('hidden');
}

function closeProjectModal() {
    el.modal.classList.add('hidden');
}

function showAdminPassword() {
    el.adminPassword.type = 'text';
}

function hideAdminPassword() {
    el.adminPassword.type = 'password';
}

/** Use fetch to post a JSON project to the server */
async function sendProject() {
    if (el.name.value.trim() === '' || el.description.value.trim() === '') {
        el.error.textContent = 'Project name and description cannot be empty';
        return;
    }

    const payload = {
        name: el.name.value.trim(),
        description: el.description.value.trim(),
        skills: el.skills.value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
    };

    const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        el.error.textContent = '';
        el.name.value = '';
        el.description.value = '';
        el.skills.value = '';
        await loadProjects();
    } else {
        el.error.textContent = 'Failed to save project. Check admin login.';
    }
}

async function adminLogin() {
    const username = el.adminUsername.value.trim();
    const password = el.adminPassword.value.trim();

    if (!username || !password) {
        el.error.textContent = 'Enter admin username and password';
        return;
    }

    const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        adminToken = '';
        el.send.disabled = true;
        el.adminControls.classList.add('hidden');
        el.error.textContent = 'Invalid admin credentials';
        return;
    }

    const result = await response.json();
    adminToken = result.token;
    el.send.disabled = false;
    el.adminControls.classList.remove('hidden');
    el.adminlogout.classList.remove('hidden');
    el.error.textContent = 'Admin login successful';
    el.adminPassword.value = '';
}

function prepareHandles() {
    const selectors = [
        '#projects',
        '#admin_username',
        '#admin_password',
        '#toggleAdminPassword',
        '#adminLogin',
        '#adminLogout',
        '#admin-controls',
        '#project_name',
        '#description',
        '#skills',
        '#addProject',
        '#error-message',
        '#project-modal',
        '#modal-close',
        '#modal-title',
        '#modal-description',
        '#modal-skills'

    ];

    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element not found for selector: ${selector}`);
        }
    });
    el.projects = document.querySelector('#projects');
    el.adminUsername = document.querySelector('#admin_username');
    el.adminPassword = document.querySelector('#admin_password');
    el.toggleAdminPassword = document.querySelector('#toggleAdminPassword');
    el.adminLogin = document.querySelector('#adminLogin');
    el.adminlogout = document.querySelector('#adminLogout');


    el.adminControls = document.querySelector('#admin-controls');
    el.name = document.querySelector('#project_name');
    el.description = document.querySelector('#description');
    el.skills = document.querySelector('#skills');
    el.send = document.querySelector('#addProject');
    el.error = document.querySelector('#error-message');

    el.modal = document.querySelector('#project-modal');
    el.modalClose = document.querySelector('#modal-close');
    el.modalTitle = document.querySelector('#modal-title');
    el.modalDescription = document.querySelector('#modal-description');
    el.modalSkills = document.querySelector('#modal-skills');

    el.send.disabled = true;
    el.adminControls.classList.add('hidden');
}

function addEventListeners() {
    el.adminLogin.addEventListener('click', adminLogin);
    el.adminlogout.addEventListener('click', () => {
        adminToken = '';
        el.send.disabled = true;
        el.adminlogout.classList.add('hidden');
        el.adminControls.classList.add('hidden');
        el.error.textContent = 'Admin logged out';
        setInterval(() => { el.error.textContent = ''; }, 3000);
    });
    el.adminUsername.addEventListener('keyup', checkKeys);
    el.adminPassword.addEventListener('keyup', checkKeys);
    el.toggleAdminPassword.addEventListener('mousedown', showAdminPassword);
    el.toggleAdminPassword.addEventListener('mouseup', hideAdminPassword);
    el.toggleAdminPassword.addEventListener('mouseleave', hideAdminPassword);
    el.toggleAdminPassword.addEventListener('touchstart', showAdminPassword);
    el.toggleAdminPassword.addEventListener('touchend', hideAdminPassword);
    el.toggleAdminPassword.addEventListener('touchcancel', hideAdminPassword);
    el.send.addEventListener('click', sendProject);
    el.name.addEventListener('keyup', checkKeys);
    el.description.addEventListener('keyup', checkKeys);
    el.skills.addEventListener('keyup', checkKeys);

    el.modalClose.addEventListener('click', closeProjectModal);
    el.modal.addEventListener('click', (e) => {
        if (e.target === el.modal) closeProjectModal();
    });
}

function checkKeys(event) {
    if (event.key === 'Enter') {
        if (event.target === el.adminUsername || event.target === el.adminPassword) {
            adminLogin();
            return;
        }

        sendProject();
    }
}

async function loadProjects() {
    const response = await fetch('/api/projects');

    if (!response.ok) {
        el.error.textContent = 'Failed to load projects';
        return;
    }

    const projects = await response.json();
    removeContentFrom(el.projects);

    if (!Array.isArray(projects) || projects.length === 0) {
        const empty = document.createElement('li');
        empty.classList.add('project');
        empty.textContent = 'No Projects Yet';
        el.projects.append(empty);
        return;
    }

    showProjects(projects, el.projects);
}

function pageLoaded() {
    prepareHandles();
    addEventListeners();
    loadProjects();
}

// deprecated in favour of using defer in the script tag
// window.addEventListener('load', pageLoaded);
pageLoaded();
