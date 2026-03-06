import { randomUUID } from "crypto";





const adminCredentials = {
    username: (process.env.ADMIN_USERNAME),
    password: (process.env.ADMIN_PASSWORD),
};

const activeAdminTokens = new Set();




export async function adminLogin(req, res) {
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

export async function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token || !activeAdminTokens.has(token)) {
        res.status(401).json({ error: "Admin login required" });
        return;
    }

    next();
}