import fs from 'node:fs';
import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import ws from 'ws';
import { loadConfig } from './config';
import orchestrator from './orchestrator';
import pluginManager from './pluginManager';
import { authenticateToken } from './security';

const config = loadConfig();
const PORT = +(process.env.PORT || 8080)!;

let server;
if (config.protocol === 'wss') {
    server = https.createServer({
        cert: fs.readFileSync(config.certPath),
        key: fs.readFileSync(config.keyPath)
    });
} else {
    server = http.createServer();
}

const wss = new ws.Server({ port: PORT });

wss.on('connection', (ws: ws, req: IncomingMessage) => {
    console.log("New client connected!");
    pluginManager.executeHook('onConnection', ws, req);

    authenticateToken(req, (err) => {
        if (err) {
            ws.close();
            return;
        }

        ws.on('message', (message: string) => {
            const parsedMessage = JSON.parse(message);
            const { action, event, data, filter, timestamp } = parsedMessage;

            pluginManager.executeHook('onMessage', ws, parsedMessage);

            switch (action) {
                case 'subscribe':
                    orchestrator.subscribe(event, ws, filter || '() => true');
                    console.log(`Subscribed to event: ${event}`);
                    break;
                case 'unsubscribe':
                    orchestrator.unsubscribe(event, ws);
                    console.log(`Unsubscribed from event: ${event}`);
                    break;
                case 'publish':
                    orchestrator.publish(event, data, timestamp || Date.now());
                    console.log(`Published to event: ${event} with data: ${data}`);
                    break
                default:
                    console.log(`Unknown action: ${action}`);
                    orchestrator.publish(event, data, timestamp || Date.now());
            }

            if (timestamp) {
                const roundTripTime = Date.now() - timestamp;
                console.log(`Round-trip time for event ${action || event}: ${roundTripTime}ms`)
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            pluginManager.executeHook('onClose', ws);
            // TODO: Cleanup subs here
        })

        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });

    // Add this node to the champion's list of nodes
    // champion.addNode(champion.getNodeId(), ws);
});

// server.listen(PORT, () => {
//     console.log(`Websocket server started on ${config.protocol}://localhost:${PORT}/`);
//     pluginManager.executeHook('onServerStart', server);
// })