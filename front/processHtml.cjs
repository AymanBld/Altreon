const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

let jsOutput = '';

files.forEach(file => {
    const filePath = path.join(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content);
    
    // Get the inner HTML of the body
    let bodyHtml = $('body').html();
    
    // The HTML string can be exported
    const constName = file.replace('.html', '').replace(/[^a-zA-Z0-9]/g, '');
    jsOutput += `export const ${constName} = ${JSON.stringify(bodyHtml)};\n\n`;
});

fs.writeFileSync(path.join(srcDir, 'htmlScreens.js'), jsOutput);
console.log('Successfully generated htmlScreens.js');
