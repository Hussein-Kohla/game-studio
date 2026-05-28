const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'الاسالة', 'الافلا والمسلسلات');
const file1 = fs.readFileSync(path.join(dir, 'gemini-code-1779965718990.ts'), 'utf8'); // m1 to m80
const file2 = fs.readFileSync(path.join(dir, 'gemini-code-1779965715933.ts'), 'utf8'); // m81 to m120
const file3 = fs.readFileSync(path.join(dir, 'gemini-code-1779965712531.ts'), 'utf8'); // m121 to m182

let merged = file1.replace(/]\s*};\s*$/, '');
merged += ',\n' + file2.trim();
merged = merged.replace(/,\s*$/, ''); // Remove trailing comma if any
merged += ',\n' + file3.trim();

// Ensure it ends with ]};
if (!merged.trim().endsWith('}')) {
  if (merged.trim().endsWith(']')) {
    merged += '\n};';
  } else {
    // maybe it is just missing the closing bracket
    merged += '\n  ]\n};';
  }
} else if (!merged.trim().endsWith('};')) {
    merged += '\n  ]\n};';
}

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'packages', 'pkg_pop_culture.ts'), merged);
console.log("Merged pop culture!");
