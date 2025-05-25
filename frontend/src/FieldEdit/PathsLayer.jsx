import React from 'react';
import {Layer, Line} from "react-konva";
import {observer} from "mobx-react-lite";
import viewStore from "../stores/algorithmStore.js";

const PathsLayer = observer(() => {
    return (
        <Layer>
            {viewStore.paths && viewStore.paths.map((p, index) => (
                <Line
                    key={index}
                    points={p.flat()}
                    stroke="purple"
                    strokeWidth={3}
                    lineCap="round"
                    lineJoin="round"
                    dash={[10, 10]}
                />
            ))}
        </Layer>
    );
});

export default PathsLayer;