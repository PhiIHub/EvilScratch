document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    button.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'doSomething' }, function(response) {
            console.log('Response from background:', response);
        });
    });
    
    const cliOutput = document.getElementById('cli-output');
    const cliInput = document.getElementById('cli-input');

    function showHelp() {
        cliOutput.innerHTML += `<div style="color:#0af;">Available commands:</div>`;
        cliOutput.innerHTML += `<div style="color:#0af;">help - Show this help message</div>`;
        cliOutput.innerHTML += `<div style="color:#0af;">echo [text] - Echo back your text</div>`;
        cliOutput.innerHTML += `<div style="color:#0af;">clear - Clear the CLI output</div>`;
        cliOutput.innerHTML += `<div style="color:#0af;">(add more commands here...)</div>`;
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }

    cliInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const command = cliInput.value.trim();
            if (command) {
                cliOutput.innerHTML += `<div>&gt; ${command}</div>`;
                if (command === 'help') {
                    showHelp();
                } else if (command.startsWith('echo ')) {
                    cliOutput.innerHTML += `<div style="color:#0f0;">${command.slice(5)}</div>`;
                } else if (command === 'clear') {
                    cliOutput.innerHTML = '';
                } else {
                    cliOutput.innerHTML += `<div style="color:#f00;">Unknown command. Type 'help' for options.</div>`;
                }
                cliOutput.scrollTop = cliOutput.scrollHeight;
                cliInput.value = '';
            }
        }
    });
});
