# MdRender

A lightweight command-line tool that converts Markdown files to HTML and opens them in your browser with GitHub-like styling.

## Features

- ✅ GitHub-like styling and layout
- ✅ Syntax highlighting for code blocks  
- ✅ Support for tables, blockquotes, lists, and more
- ✅ Auto-opens in your default browser
- ✅ Cross-platform support (macOS, Linux, Windows)
- ✅ Temporary file cleanup

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Install

1. Clone or download this project:
```bash
git clone <repository-url>
cd MdRender
```

2. Install dependencies:
```bash
npm install
```

3. Install globally (optional but recommended):
```bash
npm link
```

This makes `mdrender` available as a global command from anywhere on your system.

## Usage

### Basic Usage
```bash
mdrender filename.md
```

### Examples
```bash
# Render a README file
mdrender README.md

# Render any markdown file
mdrender docs/getting-started.md

# Works with relative and absolute paths
mdrender /path/to/document.md
```

## How It Works

1. Reads your markdown file
2. Converts it to HTML using GitHub Flavored Markdown
3. Applies GitHub-like CSS styling
4. Creates a temporary HTML file
5. Opens it in your default browser

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

## License

MIT