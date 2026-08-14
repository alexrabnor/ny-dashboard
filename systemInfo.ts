// Detaljerad systeminfo för sidan "Systeminfo" i dashboarden.
//
// Allt här är LÄSNING av värdens tillstånd. Två saker gör det möjligt inifrån
// containern (se docker-compose.yml):
//   1. `/:/host:ro`        – värdens filsystem, för diskanalys och Docker-metadata
//   2. `/sys/fs/cgroup:/hostcgroup:ro` + `pid: host` – minne/CPU per container
//      respektive processlistan för hela maskinen
// Sökvägar som skannas är HÅRDKODADE här – inget klient-värde får styra dem,
// annars vore mounten en filläsning på hela servern. Endast storlekar och
// sökvägar lämnas ut, aldrig filinnehåll.

import type { Express } from "express";
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";

// --- Var ligger värden? -------------------------------------------------
// I produktion: bind-mounten /host. I dev (kört direkt på maskinen): /.
function detectHostRoot(): string {
  for (const candidate of ["/host"]) {
    try {
      if (fs.existsSync(path.join(candidate, "etc", "os-release"))) return candidate;
    } catch {
      /* nästa */
    }
  }
  return "/";
}

const HOST_ROOT = detectHostRoot();
const HOST_MOUNTED = HOST_ROOT !== "/";
const CGROUP_ROOT = fs.existsSync("/hostcgroup/system.slice") ? "/hostcgroup" : "/sys/fs/cgroup";
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const SCAN_FILE = path.join(DATA_DIR, "disk-scan.json");

const hostPath = (p: string) => path.join(HOST_ROOT, p);

// --- Små hjälpare -------------------------------------------------------

