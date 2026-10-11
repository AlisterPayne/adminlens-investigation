// Builds a PDF from a Markdown guide (default: DEVELOPER_GUIDE.md).
// Usage:  node docs/dev-guide/build-pdf.mjs [path/to/GUIDE.md]
// Needs:  google-chrome on PATH (uses npx marked for Markdown -> HTML).
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const md = path.resolve(process.argv[2] || path.join(dir, 'DEVELOPER_GUIDE.md'));
const base = md.replace(/\.md$/i, '');
const html = base + '.html';
const pdf = base + '.pdf';
const title = (fs.readFileSync(md, 'utf8').match(/^# (.+)$/m) || [, 'Guide'])[1];

const body = execSync(`npx -y marked --gfm -i "${md}"`, { encoding: 'utf8' });

const css = `
@page { size: A4; margin: 14mm 14mm 16mm 14mm; }
body { font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; font-size: 11.5px; line-height: 1.55; }
h1 { font-size: 22px; color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 6px; margin: 0 0 6px; }
h2 { font-size: 16px; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 8px; margin: 18px 0 8px; }
h3 { font-size: 13.5px; color: #1e3a8a; margin: 14px 0 6px; }
p, li { margin: 4px 0; }
code { font-family: Consolas, Menlo, monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 10.5px; }
pre { background: #0f172a; color: #f8fafc; padding: 10px 12px; border-radius: 6px; font-size: 10.5px; white-space: pre-wrap; }
pre code { background: none; color: inherit; padding: 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 10.5px; page-break-inside: auto; }
tr { page-break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 5px 7px; text-align: left; vertical-align: top; }
th { background: #f1f5f9; color: #334155; }
blockquote { margin: 10px 0; padding: 8px 12px; background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; }
blockquote p { margin: 0; }
img { display: block; max-width: 100%; max-height: 245mm; margin: 8px auto; border: 1px solid #e2e8f0; border-radius: 6px; }
img[alt^="Generative AI menu"] { max-width: 60mm; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 14px 0; }
`;

fs.writeFileSync(html, `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`);

execSync(
  `google-chrome --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer --virtual-time-budget=5000 --print-to-pdf="${pdf}" "file://${html}"`,
  { stdio: 'ignore' }
);
fs.unlinkSync(html);
console.log('Wrote', pdf);
