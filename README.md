# MdRender

A lightweight command-line tool that converts Markdown files to HTML and opens them in your browser with GitHub-like styling.

## Features

- ✅ GitHub-like styling and layout
- ✅ Syntax highlighting for code blocks  
- ✅ Support for tables, blockquotes, lists, and more
- ✅ Auto-opens in your default browser
- ✅ Cross-platform support (macOS, Linux, Windows)
- ✅ Temporary file cleanup
- ✅ Standalone binaries available (no Node.js required)
- ✅ **Server mode** - Serve files on local network
- ✅ **Auto-reload** - Live updates when files change
- ✅ **Smart tab management** - Reuses tabs for same files
- ✅ **Dark/Light mode** - System default with manual toggle

## Installation

### Option 1: Download Standalone Binary (Recommended)

No Node.js required! Download the binary for your platform:

📥 **[Download Latest Release](https://github.com/USER/REPO/releases/latest)**

- **macOS**: [mdrender-macos](https://github.com/USER/REPO/releases/latest/download/mdrender-macos)
- **Linux**: [mdrender-linux](https://github.com/USER/REPO/releases/latest/download/mdrender-linux) 
- **Windows**: [mdrender-win.exe](https://github.com/USER/REPO/releases/latest/download/mdrender-win.exe)

Make it executable and run:
```bash
# macOS (if blocked by security)
xattr -d com.apple.quarantine mdrender-macos
chmod +x mdrender-macos
./mdrender-macos README.md

# Linux
chmod +x mdrender-linux
./mdrender-linux README.md

# Windows
mdrender-win.exe README.md
```

**macOS Security Note**: If macOS blocks the binary with "cannot verify developer", run:
```bash
xattr -d com.apple.quarantine mdrender-macos
```
Alternatively, go to System Preferences → Security & Privacy → General and click "Allow Anyway".

### Option 2: Install from Source

**Prerequisites:**
- Node.js (v14 or higher)
- npm

**Steps:**
1. Clone this project:
```bash
git clone <repository-url>
cd MdRender
```

2. Install dependencies:
```bash
npm install
```

3. Install globally (optional):
```bash
npm link
```

### Building Binaries

To create standalone binaries yourself:

```bash
# Build for current platform
npm run build

# Build for all platforms (macOS, Linux, Windows)
npm run build:all
```

Binaries will be created in the `dist/` directory.

## Usage

### Basic Usage
```bash
mdrender filename.md [options]
```

### File Mode (Default)
```bash
# Render a README file
mdrender README.md

# Render any markdown file
mdrender docs/getting-started.md

# Works with relative and absolute paths
mdrender /path/to/document.md
```

### Server Mode
```bash
# Serve on default port (3000)
mdrender README.md --serve

# Serve on custom port
mdrender README.md --serve 8080

# Serve with auto-reload on file changes
mdrender README.md --serve 3000 --watch

# Access from other devices on network
mdrender README.md --serve 3000
# Then visit http://YOUR_IP:3000 from any device
```

### Options
- `--serve [port]` - Serve file on HTTP server (default port: 3000)
- `--watch` - Auto-reload browser when file changes (requires --serve)

### Theme Switching
- **🌙 Dark Mode**: Click the moon icon in the top-right corner
- **☀️ Light Mode**: Click the sun icon to switch back
- **System Default**: Automatically detects your OS theme preference
- **Persistent**: Your choice is saved across sessions

## How It Works

### File Mode (Default)
1. Reads your markdown file
2. Converts it to HTML using GitHub Flavored Markdown
3. Applies GitHub-like CSS styling
4. Creates a temporary HTML file
5. Opens it in your default browser

### Server Mode
1. Reads your markdown file
2. Converts it to HTML with GitHub-like styling
3. Starts a local HTTP server
4. Serves the content at `http://localhost:PORT`
5. Opens browser to the server URL
6. **With --watch**: Monitors file changes and auto-reloads browser

## Dependencies

- [marked](https://marked.js.org/) - Fast markdown parser
- [highlight.js](https://highlightjs.org/) - Syntax highlighting

## Why MdRender?

Unlike terminal-based markdown viewers (`glow`, `mdcat`, etc.), MdRender renders your markdown exactly like GitHub does, in your browser where you can:

- Click links
- Copy formatted text
- Print or save as PDF
- Use browser zoom and search
- Get the full GitHub reading experience

### Server Mode Benefits

- **Network sharing**: Access your docs from any device on the network
- **Live editing**: See changes instantly with `--watch` mode
- **No file pollution**: No temporary files cluttering your system
- **Development workflow**: Perfect for documentation while coding
- **Presentation mode**: Share docs with teammates via local network

### Smart Features

- **Tab management**: Automatically reuses browser tabs for the same file
- **Auto-reload**: Real-time updates when files change (server mode)
- **Dark/Light themes**: System default detection with manual toggle
- **GitHub-accurate**: Perfect recreation of GitHub's light and dark themes
- **Cross-platform**: Works on macOS, Linux, and Windows
- **No dependencies**: Standalone binaries require no Node.js installation

## License

MIT