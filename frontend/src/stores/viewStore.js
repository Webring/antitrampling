import {makeAutoObservable} from "mobx";

class ViewStore {
    paths = []

    constructor() {
        makeAutoObservable(this);
    }

    addPaths(paths){
        this.paths = this.paths.concat(paths);
        console.log(paths);
    }

    clearPaths(){
        this.paths = [];
    }
}

export default new ViewStore();