import express from "express";

import { getProjects, getProject, addProject } from "./projects_controller.js";
import { adminLogin, requireAdmin } from "./admin.js";
const app = express();

import * as dotenv from 'dotenv';

dotenv.config({ path: ('server/config.env') });
const process_options = {
    port: process.env.PROCESS_PORT || 8080
};

app.use(express.static('webpage'));


app.get("/api/projects", getProjects);
app.get("/api/projects/:id", getProject);
app.post("/api/admin/login", express.json(), adminLogin);
app.post("/api/projects", express.json(), requireAdmin, addProject);
app.listen(process_options.port, () => {
    console.log(`Server is running on port ${process_options.port}`);
});

