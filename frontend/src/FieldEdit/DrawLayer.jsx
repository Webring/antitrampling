import React, {useEffect, useRef, useState} from 'react';
import LayerWithSize from "./LayerWithSize.jsx";
import {Line, Rect} from "react-konva";
import {TYPE_COLORS} from "./consts.js";

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const DrawLayer = ({width, height, polygonType, ...props}) => {
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
                props.addPolygon(points);
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
        <LayerWithSize width={width} height={height}
                       onMouseDown={onMouseDown}
                       onMouseMove={onMouseMove}
        >
            <Line points={points.flat(1)}
                  stroke={TYPE_COLORS[polygonType]}
                  strokeWidth={5}
                  lineCap="round"
                  lineJoin="round"
            />
            <Line points={cursorLine.flat(1)}
                  stroke={TYPE_COLORS[polygonType]}
                  strokeWidth={5}
                  lineCap="round"
                  lineJoin="round"
            />
        </LayerWithSize>
    );
};

export default DrawLayer;