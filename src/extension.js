const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const EXTENSION_NAME = 'ephemeral-theme';
const EXTENSION_ID = `hukakhepak.${EXTENSION_NAME}`;
const BACKGROUND_VER = `${EXTENSION_NAME}.ver`;
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
// Background image functionality inspired by shalldie/vscode-background extension
function generateFullscreenPatch() {
    const extensionRoot = getExtensionRoot();
    if (!extensionRoot) {
        return '';
    }
    
    const imagePath = path.join(extensionRoot, 'resources', 'ephemeral.gif');
    const normalizedImageUrl = normalizeImageUrl(imagePath);
    
    if (!normalizedImageUrl) {
        return '';
    }
    
    const cssVariable = `--${EXTENSION_NAME}-fullscreen-img`;
    
    // JS script that reads config from VS Code settings and applies it
    // Uses VS Code's configuration service available in workbench context
    const script = `
(function() {
    const cssVariable = '${cssVariable}';
    const image = '${normalizedImageUrl}';
    const extensionName = '${EXTENSION_NAME}';
    
    function getConfig() {
        try {
            // Access VS Code configuration through workbench API
            if (typeof require !== 'undefined') {
                const vscode = require('vscode');
                const config = vscode.workspace.getConfiguration(extensionName);
                return {
                    enabled: config.get('enabled', true),
                    opacity: config.get('opacity', 0.05)
                };
            }
        } catch (e) {
            console.error('Ephemeral Theme: Failed to read config', e);
        }
        return { enabled: true, opacity: 0.05 };
    }
    
    function applyBackground() {
        try {
            const config = getConfig();
            const size = 'cover';
            
            if (!config.enabled) {
                // Remove background if disabled
                const existingStyle = document.getElementById('${EXTENSION_NAME}-background-style');
                if (existingStyle) {
                    existingStyle.remove();
                }
                document.body.style.removeProperty(cssVariable);
                return;
            }
            
            // Remove existing style if any
            const existingStyle = document.getElementById('${EXTENSION_NAME}-background-style');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            // Create new style with current config
            const style = document.createElement("style");
            style.id = '${EXTENSION_NAME}-background-style';
            style.textContent = \`body::after {
    content: '';
    display: block;
    position: absolute;
    z-index: 1000;
    inset: 0;
    pointer-events: none;
    background-size: \${size};
    background-repeat: no-repeat;
    background-position: center;
    opacity: \${config.opacity};
    transition: 1s;
    background-image: var(\${cssVariable});
}\`;
            document.head.appendChild(style);
            
            // Set image
            document.body.style.setProperty(cssVariable, 'url(' + image + ')');
        } catch (error) {
            console.error('Ephemeral Theme: Failed to apply background', error);
        }
    }
    
    // Apply on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBackground);
    } else {
        applyBackground();
    }
    
    // Re-apply when settings might change (polling as fallback)
    // Main updates happen on window reload
    setInterval(function() {
        const existingStyle = document.getElementById('${EXTENSION_NAME}-background-style');
        if (!existingStyle) {
            applyBackground();
        }
    }, 5000);
})();`;
    
    return script;
}

// Clean patches from file
function cleanPatches(content) {
    const regex = new RegExp(`\\n// ${BACKGROUND_VER}\\.[\\s\\S]*?// ${BACKGROUND_VER}-end`, 'g');
    return content.replace(regex, '');
}

