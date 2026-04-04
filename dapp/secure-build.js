const JavaScriptObfuscator = require('javascript-obfuscator');
const htmlMinifier = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const buildDir = path.join(__dirname, 'build');
console.log('Build directory:', buildDir);

function processDirectory(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const filePath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
            processDirectory(filePath);
        } else {
            processFile(filePath);
        }
    });
}

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (ext === '.js') {
        processJSFile(filePath);
    } else if (ext === '.css') {
        processCSSFile(filePath);
    } else if (ext === '.html') {
        processHTMLFile(filePath);
    }
}

function processJSFile(filePath) {
    console.log('Processing JS file:', filePath);
    const code = fs.readFileSync(filePath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        disableConsoleOutput: false,
        debugProtection: false,
        reservedNames: ['emit', 'on', 'postMessage', 'WebSocket'],
        renameGlobals: false,
        identifierNamesGenerator: 'hexadecimal',
        splitStrings: false,
        unicodeEscapeSequence: false
    });
    const obfuscatedCode = obfuscationResult.getObfuscatedCode();
    if (fileChanged(filePath, obfuscatedCode)) {
        fs.writeFileSync(filePath, obfuscatedCode);
        console.log('JS file updated:', filePath);
    } else {
        console.log('No changes needed for JS file:', filePath);
    }
}

function processCSSFile(filePath) {
    console.log('Processing CSS file:', filePath);
    const css = fs.readFileSync(filePath, 'utf8');
    console.log('Original CSS length:', css.length);

    const minificationResult = new CleanCSS({
        level: {
            1: {
                all: true,
            },
            2: {
                all: true,
                removeUnusedAtRules: false,
            }
        }
    }).minify(css);

    console.log('Minification efficiency:', minificationResult.stats.efficiency);
    console.log('Minified CSS length:', minificationResult.styles.length);

    if (fileChanged(filePath, minificationResult.styles)) {
        fs.writeFileSync(filePath, minificationResult.styles);
        console.log('CSS file updated:', filePath);
    } else {
        console.log('No changes needed for CSS file:', filePath);
    }
}

function processHTMLFile(filePath) {
    console.log('Processing HTML file:', filePath);
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const minifiedHtml = htmlMinifier.minify(htmlContent, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    });
    if (fileChanged(filePath, minifiedHtml)) {
        fs.writeFileSync(filePath, minifiedHtml);
        console.log('HTML file updated:', filePath);
    } else {
        console.log('No changes needed for HTML file:', filePath);
    }
}

function fileChanged(filePath, newContent) {
    const oldContent = fs.readFileSync(filePath, 'utf8');
    const oldHash = crypto.createHash('md5').update(oldContent).digest('hex');
    const newHash = crypto.createHash('md5').update(newContent).digest('hex');
    return oldHash !== newHash;
}

processDirectory(buildDir);
console.log('Build process complete!');