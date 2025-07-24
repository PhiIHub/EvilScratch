export async function run(args) {
    // Usage: addtopopularstudios [project_id] [number_of_studios]
    // Ask for params in the CLI if not provided
    let projectId = args[0];
    let studioCount = parseInt(args[1], 10);

    // If not provided, prompt in the CLI
    if (!projectId || isNaN(studioCount)) {
        let cliOutput = document.getElementById('cli-output');
        if (cliOutput) {
            cliOutput.innerHTML += `<div style="color:#0af;">Usage: addtopopularstudios [project_id] [number_of_studios]</div>`;
            return "Please provide both a project ID and the number of studios as arguments.";
        }
        return "Usage: addtopopularstudios [project_id] [number_of_studios]";
    }

    // Step 1: Get Scratch session token from /session/
    let token;
    try {
        const sessionResp = await fetch('https://scratch.mit.edu/session/', {
            credentials: 'include',
            headers: {
                'accept': '*/*',
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        const session = await sessionResp.json();
        token = session?.user?.token;
        if (!token) return "Could not extract session token.";
    } catch (err) {
        return "Error fetching session: " + err;
    }

    // Step 2: Fetch studios and filter for open_to_all
    let offset = 0;
    let studioIds = [];
    while (studioIds.length < studioCount) {
        const url = `https://api.scratch.mit.edu/explore/studios/?limit=40&offset=${offset}&language=en&mode=popular`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) return `Error fetching studios: ${resp.status}`;
            const data = await resp.json();
            if (!Array.isArray(data) || data.length === 0) break;
            for (const studio of data) {
                if (studio.open_to_all) {
                    studioIds.push(studio.id);
                    if (studioIds.length >= studioCount) break;
                }
            }
            offset += 40;
        } catch (err) {
            return "Error fetching studios: " + err;
        }
    }

    if (studioIds.length < studioCount) {
        return `Only found ${studioIds.length} open-to-all studios. Try a smaller number.`;
    }

    // Step 3: Add project to each studio with live progress bar
    let successes = 0;
    let failures = 0;
    let progressBar = (done, total, width = 30) => {
        const percent = Math.floor((done / total) * 100);
        const filled = Math.floor((done / total) * width);
        const empty = width - filled;
        return `[${"=".repeat(filled)}${" ".repeat(empty)}] ${percent}% (${done}/${total})`;
    };

    // Find CLI output element
    let cliOutput = document.getElementById('cli-output');
    if (!cliOutput) cliOutput = document.body;

    // Initial progress bar
    let progressDiv = document.createElement('div');
    progressDiv.style.color = "#0af";
    progressDiv.style.fontFamily = "monospace";
    progressDiv.innerText = progressBar(0, studioIds.length);
    cliOutput.appendChild(progressDiv);

    for (let i = 0; i < studioIds.length; i++) {
        const studioId = studioIds[i];
        const addUrl = `https://api.scratch.mit.edu/studios/${studioId}/project/${projectId}`;
        try {
            const resp = await fetch(addUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'accept': '*/*',
                    'origin': 'https://scratch.mit.edu',
                    'referer': 'https://scratch.mit.edu/',
                    'x-token': token
                }
            });
            if (resp.status === 200 || resp.status === 201) {
                successes++;
            } else {
                failures++;
            }
        } catch (err) {
            failures++;
        }
        // Update progress bar and yield to event loop for live update
        progressDiv.innerText = progressBar(i + 1, studioIds.length);
        await new Promise(r => setTimeout(r, 0));
    }

    progressDiv.innerText = progressBar(studioIds.length, studioIds.length) + " - Done!";
    return `Added project to ${successes} studios`;
}
