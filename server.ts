import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import axios from "axios";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { APPS, GAMES, SHARED_APPS } from "./src/constants";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

app.use(express.json());
app.use(cookieParser());

// Lösenord för den skyddade kategorin "Övriga appar"
const PRIVATE_PASS = process.env.DASHBOARD_PASS;

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Personliga appar – listan finns ENDAST här på servern och skickas aldrig
// med i den publika webb-bundlen. Den lämnas bara ut efter korrekt lösenord.
const PRIVATE_APPS = [
  {
    id: "drickamindre",
    title: "Drickamindre",
    description: "Coach för ölvanor med pengarna som drivkraft. Ett tryck loggar en öl ur typkatalogen (lager till QIPA), appen räknar om till standardglas och visar veckoringen mot målet. Hjältesiffran är kronorna du sparat mot sommarens takt – grön yta mellan baslinjen och verkligheten.",
    icon: "🍺",
    category: "Hälsa",
    tags: ["React", "Vite", "Express", "Directus", "Docker"],
    imageSeed: "drickamindre",
    status: "active",
    createdAt: "2026-08-05T00:00:00Z",
    type: "Web App",
    url: "https://drickamindre.alexcloud.se",
    banner: "linear-gradient(135deg, #1b1815, #b8892c)",
    bannerEmoji: "🍺",
  },
  {
    id: "halsa",
    title: "Hälsa – magdagbok",
    description: "Privat dagbok för magbesvär vid kolostomi. Registrerar skov med daglig smärtskattning, konsistens, gasbildning, tömningar och stopp-flagga – plus vad som åts och dracks dygnet innan. Jämför mot en personlig baslinje och skriver ut en A4-sammanställning till läkaren.",
    icon: "🫀",
    category: "Hälsa",
    tags: ["Express", "SQLite", "PWA", "Docker"],
    imageSeed: "halsa",
    status: "active",
    createdAt: "2026-08-03T00:00:00Z",
    type: "Web App",
    url: "https://halsa.alexcloud.se",
    banner: "linear-gradient(135deg, #33291f, #c2643f)",
    bannerEmoji: "🌿",
  },
  {
    id: "familjeresor",
    title: "Familjeresor",
    description: "Redaktionellt reseminnesarkiv för familjens sommarresor – hjältebanner för senaste resan, kort för alla resmål och en berättande sida per plats med galleri på upp till 50 bilder, lightbox, karta och egen stämningsanimation per resmål.",
    icon: "🏖️",
    category: "Resor",
    tags: ["Express", "Sharp", "Leaflet", "Docker"],
    imageSeed: "familjeresor",
    status: "active",
    createdAt: "2026-07-25T20:00:00Z",
    type: "Web App",
    url: "https://familjeresor.alexcloud.se",
    banner: "linear-gradient(135deg, #211c15, #2f6b5c)",
    bannerEmoji: "🏖️",
  },
  {
    id: "coach",
    title: "Alex – AI-coach",
    description: "Personlig AI-hälsocoach som planerar veckan runt golf och padel, anpassar träningen efter dagsform (höft/astma), loggar vikt och peppar varje dag. Snabb morgon-incheckning och en coach som aldrig ger dåligt samvete.",
    icon: "🌿",
    category: "Hälsa",
    tags: ["Next.js", "TypeScript", "OpenAI", "Directus", "PWA"],
    imageSeed: "coach",
    status: "active",
    createdAt: "2026-06-13T18:00:00Z",
    type: "Web App",
    url: "https://coach.alexcloud.se",
    banner: "linear-gradient(135deg, #6D7D5F, #C6795A)",
    bannerEmoji: "💚",
  },
  {
    id: "trogir-guiden",
    title: "Trogir-guiden",
    description: "Personlig reseguide för Klara & Ulrikas resa till Trogir, Kroatien 31 juli–7 augusti 2026. Kurerade tips på konobas, zipline, öturer och stränder – med hjärtmarkering per person och GetYourGuide-bokning.",
    icon: "⛵",
    category: "Resor",
    tags: ["Node.js", "Express", "GetYourGuide", "Docker"],
    imageSeed: "trogir",
    status: "active",
    createdAt: "2026-06-12T17:00:00Z",
    type: "Web App",
    url: "https://trogir.alexcloud.se",
    banner: "linear-gradient(135deg, #1273a6, #2ec4b6)",
    bannerEmoji: "🇭🇷",
  },
  {
    id: "filsamlare",
    title: "Filsamlare",
    description: "Dra och släpp filer rakt in på servern – eller klicka för att ladda upp. Bilder, video, ljud, PDF och text förhandsvisas direkt i appen, med nedladdning och borttagning per fil.",
    icon: "🗂️",
    category: "Verktyg",
    tags: ["Node.js", "Express", "Multer", "Docker"],
    imageSeed: "filsamlare",
    status: "active",
    createdAt: "2026-06-12T12:00:00Z",
    type: "Web App",
    url: "https://filer.alexcloud.se",
    banner: "linear-gradient(135deg, #e8b34b, #14130f)",
    bannerEmoji: "📥",
  },
  {
    id: "sjukdagbok",
    title: "Sjukdagbok",
    description: "Lugn, mörk dagbok för sjukdomsperioder. Logga feber, symtom, sömn, vattenintag och medicin med stora touchvänliga knappar — med feberkurva och tid sedan senaste dos.",
    icon: "💊",
    category: "Hälsa",
    tags: ["React", "Vite", "Tailwind", "Directus", "Recharts"],
    imageSeed: "sjukdagbok",
    status: "active",
    createdAt: "2026-06-10T12:00:00Z",
    type: "Web App",
    url: "https://sjukdagbok.alexcloud.se",
    banner: "linear-gradient(135deg, #7C9CBF, #1A1D27)",
    bannerEmoji: "🤒",
  },
  {
    id: "somndagbok",
    title: "Sömndagbok",
    description: "Logga sömn och CPAP-data varje natt. Läggdags, uppstigningstid, sömnkvalitet och AHI (anduppehåll/timme). Dashboard med diagram och statistik.",
    icon: "💤",
    category: "Hälsa",
    tags: ["React", "Directus", "CPAP"],
    imageSeed: "somndagbok",
    status: "active",
    createdAt: "2026-03-19T12:00:00Z",
    type: "Web App",
    url: "https://somn.alexcloud.se",
    banner: "linear-gradient(135deg, #0a0e1a, #0e2044)",
    bannerEmoji: "🌙",
  },
  {
    id: "viktapp",
    title: "Vikttapp",
    description: "Spåra din viktnedgång och Wegovy-injektioner. Se BMI-mätare, progress och statistik för din hälsoresa.",
    icon: "💉",
    category: "Hälsa",
    tags: ["Next.js", "Directus"],
    imageSeed: "viktapp",
    status: "active",
    createdAt: "2026-03-19T12:00:00Z",
    type: "Web App",
    url: "https://viktapp.alexcloud.se/dashboard",
    banner: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    bannerEmoji: "⚖️",
  },
  {
    id: "skuld",
    title: "Skuld",
    description: "Håll koll på vem som är skyldig vad. Skulder och återbetalningar med automatisk FIFO-avräkning, status per post, aktuellt saldo, statistik med grafer, tidslinje och CSV/PDF-export.",
    icon: "🤝",
    category: "Ekonomi",
    tags: ["Next.js", "Directus", "Recharts"],
    imageSeed: "skuld",
    status: "active",
    createdAt: "2026-03-04T12:00:00Z",
    type: "Web App",
    url: "https://skuld.alexcloud.se",
    banner: "linear-gradient(135deg, #1a1a2e, #16213e)",
    bannerEmoji: "💸",
  },
  {
    id: "fondhjarnan",
    title: "Fondhjärnan",
    description: "Personlig översikt över dina fonder och investeringar – följ portföljen, utveckling och sparande.",
    icon: "🧠",
    category: "Ekonomi",
    tags: ["Web App", "Ekonomi"],
    imageSeed: "fondhjarnan",
    status: "active",
    createdAt: "2026-06-10T12:00:00Z",
    type: "Web App",
    url: "https://fondhjarnan.alexcloud.se",
    banner: "linear-gradient(135deg, #052e1a, #0a7d4a)",
    bannerEmoji: "📈",
  },
];

