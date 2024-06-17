import random from './random';
import faker, { Faker, fakerEN_AU, en_AU } from '@faker-js/faker'
import WS, { WebSocketServer } from 'ws';
import { DockerfileBuilder, DockerManager } from 'docker-js';
import { cwd } from 'node:process';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { inspect } from 'node:util';

const l = console.log;

interface SimulationData {
    messageTopics: string[];
    services: {
        amount: number;
        failureChance: number;
    };
    beacons: {
        amount: number;
        failureChance: number;
    };
}

class Simulator {
    private server: WebSocketServer;
    private seed: Number;
    private faker: Faker;
    private simulationData: SimulationData = {};

    private services: WS[];
    private beacons: WS[];

    constructor(seed: number = Date.now() ^ (Math.random() * 0x100000000)) {
        this.seed = seed;
        this.faker = fakerEN_AU;
        this.faker.seed(this.seed);
        this.createServer();
        this.generateData();
        this.logInformation();
        this.preconnect();
    }

    private createServer() {
        this.server = new WebSocketServer({ port: 8456 });
    }

    private generateData() {
        this.simulationData = {
            messageTopics: this.faker.lorem.words(10).split(" "),
            services: {
                amount: this.faker.number.int({ min: 1, max: 10 }),
                failureChance: this.faker.number.float({ min: 0, max: 1 }),
            },
            beacons: {
                amount: this.faker.number.int({ min: 1, max: 5 }),
                failureChance: this.faker.number.float({ min: 0, max: 1 }),
            }
        }
    }

    private logInformation() {
        l("==========================================================")
        l(`SEED: ${this.seed}`)
        l(``)
        l(`Topics: ["${this.simulationData.messageTopics.join('", "')}"]`)
        l(`Services:`)
        l(`  Amount: ${this.simulationData.services.amount}`)
        l(`  Failure Rate: ${(this.simulationData.services.failureChance * 100).toFixed(2)}%`)
        l(`Beacons:`)
        l(`  Amount: ${this.simulationData.beacons.amount}`)
        l(`  Failure Rate: ${(this.simulationData.beacons.failureChance * 100).toFixed(2)}%`)
        l("==========================================================")
    }

    private async preconnect() {

        const baseBeacon = new DockerfileBuilder()
            .from('node:22-bookworm')
            .copy('./dist/server.js', 'index.js')
            .env({ MANAGER_PORT: 8456, PROTOCOL: 'ws' })

        const baseService = new DockerfileBuilder()
            .from('node:22-bookworm')
            .copy('./dist/client.js', 'index.js')
            .env({ MANAGER_PORT: 8456 })

        const manager = new DockerManager();

        const beacons = Array(this.simulationData.beacons.amount).map(() => new DockerfileBuilder()
            .clone(baseBeacon)
            .env({
                SERVICE_ID: this.faker.string.uuid(),
                PORT: this.faker.number.int({ min: 4000, max: 5000 })
            })
        )

        for (const beacon of beacons) {

        }

        for (let i = 0; i !== this.simulationData.beacons.amount; i++) {
            const beacon = new DockerfileBuilder().clone(baseBeacon)
                .env({
                    SERVICE_ID: this.faker.string.uuid(),
                    PORT: this.faker.number.int({ min: 4000, max: 5000 })
                }).cmd("node ./index.js");

            const containerID = manager.createAndRunImage(beacon, '.', { detach: true, })
            console.log({ containerID })
        }


        // const beacons: DockerfileBuilder[] = Array(this.simulationData.beacon).fill(
        //     new DockerfileBuilder()
        //         .from('node:22-bookworm')
        //         .copy('./dist/server.js', 'index.js')
        //         .env({
        //             MANAGER_PORT: 8456, // This is our port
        //         })
        // ).map((beacon: DockerfileBuilder, idx: number, arr: DockerfileBuilder[]) => beacon
        //       .env({
        //           // Getting the port of the first instance, as that will be the orchestrator.
        //           SERVICE_ID: this.faker.string.uuid(),
        //           IS_ORCHESTRATOR: idx === 0 && arr.length >= 2 ? 1 : 0,
        //           PORT: this.faker.number.int({ min: 4000, max: 5000 }),
        //           PROTOCOL: 'ws'
        //       })
        // )

        // // Setting the servers for the orchestrator.
        // beacons[0].env({ SERVERS: beacons.filter(b => b.get('SERVICE_ID') != beacons[0].get('SERVICE_ID')).map((b) => `localhost:${b.get('PORT')}`) })
        // beacons.map((beacon) => beacon.cmd('node ./index.js'))

        // const services: DockerfileBuilder[] = Array(this.simulationData.services.amount).fill(
        //     new DockerfileBuilder()
        //         .from('node:22-bookworm')
        //         .copy('./dist/client.js', 'index.js')
        //         .env({
        //             MANAGER_PORT: 8456, // This is our port
        //             PORT: beacons[0].get('PORT'), // This is the orchestrator port
        //         })
        // ).map((docker: DockerfileBuilder) => docker
        //     .env({
        //         SERVICE_ID: this.faker.string.uuid(), // Giving it a unique ID
        //     })
        //     .cmd('node ./index.js')
        // );

        // // We are going to spin up the first beacon, as it is the orchestrator instance.
        // We will then spin up the rest.
        // After that we will spin up each of the services.
        //     const manager = new DockerManager();
        //     console.log({beacon: inspect(beacons[0], false, null, true)})
        //     const orchestrator_id = manager.createAndRunImage(beacons[0], '.', { detach: true, port: beacons[0].get('PORT') });
        // }
    }

    public start() {
        // This is the main thread where we communicate to the different instances of the simulation.
        // We will tell them when to die, and when to send messages like unsubscribing.
    }
}

const SEED = process.env.SEED;
new Simulator(SEED != null ? +SEED : undefined);
