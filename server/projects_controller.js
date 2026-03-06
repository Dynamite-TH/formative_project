import fs from "fs";


const projects = JSON.parse(fs.readFileSync('server/projects.json'), 'utf-8');
projects.forEach((project, index) => {
    if (!project.id) {
        project.id = index + 1;
    }
});

export async function getProjects(req, res) {
    res.json(projects);
}

export async function getProject(req, res) {
    for (const project of projects) {
        if (project.id === parseInt(req.params.id)) {
            res.status(201).json(project);
            return;
        }
    }
    res.status(404).json({ error: "Project not found" });
}

export async function addProject(req, res) {
    const newProject = {
        id: projects.length + 1,
        name: req.body.name,
        description: req.body.description,
        skills: Array.isArray(req.body.skills) ? req.body.skills : []
    };
    projects.push(newProject);
    res.status(201).json(newProject);
}