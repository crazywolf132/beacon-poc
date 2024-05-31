export interface Plugin {
    name: string;
    init: (context: PluginContext) => void;
}

export interface PluginContext {
    registerHook: (hookName: string, callback: Function) => void;
    config: any;
}