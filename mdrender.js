#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');
const { exec } = require('child_process');
const os = require('os');
const http = require('http');

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (__) {}
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
});

// GitHub-like CSS with dark/light theme support
const githubCSS = `
<style>
:root {
  /* Light theme (default) */
  --bg-color: #ffffff;
  --text-color: #24292f;
  --text-muted: #656d76;
  --border-color: #d0d7de;
  --border-muted: #d8dee4;
  --bg-subtle: #f6f8fa;
  --bg-overlay: rgba(175,184,193,0.2);
  --accent-color: #0969da;
  --accent-hover: #0550ae;
  
  /* Code highlighting */
  --code-bg: #f6f8fa;
  --code-text: #24292f;
  --hl-keyword: #d73a49;
  --hl-title: #6f42c1;
  --hl-attr: #005cc5;
  --hl-string: #032f62;
  --hl-builtin: #e36209;
  --hl-comment: #6a737d;
  --hl-name: #22863a;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #0d1117;
    --text-color: #f0f6fc;
    --text-muted: #8b949e;
    --border-color: #30363d;
    --border-muted: #21262d;
    --bg-subtle: #161b22;
    --bg-overlay: rgba(110,118,129,0.2);
    --accent-color: #58a6ff;
    --accent-hover: #388bfd;
    
    /* Code highlighting - dark theme */
    --code-bg: #161b22;
    --code-text: #f0f6fc;
    --hl-keyword: #ff7b72;
    --hl-title: #d2a8ff;
    --hl-attr: #79c0ff;
    --hl-string: #a5f3fc;
    --hl-builtin: #ffa657;
    --hl-comment: #8b949e;
    --hl-name: #7ee787;
  }
}

/* Manual theme overrides */
[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #24292f;
  --text-muted: #656d76;
  --border-color: #d0d7de;
  --border-muted: #d8dee4;
  --bg-subtle: #f6f8fa;
  --bg-overlay: rgba(175,184,193,0.2);
  --accent-color: #0969da;
  --accent-hover: #0550ae;
  
  --code-bg: #f6f8fa;
  --code-text: #24292f;
  --hl-keyword: #d73a49;
  --hl-title: #6f42c1;
  --hl-attr: #005cc5;
  --hl-string: #032f62;
  --hl-builtin: #e36209;
  --hl-comment: #6a737d;
  --hl-name: #22863a;
}

[data-theme="dark"] {
  --bg-color: #0d1117;
  --text-color: #f0f6fc;
  --text-muted: #8b949e;
  --border-color: #30363d;
  --border-muted: #21262d;
  --bg-subtle: #161b22;
  --bg-overlay: rgba(110,118,129,0.2);
  --accent-color: #58a6ff;
  --accent-hover: #388bfd;
  
  --code-bg: #161b22;
  --code-text: #f0f6fc;
  --hl-keyword: #ff7b72;
  --hl-title: #d2a8ff;
  --hl-attr: #79c0ff;
  --hl-string: #a5f3fc;
  --hl-builtin: #ffa657;
  --hl-comment: #8b949e;
  --hl-name: #7ee787;
}

body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-color);
}

h1 { font-size: 2em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { font-size: 0.85em; color: var(--text-muted); }

p { margin-top: 0; margin-bottom: 16px; }

blockquote {
  padding: 0 1em;
  color: var(--text-muted);
  border-left: 0.25em solid var(--border-color);
  margin: 0 0 16px 0;
}

ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
li + li { margin-top: 0.25em; }

code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: var(--bg-overlay);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  color: var(--text-color);
}

pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--code-bg);
  border-radius: 6px;
  margin-bottom: 16px;
  color: var(--code-text);
}

pre code {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
  color: inherit;
}

table {
  border-spacing: 0;
  border-collapse: collapse;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 16px;
}

table th, table td {
  padding: 6px 13px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

table th {
  font-weight: 600;
  background-color: var(--bg-subtle);
}

table tr:nth-child(2n) {
  background-color: var(--bg-subtle);
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
  color: var(--accent-hover);
}

hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--border-color);
  border: 0;
}

/* Highlight.js GitHub theme with theme support */
.hljs {
  color: var(--code-text);
  background: var(--code-bg);
}

.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  color: var(--hl-keyword);
}

.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
  color: var(--hl-title);
}

.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id,
.hljs-variable {
  color: var(--hl-attr);
}

.hljs-string,
.hljs-meta .hljs-string,
.hljs-regexp {
  color: var(--hl-string);
}

.hljs-built_in,
.hljs-symbol {
  color: var(--hl-builtin);
}

.hljs-code,
.hljs-comment,
.hljs-formula {
  color: var(--hl-comment);
}

.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
  color: var(--hl-name);
}

/* Theme toggle button */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text-color);
  z-index: 1000;
  transition: all 0.3s ease;
  user-select: none;
}

.theme-toggle:hover {
  background: var(--border-color);
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>
`;