function readText(file: string): string | null {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function readNumber(file: string): number | null {
  const raw = readText(file);
  if (raw === null) return null;
  const n = parseInt(raw.trim().split(/\s+/)[0]);
  return Number.isFinite(n) ? n : null;
}

// --- CPU ----------------------------------------------------------------

type CpuSample = { idle: number; total: number };

function readCpuSamples(): { total: CpuSample; cores: CpuSample[] } {
  const lines = (readText("/proc/stat") || "").split("\n").filter((l) => l.startsWith("cpu"));
  const parse = (line: string): CpuSample => {
    const parts = line.trim().split(/\s+/).slice(1).map(Number);
    return { idle: parts[3] + (parts[4] || 0), total: parts.reduce((a, b) => a + b, 0) };
  };
  const total = lines[0] ? parse(lines[0]) : { idle: 0, total: 0 };
  const cores = lines.slice(1).map(parse);
  return { total, cores };
}

function usagePercent(a: CpuSample, b: CpuSample): number {
  const totalDiff = b.total - a.total;
  const idleDiff = b.idle - a.idle;
  if (totalDiff <= 0) return 0;
  return Math.round(((totalDiff - idleDiff) / totalDiff) * 100);
}

function readCpuTemp(): number | null {
  try {
    const base = "/sys/class/thermal";
    const zones = fs.readdirSync(base).filter((z) => z.startsWith("thermal_zone"));
    let fallback: number | null = null;
    for (const z of zones) {
      const type = (readText(path.join(base, z, "type")) || "").trim();
      const raw = readNumber(path.join(base, z, "temp"));
      if (raw === null) continue;
      const temp = raw / 1000;
      if (type === "x86_pkg_temp") return Math.round(temp);
      if (fallback === null || temp > fallback) fallback = temp;
    }
    return fallback === null ? null : Math.round(fallback);
  } catch {
    return null;
  }
}

function cpuModel(): string {
  const info = readText("/proc/cpuinfo") || "";
  return info.match(/^model name\s*:\s*(.+)$/m)?.[1]?.trim() || os.cpus()[0]?.model || "Okänd CPU";
}

// --- Minne --------------------------------------------------------------
// Samma definition av "använt" som verktyget `free`: totalt minus fritt,
// buffertar och cache. Cache är minne kärnan gärna lämnar ifrån sig igen,
// därför räknas det inte som upptaget.

function readMemory() {
  const info = readText("/proc/meminfo") || "";
  const kb = (key: string) => parseInt(info.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"))?.[1] || "0") * 1024;

  const total = kb("MemTotal");
  const free = kb("MemFree");
  const available = kb("MemAvailable");
  const buffers = kb("Buffers");
  const cachedRaw = kb("Cached");
  const sReclaimable = kb("SReclaimable");
  const shared = kb("Shmem");
  const cached = cachedRaw + sReclaimable - shared;
  const used = total - free - buffers - cachedRaw - sReclaimable;
  const swapTotal = kb("SwapTotal");
  const swapFree = kb("SwapFree");

  return {
    totalBytes: total,
    usedBytes: Math.max(0, used),
    freeBytes: free,
    availableBytes: available,
    buffersBytes: buffers,
    cachedBytes: Math.max(0, cached),
    sharedBytes: shared,
    dirtyBytes: kb("Dirty"),
    swapTotalBytes: swapTotal,
    swapUsedBytes: swapTotal - swapFree,
    swapFreeBytes: swapFree,
    percent: total > 0 ? Math.round(((total - available) / total) * 100) : 0,
  };
}

// --- Processer ----------------------------------------------------------
// Kräver `pid: host` i compose. Utan den syns bara containerns egna processer,
// vilket vi säger ifrån om i svaret istället för att visa halva sanningen.

let passwdCache: { map: Map<number, string>; at: number } | null = null;
function uidName(uid: number): string {
  if (!passwdCache || Date.now() - passwdCache.at > 5 * 60 * 1000) {
    const map = new Map<number, string>();
    for (const line of (readText(hostPath("/etc/passwd")) || "").split("\n")) {
      const [name, , id] = line.split(":");
      if (name && id) map.set(parseInt(id), name);
    }
    passwdCache = { map, at: Date.now() };
  }
  return passwdCache.map.get(uid) || String(uid);
}

// Bara programnamn och (för tolkade språk) skriptets filnamn lämnas ut –
// hela kommandoraden kan innehålla nycklar och lösenord i klartext.
function safeCommand(cmdline: string, comm: string): string {
  const args = cmdline.split("\0").filter(Boolean);
  if (args.length === 0) return comm;
  const first = path.basename(args[0]);
  const second = args[1] && !args[1].startsWith("-") ? path.basename(args[1]) : "";
  return (second ? `${first} ${second}` : first).slice(0, 60);
}

function readProcesses(memTotal: number) {
  const pids = fs.readdirSync("/proc").filter((d) => /^\d+$/.test(d));
  const list: { pid: number; name: string; command: string; user: string; rssBytes: number; percent: number }[] = [];

  for (const pid of pids) {
    const status = readText(`/proc/${pid}/status`);
    if (!status) continue;
    const rssKb = parseInt(status.match(/^VmRSS:\s+(\d+)/m)?.[1] || "0");
    if (rssKb <= 0) continue;
    const name = status.match(/^Name:\s+(.+)$/m)?.[1] || "?";
    const uid = parseInt(status.match(/^Uid:\s+(\d+)/m)?.[1] || "0");
    const rssBytes = rssKb * 1024;
    list.push({
      pid: parseInt(pid),
      name,
      command: safeCommand(readText(`/proc/${pid}/cmdline`) || "", name),
      user: uidName(uid),
      rssBytes,
      percent: memTotal > 0 ? Math.round((rssBytes / memTotal) * 1000) / 10 : 0,
    });
  }

  list.sort((a, b) => b.rssBytes - a.rssBytes);
  return { total: list.length, top: list.slice(0, 20) };
}

// --- Containrar ---------------------------------------------------------
// Namn och image läses ur Dockers egen metadata på disk, minne/CPU ur
// cgroup-filerna. Ingen Docker-socket monteras – den vore likvärdig med
// root-åtkomst till hela maskinen.

type ContainerConfig = { name: string; image: string; running: boolean; startedAt: string; restartCount: number; logPath: string; volumes: string[] };
const configCache = new Map<string, { mtimeMs: number; config: ContainerConfig }>();

function readContainerConfig(id: string): ContainerConfig | null {
  const file = hostPath(`/var/lib/docker/containers/${id}/config.v2.json`);
  let mtimeMs = 0;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
  const cached = configCache.get(id);
  if (cached && cached.mtimeMs === mtimeMs) return cached.config;

  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const config: ContainerConfig = {
      name: String(raw.Name || id).replace(/^\//, ""),
      image: String(raw.Config?.Image || raw.Image || "").slice(0, 60),
      running: !!raw.State?.Running,
      startedAt: String(raw.State?.StartedAt || ""),
      restartCount: Number(raw.RestartCount || 0),
      logPath: String(raw.LogPath || ""),
      volumes: Object.values(raw.MountPoints || {})
        .filter((m: any) => m?.Type === "volume" && m?.Name)
        .map((m: any) => String(m.Name)),
    };
    configCache.set(id, { mtimeMs, config });
    return config;
  } catch {
    return null;
  }
}

const prevCpu = new Map<string, { usec: number; at: number }>();

function readContainers(cores: number, volumeSizes: Record<string, number>) {
  const dir = hostPath("/var/lib/docker/containers");
  let ids: string[] = [];
  try {
    ids = fs.readdirSync(dir).filter((d) => /^[0-9a-f]{12,}$/.test(d));
  } catch {
    return { total: 0, running: 0, memTotalBytes: 0, logTotalBytes: 0, list: [], available: false };
  }

  const now = Date.now();
  const list = [];
  let memTotalBytes = 0;
  let logTotalBytes = 0;
  let running = 0;

  for (const id of ids) {
    const config = readContainerConfig(id);
    if (!config) continue;

    const scope = path.join(CGROUP_ROOT, "system.slice", `docker-${id}.scope`);
    const memBytes = readNumber(path.join(scope, "memory.current")) || 0;

    // cpu.stat räknar mikrosekunder sedan start – andelen räknas ur skillnaden
    // mot förra hämtningen, delat på antal kärnor.
    let cpuPercent: number | null = null;
    const cpuStat = readText(path.join(scope, "cpu.stat"));
    if (cpuStat) {
      const usec = parseInt(cpuStat.match(/^usage_usec\s+(\d+)/m)?.[1] || "0");
      const prev = prevCpu.get(id);
      if (prev && now > prev.at && usec >= prev.usec) {
        const elapsedUsec = (now - prev.at) * 1000;
        cpuPercent = Math.round(((usec - prev.usec) / (elapsedUsec * cores)) * 1000) / 10;
      }
      prevCpu.set(id, { usec, at: now });
    }

    let logBytes = 0;
    if (config.logPath) {
      try {
        logBytes = fs.statSync(hostPath(config.logPath)).size;
      } catch {
        /* loggen kan vara borttagen */
      }
    }

    const volumeBytes = config.volumes.reduce((sum, v) => sum + (volumeSizes[v] || 0), 0);

    if (config.running) {
      running++;
      memTotalBytes += memBytes;
    }
    logTotalBytes += logBytes;

    list.push({
      id: id.slice(0, 12),
      name: config.name,
      image: config.image,
      running: config.running,
      startedAt: config.startedAt,
      restartCount: config.restartCount,
      memBytes: config.running ? memBytes : 0,
      cpuPercent: config.running ? cpuPercent : null,
      logBytes,
      volumeBytes,
      volumes: config.volumes,
    });
  }

  list.sort((a, b) => b.memBytes - a.memBytes || b.logBytes - a.logBytes);
  return { total: list.length, running, memTotalBytes, logTotalBytes, list, available: true };
}

// --- Filsystem ----------------------------------------------------------
// Bind-mounten visar inte värdens undermonteringar, så vi provar ett fast
// antal kända sökvägar och slår ihop dem som ligger på samma enhet.

function readFilesystems() {
  const candidates = ["/", "/home", "/var", "/var/lib/docker", "/boot", "/boot/efi", "/tmp", "/opt", "/srv", "/mnt"];
  const seen = new Set<number>();
  const result: { mount: string; totalBytes: number; usedBytes: number; freeBytes: number; percent: number; device: string | null; fsType: string | null }[] = [];

  // Enhetsnamn/typ för det som faktiskt är monterat i containern
  const mounts = (readText("/proc/mounts") || "").split("\n").map((l) => l.split(/\s+/));

  for (const mount of candidates) {
    const full = hostPath(mount);
    let dev: number;
    try {
      dev = fs.statSync(full).dev;
      if (seen.has(dev)) continue;
      const st = fs.statfsSync(full);
      const totalBytes = st.blocks * st.bsize;
      if (!totalBytes) continue;
      seen.add(dev);
      const freeBytes = st.bavail * st.bsize;
      const usedBytes = (st.blocks - st.bfree) * st.bsize;
      const mountLine = mounts.find((m) => m[1] === full) || mounts.find((m) => m[1] === HOST_ROOT);
      result.push({
        mount,
        totalBytes,
        usedBytes,
        freeBytes,
        percent: Math.round((usedBytes / (usedBytes + freeBytes)) * 100),
        device: mountLine?.[0] || null,
        fsType: mountLine?.[2] || null,
      });
    } catch {
      /* sökvägen finns inte på den här maskinen */
    }
  }

  return result;
}

// --- Diskskanning -------------------------------------------------------
// `du` och `find` går över hela rotfilsystemet och tar ett par minuter. Den
// körs därför i bakgrunden (nice 19), sparas till disk och visas med
// tidsstämpel – aldrig synkront i ett API-anrop.

type TreeNode = { name: string; path: string; bytes: number; children?: TreeNode[]; ownBytes?: number };

export type DiskScan = {
  scannedAt: string;
  durationMs: number;
  tree: TreeNode | null;
  largestFiles: { path: string; bytes: number }[];
  extensions: { ext: string; bytes: number; count: number }[];
  buckets: { nodeModulesBytes: number; gitBytes: number; dockerLogBytes: number };
  fileCount: number;
  fileBytes: number;
  dockerLogs: { name: string; bytes: number }[];
  volumes: { name: string; bytes: number }[];
};

let scanState: { running: boolean; startedAt: number | null; error: string | null } = { running: false, startedAt: null, error: null };
let scanCache: DiskScan | null = null;

function loadScanFromDisk() {
  try {
    scanCache = JSON.parse(fs.readFileSync(SCAN_FILE, "utf8"));
  } catch {
    scanCache = null;
  }
}

function run(cmd: string, args: string[], maxBuffer: number): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer, timeout: 20 * 60 * 1000 }, (err, stdout) => {
      // du/find sätter felkod redan vid "permission denied" på en enda fil –
      // delresultatet duger, så vi använder stdout så länge något kom fram.
      if (err && !stdout) return reject(err);
      resolve(stdout);
    });
  });
}

