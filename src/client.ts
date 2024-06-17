/**
 * Welcome to the simulation client.
 *
 * The idea of this is we will create X amount of clients and spin them up.
 * Each will be tasked with flooding the system with different kinds of messages.
 *
 * Some will be in charge of listening to different topics too.
 *
 * */

import WS from 'ws';
console.log({env: process.env});
const MANAGER_PORT = +(process.env.MANAGER_PORT ?? 8456);
const SERVICE_ID = process.env.SERVICE_ID;

type EventHandler = (data: any, ws: WS) => void;

class SimulationClient {
    private client: WS;
    public shouldStop: boolean = false;

    public setup() {
        this.client = new WS(`ws://localhost:8456`)
    }

    public on(event: string, cb: EventHandler): void {
        this.client.on('message', (data, ws) => {
            const {type,...rest} = JSON.parse(data.toString());
            if (type === 'STOP') {
                this.shouldStop = true;
                return;
            }
            if (type === event) {
              cb(rest, ws)
            }
        })
    }

    public emit(event: string, ...data: any[]): void {
        this.client.emit(event, ...data);
    }
}

class Simulation {
    private client: WS;

    public setup(port: number): void {
        this.client = new WS(`ws://localhost:${port}`);
        console.log({client: this.client});
        this.client.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log(message);
        })
    }

    public emit(event: string, ...data: any[]): void {
        this.client.emit(event, ...data);
    }
}

const simulation = new SimulationClient();
const service = new Simulation();

service.setup(process.env.PORT);

simulation.on('send_message', ({event, message}) => service.emit(event, message));
simulation.on('subscribe', ({event, message, filter}) => service.emit('subscribe', {event, message, filter}));
simulation.on('unsubscribe', ({event}) => service.emit('unsubscribe', {event}));
simulation.on('identify', () => simulation.emit(`identity`, SERVICE_ID));
while (!simulation.shouldStop) {}
