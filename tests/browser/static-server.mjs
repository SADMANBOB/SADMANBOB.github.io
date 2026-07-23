import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd(), "_site");
const port = Number(process.env.PLAYWRIGHT_PORT || 4177);
const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

const findFile = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates = decoded.endsWith("/")
    ? [`${relative}index.html`]
    : [relative, `${relative}/index.html`];

  for (const candidate of candidates) {
    const file = resolve(root, candidate);
    if (file !== root && !file.startsWith(`${root}${sep}`)) continue;
    try {
      const fileStat = await stat(file);
      if (fileStat.isFile()) return { file, fileStat };
    } catch {
      // Try the next static-file form.
    }
  }
  return null;
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://playwright.local").pathname;
    const requested = await findFile(pathname);
    if (!requested) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-length": requested.fileStat.size,
      "content-type": contentTypes.get(extname(requested.file).toLowerCase()) || "application/octet-stream",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(requested.file).pipe(response);
  } catch {
    response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    response.end("Bad request");
  }
});

const close = () => server.close(() => process.exit(0));
process.on("SIGINT", close);
process.on("SIGTERM", close);
server.listen(port, "127.0.0.1");
