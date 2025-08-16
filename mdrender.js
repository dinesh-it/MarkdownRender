#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');
const { exec } = require('child_process');
const os = require('os');

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

// GitHub-like CSS
const githubCSS = `
<style>
body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #24292f;
  background-color: #ffffff;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
h5 { font-size: 0.875em; }
h6 { font-size: 0.85em; color: #656d76; }

p { margin-top: 0; margin-bottom: 16px; }

blockquote {
  padding: 0 1em;
  color: #656d76;
  border-left: 0.25em solid #d0d7de;
  margin: 0 0 16px 0;
}

ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
li + li { margin-top: 0.25em; }

code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  white-space: break-spaces;
  background-color: rgba(175,184,193,0.2);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
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
  border: 1px solid #d0d7de;
}

table th {
  font-weight: 600;
  background-color: #f6f8fa;
}

table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

a {
  color: #0969da;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #d0d7de;
  border: 0;
}

/* Highlight.js GitHub theme */
.hljs {
  color: #24292f;
  background: #f6f8fa;
}

.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
  color: #d73a49;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
  color: #6f42c1;
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
  color: #005cc5;
}

.hljs-string,
.hljs-meta .hljs-string,
.hljs-regexp {
  color: #032f62;
}

.hljs-built_in,
.hljs-symbol {
  color: #e36209;
}

.hljs-code,
.hljs-comment,
.hljs-formula {
  color: #6a737d;
}

.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
  color: #22863a;
}
</style>
`;

function showUsage() {
  console.log('Usage: mdrender <markdown-file>');
  console.log('Example: mdrender README.md');
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

function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    showUsage();
  }
  
  const mdFile = args[0];
  
  if (!fs.existsSync(mdFile)) {
    console.error(`Error: File '${mdFile}' not found`);
    process.exit(1);
  }
  
  try {
    // Read markdown file
    const markdownContent = fs.readFileSync(mdFile, 'utf8');
    
    // Convert to HTML
    const htmlContent = marked(markdownContent);
    
    // Create complete HTML document
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
    ${htmlContent}
</body>
</html>
`;
    
    // Create temporary HTML file
    const tempDir = os.tmpdir();
    const htmlFile = path.join(tempDir, `${path.basename(mdFile, '.md')}.html`);
    
    fs.writeFileSync(htmlFile, fullHTML);
    
    console.log(`Rendered ${mdFile} -> ${htmlFile}`);
    console.log('Opening in browser...');
    
    // Open in browser
    openInBrowser(htmlFile);
    
  } catch (error) {
    console.error('Error processing file:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}