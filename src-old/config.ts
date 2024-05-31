import fs from 'node:fs';
import path from 'node:path';

const configPath = path.resolve(__dirname, 'config.json');

interface Config {
    servers: string[];
    secretKey: string;
    certPath: string;
    keyPath: string;
    protocol: "ws" | "wss";
    plugins: string[];
}

const defaultConfig: Config = {
    servers: [8081, 8082, 8083].map((port) => `ws://localhost:${port}`),
    secretKey: 'your_secret_key',
    certPath: 'cert.pem',
    keyPath: 'key.pem',
    protocol: "ws",
    plugins: ['examplePlugin']
}

export function loadConfig(): Config {
    if (fs.existsSync(configPath))  {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configFile);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
}