import WebSocket from 'ws';

interface Subscription {
    ws: WebSocket;
    filter: (data: any) => boolean;
}

class Orchestrator {
    private subscriptions: Map<string, Set<Subscription>> = new Map();

    subscribe(event: string, ws: WebSocket, filter: string) {
        const safeFilter = this.createSafeFilter(filter);
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, new Set());
        }
        this.subscriptions.get(event)!.add({ ws, filter: safeFilter });
    }

    unsubscribe(event: string, ws: WebSocket) {
        if (this.subscriptions.has(event)) {
            const eventSubscriptions = this.subscriptions.get(event)!;
            for (const subscription of eventSubscriptions) {
                if (subscription.ws === ws) {
                    eventSubscriptions.delete(subscription);
                    break;
                }
            }
            if (eventSubscriptions.size === 0) {
                this.subscriptions.delete(event);
            }
        }
    }

    publish(event: string, data: string, timestamp?: number) {
        const subscribers = this.subscriptions.get(event)!;
        if (subscribers) {
            const batch: any[] = [];
            subscribers.forEach(({ws, filter: _filter}) => {
                try {
                    if (_filter(data as any)) {
                        const payload = timestamp ? { data, timestamp } : {data};
                        batch.push({ws, payload});
                    }
                } catch (err) {
                    console.error('Error executing filter:', err);
                }
            });
            this.sendBatch(batch);
        }
    }

    private sendBatch(batch: {ws: WebSocket; payload: any}[]) {
        batch.forEach(({ ws, payload }) => {
            ws.send(JSON.stringify(payload));
        })
    }

    private createSafeFilter(filter: string): (data: any) => boolean {
        return Function('data', `
            'use strict';
            const console = {
                log: () => {},
                warn: () => {},
                error: () => {},
                info: () => {},
            };
            return (${filter})(data);
        `) as (data: any) => boolean;
    }
}

export default new Orchestrator();