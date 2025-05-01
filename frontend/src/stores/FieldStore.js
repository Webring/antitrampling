import {makeAutoObservable} from "mobx";

export const polygonType = {
    grass: 1, building: 2, fence: 3
}

export const polygonColor = {
    [polygonType.grass]: "green", [polygonType.building]: "red", [polygonType.fence]: "blue",
}

export const polygonRussianLabel = {
    [polygonType.grass]: "Трава", [polygonType.building]: "Здание", [polygonType.fence]: "Забор",
}

class FieldStore {
    width = 500
    height = 500

    polygons = []

    constructor() {
        makeAutoObservable(this)
    }

    new(width, height) {
        this.width = width
        this.height = height
    }

    addPolygon(points, type = polygonType.grass) {
        let newPolygon = {
            type: type,
            points: points,
        }
        this.polygons.push(newPolygon)
        console.log(this.polygons)
    }
}

export default new FieldStore()