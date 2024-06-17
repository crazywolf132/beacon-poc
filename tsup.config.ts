import { defineConfig } from 'tsup';

export default defineConfig([
    {
        name: "CLIENT",
        entry: ['./src/client.ts'],
        format: ['cjs'],
        platform: 'node',
        skipNodeModulesBundle: false,
        noExternal: ['ws'],
        dts: false
    },
    {
        name: "SERVER",
        entry: ['./src/server.ts'],
        format: ['cjs'],
        platform: 'node',
        skipNodeModulesBundle: false,
        noExternal: ['ws', 'dotenv', 'winston'],
        dts: false
    }
])
