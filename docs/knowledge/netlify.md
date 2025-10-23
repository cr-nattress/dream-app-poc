Make Netlify Functions restarts boring (in a good way)
1) Pin the runtime exactly

Misaligned Node versions = random restart failures.

Add .nvmrc (or .node-version) to match your Netlify site runtime (e.g. 20).

In netlify.toml:

[functions]
node_bundler = "esbuild"
included_files = ["src/**"]


Use one package manager everywhere (npm or pnpm or yarn), and commit the lockfile.

2) Compile TypeScript ahead-of-time (don’t rely on on-the-fly transpile)

Hot-reloading TS inside the functions server is where flakiness thrives.

Output compiled JS to a stable folder; point Netlify at that.

Example layout:

/src/functions/*.ts  -> compiled to  /.netlify/functions-built/*.js


netlify.toml:

[functions]
directory = ".netlify/functions-built"
node_bundler = "esbuild"


package.json:

{
  "scripts": {
    "build:functions": "tsup src/functions --dts=false --format=cjs --outDir .netlify/functions-built --splitting=false",
    "watch:functions": "tsup src/functions --watch --dts=false --format=cjs --outDir .netlify/functions-built --splitting=false"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}

3) Run the function server alone (and proxy to it)

netlify dev tries to juggle your web dev server and functions at once; divorcing them reduces churn.

Start functions on their own port, then optionally run netlify dev just as a proxy—or skip it and hit the functions port directly.

package.json:

{
  "scripts": {
    "serve:functions": "netlify functions:serve --port 9999",
    "dev:functions": "run-p watch:functions serve:functions"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5"
  }
}


If you also run Vite/Next/etc., keep them separate and let the web dev server proxy /api/* to http://localhost:9999.

4) Make file watching deterministic (Windows/WSL fix)

Missed file-change events = server never restarts.

Use polling:

# Windows-friendly in package.json scripts via cross-env
CHOKIDAR_USEPOLLING=1 WATCHPACK_POLLING=true


Add cross-env and wrap your watch scripts:

{
  "scripts": {
    "watch:functions": "cross-env CHOKIDAR_USEPOLLING=1 WATCHPACK_POLLING=true tsup src/functions --watch --outDir .netlify/functions-built --format=cjs --splitting=false"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}


If you’re on WSL2, keep the repo inside the Linux filesystem (~/code/...) not on a Windows mount.

5) Clear the state that actually breaks restarts

When it gets cursed:

Nuke local artifacts:
rimraf .netlify/functions-serve .netlify/functions .netlify/functions-built

Then full reinstall:
rimraf node_modules && npm ci

Add a clean script:

{
  "scripts": {
    "clean": "rimraf .netlify node_modules .netlify/functions-built"
  },
  "devDependencies": {
    "rimraf": "^6.0.0"
  }
}

6) Health-check the function after (re)start

Fast feedback beats guessing whether it actually restarted.

Add a tiny health endpoint (or reuse one function).

Script a ping:

{
  "scripts": {
    "ping": "node -e \"require('http').get('http://localhost:9999/.netlify/functions/health', r=>console.log('health', r.statusCode))\"",
    "dev:functions": "run-p watch:functions serve:functions ping"
  }
}

7) Stabilize env & IO

Keep .env files deterministic: .env, .env.development. Load with dotenv at the top of your handler.

Mock outbound network I/O for local runs where possible; flaky upstreams cause “it restarted?” confusion.

Exclude your project folder from Windows Defender real-time scanning; AV can lock files and kill restarts.

8) Log like you mean it

Structured JSON logs in handlers (request id, path, duration).

Surface unhandled rejections:

process.on('unhandledRejection', (e)=>console.error('UNHANDLED_REJECTION', e));
process.on('uncaughtException', (e)=>console.error('UNCAUGHT_EXCEPTION', e));

9) Have a one-command “known good” dev entry

Copy/paste friendly; zero thinking:

{
  "scripts": {
    "dev:functions": "run-p watch:functions serve:functions",
    "dev:web": "vite",                          // or next dev
    "dev": "run-p dev:functions dev:web",       // run both if you want
    "build": "npm run build:functions && your-web-build"
  }
}


In your web server dev config, proxy /api/* → http://localhost:9999/.netlify/functions/*.

10) Test functions without the server

Handlers are just functions—unit test them to catch issues before the watcher cycle:

Export the raw handler logic and test it with Node (or supertest if you wrap Express-ish adapters).

Quick “why does restart keep failing?” checklist

⛔ Port stuck: EADDRINUSE → kill the orphan: npx kill-port 9999.

🔢 Wrong Node: local Node ≠ Netlify runtime. Fix .nvmrc.

🧹 Stale build: delete .netlify/ + functions-built/.

🧪 Transpile-in-place: switch to precompiled JS (Section 2).

👀 Missed file events: force polling (Section 4).

🛡️ AV interference (Windows): exclude project folder.

🔗 Path shenanigans: avoid spaces & very long paths in repo location.

📦 Dual package managers: remove stray yarn.lock if you use npm (or vice versa).