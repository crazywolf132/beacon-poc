/**
 * This is the health check action.
 * This will go through all our connected clients and send a health ping to them.
 * If they respond with a health pong, we know they are still connected.
 */

export const health = async (ws: any) => {
    const clients = ws.clients;
    for (const client of clients) {
        client.send("health");
    }
}

export const healthPong = async (ws: any) => {
    
}