import { loadConfig } from "./config";
import { Plugin, PluginContext } from "./plugin";

class PluginManager {
    private plugins: Plugin[] = [];
    private hooks: Map<string, Function[]> = new Map();

    constructor() {
        this.loadPlugins();
    }

    private loadPlugins() {
        const config = loadConfig();
        const pluginNames = config.plugins || [];
        pluginNames.forEach((pluginName: string) => {
            try {
                const plugin: Plugin = require(`./plugins/${pluginName}`).default;
                this.plugins.push(plugin);
                plugin.init(this.createContext());
            } catch (error) {
                console.error(`Failed to load plugin: ${pluginName}:`, error);
            }
        });
    }

    private createContext(): PluginContext {
        return {
            registerHook: this.registerHook.bind(this),
            config: loadConfig()
        };
    }

    registerHook(hookName: string, callback: Function) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName)!.push(callback);
    }

    executeHook(hookName: string, ...args: any[]) {
        const callbacks = this.hooks.get(hookName) || [];
        callbacks.forEach((callback) => callback(...args));
    }
}

export default new PluginManager();