import React from 'react';
import {Layer, Line} from "react-konva";
import FieldStore, {polygonColor} from "../stores/FieldStore.js";
import {observer} from "mobx-react-lite";

const PolygonsLayer = observer(() => {
    // function groupPairs(arr) {
    //     const result = [];
    //     for (let i = 0; i < arr.length; i += 2) {
    //         result.push([arr[i], arr[i + 1]]);
    //     }
    //     return result;
    // }

    // function onDragEnd(event){
    //     const polygon = event.target
    //     const polygonId = polygon.attrs.polygonId;
    //
    //     changePolygon(polygonId, {points: groupPairs(polygon.attrs.points)})
    // }

    return (
        <Layer>
            {FieldStore.polygons.map((polygon, id) => (
                <Line
                    key={id}
                    points={polygon.points.flat(1)}
                    closed={true}
                    polygonId={id}
                    fill={polygonColor[polygon.type]}
                    // ondragEnd={onDragEnd}
                />

            ))}
        </Layer>
    );
});

export default PolygonsLayer;