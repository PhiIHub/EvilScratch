export async function run(args) {
    // Usage: followers [username] [count] [offset]
    const username = args[0];
    const count = parseInt(args[1], 10) || 40;
    let offset = parseInt(args[2], 10) || 0;
    if (!username) return "Usage: followers [username] [count] [offset]";
    let followers = [];
    let fetched = 0;

    while (followers.length < count) {
        const url = `https://api.scratch.mit.edu/users/${encodeURIComponent(username)}/followers/?offset=${offset}`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) return `Error: ${resp.status}`;
            const data = await resp.json();
            if (!Array.isArray(data) || data.length === 0) break;
            for (const user of data) {
                followers.push(user.username);
                if (followers.length >= count) break;
            }
            if (data.length === 0) break; // No more pages
            offset += 40;
        } catch (err) {
            return "Error: " + err;
        }
    }

    // Format as Python list
    const pyList = `[${followers.map(u => `'${u}'`).join(', ')}]`;

    // Copy to clipboard
    try {
        await navigator.clipboard.writeText(pyList);
    } catch (e) {
        // Clipboard API may fail if not in a user gesture
    }

    return followers.length
        ? `${pyList}\nCopied ${followers.length} followers to clipboard.`
        : `No followers found or error.`;
}
