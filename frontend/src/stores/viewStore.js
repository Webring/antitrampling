import {makeAutoObservable} from "mobx";

class ViewStore {
    paths = []

    constructor() {
        makeAutoObservable(this);
    }

    addPaths(paths){
        this.paths += paths;
        console.log(paths);
    }
}

export default new ViewStore();