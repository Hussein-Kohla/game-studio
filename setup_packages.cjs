const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'الاسالة');
const destDir = path.join(__dirname, 'src', 'data', 'packages');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. History & Geography
let hgContent = fs.readFileSync(path.join(srcDir, 'game3Questions.ts'), 'utf8');
hgContent = hgContent.replace('export const historyGeographyQuestions = [', 'import { Game5Package } from "../game5Questions";\n\nexport const pkgHistoryGeo: Game5Package = {\n  id: "pkg_history_geo",\n  name: "🌍 بكج العباقرة (تاريخ وجغرافيا)",\n  questions: [');
hgContent = hgContent.replace(/];\s*$/, '  ]\n};\n');
fs.writeFileSync(path.join(destDir, 'pkg_history_geo.ts'), hgContent);

// 2. Science
let scContent = fs.readFileSync(path.join(srcDir, 'game4Questions.ts'), 'utf8');
scContent = scContent.replace('export const scienceQuestions = [', 'import { Game5Package } from "../game5Questions";\n\nexport const pkgScience: Game5Package = {\n  id: "pkg_science",\n  name: "🔬 بكج علماء المستقبل (علوم وطبيعة)",\n  questions: [');
scContent = scContent.replace(/];\s*$/, '  ]\n};\n');
fs.writeFileSync(path.join(destDir, 'pkg_science.ts'), scContent);

// 3. Culture
let cuContent = fs.readFileSync(path.join(srcDir, 'game5Culture200.ts'), 'utf8');
// Fix import path in culture if needed
cuContent = cuContent.replace('import { Game5Package } from "./game5Questions";', 'import { Game5Package } from "../game5Questions";');
fs.writeFileSync(path.join(destDir, 'pkg_culture.ts'), cuContent);

// 4. Islam
let isContent = fs.readFileSync(path.join(srcDir, 'pkg_islam.ts'), 'utf8');
// Add import if missing
if (!isContent.includes('import { Game5Package }')) {
  isContent = 'import { Game5Package } from "../game5Questions";\n' + isContent;
}
fs.writeFileSync(path.join(destDir, 'pkg_islam.ts'), isContent);

console.log("Packages transformed and copied successfully.");
