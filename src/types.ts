export interface Config {
    servers: string[];
    secretKey: string;
    certPath: string;
    keyPath: string;
    protocol: "ws" | "wss";
    plugins: string[];
}