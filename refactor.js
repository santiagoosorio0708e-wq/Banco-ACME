const fs = require('fs');
const path = require('path');

const dirComponentes = path.join(__dirname, 'componentes');
const dirJs = path.join(__dirname, 'js');
const indexFile = path.join(__dirname, 'index.html');

// 1. Refactor base-datos.js
let dbContent = fs.readFileSync(path.join(dirJs, 'base-datos.js'), 'utf8');
dbContent = dbContent.replace(/window\.db = new BaseDatos\(\);/, 'export const db = new BaseDatos();');
dbContent = dbContent.replace(/window\.db\.migrarDatos\(\);/, 'db.migrarDatos();');
fs.writeFileSync(path.join(dirJs, 'base-datos.js'), dbContent);

// 2. Refactor autenticacion.js
let authContent = fs.readFileSync(path.join(dirJs, 'autenticacion.js'), 'utf8');
authContent = authContent.replace(/window\.auth = new Autenticacion\(\);/, 'export const auth = new Autenticacion();');
authContent = authContent.replace(/window\.db/g, 'db');
authContent = `import { db } from './base-datos.js';\n` + authContent;
fs.writeFileSync(path.join(dirJs, 'autenticacion.js'), authContent);

// 3. Refactor componentes
const componentes = fs.readdirSync(dirComponentes).filter(f => f.endsWith('.js'));
for (const comp of componentes) {
    const compPath = path.join(dirComponentes, comp);
    let content = fs.readFileSync(compPath, 'utf8');
    
    let imports = [];
    if (content.includes('window.db') || content.includes(' db.')) {
        imports.push(`import { db } from '../js/base-datos.js';`);
    }
    if (content.includes('window.auth') || content.includes(' auth.')) {
        imports.push(`import { auth } from '../js/autenticacion.js';`);
    }
    
    content = content.replace(/window\.db/g, 'db');
    content = content.replace(/window\.auth/g, 'auth');
    
    if (imports.length > 0) {
        content = imports.join('\n') + '\n\n' + content;
    }
    fs.writeFileSync(compPath, content);
}

// 4. Refactor principal.js
let principalContent = fs.readFileSync(path.join(dirJs, 'principal.js'), 'utf8');
principalContent = principalContent.replace(/window\.auth/g, 'auth');
let principalImports = [
    `import { db } from './base-datos.js';`,
    `import { auth } from './autenticacion.js';`
];
for (const comp of componentes) {
    principalImports.push(`import '../componentes/${comp}';`);
}
principalContent = principalImports.join('\n') + '\n\n' + principalContent;
fs.writeFileSync(path.join(dirJs, 'principal.js'), principalContent);

// 5. Refactor index.html
let indexContent = fs.readFileSync(indexFile, 'utf8');
// Remove all <script src="js/..."></script> and <script src="componentes/..."></script> except chart.js
indexContent = indexContent.replace(/<script src="js\/(base-datos|autenticacion)\.js"><\/script>\n?/g, '');
indexContent = indexContent.replace(/<script src="componentes\/.*?\.js"><\/script>\n?/g, '');
// Replace principal.js with type="module"
indexContent = indexContent.replace(/<script src="js\/principal\.js"><\/script>/, '<script type="module" src="js/principal.js"></script>');
fs.writeFileSync(indexFile, indexContent);

console.log('Refactoring complete!');
