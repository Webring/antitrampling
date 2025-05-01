import {makeAutoObservable} from "mobx";
import {polygonType} from "./FieldStore.js";


export const modeType = {
    draw: "Рисовать",
    view: "Смотреть"
}

const MAX_ZOOM = 5.0
const MIN_ZOOM = 0.1

class EditorStore {
    mode = modeType.draw;

    zoom = 1.0

    currentPolygonType = polygonType.grass

    constructor() {
        makeAutoObservable(this)
    }

    enableDrawingMode() {
        this.mode = modeType.draw;
    }

    enableViewMode() {
        this.mode = modeType.view;
    }

    selectGrassPolygonType() {
        this.currentPolygonType = polygonType.grass;
    }

    selectBuildingPolygonType() {
        this.currentPolygonType = polygonType.building;
    }

    selectFencePolygonType() {
        this.currentPolygonType = polygonType.fence;
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.1, MAX_ZOOM);
        console.log("zoom in", this.zoom);
    };

    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.1, MIN_ZOOM)
        console.log("zoom out", this.zoom);

    };
}

export default new EditorStore()