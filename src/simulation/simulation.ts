import seedrandom from 'seedrandom';

class SimulationManager {
    private _rng: seedrandom.PRNG;
    constructor(public seed: string) {
        this._rng = seedrandom(seed);
    }
}