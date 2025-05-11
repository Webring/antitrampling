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
            FieldStore.addInterestPoint([x, y])

        }
    }


    const elements = FieldStore.interestPoints.map((point, id) => <Circle
        key={id}
        x={point[0]}
        y={point[1]}
        radius={5}
        fill="#c8a2c8"
        interestPointId={id}
        draggable={EditorStore.mode === modeType.interestPoints}
    />)


    return (
        <>

            {EditorStore.mode === modeType.interestPoints ? <LayerWithSize
                    width={FieldStore.width}
                    height={FieldStore.height}
                    onMouseDown={onMouseDown}
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