import {makeAutoObservable} from "mobx";

class FieldStore {
    // Класс поля, здесь содержиться лишь информация о поле

    width = 500
    height = 500

    polygons = {}
    last_polygon_id = 0

    constructor() {
        makeAutoObservable(this)
    }

    setPolygons(polygons) {
        this.polygons = polygons
    }



}