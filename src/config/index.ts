import dotenv from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { Config } from "../types";
import { defaultConfig } from "./default";

const ensureConfigDirExists = (path: string) => {
    const dir = dirname(path);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

const ensureConfigExists = (path: string) => {
    ensureConfigDirExists(path);
    if (!existsSync(path)) {
        writeFileSync(path, JSON.stringify(defaultConfig, null, 2));
    }
}

const CONFIG_PATH = join(cwd(), "beacon.config.json");

export const loadConfig = (): Config => {
    dotenv.config();

    ensureConfigExists(CONFIG_PATH);
    const conf = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    console.log(process.env)
    const config: Config = {
        port: process.env.PORT ? +(process.env.PORT) : defaultConfig.port,
        secretKey: process.env.SECRET_KEY || defaultConfig.secretKey,
        certPath: process.env.CERT_PATH || defaultConfig.certPath,
        keyPath: process.env.KEY_PATH || defaultConfig.keyPath,
        protocol: process.env.PROTOCOL === 'wss' ? 'wss' : 'ws',
        plugins: process.env.PLUGINS ? process.env.PLUGINS.split(',') : defaultConfig.plugins,
        servers: process.env.SERVERS ? process.env.SERVERS.split(',') : defaultConfig.servers,
    };

    return {
        ...defaultConfig,
        ...conf,
        ...config,
    }
}
