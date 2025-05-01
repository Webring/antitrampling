import {makeAutoObservable} from "mobx";

const BackgroundType = {
    Clear: "None",
    Image: "image",
    Grid: "grid",
    Points: "points"
}


class ViewSettingsStore {
    backgroundType = BackgroundType.Clear;

    backgroundUrl = ""
    gridCellWidth = 50;
    gridCellHeight = 50;

    constructor() {
        makeAutoObservable(this);
    }

}

export default ViewSettingsStore();