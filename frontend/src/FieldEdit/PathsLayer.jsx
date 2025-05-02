import React from 'react';
import {Layer} from "react-konva";
import {observer} from "mobx-react-lite";

const PathsLayer = observer(() => {
    return (
        <Layer>
            {/*{paths.map((p, index) => (*/}
            {/*    <Line*/}
            {/*        key={index}*/}
            {/*        points={p.flat()}*/}
            {/*        stroke="purple"*/}
            {/*        strokeWidth={5}*/}
            {/*        lineCap="round"*/}
            {/*        lineJoin="round"*/}
            {/*        dash={[10, 20]}*/}
            {/*        tension={0.1}*/}
            {/*    />*/}
            {/*))}*/}
        </Layer>
    );
});

export default PathsLayer;