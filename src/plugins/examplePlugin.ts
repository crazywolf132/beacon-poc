import type { Plugin } from '.';

const examplePlugin: Plugin = {
    name: 'examplePlugin',
    init: (context) => {
        context.registerHook('onConnection', (ws, req) => {
            console.log('ExamplePlugin: New connection');
        });

        context.registerHook('onMessage', (ws, message) => {
            console.log('ExamplePlugin: New message', message);
        });

        context.registerHook('onClose', (ws) => {
            console.log('ExamplePlugin: Connection closed');
        });

        context.registerHook('onServerStart', (server) => {
            console.log('ExamplePlugin: Server started');
        });
    }
};

export default examplePlugin;