// Bygger katalogträdet ur du-utdata och beskär det till det som går att läsa:
// de 12 största barnen per nivå, resten summeras till en "Övrigt"-post.
function buildTree(duOutput: string): TreeNode | null {
  const nodes = new Map<string, TreeNode>();
  const prefix = HOST_ROOT === "/" ? "" : HOST_ROOT;

  for (const line of duOutput.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const bytes = parseInt(line.slice(0, tab));
    let p = line.slice(tab + 1).trim();
    if (!Number.isFinite(bytes) || !p) continue;
    if (prefix && p.startsWith(prefix)) p = p.slice(prefix.length) || "/";
    nodes.set(p, { name: p === "/" ? "/" : path.basename(p), path: p, bytes, children: [] });
  }

  const root = nodes.get("/");
  if (!root) return null;

  for (const [p, node] of nodes) {
    if (p === "/") continue;
    const parent = nodes.get(path.dirname(p));
    if (parent) parent.children!.push(node);
  }

  const prune = (node: TreeNode): TreeNode => {
    const children = (node.children || []).sort((a, b) => b.bytes - a.bytes);
    const kept = children.slice(0, 12).map(prune);
    const rest = children.slice(12);
    if (rest.length > 0) {
      const bytes = rest.reduce((s, c) => s + c.bytes, 0);
      if (bytes > 0) kept.push({ name: `Övriga ${rest.length} mappar`, path: `${node.path}#rest`, bytes });
    }
    const childSum = children.reduce((s, c) => s + c.bytes, 0);
    return { name: node.name, path: node.path, bytes: node.bytes, ownBytes: Math.max(0, node.bytes - childSum), children: kept.length ? kept : undefined };
  };

  return prune(root);
}

