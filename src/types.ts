export interface Config {
    port: number;
    servers: string[];
    secretKey: string;
    certPath: string;
    keyPath: string;
    protocol: "ws" | "wss";
    plugins: string[];
}