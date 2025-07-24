export async function run(args) {
    try {
        // Step 1: Get session info
        const sessionResp = await fetch('https://scratch.mit.edu/session/', {
            credentials: 'include',
            headers: {
                'accept': '*/*',
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        const session = await sessionResp.json();
        const username = session?.user?.username;
        if (!username) return "Could not extract username from session.";

        // Step 2: Get CSRF token from cookies
        const cookies = document.cookie.split(';').map(c => c.trim());
        const csrfCookie = cookies.find(c => c.startsWith('scratchcsrftoken='));
        if (!csrfCookie) return "CSRF token not found in cookies.";
        const csrfToken = csrfCookie.split('=')[1];

        // Step 3: Send follow request
        const followUrl = `https://scratch.mit.edu/site-api/users/followers/${username}/add/?usernames=${username}`;
        const followResp = await fetch(followUrl, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'content-type': 'application/json',
                'x-csrftoken': csrfToken,
                'x-requested-with': 'XMLHttpRequest',
                'origin': 'https://scratch.mit.edu',
                'referer': `https://scratch.mit.edu/users/${username}/`
            },
            body: JSON.stringify({
                username: username
            })
        });

        if (followResp.status === 200) {
            return "Follow successful";
        } else {
            return "Follow unsuccessful";
        }
    } catch (err) {
        return "Error: " + err;
    }
}
