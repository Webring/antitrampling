import {makeAutoObservable} from "mobx";

class AlgorithmStore {
    paths = []
    grassWeight = 3.0
    fenceWeight = 5.0

    constructor() {
        makeAutoObservable(this);
    }

    setGrassWeight(value) {
        this.grassWeight = value;
    }

    setFenceWeight(value) {
        this.fenceWeight = value;
    }

    addPaths(paths){
        this.paths = this.paths.concat(paths);
        console.log(paths);
    }

    clearPaths(){
        this.paths = [];
    }
}

export default new AlgorithmStore();