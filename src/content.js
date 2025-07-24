// Remove the DOMContentLoaded wrapper, as content scripts run after DOM is ready

let cliContainer = null;

// Create CLI container
function createCLI() {
    if (cliContainer) return; // Already exists

    cliContainer = document.createElement('div');
    cliContainer.style.position = 'fixed';
    cliContainer.style.bottom = '30px';
    cliContainer.style.right = '30px';
    cliContainer.style.width = '400px';
    cliContainer.style.height = '250px';
    cliContainer.style.background = '#222';
    cliContainer.style.color = '#fff';
    cliContainer.style.border = '2px solid #444';
    cliContainer.style.borderRadius = '8px';
    cliContainer.style.zIndex = '99999';
    cliContainer.style.display = 'flex';
    cliContainer.style.flexDirection = 'column';
    cliContainer.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
    cliContainer.style.resize = 'both';
    cliContainer.style.overflow = 'hidden';

    // Header for dragging
    const cliHeader = document.createElement('div');
    cliHeader.textContent = 'Scratch CLI';
    cliHeader.style.background = '#333';
    cliHeader.style.padding = '8px';
    cliHeader.style.cursor = 'move';
    cliHeader.style.userSelect = 'none';
    cliHeader.style.fontWeight = 'bold';

    // Output area
    const cliOutput = document.createElement('div');
    cliOutput.style.flex = '1';
    cliOutput.style.padding = '8px';
    cliOutput.style.overflowY = 'auto';
    cliOutput.style.fontFamily = 'monospace';
    cliOutput.style.fontSize = '14px';

    // Input area
    const cliInput = document.createElement('input');
    cliInput.type = 'text';
    cliInput.placeholder = 'Type a command...';
    cliInput.style.width = '100%';
    cliInput.style.padding = '8px';
    cliInput.style.border = 'none';
    cliInput.style.outline = 'none';
    cliInput.style.background = '#222';
    cliInput.style.color = '#fff';
    cliInput.style.fontFamily = 'monospace';
    cliInput.style.fontSize = '14px';

    // List of available CLI scripts (update this when you add/remove scripts)
    const availableScripts = [
        "followyourself - Follow yourself on Scratch",
        "followers - List the followers of a user",
        "p2s - Add a project to studios",
        "session - Get session info",
    ];

    // Handle input
    cliInput.addEventListener('keydown', async function(e) {
        if (e.key === 'Enter') {
            const commandLine = cliInput.value.trim();
            if (commandLine) {
                cliOutput.innerHTML += `<div>&gt; ${commandLine}</div>`;
                const [cmd, ...args] = commandLine.split(' ');
                if (cmd === 'help') {
                    cliOutput.innerHTML += `<div style="color:#0af;">Commands:</div><br>`;
                    cliOutput.innerHTML += `<div style="color:#0af;">help - Show this help message</div>`;
                    cliOutput.innerHTML += `<div style="color:#0af;">echo [text] - Echo back your text</div>`;
                    cliOutput.innerHTML += `<div style="color:#0af;">clear - Clear the CLI output</div>`;
                    cliOutput.innerHTML += `<br><div style="color:#0af;">Scripts:</div><br>`;
                    availableScripts.forEach(script => {
                        cliOutput.innerHTML += `<div style="color:#0af;">${script}</div>`;
                    });
                    cliOutput.innerHTML += `<br><div style="color:#0af;">(add more commands by adding scripts!)</div>`;
                } else if (cmd === 'echo') {
                    cliOutput.innerHTML += `<div style="color:#0f0;">${args.join(' ')}</div>`;
                } else if (cmd === 'clear') {
                    cliOutput.innerHTML = '';
                } else {
                    // Try to dynamically import a script matching the command name
                    try {
                        const module = await import(chrome.runtime.getURL(`src/cli-scripts/${cmd}.js`));
                        let result = module.run(args);
                        if (result instanceof Promise) {
                            result = await result;
                        }
                        cliOutput.innerHTML += `<div style="color:#0f0;white-space:pre;">${result}</div>`;
                    } catch (err) {
                        cliOutput.innerHTML += `<div style="color:#f00;">Unknown command or error loading script. Type 'help' for options.</div>`;
                    }
                }
                cliOutput.scrollTop = cliOutput.scrollHeight;
                cliInput.value = '';
            }
        }
    });

    // Drag functionality
    let isDragging = false, offsetX = 0, offsetY = 0;
    cliHeader.addEventListener('mousedown', function(e) {
        isDragging = true;
        offsetX = e.clientX - cliContainer.getBoundingClientRect().left;
        offsetY = e.clientY - cliContainer.getBoundingClientRect().top;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            cliContainer.style.left = (e.clientX - offsetX) + 'px';
            cliContainer.style.top = (e.clientY - offsetY) + 'px';
            cliContainer.style.right = '';
            cliContainer.style.bottom = '';
            cliContainer.style.position = 'fixed';
        }
    });
    document.addEventListener('mouseup', function() {
        isDragging = false;
        document.body.style.userSelect = '';
    });

    // Assemble CLI
    cliContainer.appendChild(cliHeader);
    cliContainer.appendChild(cliOutput);
    cliContainer.appendChild(cliInput);
    document.body.appendChild(cliContainer);
}

function removeCLI() {
    if (cliContainer) {
        cliContainer.remove();
        cliContainer = null;
    }
}

// Listen for toggle message from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.action === 'toggleCLI') {
        if (cliContainer) {
            removeCLI();
        } else {
            createCLI();
        }
    }
});