function showUsage() {
  console.log('Usage: mdrender <markdown-file> [options]');
  console.log('Example: mdrender README.md');
  console.log('Options:');
  console.log('  --serve [port]    Serve file on local network (default port: 3000)');
  console.log('  --watch          Auto-reload on file changes (requires --serve)');
  process.exit(1);
}

function openInBrowser(filePath) {
  const command = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${command} "${filePath}"`, (error) => {
    if (error) {
      console.error('Error opening browser:', error.message);
    }
  });
}

function openInBrowserWithTabReuse(filePath, mdFile) {
  // Create a unique window name based on the markdown file path
  const windowName = `mdrender_${path.resolve(mdFile).replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  if (process.platform === 'darwin') {
    // macOS: Use AppleScript to reuse the same tab
    const script = `
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
end tell

tell application "Safari"
    activate
    set foundTab to false
    repeat with w in windows
        repeat with t in tabs of w
            if name of t contains "${path.basename(mdFile)}" then
                set current tab of w to t
                set URL of t to "${filePath}"
                set foundTab to true
                exit repeat
            end if
        end repeat
        if foundTab then exit repeat
    end repeat
    
    if not foundTab then
        tell window 1
            set current tab to (make new tab with properties {URL:"${filePath}"})
        end tell
    end if
end tell

tell application frontApp
    activate
end tell
`;
    
    exec(`osascript -e '${script.replace(/'/g, "\\'")}'`, (error) => {
      if (error) {
        console.log('AppleScript failed, falling back to regular open');
        openInBrowser(filePath);
      }
    });
  } else {
    // For non-macOS, fall back to regular browser opening
    // Note: Tab reuse is more complex on Linux/Windows and depends on the browser
    openInBrowser(filePath);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    serve: false,
    port: 3000,
    watch: false,
    file: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--serve') {
      options.serve = true;
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        const port = parseInt(args[i + 1]);
        if (!isNaN(port)) {
          options.port = port;
          i++;
        }
      }
    } else if (arg === '--watch') {
      options.watch = true;
    } else if (!arg.startsWith('--') && !options.file) {
      options.file = arg;
    }
  }
  
  return options;
}

