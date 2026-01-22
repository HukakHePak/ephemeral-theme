const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const EXTENSION_NAME = 'ephemeral-theme';
const EXTENSION_ID = 'ephemeral-theme.ephemeral-theme';
const BACKGROUND_VER = 'ephemeral-theme.ver';
const VERSION = '0.0.1';
const ENCODING = 'utf-8';

let disposables = [];

// Get workbench.js path
function getJsPath() {
    const mainFilename = require.main && require.main.filename;
    const vscodeInstallPath = vscode.env.appRoot;
    const base = mainFilename && mainFilename.length ? path.dirname(mainFilename) : path.join(vscodeInstallPath, 'out');
    
    const isDesktop = vscode.env.appHost === 'desktop';
    
    if (isDesktop) {
        return path.join(base, 'vs/workbench/workbench.desktop.main.js');
    }
    
    return path.join(base, 'vs/code/browser/workbench/workbench.js');
}

// Get extension root path
function getExtensionRoot() {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    return (extension && extension.extensionPath) || '';
}

// Normalize image URL to vscode-file protocol
function normalizeImageUrl(imageUrl) {
    try {
        if (!imageUrl.startsWith('file://')) {
            const { pathToFileURL } = require('url');
            imageUrl = pathToFileURL(imageUrl).href;
        }
        const url = imageUrl.replace('file://', 'vscode-file://vscode-app');
        return vscode.Uri.parse(url).toString();
    } catch {
        return '';
    }
}

// Generate fullscreen patch
function generateFullscreenPatch(config) {
    const { enabled, opacity, size } = config;
    
    if (!enabled) {
        return '';
    }
    
    const extensionRoot = getExtensionRoot();
    if (!extensionRoot) {
        return '';
    }
    
    const imagePath = path.join(extensionRoot, 'resources', 'ephemeral.gif');
    const normalizedImageUrl = normalizeImageUrl(imagePath);
    
    if (!normalizedImageUrl) {
        return '';
    }
    
    const cssVariable = '--ephemeral-theme-fullscreen-img';
    
    // CSS style
    const css = `
body::after {
    content: '';
    display: block;
    position: absolute;
    z-index: 1000;
    inset: 0;
    pointer-events: none;
    background-size: ${size};
    background-repeat: no-repeat;
    background-position: center;
    opacity: ${opacity};
    transition: 1s;
    background-image: var(${cssVariable});
}`;
    
    // JS script to set image
    const script = `
const cssvariable = '${cssVariable}';
const image = '${normalizedImageUrl}';
document.body.style.setProperty(cssvariable, 'url(' + image + ')');`;
    
    // Wrap in IIFE
    const styleInjection = `
const style = document.createElement("style");
style.textContent = ${JSON.stringify(css.trim())};
document.head.appendChild(style);`;
    
    return `;(function() { ${styleInjection} })();;(function() { ${script} })();`;
}

// Clean patches from file
function cleanPatches(content) {
    const regex = new RegExp(`\\n// ${BACKGROUND_VER}\\.[\\s\\S]*?// ${BACKGROUND_VER}-end`, 'g');
    return content.replace(regex, '');
}

// Apply patches to workbench.js
async function applyPatches(patchContent) {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        console.warn(`Ephemeral Theme: workbench.js not found at ${jsPath}`);
        return false;
    }
    
    try {
        let content = await fs.promises.readFile(jsPath, ENCODING);
        content = cleanPatches(content);
        
        if (patchContent) {
            content += [
                `\n// ${BACKGROUND_VER}.${VERSION}`,
                patchContent,
                `// ${BACKGROUND_VER}-end`
            ].join('\n');
        }
        
        await fs.promises.writeFile(jsPath, content, ENCODING);
        return true;
    } catch (error) {
        console.error('Ephemeral Theme: Failed to patch workbench.js', error);
        return false;
    }
}

// Restore workbench.js (remove patches)
async function restore() {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        return false;
    }
    
    try {
        let content = await fs.promises.readFile(jsPath, ENCODING);
        content = cleanPatches(content);
        await fs.promises.writeFile(jsPath, content, ENCODING);
        return true;
    } catch (error) {
        console.error('Ephemeral Theme: Failed to restore workbench.js', error);
        return false;
    }
}

// Apply background
async function applyBackground() {
    const config = vscode.workspace.getConfiguration('ephemeral-theme.background');
    const enabled = config.get('enabled', true);
    const opacity = config.get('opacity', 0.1);
    const size = config.get('size', 'cover');
    
    if (!enabled) {
        await restore();
        return;
    }
    
    const patchContent = generateFullscreenPatch({ enabled, opacity, size });
    await applyPatches(patchContent);
}

function activate(context) {
    console.log('Ephemeral Theme background extension is now active');
    
    // Apply background on activation
    applyBackground();
    
    // Listen for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('ephemeral-theme.background')) {
            await applyBackground();
            vscode.window.showInformationMessage(
                'Ephemeral Theme: Background configuration changed. Please reload window.',
                { title: 'Reload' }
            ).then(confirm => {
                if (confirm) {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
    });
    
    disposables.push(configWatcher);
}

function deactivate() {
    // Don't restore on deactivate - let user control it
    disposables.forEach(d => d.dispose());
    disposables = [];
}

module.exports = {
    activate,
    deactivate
};
