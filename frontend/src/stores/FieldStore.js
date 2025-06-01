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
    interestPoints = []

    constructor() {
        makeAutoObservable(this)
    }

    new(width, height) {
        this.width = width
        this.height = height
        this.polygons = []
    }

    setInterestPoints(interestPoints) {
        this.interestPoints = interestPoints
    }

    setPolygons(polygons) {
        this.polygons = polygons
    }

    addInterestPoint(interestPoint) {
        this.interestPoints.push(interestPoint)
    }

    removeInterestPoint(id) {
        this.interestPoints.splice(id, 1)
    }

    changeInterestPointLevel(id, delta) {
        let levelDelta = delta / Math.abs(delta)
        let lastLevel = this.interestPoints[id].level
        let newLevel = Math.round(lastLevel + levelDelta)
        let newLevelRanged = Math.min(9, Math.max(1, newLevel))
        if (! isNaN(newLevelRanged)) this.interestPoints[id].level = newLevelRanged
        console.log(this.interestPoints[id].level)
    }

    addPolygon(points, type = polygonType.grass) {
        let newPolygon = {
            type: type,
            points: points,
        }
        this.polygons.push(newPolygon)
    }

    movePolygon(id, deltaX, deltaY) {
        this.polygons[id]["points"] = this.polygons[id]["points"].map(point => [point[0] + deltaX, point[1] + deltaY])
    }


    setPolygonType(id, type) {
        this.polygons[id].type = type
    }

    removePolygon(id) {
        this.polygons.splice(id, 1)
    }

    export() {
        return JSON.stringify({
            width: this.width,
            height: this.height,
            polygons: this.polygons,
            interestPoints: this.interestPoints,
        });
    }

    import(jsonString) {
        const data = JSON.parse(jsonString);

        if (typeof data.width !== 'number' || typeof data.height !== 'number' || typeof data.polygons !== 'object') {
            throw new Error("Invalid scene format");
        }

        for (const key in data.polygons) {
            const polygon = data.polygons[key];
            if (typeof polygon.type !== 'number' || !Array.isArray(polygon.points)) {
                throw new Error("Invalid polygon structure");
            }

            if (polygon.points.some(point =>
                !Array.isArray(point) || point.length !== 2 ||
                typeof point[0] !== 'number' || typeof point[1] !== 'number')) {
                throw new Error("Invalid polygon points format");
            }
        }

        this.new(data.width, data.height)
        this.setPolygons(data.polygons);
        this.setInterestPoints(data.interestPoints); //ToDo add validation
    }

    get isEmpty() {
        return this.polygons.length === 0
    }
}

export default new FieldStore()