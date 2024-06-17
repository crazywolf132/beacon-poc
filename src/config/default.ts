import type { Config } from "../types";

export const defaultConfig: Config = {
    port: 8080,
    servers: [],
    secretKey: "",
    certPath: "",
    keyPath: "",
    protocol: "ws",
    plugins: []
}