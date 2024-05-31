import { loadConfig } from "../config";
import type { Simulation } from "./types";

class SimulationManager {
    private simulations: Simulation[] = [];
    private currentSimulation: Simulation | null = null;

    constructor() {
        this.loadSimulations();
    }

    private loadSimulations() {
        const config = loadConfig();
        const simulationNames = config.simulations || [];
        simulationNames.forEach((simulationName: string) =>  {
            try {
                const simulation: Simulation = require(`./simulations/${simulationName}`).default;
            }
        })
    }
}