// Ett enda svep över alla filer: awk summerar per filändelse och skriver bara
// ut de riktigt stora filerna, så utdatan blir liten i stället för miljontals rader.
const AWK_PROGRAM = [
  "BEGIN{FS=\"\\t\"}",
  "{s=$1+0;p=$2;total+=s;cnt++;",
  "if(p ~ /\\/node_modules\\//)nm+=s;",
  "if(p ~ /\\/\\.git\\//)git+=s;",
  "if(p ~ /-json\\.log$/)dlog+=s;",
  "n=split(p,a,\"/\");f=a[n];e=\"\";",
  "m=match(f,/\\.[A-Za-z0-9]+$/);",
  "if(m>1 && length(f)-m<=8)e=tolower(substr(f,m+1));",
  "eb[e]+=s;ec[e]++;",
  "if(s>209715200)print \"FILE\\t\" s \"\\t\" p;}",
  "END{for(k in eb)print \"EXT\\t\" k \"\\t\" eb[k] \"\\t\" ec[k];",
  "print \"SUM\\t\" total+0 \"\\t\" cnt+0 \"\\t\" nm+0 \"\\t\" git+0 \"\\t\" dlog+0}",
].join("");

async function runScan(): Promise<void> {
  if (scanState.running) return;
  scanState = { running: true, startedAt: Date.now(), error: null };
  const started = Date.now();

  try {
    const duOut = await run("nice", ["-n", "19", "du", "-x", "--block-size=1", "--max-depth=4", HOST_ROOT], 128 * 1024 * 1024);
    const tree = buildTree(duOut);

    const findCmd = `nice -n 19 find ${HOST_ROOT} -xdev -type f -printf '%s\\t%p\\n' 2>/dev/null | nice -n 19 awk '${AWK_PROGRAM}'`;
    const filesOut = await run("sh", ["-c", findCmd], 64 * 1024 * 1024);

    const prefix = HOST_ROOT === "/" ? "" : HOST_ROOT;
    const largestFiles: { path: string; bytes: number }[] = [];
    const extensions: { ext: string; bytes: number; count: number }[] = [];
    let fileCount = 0;
    let fileBytes = 0;
    const buckets = { nodeModulesBytes: 0, gitBytes: 0, dockerLogBytes: 0 };

    for (const line of filesOut.split("\n")) {
      const parts = line.split("\t");
      if (parts[0] === "FILE") {
        const p = parts[2] || "";
        largestFiles.push({ bytes: parseInt(parts[1]), path: prefix && p.startsWith(prefix) ? p.slice(prefix.length) : p });
      } else if (parts[0] === "EXT") {
        extensions.push({ ext: parts[1] || "(utan ändelse)", bytes: parseInt(parts[2]), count: parseInt(parts[3]) });
      } else if (parts[0] === "SUM") {
        fileBytes = parseInt(parts[1]) || 0;
        fileCount = parseInt(parts[2]) || 0;
        buckets.nodeModulesBytes = parseInt(parts[3]) || 0;
        buckets.gitBytes = parseInt(parts[4]) || 0;
        buckets.dockerLogBytes = parseInt(parts[5]) || 0;
      }
    }

    largestFiles.sort((a, b) => b.bytes - a.bytes);
    extensions.sort((a, b) => b.bytes - a.bytes);

    // Containerloggar och volymer i klartext – de vanligaste diskbovarna på
    // en server med många containrar.
    const dockerLogs: { name: string; bytes: number }[] = [];
    try {
      const dir = hostPath("/var/lib/docker/containers");
      for (const id of fs.readdirSync(dir)) {
        const config = readContainerConfig(id);
        if (!config?.logPath) continue;
        try {
          dockerLogs.push({ name: config.name, bytes: fs.statSync(hostPath(config.logPath)).size });
        } catch {
          /* ingen logg */
        }
      }
    } catch {
      /* docker saknas */
    }
    dockerLogs.sort((a, b) => b.bytes - a.bytes);

    const volumes: { name: string; bytes: number }[] = [];
    const volumeNode = findNode(tree, "/var/lib/docker/volumes");
    for (const child of volumeNode?.children || []) {
      if (!child.path.endsWith("#rest")) volumes.push({ name: child.name, bytes: child.bytes });
    }
    volumes.sort((a, b) => b.bytes - a.bytes);

    scanCache = {
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      tree,
      largestFiles: largestFiles.slice(0, 40),
      extensions: extensions.slice(0, 25),
      buckets,
      fileCount,
      fileBytes,
      dockerLogs: dockerLogs.slice(0, 15),
      volumes: volumes.slice(0, 15),
    };

    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SCAN_FILE, JSON.stringify(scanCache));
    scanState = { running: false, startedAt: null, error: null };
  } catch (err: any) {
    scanState = { running: false, startedAt: null, error: String(err?.message || err).slice(0, 200) };
  }
}