// Systemappar – serverhantering/verktyg. Finns ENDAST här på servern och lämnas
// bara ut efter korrekt lösenord (samma lösenord som "Övriga appar").
const SYSTEM_APPS = [
  {
    id: "nextcloud",
    title: "Nextcloud",
    description: "Eget moln för filer & foton.",
    icon: "☁️",
    category: "System",
    tags: ["Lagring", "Moln"],
    imageSeed: "nextcloud",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://nextcloud.alexcloud.se",
    banner: "linear-gradient(135deg, #0a2a4a, #0082c9)",
    bannerEmoji: "☁️",
  },
  {
    id: "portainer",
    title: "Portainer",
    description: "Docker GUI & container management.",
    icon: "🐳",
    category: "System",
    tags: ["Docker", "DevOps"],
    imageSeed: "portainer",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://portainer.alexcloud.se",
    banner: "linear-gradient(135deg, #0b1f2a, #13bef9)",
    bannerEmoji: "🐳",
  },
  {
    id: "syncthing",
    title: "Syncthing",
    description: "Synka filer mellan enheter.",
    icon: "🔄",
    category: "System",
    tags: ["Sync", "Filer"],
    imageSeed: "syncthing",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://syncthing.alexcloud.se",
    banner: "linear-gradient(135deg, #0b3d2e, #2ecc71)",
    bannerEmoji: "🔄",
  },
  {
    id: "minio",
    title: "MinIO Storage",
    description: "S3-kompatibel filhantering.",
    icon: "🪣",
    category: "System",
    tags: ["S3", "Lagring"],
    imageSeed: "minio",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://console.alexcloud.se",
    banner: "linear-gradient(135deg, #2a0a0a, #c72c48)",
    bannerEmoji: "🪣",
  },
  {
    id: "supabase",
    title: "Supabase Station",
    description: "Databas & backend.",
    icon: "⚡",
    category: "System",
    tags: ["Databas", "Backend"],
    imageSeed: "supabase",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://supabase-studio.alexcloud.se/",
    banner: "linear-gradient(135deg, #06281d, #3ecf8e)",
    bannerEmoji: "⚡",
  },
  {
    id: "n8n",
    title: "n8n Agent",
    description: "AI-driven automation & agenter.",
    icon: "🤖",
    category: "System",
    tags: ["Automation", "AI"],
    imageSeed: "n8n",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://n8nagent.alexcloud.se",
    banner: "linear-gradient(135deg, #2a0a2a, #ea4b71)",
    bannerEmoji: "🤖",
  },
  {
    id: "vaultwarden",
    title: "Vaultwarden",
    description: "Lösenordshanterare.",
    icon: "🔐",
    category: "System",
    tags: ["Säkerhet", "Lösenord"],
    imageSeed: "vaultwarden",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://vault.alexcloud.se",
    banner: "linear-gradient(135deg, #0a1633, #175ddc)",
    bannerEmoji: "🔐",
  },
  {
    id: "todo",
    title: "AlexCloud Todo",
    description: "Snygg & maffig uppgiftshantering.",
    icon: "✅",
    category: "System",
    tags: ["Produktivitet"],
    imageSeed: "todo",
    status: "active",
    createdAt: "2026-01-01T12:00:00Z",
    type: "Web App",
    url: "https://todo.alexcloud.se",
    banner: "linear-gradient(135deg, #0d2818, #1a5c34)",
    bannerEmoji: "✅",
  },
  {
    id: "bilddatabas",
    title: "Bilddatabas",
    description: "Fri bild-databas som aggregerar Unsplash, Pexels och Pixabay, cachar i Directus och exponeras för Claude Code via MCP.",
    icon: "🖼️",
    category: "System",
    tags: ["Express", "Directus", "MCP"],
    imageSeed: "bilddatabas",
    status: "active",
    createdAt: "2026-06-10T12:00:00Z",
    type: "Web App",
    url: "https://bilder.alexcloud.se",
    banner: "linear-gradient(135deg, #2a1a3a, #6d28d9)",
    bannerEmoji: "🖼️",
  },
];

