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

// Apply patches to workbench.js with sudo/admin rights
async function applyPatchesWithSudo(patchContent) {
    const jsPath = getJsPath();
    const { tmpdir } = require('os');
    const crypto = require('crypto');
    
    // Try to load sudo-prompt dynamically
    let sudo;
    try {
        sudo = require('@vscode/sudo-prompt');
    } catch (error) {
        return { success: false, error: 'SUDO_NOT_AVAILABLE', message: 'sudo-prompt module not available' };
    }
    
    try {
        // Read current content
        let content = await fs.promises.readFile(jsPath, ENCODING);
        content = cleanPatches(content);
        
        if (patchContent) {
            content += [
                `\n// ${BACKGROUND_VER}.${VERSION}`,
                patchContent,
                `// ${BACKGROUND_VER}-end`
            ].join('\n');
        }
        
        // Write to temp file first
        const randomId = crypto.randomBytes(16).toString('hex');
        const tempFilePath = path.join(tmpdir(), `ephemeral-theme-${randomId}.tmp`);
        await fs.promises.writeFile(tempFilePath, content, ENCODING);
        
        // Copy temp file to target with sudo
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';
            const cmd = isWindows 
                ? `powershell -Command "Copy-Item -Path '${tempFilePath.replace(/\\/g, '/')}' -Destination '${jsPath.replace(/\\/g, '/')}' -Force"`
                : `cp -f "${tempFilePath}" "${jsPath}"`;
            
            sudo.exec(cmd, { name: 'Ephemeral Theme' }, (error, stdout, stderr) => {
                // Clean up temp file
                fs.promises.unlink(tempFilePath).catch(() => {});
                
                if (error) {
                    reject(error);
                } else {
                    resolve({ success: true });
                }
            });
        });
    } catch (error) {
        return { success: false, error: error.code || 'UNKNOWN', message: error.message };
    }
}

// Apply patches to workbench.js
async function applyPatches(patchContent) {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        console.warn(`Ephemeral Theme: workbench.js not found at ${jsPath}`);
        return { success: false, error: 'File not found' };
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
        return { success: true };
    } catch (error) {
        console.error('Ephemeral Theme: Failed to patch workbench.js', error);
        
        // Check if it's a permission error
        if (error.code === 'EPERM' || error.code === 'EACCES') {
            return { success: false, error: 'PERMISSION_DENIED', message: error.message };
        }
        
        return { success: false, error: error.code || 'UNKNOWN', message: error.message };
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
async function applyBackground(isFirstActivation = false) {
    const config = vscode.workspace.getConfiguration('ephemeral-theme');
    const enabled = config.get('enabled', true);
    const opacity = config.get('opacity', 0.05);
    const size = 'cover'; // Always use cover
    
    if (!enabled) {
        await restore();
        return;
    }
    
    const patchContent = generateFullscreenPatch({ enabled, opacity, size });
    const result = await applyPatches(patchContent);
    
    if (!result.success) {
        if (result.error === 'PERMISSION_DENIED') {
            // Show notification asking for permissions
            const jsPath = getJsPath();
            vscode.window.showErrorMessage(
                `Ephemeral Theme: Permission denied. Grant administrator rights to apply background changes?`,
                'Grant Permissions',
                'Learn More'
            ).then(action => {
                if (action === 'Grant Permissions') {
                    // Try to apply with sudo/admin rights
                    applyPatchesWithSudo(patchContent).then(sudoResult => {
                        if (sudoResult.success) {
                            vscode.window.showInformationMessage(
                                'Ephemeral Theme: Background has been applied! Please reload the window to see the changes.',
                                { title: 'Reload Window' }
                            ).then(confirm => {
                                if (confirm) {
                                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                                }
                            });
                        } else {
                            vscode.window.showErrorMessage(
                                `Ephemeral Theme: Failed to apply changes with administrator rights. Please run VS Code as Administrator.\n\nFile: ${jsPath}`,
                                'Learn More'
                            ).then(learnAction => {
                                if (learnAction === 'Learn More') {
                                    vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/command-line#_running-with-administrator-privileges'));
                                }
                            });
                        }
                    }).catch(error => {
                        vscode.window.showErrorMessage(
                            `Ephemeral Theme: Failed to apply changes. ${error.message || 'Unknown error'}`,
                            'Learn More'
                        ).then(learnAction => {
                            if (learnAction === 'Learn More') {
                                vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/command-line#_running-with-administrator-privileges'));
                            }
                        });
                    });
                } else if (action === 'Learn More') {
                    vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/command-line#_running-with-administrator-privileges'));
                }
            });
        }
        return;
    }
    
    // Show reload notification after successful patch (only on first activation)
    if (isFirstActivation) {
        vscode.window.showInformationMessage(
            'Ephemeral Theme: Background has been applied! Please reload the window to see the changes.',
            { title: 'Reload Window' }
        ).then(confirm => {
            if (confirm) {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        });
    }
}

function activate(context) {
    console.log('Ephemeral Theme background extension is now active');
    
    // Apply background on activation (first time)
    applyBackground(true);
    
    // Listen for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('ephemeral-theme')) {
            await applyBackground(false);
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