function findNode(node: TreeNode | null, target: string): TreeNode | null {
  if (!node) return null;
  if (node.path === target) return node;
  if (!target.startsWith(node.path)) return null;
  for (const child of node.children || []) {
    const hit = findNode(child, target);
    if (hit) return hit;
  }
  return null;
}

// --- Enkel bromskloss mot lösenordsgissning -----------------------------

const attempts = new Map<string, { count: number; blockedUntil: number }>();

function throttled(ip: string): boolean {
  const entry = attempts.get(ip);
  return !!entry && entry.blockedUntil > Date.now();
}

function noteFailure(ip: string) {
  const entry = attempts.get(ip) || { count: 0, blockedUntil: 0 };
  entry.count++;
  if (entry.count >= 5) {
    entry.blockedUntil = Date.now() + 60_000;
    entry.count = 0;
  }
  attempts.set(ip, entry);
}

// --- Routes -------------------------------------------------------------

export function registerSystemInfoRoutes(app: Express, checkPassword: (password: unknown) => boolean) {
  loadScanFromDisk();

  // Första skanningen körs i bakgrunden vid start om den saknas eller är gammal,
  // och sedan var tolfte timme.
  const scanIfStale = () => {
    const age = scanCache ? Date.now() - new Date(scanCache.scannedAt).getTime() : Infinity;
    if (age > 12 * 60 * 60 * 1000) void runScan();
  };
  setTimeout(scanIfStale, 60_000);
  setInterval(scanIfStale, 60 * 60 * 1000);

  const guard = (req: any, res: any): boolean => {
    const ip = String(req.ip || req.socket?.remoteAddress || "okänd");
    if (throttled(ip)) {
      res.status(429).json({ error: "För många försök. Vänta en minut." });
      return false;
    }
    if (!checkPassword(req.body?.password)) {
      noteFailure(ip);
      res.status(401).json({ error: "Fel lösenord" });
      return false;
    }
    attempts.delete(ip);
    return true;
  };

  app.post("/api/system-info", async (req, res) => {
    if (!guard(req, res)) return;
    try {
      const before = readCpuSamples();
      await new Promise((r) => setTimeout(r, 250));
      const after = readCpuSamples();

      const memory = readMemory();
      const cores = os.cpus().length;
      const volumeSizes: Record<string, number> = {};
      for (const v of scanCache?.volumes || []) volumeSizes[v.name] = v.bytes;

      const uptimeSec = Math.round(parseFloat((readText("/proc/uptime") || "0").split(" ")[0]));
      const osRelease = readText(hostPath("/etc/os-release")) || "";

      res.json({
        host: {
          // os.hostname() ger containerns id – värdens namn står i /etc/hostname
          hostname: (readText(hostPath("/etc/hostname")) || os.hostname()).trim(),
          os: osRelease.match(/^PRETTY_NAME="?(.+?)"?$/m)?.[1] || "Linux",
          kernel: os.release(),
          cpuModel: cpuModel(),
          cores,
          uptimeSec,
          bootTime: new Date(Date.now() - uptimeSec * 1000).toISOString(),
          hostMounted: HOST_MOUNTED,
          now: new Date().toISOString(),
        },
        cpu: {
          percent: usagePercent(before.total, after.total),
          perCore: before.cores.map((c, i) => (after.cores[i] ? usagePercent(c, after.cores[i]) : 0)),
          loadAvg: os.loadavg().map((l) => Math.round(l * 100) / 100),
          tempC: readCpuTemp(),
        },
        memory,
        processes: readProcesses(memory.totalBytes),
        containers: readContainers(cores, volumeSizes),
        filesystems: readFilesystems(),
        scan: {
          scannedAt: scanCache?.scannedAt || null,
          durationMs: scanCache?.durationMs || null,
          running: scanState.running,
          startedAt: scanState.startedAt ? new Date(scanState.startedAt).toISOString() : null,
          error: scanState.error,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: "Kunde inte läsa systeminfo", detail: String(err?.message || err).slice(0, 200) });
    }
  });

  app.post("/api/system-info/disk", (req, res) => {
    if (!guard(req, res)) return;
    res.json({
      scan: scanCache,
      running: scanState.running,
      startedAt: scanState.startedAt ? new Date(scanState.startedAt).toISOString() : null,
      error: scanState.error,
    });
  });

  app.post("/api/system-info/scan", (req, res) => {
    if (!guard(req, res)) return;
    if (scanState.running) return res.json({ started: false, running: true });
    void runScan();
    res.json({ started: true, running: true });
  });
}