function generateHTML(mdFile) {
  const markdownContent = fs.readFileSync(mdFile, 'utf8');
  const htmlContent = marked(markdownContent);
  
  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${path.basename(mdFile)}</title>
    ${githubCSS}
</head>
<body>
    <div class="theme-toggle" onclick="toggleTheme()">
      <span id="theme-icon">🌙</span> <span id="theme-text">Dark</span>
    </div>
    ${htmlContent}
    <script>
      // Theme management
      function getPreferredTheme() {
        const saved = localStorage.getItem('mdrender_theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mdrender_theme', theme);
        updateThemeToggle(theme);
      }
      
      function updateThemeToggle(theme) {
        const icon = document.getElementById('theme-icon');
        const text = document.getElementById('theme-text');
        if (theme === 'dark') {
          icon.textContent = '☀️';
          text.textContent = 'Light';
        } else {
          icon.textContent = '🌙';
          text.textContent = 'Dark';
        }
      }
      
      function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      }
      
      // Initialize theme
      setTheme(getPreferredTheme());
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('mdrender_theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
      
      // Tab reuse functionality
      const fileId = '${path.resolve(mdFile).replace(/\\/g, '\\\\')}';
      
      // Check if this file is already open in another tab
      if (localStorage.getItem('mdrender_current_file') === fileId) {
        // Close any other tabs with the same file
        localStorage.setItem('mdrender_close_signal', fileId + '_' + Date.now());
      }
      
      // Set this tab as the current one for this file
      localStorage.setItem('mdrender_current_file', fileId);
      
      // Listen for close signals
      window.addEventListener('storage', (e) => {
        if (e.key === 'mdrender_close_signal') {
          const [signalFileId, timestamp] = e.newValue.split('_');
          if (signalFileId === fileId && Date.now() - parseInt(timestamp) < 1000) {
            window.close();
          }
        }
      });
      
      // Auto-reload script for watch mode
      if (window.location.search.includes('watch=true')) {
        let lastModified = null;
        
        async function checkForUpdates() {
          try {
            const response = await fetch('/api/modified');
            const data = await response.json();
            
            if (lastModified && data.modified !== lastModified) {
              window.location.reload();
            }
            lastModified = data.modified;
          } catch (error) {
            console.log('Auto-reload check failed:', error);
          }
        }
        
        // Check for updates every 1 second
        setInterval(checkForUpdates, 1000);
        checkForUpdates();
      }
    </script>
</body>
</html>
`;
  
  return fullHTML;
}

function serveFile(mdFile, port, watch) {
  let htmlContent = generateHTML(mdFile);
  
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      // Regenerate HTML if watch mode is enabled
      if (watch) {
        try {
          htmlContent = generateHTML(mdFile);
        } catch (error) {
          console.error('Error regenerating HTML:', error.message);
        }
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(htmlContent);
    } else if (req.url === '/api/modified' && watch) {
      // API endpoint for checking file modification time
      try {
        const stats = fs.statSync(mdFile);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ modified: stats.mtime.getTime() }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  server.listen(port, () => {
    const watchParam = watch ? '?watch=true' : '';
    const url = `http://localhost:${port}${watchParam}`;
    console.log(`Serving ${mdFile} at ${url}`);
    if (watch) {
      console.log('Auto-reload enabled - file changes will refresh the browser');
    }
    console.log('Press Ctrl+C to stop the server');
    
    // Open in browser with tab reuse
    openInBrowserWithTabReuse(url, mdFile);
  });
  
  return server;
}

function main() {
  const options = parseArgs();
  
  if (!options.file) {
    showUsage();
  }
  
  const mdFile = options.file;
  
  if (!fs.existsSync(mdFile)) {
    console.error(`Error: File '${mdFile}' not found`);
    process.exit(1);
  }
  
  try {
    if (options.serve) {
      // Serve mode
      if (options.watch && !options.serve) {
        console.error('--watch requires --serve option');
        process.exit(1);
      }
      serveFile(mdFile, options.port, options.watch);
    } else {
      // File mode (original behavior)
      const fullHTML = generateHTML(mdFile);
      const tempDir = os.tmpdir();
      const htmlFile = path.join(tempDir, `${path.basename(mdFile, '.md')}.html`);
      
      fs.writeFileSync(htmlFile, fullHTML);
      
      console.log(`Rendered ${mdFile} -> ${htmlFile}`);
      console.log('Opening in browser...');
      
      // Open in browser with tab reuse
      openInBrowserWithTabReuse(htmlFile, mdFile);
    }
    
  } catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}