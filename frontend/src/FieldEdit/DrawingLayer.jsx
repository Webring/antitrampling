import React, {useEffect, useState} from 'react';
import LayerWithSize from "./LayerWithSize.jsx";
import {Line} from "react-konva";
import FieldStore, {polygonColor} from "../stores/FieldStore.js";
import EditorStore from "../stores/EditorStore.js";

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const DrawingLayer = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState([]);

    const [cursorPos, setCursorPos] = useState([0, 0]);
    const [cursorLine, setCursorLine] = useState([]);

    useEffect(() => {
        window.addEventListener('keydown', (e) => {
            if (e.code === "Escape") endDrawing()
        });
    })


    function onMouseDown(e) {
        if (e.evt.button > 0) return;

        if (!isDrawing) setIsDrawing(true);

        const x = e.evt.offsetX
        const y = e.evt.offsetY

        if (points.length > 2) {
            const [px, py] = points[0];
            if (distance(px, py, x, y) < 10) {
                FieldStore.addPolygon(points, EditorStore.currentPolygonType)
                endDrawing()
                return
            }
        }
        setPoints(points => [...points, [Number(x), Number(y)]]);
    }


    function onMouseMove(e) {
        const x = e.evt.offsetX
        const y = e.evt.offsetY

        setCursorPos([x, y]);
    }

    function endDrawing() {
        setPoints([])
        setIsDrawing(false);
        setCursorLine([])
    }

    useEffect(() => {
        const points_len = points.length;
        if (points.length > 0) {
            setCursorLine([points[points_len - 1], cursorPos]);
        }
    }, [points, cursorPos]);

    return (
        <LayerWithSize
            width={FieldStore.width}
            height={FieldStore.height}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
        >
            <Line points={points.flat(1)}
                  stroke={polygonColor[EditorStore.currentPolygonType]}
                  strokeWidth={5}
                  lineCap="round"
                  lineJoin="round"
            />
            <Line points={cursorLine.flat(1)}
                  stroke={polygonColor[EditorStore.currentPolygonType]}
                  strokeWidth={5}
                  lineCap="round"
                  lineJoin="round"
            />
        </LayerWithSize>
    );
};

export default DrawingLayer;