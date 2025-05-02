import React from 'react';
import {Layer, Line} from "react-konva";
import FieldStore, {polygonColor} from "../stores/FieldStore.js";
import {observer} from "mobx-react-lite";
import EditorStore, {modeType} from "../stores/EditorStore.js";

const PolygonsLayer = observer(() => {
    function onDragEnd(event){
        const polygon = event.target
        const deltaX = polygon.x()
        const deltaY = polygon.y()
        const polygonId = polygon.attrs.polygonId;

        FieldStore.movePolygon(polygonId, deltaX, deltaY)

        polygon.x(0)
        polygon.y(0)
    }

    return (
        <Layer>
            {FieldStore.polygons.map((polygon, id) => (
                <Line
                    key={id}
                    points={polygon.points.flat(1)}
                    closed={true}
                    polygonId={id}
                    fill={polygonColor[polygon.type]}
                    draggable={EditorStore.mode === modeType.drag}
                    ondragEnd={onDragEnd}
                />

            ))}
        </Layer>
    );
});

export default PolygonsLayer;