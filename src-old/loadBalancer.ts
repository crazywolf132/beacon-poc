import WebSocket from 'ws';
import { loadConfig } from './config';
import { performHealthCheck } from './healthCheck';

const config = loadConfig();

class LoadBalancer {
    private servers: string[];
    private currentIndex: number;

    constructor(servers: string[]) {
        this.servers = servers;
        this.currentIndex = 0;
    }

    public start(port: number) {
        // let server;
        // if (config.protocol === 'wss') {
        //     server = https.createServer({
        //         cert: fs.readFileSync(config.certPath),
        //         key: fs.readFileSync(config.keyPath),
        //     });
        // } else {
        //     server = http.createServer();
        // }

        const wss = new WebSocket.Server({ port });

        wss.on('connection', (ws, req) => {
            this.handleConnection(ws);
        });

        console.log(`Load balancer started on port ${port}`);

        // server.listen(port, () => {
        //     console.log(`Load balancer started on port ${port}`);
        // });

    }

    private async handleConnection(ws: WebSocket) {
        const target = await this.getNextHealthyServer();
        if (target) {
            const proxyWs = new WebSocket(target);

            ws.on('message', (message) => {
                proxyWs.send(message);
            });

            proxyWs.on('message', (message) => {
                ws.send(message);
            });

            ws.on('close', () => {
                proxyWs.close();
            });

            proxyWs.on('close', () => {
                ws.close();
            });

            ws.on('error', () => {
                proxyWs.close();
            });

            proxyWs.on('error', () => {
                ws.close();
            });
        } else {
            ws.close();
        }
    }
    

    private async getNextHealthyServer(): Promise<string | null> {
        for (let i = 0; i < this.servers.length; i++) {
            const server = this.servers[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.servers.length;
            const isHealthy = await performHealthCheck(server);
            if (isHealthy) {
                return server;
            }
        }
        return null;
    }
}

const loadBalancer = new LoadBalancer(config.servers);
loadBalancer.start(8080);