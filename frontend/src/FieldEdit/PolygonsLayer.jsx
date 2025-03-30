import React from 'react';
import {Layer, Line} from "react-konva";
import {TYPE_COLORS} from "./consts.js";

const PolygonsLayer = ({polygons, changePolygon}) => {
    function onDragEnd(event){
        const polygon = event.target
        const polygonId = polygon.attrs.polygonId;
        changePolygon(polygonId, {points: polygon.attrs.points})
    }

    return (
        <Layer>
            {Object.entries(polygons).map(([id, polygon]) => (
                <Line key={id}
                      points={polygon.points.flat(1)}
                      closed={true}
                      polygonId={id}
                      fill={TYPE_COLORS[polygon.type]}
                      ondragEnd={onDragEnd}
                />

            ))}
        </Layer>
    );
};

export default PolygonsLayer;