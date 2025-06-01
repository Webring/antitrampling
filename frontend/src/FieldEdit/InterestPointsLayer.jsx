import React from 'react';
import LayerWithSize from "./LayerWithSize.jsx";
import {Circle, Layer} from "react-konva";
import FieldStore from "../stores/FieldStore.js";
import {observer} from "mobx-react-lite";
import EditorStore, {modeType} from "../stores/EditorStore.js";


const InterestPointsLayer = observer(() => {

    function onMouseDown(e) {
        const x = e.evt.offsetX
        const y = e.evt.offsetY

        if (e.evt.button !== 2) return;

        if (e.target.attrs.interestPointId || e.target.attrs.interestPointId === 0) {
            FieldStore.removeInterestPoint(e.target.attrs.interestPointId);
        } else {
            FieldStore.addInterestPoint({
                x: x,
                y: y,
                level: 1
            })

        }
    }

    function getStrokeByLevel(level) {
        const levelColors = {
            1: '#fce4f9', // очень светло-розовый
            2: '#f3c1f1',
            3: '#eaa0e8',
            4: '#e180df',
            5: '#c8a2c8', // базовый цвет — по центру
            6: '#a06eb4',
            7: '#7d4ca0',
            8: '#5b2c8c',
            9: '#3a0f78', // тёмно-фиолетовый
        };
        return levelColors[level] || '#000000';
    }



    const elements = FieldStore.interestPoints.map((point, id) => <Circle
        key={id}
        x={point.x}
        y={point.y}
        radius={7}
        fill="#c8a2c8" // постоянная заливка
        stroke={getStrokeByLevel(point.level)} // цвет по уровню
        strokeWidth={1} // можно увеличить для яркости
        interestPointId={id}
        draggable={EditorStore.mode === modeType.interestPoints}
    />)

    function wheel(e) {
        if (e.target.attrs.interestPointId || e.target.attrs.interestPointId === 0) {
            FieldStore.changeInterestPointLevel(e.target.attrs.interestPointId, -e.evt.deltaY)
        }
    }


    return (
        <>
            {EditorStore.mode === modeType.interestPoints ? <LayerWithSize
                    width={FieldStore.width}
                    height={FieldStore.height}
                    onMouseDown={onMouseDown}
                    onWheel={wheel}
                >
                    {elements}
                </LayerWithSize> :
                <Layer>
                    {elements}
                </Layer>
            }
        </>

    )
});

export default InterestPointsLayer;