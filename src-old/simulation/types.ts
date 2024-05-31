export interface Simulation {
    name: string;
    seed: number;
    init: (context: SimulationContext) => void;
    run: () => Promise<void>;
}

export interface SimulationContext {
    config: any;
    injectIssues: (issues: Issue) => void;
    collectMetrics: (metrics: Metrics) => void;
}

export interface Issue {
    type: string;
    description: string;
    handler: (context: SimulationContext) => void;
}

export interface Metrics {
    timestamp: number;
    load: number;
    responseTime: number;
    errorRate: number;
}