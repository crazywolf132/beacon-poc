import { readFileSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';

import ws, { WebSocketServer } from 'ws';

import { loadConfig } from './config';
import orchestrator from './orchestrator';
import pluginManager from './plugins';


const config = loadConfig();
const PORT = process.env.PORT || 8080;

let server: http.Server;
let wss: ws.Server;

if (config.protocol === 'wss') {
    server = https.createServer({
        cert: readFileSync(config.certPath),
        key: readFileSync(config.keyPath)
    })
} else {
    server = http.createServer();
}
wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log(`Connection accepted: ${req.url}`);
  pluginManager.executeHook('onConnection', ws, req);

//   authenticateToken(config)(req, (err) => {
//     if (err) {
//         ws.close();
//         return;
//     }

    ws.on('message', (message: string) => {
        const parsedMessage = JSON.parse(message);
        const { event, data, filter, timestamp } = parsedMessage;

        pluginManager.executeHook('onMessage', ws, parsedMessage);

        switch (event) {
            case 'subscribe':
                orchestrator.subscribe(data, ws, filter || '() => true');
                console.log(`Subscribed to event: ${data}`);
                break;
            case 'unsubscribe':
                orchestrator.unsubscribe(data, ws);
                console.log(`Unsubscribed from event: ${data}`);
                break;
            default:
                orchestrator.publish(event, data, timestamp || Date.now());
                console.log(`Published to event: ${event}`);
                break
        }

        if (timestamp) {
            const roundTripTime = Date.now() - timestamp;
            console.log(`Round-trip time for event ${event}: ${roundTripTime}ms`)
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        pluginManager.executeHook('onClose', ws);
    })

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        pluginManager.executeHook('onError', ws, err);
    });
//   })
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