// Check if patch is already applied
async function hasPatched() {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        return false;
    }
    
    try {
        const content = await fs.promises.readFile(jsPath, ENCODING);
        // Check if current version patch exists
        if (content.includes(`${BACKGROUND_VER}.${VERSION}`)) {
            return true;
        }
        // Check if any old version patch exists
        if (content.includes(BACKGROUND_VER)) {
            return 'legacy';
        }
        return false;
    } catch (error) {
        // If we can't read file due to permissions, assume patch might be applied
        // Don't try to restore if we can't even check status
        if (error.code === 'EPERM' || error.code === 'EACCES') {
            console.warn('Ephemeral Theme: Cannot check patch status due to permissions');
            return 'unknown'; // Return special value to indicate we can't check
        }
        console.error('Ephemeral Theme: Failed to check patch status', error);
        return false;
    }
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
            // Ensure content ends properly before adding patch
            // For minified files, ensure we end with semicolon or newline
            const trimmed = content.trimEnd();
            if (!trimmed.endsWith(';') && !trimmed.endsWith('}')) {
                content = trimmed + ';';
            }
            if (!content.endsWith('\n')) {
                content += '\n';
            }
            content += [
                `// ${BACKGROUND_VER}.${VERSION}`,
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
async function applyPatches(patchContent, force = false) {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        console.warn(`Ephemeral Theme: workbench.js not found at ${jsPath}`);
        return { success: false, error: 'File not found' };
    }
    
    try {
        let content = await fs.promises.readFile(jsPath, ENCODING);
        
        // Check if already patched with current version
        if (!force && content.includes(`${BACKGROUND_VER}.${VERSION}`)) {
            console.log('Ephemeral Theme: Patch already applied, skipping');
            return { success: true, alreadyApplied: true };
        }
        
        content = cleanPatches(content);
        
        if (patchContent) {
            // Ensure content ends properly before adding patch
            // For minified files, ensure we end with semicolon or newline
            const trimmed = content.trimEnd();
            if (!trimmed.endsWith(';') && !trimmed.endsWith('}')) {
                content = trimmed + ';';
            }
            if (!content.endsWith('\n')) {
                content += '\n';
            }
            content += [
                `// ${BACKGROUND_VER}.${VERSION}`,
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

// Restore workbench.js (remove patches) with sudo/admin rights
async function restoreWithSudo() {
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
        
        // Write to temp file first
        const randomId = crypto.randomBytes(16).toString('hex');
        const tempFilePath = path.join(tmpdir(), `ephemeral-theme-restore-${randomId}.tmp`);
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

// Restore workbench.js (remove patches)
async function restore() {
    const jsPath = getJsPath();
    
    if (!fs.existsSync(jsPath)) {
        return { success: false, error: 'File not found' };
    }
    
    try {
        let content = await fs.promises.readFile(jsPath, ENCODING);
        content = cleanPatches(content);
        await fs.promises.writeFile(jsPath, content, ENCODING);
        return { success: true };
    } catch (error) {
        console.error('Ephemeral Theme: Failed to restore workbench.js', error);
        
        // Check if it's a permission error
        if (error.code === 'EPERM' || error.code === 'EACCES') {
            return { success: false, error: 'PERMISSION_DENIED', message: error.message };
        }
        
        return { success: false, error: error.code || 'UNKNOWN', message: error.message };
    }
}

// Apply background
async function applyBackground(isFirstActivation = false, force = false) {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const enabled = config.get('enabled', true);
    const opacity = config.get('opacity', 0.05);
    const size = 'cover'; // Always use cover
    
    console.log(`Ephemeral Theme: enabled=${enabled}, opacity=${opacity}, force=${force}`);
    
    if (!enabled) {
        // Check if already restored (no patch)
        const patchStatus = await hasPatched();
        
        // If we can't check status due to permissions, don't try to restore
        if (patchStatus === 'unknown') {
            console.log('Ephemeral Theme: Cannot check patch status, skipping restore');
            return;
        }
        
        if (!force && patchStatus === false) {
            console.log('Ephemeral Theme: Already disabled, skipping restore');
            return;
        }
        
        // Only try to restore if we know patch is applied
        if (patchStatus !== true && patchStatus !== 'legacy') {
            console.log('Ephemeral Theme: No patch to restore');
            return;
        }
        
        const restoreResult = await restore();
        if (!restoreResult.success && restoreResult.error === 'PERMISSION_DENIED') {
            // Show notification asking for permissions to restore
            const jsPath = getJsPath();
            vscode.window.showErrorMessage(
                `Ephemeral Theme: Permission denied. Grant administrator rights to disable background?`,
                'Grant Permissions',
                'Learn More'
            ).then(action => {
                if (action === 'Grant Permissions') {
                    // Try to restore with sudo/admin rights
                    restoreWithSudo().then(sudoResult => {
                        if (sudoResult.success) {
                            vscode.window.showInformationMessage(
                                'Ephemeral Theme: Background has been disabled! Please reload the window.',
                                { title: 'Reload Window' }
                            ).then(confirm => {
                                if (confirm) {
                                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                                }
                            });
                        } else {
                            vscode.window.showErrorMessage(
                                `Ephemeral Theme: Failed to disable background. Please run VS Code as Administrator.\n\nFile: ${jsPath}`,
                                'Learn More'
                            ).then(learnAction => {
                                if (learnAction === 'Learn More') {
                                    vscode.env.openExternal(vscode.Uri.parse('https://code.visualstudio.com/docs/editor/command-line#_running-with-administrator-privileges'));
                                }
                            });
                        }
                    }).catch(error => {
                        vscode.window.showErrorMessage(
                            `Ephemeral Theme: Failed to disable background. ${error.message || 'Unknown error'}`,
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
    
    // Check if already patched
    const patchStatus = await hasPatched();
    
    // If patch is already applied and not forcing, skip reapplication
    // Patch reads config dynamically, so no need to update it
    // But allow force to reapply if needed (e.g., when switching theme)
    if (patchStatus === true && !force) {
        console.log('Ephemeral Theme: Patch already applied with current version, skipping');
        return;
    }
    
    // Only apply patch if it's not already applied
    // This should only happen on first activation
    const patchContent = generateFullscreenPatch();
    const result = await applyPatches(patchContent, false);
    
    // If already applied, don't show error
    if (result.alreadyApplied) {
        return;
    }
    
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
    
    // Show reload notification after successful patch
    if (result.success) {
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

// Check if this is first installation and set defaults
async function checkFirstInstall() {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    
    // Check if config values are explicitly set (not just defaults)
    // Only set opacity default on first install, never override user settings
    const opacityInspect = config.inspect('opacity');
    
    // Set opacity if not explicitly set anywhere
    if (opacityInspect.globalValue === undefined && 
        opacityInspect.workspaceValue === undefined && 
        opacityInspect.workspaceFolderValue === undefined) {
        try {
            await config.update('opacity', 0.05, vscode.ConfigurationTarget.Global);
            console.log('Ephemeral Theme: Set opacity=0.05 in settings (first install)');
        } catch (error) {
            console.error('Ephemeral Theme: Failed to set opacity', error);
        }
    }
}

function activate(context) {
    console.log('Ephemeral Theme background extension is now active');
    
    // Check if first install and set default opacity
    checkFirstInstall();
    
    // Track previous theme to detect when user switches to Ephemeral
    const globalConfig = vscode.workspace.getConfiguration();
    let previousTheme = globalConfig.get('workbench.colorTheme');
    
    // Listen for theme changes - set enabled=true only when user switches TO Ephemeral
    const themeWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        console.log(`Ephemeral Theme: Configuration event fired, affects workbench.colorTheme: ${e.affectsConfiguration('workbench.colorTheme')}`);
        
        if (e.affectsConfiguration('workbench.colorTheme')) {
            // Re-read config to get latest value
            const currentConfig = vscode.workspace.getConfiguration();
            const currentTheme = currentConfig.get('workbench.colorTheme');
            console.log(`Ephemeral Theme: Theme changed from "${previousTheme}" to "${currentTheme}"`);
            
            const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
            
            // Check if theme name matches (could be "Ephemeral" or full extension ID)
            const isEphemeralTheme = currentTheme === 'Ephemeral' || 
                                     currentTheme === EXTENSION_ID ||
                                     currentTheme?.includes('Ephemeral');
            
            // Only set enabled=true if user switched TO Ephemeral (was not Ephemeral before)
            const wasEphemeralBefore = previousTheme === 'Ephemeral' || 
                                      previousTheme === EXTENSION_ID ||
                                      previousTheme?.includes('Ephemeral');
            
            if (isEphemeralTheme && !wasEphemeralBefore) {
                console.log(`Ephemeral Theme: User switched TO Ephemeral theme`);
                try {
                    const enabledInspect = config.inspect('enabled');
                    const currentGlobalValue = enabledInspect.globalValue;
                    console.log(`Ephemeral Theme: Current enabled in user settings: ${currentGlobalValue === undefined ? 'not set' : currentGlobalValue}`);
                    
                    // Only set enabled to true if it's not explicitly set in user settings
                    // If it's explicitly set to false, don't change it
                    // If it's not set (undefined), create it with value true
                    if (currentGlobalValue === undefined) {
                        console.log(`Ephemeral Theme: enabled not set in user settings, creating enabled=true`);
                        
                        // Update the setting
                        await config.update('enabled', true, vscode.ConfigurationTarget.Global);
                        
                        // Wait a bit for VS Code to save the setting
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Re-read config to verify it was saved
                        const verifyConfig = vscode.workspace.getConfiguration(EXTENSION_NAME);
                        const verifyInspect = verifyConfig.inspect('enabled');
                        console.log(`Ephemeral Theme: Set enabled=true in user settings. Verified: ${verifyInspect.globalValue}`);
                        
                        if (verifyInspect.globalValue !== true) {
                            console.error(`Ephemeral Theme: WARNING - enabled was not saved correctly! Expected true, got ${verifyInspect.globalValue}`);
                        }
                    } else if (currentGlobalValue === false) {
                        console.log(`Ephemeral Theme: enabled is explicitly set to false in user settings, not changing it`);
                    } else {
                        console.log(`Ephemeral Theme: enabled is already set to ${currentGlobalValue} in user settings`);
                    }
                    
                    // Always apply patch when switching to Ephemeral theme (if enabled is true or not set)
                    // Use force=true to ensure patch is applied even if it was already applied
                    // Re-read config after potential update
                    const finalConfig = vscode.workspace.getConfiguration(EXTENSION_NAME);
                    const enabled = finalConfig.get('enabled', true);
                    console.log(`Ephemeral Theme: enabled value for patch: ${enabled}`);
                    if (enabled) {
                        await applyBackground(false, true);
                    }
                } catch (error) {
                    console.error('Ephemeral Theme: Failed to set enabled', error);
                    vscode.window.showErrorMessage(`Ephemeral Theme: Failed to set enabled: ${error.message}`);
                }
            }
            
            previousTheme = currentTheme;
        }
    });
    
    disposables.push(themeWatcher);
    
    // Don't apply patch automatically on activation
    // Patch will be applied when user enables it or switches to Ephemeral theme
    // Check if patch needs to be removed if enabled is explicitly false
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    const enabledInspect = config.inspect('enabled');
    const enabled = config.get('enabled');
    
    // Only act if enabled is explicitly set (not undefined/default)
    if (enabledInspect.globalValue !== undefined || 
        enabledInspect.workspaceValue !== undefined || 
        enabledInspect.workspaceFolderValue !== undefined) {
        // enabled is explicitly set
        if (enabled === false) {
            // If explicitly disabled, check if patch needs to be removed
            applyBackground(false, false);
        }
        // If enabled is true, patch should already be applied (or will be applied when needed)
        // Don't apply automatically on activation
    }
    // If enabled is not set (undefined), do nothing - patch will be applied when theme is switched
    
    // Listen for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(EXTENSION_NAME)) {
            const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
            const enabled = config.get('enabled', true);
            const patchStatus = await hasPatched();
            
            // Check if 'enabled' setting changed
            const enabledChanged = e.affectsConfiguration('ephemeral-theme.enabled');
            
            if (enabledChanged && !enabled) {
                // 'enabled' changed to false - need to remove patch
                if (patchStatus === true || patchStatus === 'legacy') {
                    // Patch is applied, need to remove it (requires permissions)
                    await applyBackground(false, false);
                }
                // If patch not applied or unknown, nothing to do
            } else if (enabledChanged && enabled) {
                // 'enabled' changed to true - check if patch is applied
                if (patchStatus !== true) {
                    // Patch not applied, apply it (requires permissions)
                    await applyBackground(false, false);
                } else {
                    // Patch already applied, just reload
                    vscode.window.showInformationMessage(
                        'Ephemeral Theme: Background configuration changed. Please reload window.',
                        { title: 'Reload' }
                    ).then(confirm => {
                        if (confirm) {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
                }
            } else {
                // Other settings changed (opacity, etc.) - patch reads config dynamically
                // Just show reload notification, never reapply patch
                if (patchStatus === true) {
                    vscode.window.showInformationMessage(
                        'Ephemeral Theme: Background configuration changed. Please reload window.',
                        { title: 'Reload' }
                    ).then(confirm => {
                        if (confirm) {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
                } else if (patchStatus === false) {
                    // Patch not applied, apply it (first time, requires permissions)
                    await applyBackground(false, false);
                }
                // If unknown, do nothing
            }
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
