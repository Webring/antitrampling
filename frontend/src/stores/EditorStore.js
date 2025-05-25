import {makeAutoObservable} from "mobx";
import {polygonType} from "./FieldStore.js";


export const modeType = {
    draw: "Рисовать",
    view: "Смотреть",
    drag: "Двигать",
    interestPoints: "Точки интереса"
}

export const backgroundType = {
    clear: "none",
    image: "image",
    grid: "grid",
    points: "points"
}


const MAX_ZOOM = 5.0
const MIN_ZOOM = 0.1

class EditorStore {
    mode = modeType.view;

    zoom = 1.0

    currentPolygonType = polygonType.grass

    contextMenu = {visible: false, x: 0, y: 0, element: null}

    background = {
        type: backgroundType.clear,
        image: null,
        cellSize: 5,
        opacity: 1.0
    }


    constructor() {
        makeAutoObservable(this)
    }

    closeContextMenu() {
        this.contextMenu = {visible: false, x: 0, y: 0, element: null}
    }

    setContextMenu(contextMenu) {
        this.contextMenu = contextMenu;
    }

    get contextMenuIsVisible() {
        return this.contextMenu.visible && this.contextMenu.element;
    }

    get contextElementPolygonId() {
        return this.contextMenu.element.attrs.polygonId
    }

    enableDrawingMode() {
        this.mode = modeType.draw;
    }

    enableViewMode() {
        this.mode = modeType.view;
    }

    enableDragMode() {
        this.mode = modeType.drag
    }

    enableInterestPointMode() {
        this.mode = modeType.interestPoints
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
    };

    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.1, MIN_ZOOM)
    };

    clearBackground() {
        this.background.type = backgroundType.clear
    }

    setBackgroundOpacity(opacity) {
        if (opacity > 1) {
            opacity = 1
        }

        if (opacity < 0) {
            opacity = 0
        }
        this.background.opacity = opacity
    }

    setBackgroundImage(image) {
        this.background.type = backgroundType.image
        this.background.image = image
    }

    setBackgroundGrid(cellSize, usePoints = false) {
        this.background.cellSize = cellSize
        this.background.type = usePoints ? backgroundType.points : backgroundType.grid
    }

}

export default new EditorStore()