function checkPassword(password: unknown): boolean {
  return typeof password === "string" && !!PRIVATE_PASS && safeEqual(password, PRIVATE_PASS);
}

// Skyddad endpoint: returnerar de personliga apparna efter korrekt lösenord
app.post("/api/private-apps", (req, res) => {
  const { password } = req.body || {};
  if (!PRIVATE_PASS) {
    return res.status(500).json({ error: "Lösenord ej konfigurerat på servern" });
  }
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Fel lösenord" });
  }
  res.json(PRIVATE_APPS);
});

// Skyddad endpoint: returnerar systemapparna efter korrekt lösenord (samma lösenord)
app.post("/api/system-apps", (req, res) => {
  const { password } = req.body || {};
  if (!PRIVATE_PASS) {
    return res.status(500).json({ error: "Lösenord ej konfigurerat på servern" });
  }
  if (!checkPassword(password)) {
    return res.status(401).json({ error: "Fel lösenord" });
  }
  res.json(SYSTEM_APPS);
});

// --- Upp/ner-status för apparna -----------------------------------------
// Pingar varje publik apps URL och rapporterar om den svarar. Svar med
// HTTP-status < 500 räknas som uppe (401/403/404 betyder att appen lever);
// 502/503/504 från Caddy/Cloudflare eller timeout betyder nere.
// Privata appar och systemappar kontrolleras INTE här — deras id:n får
// aldrig läcka via ett publikt endpoint.

