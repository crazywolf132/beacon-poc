import https from 'node:https';

export function performHealthCheck(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        })
    })
}