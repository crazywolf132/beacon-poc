import type { Config } from "../types";

export const defaultConfig: Config = {
    servers: [],
    secretKey: "",
    certPath: "",
    keyPath: "",
    protocol: "ws",
    plugins: []
}