type AppStatus = "up" | "down";
let appStatusCache: { value: { statuses: Record<string, AppStatus>; checkedAt: string }; fetchedAt: number } | null = null;
let appStatusRefreshing: Promise<void> | null = null;

async function pingApp(url: string): Promise<AppStatus> {
  const tryOnce = async (): Promise<AppStatus> => {
    try {
      const res = await axios.get(url, {
        timeout: 12000,
        validateStatus: () => true,
        maxRedirects: 3,
        headers: { "User-Agent": "alexcloud-dashboard-healthcheck" },
      });
      return res.status < 500 ? "up" : "down";
    } catch {
      return "down";
    }
  };
  // Ett omförsök innan en app rapporteras nere — alla pingas samtidigt genom
  // Cloudflare, så enstaka anrop kan vara långsamma utan att appen är nere.
  if ((await tryOnce()) === "up") return "up";
  await new Promise((r) => setTimeout(r, 2000));
  return tryOnce();
}

async function refreshAppStatuses(): Promise<void> {
  const targets = [...APPS, ...GAMES, ...SHARED_APPS]
    .filter((a) => a.url && a.url.startsWith("http"))
    .map((a) => ({ id: a.id, url: a.url }));

  const results = await Promise.all(
    targets.map(async (t) => ({ id: t.id, status: await pingApp(t.url) }))
  );

  const statuses: Record<string, AppStatus> = {};
  for (const r of results) statuses[r.id] = r.status;
  appStatusCache = {
    value: { statuses, checkedAt: new Date().toISOString() },
    fetchedAt: Date.now(),
  };
}

app.get("/api/app-status", async (_req, res) => {
  try {
    const stale = !appStatusCache || Date.now() - appStatusCache.fetchedAt > 120_000;
    if (stale) {
      // Bara en uppfräschning åt gången, övriga anrop väntar på samma promise
      if (!appStatusRefreshing) {
        appStatusRefreshing = refreshAppStatuses().finally(() => {
          appStatusRefreshing = null;
        });
      }
      await appStatusRefreshing;
    }
    res.json(appStatusCache!.value);
  } catch {
    res.status(500).json({ error: "Kunde inte kontrollera appstatus" });
  }
});

// --- Systemstatistik ---------------------------------------------------
// Containern delar kärna med värden, så /proc och /sys ger värdens riktiga
// värden (load, RAM, uptime, CPU-temp). Disken läses från overlay-fs som
// speglar värdens rotpartition.

function readCpuTemp(): number | null {
  try {
    const base = "/sys/class/thermal";
    const zones = fs.readdirSync(base).filter((z) => z.startsWith("thermal_zone"));
    let fallback: number | null = null;
    for (const z of zones) {
      const type = fs.readFileSync(path.join(base, z, "type"), "utf8").trim();
      const temp = parseInt(fs.readFileSync(path.join(base, z, "temp"), "utf8")) / 1000;
      if (type === "x86_pkg_temp") return Math.round(temp);
      if (fallback === null || temp > fallback) fallback = temp;
    }
    return fallback === null ? null : Math.round(fallback);
  } catch {
    return null;
  }
}

