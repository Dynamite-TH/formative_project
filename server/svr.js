import express from "express";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const app = express();


app.use(express.static('webpage'));

import * as dotenv from 'dotenv';

dotenv.config({ path: ('server/config.env') });
const process_options = {
    port: process.env.PROCESS_PORT || 8080
};

const adminCredentials = {
    username: (process.env.ADMIN_USERNAME),
    password: (process.env.ADMIN_PASSWORD),
};

const activeAdminTokens = new Set();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsFilePath = path.join(__dirname, "projects.json");
const projects = JSON.parse(fs.readFileSync(projectsFilePath, "utf8"));

async function getprojects(req, res) {
    res.json(projects);
}


async function getproject(req, res) {
    for (const project of projects) {
        if (project.id === parseInt(req.params.id)) {
            res.status(201).json(project);
            return;
        }
    }
    res.status(404).json({ error: "Project not found" });
}

async function addproject(req, res) {
    const newProject = {
        id: projects.length + 1,
        name: req.body.name,
        description: req.body.description,
        skills: Array.isArray(req.body.skills) ? req.body.skills : []
    };
    projects.push(newProject);
    res.status(201).json(newProject);
}

async function adminLogin(req, res) {
    const username = (req.body?.username || "").trim();
    const password = (req.body?.password || "").trim();

    if (username !== adminCredentials.username || password !== adminCredentials.password) {
        res.status(401).json({ error: "Invalid admin credentials" });
        return;
    }

    const token = randomUUID();
    activeAdminTokens.add(token);
    res.json({ token });
}

async function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token || !activeAdminTokens.has(token)) {
        res.status(401).json({ error: "Admin login required" });
        return;
    }

    next();
}

app.get("/api/projects", getprojects);
app.get("/api/projects/:id", getproject);
app.post("/api/admin/login", express.json(), adminLogin);
app.post("/api/projects", express.json(), requireAdmin, addproject);
app.listen(process_options.port, () => {
    console.log(`Server is running on port ${process_options.port}`);
});

