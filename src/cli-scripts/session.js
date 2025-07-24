export function run(args) {
    return new Promise((resolve, reject) => {
        fetch('https://scratch.mit.edu/session/', {
            method: 'GET',
            credentials: 'include', // send cookies
            headers: {
                'accept': '*/*',
                'x-requested-with': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(json => resolve(JSON.stringify(json, null, 2)))
        .catch(err => resolve('Error: ' + err));
    });
}
