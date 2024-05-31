import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd } from "node:process";
import { Config } from "../types";
import { defaultConfig } from "./deafult";

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
    ensureConfigExists(CONFIG_PATH);
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}