function readCpuTimes(): { idle: number; total: number } {
  const line = fs.readFileSync("/proc/stat", "utf8").split("\n")[0];
  const parts = line.trim().split(/\s+/).slice(1).map(Number);
  const idle = parts[3] + (parts[4] || 0);
  const total = parts.reduce((a, b) => a + b, 0);
  return { idle, total };
}

function readMemInfo(): { totalKb: number; availableKb: number } {
  const info = fs.readFileSync("/proc/meminfo", "utf8");
  const get = (key: string) => parseInt(info.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"))?.[1] || "0");
  return { totalKb: get("MemTotal"), availableKb: get("MemAvailable") };
}

// Extern IP hämtas sällan och maskeras (sista oktetten) så att serverns
// riktiga IP bakom Cloudflare aldrig exponeras i den publika dashboarden.
let externalIpCache: { value: string; fetchedAt: number } | null = null;
async function getMaskedExternalIp(): Promise<string | null> {
  if (externalIpCache && Date.now() - externalIpCache.fetchedAt < 60 * 60 * 1000) {
    return externalIpCache.value;
  }
  try {
    const { data } = await axios.get("https://api.ipify.org", { timeout: 5000 });
    const masked = String(data).trim().replace(/\.\d+$/, ".XX");
    externalIpCache = { value: masked, fetchedAt: Date.now() };
    return masked;
  } catch {
    return externalIpCache?.value || null;
  }
}

let statsCache: { value: object; fetchedAt: number } | null = null;
app.get("/api/system-stats", async (_req, res) => {
  try {
    if (statsCache && Date.now() - statsCache.fetchedAt < 5000) {
      return res.json(statsCache.value);
    }

    const t1 = readCpuTimes();
    await new Promise((r) => setTimeout(r, 250));
    const t2 = readCpuTimes();
    const totalDiff = t2.total - t1.total;
    const idleDiff = t2.idle - t1.idle;
    const cpuPercent = totalDiff > 0 ? Math.round(((totalDiff - idleDiff) / totalDiff) * 100) : 0;

    const mem = readMemInfo();
    const uptimeSec = parseFloat(fs.readFileSync("/proc/uptime", "utf8").split(" ")[0]);
    const disk = fs.statfsSync("/");
    const diskTotal = disk.blocks * disk.bsize;
    const diskFree = disk.bavail * disk.bsize;

    const stats = {
      cpuPercent,
      ramUsedGb: Math.round(((mem.totalKb - mem.availableKb) / 1024 / 1024) * 10) / 10,
      ramTotalGb: Math.round((mem.totalKb / 1024 / 1024) * 10) / 10,
      uptimeSec: Math.round(uptimeSec),
      loadAvg: os.loadavg().map((l) => Math.round(l * 100) / 100),
      cpuCount: os.cpus().length,
      tempC: readCpuTemp(),
      diskUsedPercent: Math.round(((diskTotal - diskFree) / diskTotal) * 100),
      diskFreeGb: Math.round(diskFree / 1024 / 1024 / 1024),
      externalIp: await getMaskedExternalIp(),
      // Riktiga händelser istället för påhittade loggar
      events: [
        { time: new Date(Date.now() - process.uptime() * 1000).toISOString(), msg: "Dashboard-containern startad", type: "info" },
        ...(() => {
          try {
            const mtime = fs.statSync(path.join(process.cwd(), "dist", "index.html")).mtime;
            return [{ time: mtime.toISOString(), msg: "Senaste deploy av dashboarden", type: "success" }];
          } catch {
            return [];
          }
        })(),
        { time: new Date(Date.now() - uptimeSec * 1000).toISOString(), msg: "Servern startades (boot)", type: "info" },
      ],
    };

    statsCache = { value: stats, fetchedAt: Date.now() };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Kunde inte läsa systemstatistik" });
  }
});

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
        sameSite: "lax",
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

  try {
    // Utan inloggning: visa publika repos för alexrabnor
    const response = token
      ? await axios.get("https://api.github.com/user/repos?sort=updated&per_page=100", {
          headers: { Authorization: `token ${token}` },
        })
      : await axios.get("https://api.github.com/users/alexrabnor/repos?sort=updated&per_page=100");
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

// APK-nedladdningar (Mobilappar-sidan) – flyttade från gamla alexcloud.se/downloads
app.use("/downloads", express.static(path.join(process.cwd(), "downloads")));

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
