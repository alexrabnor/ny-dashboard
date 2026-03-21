import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import fs from "fs/promises";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// GitHub OAuth Routes
app.get("/api/auth/github/url", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
  res.json({ url });
});

app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = response.data;
    if (access_token) {
      res.cookie("github_token", access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>GitHub ansluten. Detta fönster stängs automatiskt.</p>
          </body>
        </html>
      `);
    } else {
      res.status(400).send("Kunde inte hämta access token.");
    }
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.status(500).send("Ett fel uppstod vid GitHub-anslutning.");
  }
});

app.get("/api/github/repos", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    return res.status(401).json({ error: "Inte ansluten till GitHub" });
  }

  try {
    const response = await axios.get("https://api.github.com/user/repos?sort=updated&per_page=10", {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("GitHub API error:", error);
    res.status(500).json({ error: "Kunde inte hämta repos" });
  }
});

app.get("/api/github/user", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) {
    return res.status(401).json({ error: "Inte ansluten" });
  }

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta användare" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("github_token");
  res.json({ success: true });
});

// Docker API (Mocked/Basic)
app.get("/api/docker/containers", async (req, res) => {
  try {
    // In a real server, we'd use 'docker ps -a --format "{{json .}}"'
    // For this demo, we'll return some mock data if docker is not available
    try {
      const { stdout } = await execPromise('docker ps -a --format "{\"id\":\"{{.ID}}\",\"name\":\"{{.Names}}\",\"image\":\"{{.Image}}\",\"status\":\"{{.Status}}\",\"state\":\"{{.State}}\"}"');
      const containers = stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
      res.json(containers);
    } catch (e) {
      // Fallback mock data for demo
      res.json([
        { id: "d1f2e3a4b5c6", name: "nginx-proxy", image: "nginx:latest", status: "Up 2 hours", state: "running" },
        { id: "a1b2c3d4e5f6", name: "alex-core-db", image: "postgres:15", status: "Up 5 hours", state: "running" },
        { id: "f6e5d4c3b2a1", name: "redis-cache", image: "redis:alpine", status: "Exited (0) 10 minutes ago", state: "exited" }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta containrar" });
  }
});

app.post("/api/docker/action", async (req, res) => {
  const { id, action } = req.body;
  // In a real server: await execPromise(`docker ${action} ${id}`);
  res.json({ success: true, message: `Container ${id} ${action}ed` });
});

// File Manager API
app.get("/api/files/list", async (req, res) => {
  const dirPath = (req.query.path as string) || ".";
  const absolutePath = path.resolve(process.cwd(), dirPath);

  // Security check: only allow browsing within the app directory
  if (!absolutePath.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const entries = await fs.readdir(absolutePath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      size: 0, // Would need fs.stat for real size
      path: path.join(dirPath, entry.name)
    }));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte läsa mapp" });
  }
});

app.get("/api/files/read", async (req, res) => {
  const filePath = req.query.path as string;
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!absolutePath.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const content = await fs.readFile(absolutePath, "utf-8");
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: "Kunde inte läsa fil" });
  }
});

app.post("/api/files/write", async (req, res) => {
  const { path: filePath, content } = req.body;
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!absolutePath.startsWith(process.cwd())) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await fs.writeFile(absolutePath, content, "utf-8");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Kunde inte spara fil" });
  }
});

// Terminal API
app.post("/api/terminal/exec", async (req, res) => {
  const { command } = req.body;
  
  // Basic security: avoid some dangerous commands
  const forbidden = ["rm -rf /", "mkfs", "dd"];
  if (forbidden.some(f => command.includes(f))) {
    return res.status(403).json({ error: "Forbidden command" });
  }

  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
    res.json({ output: stdout || stderr });
  } catch (error: any) {
    res.json({ output: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
