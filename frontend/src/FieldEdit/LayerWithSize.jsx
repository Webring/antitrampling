import React from 'react';
import {Layer, Line, Rect} from "react-konva";

const LayerWithSize = ({width, height, ...props}) => {
    return (
        <Layer {...props}>
            <Rect width={width} height={height} opacity={0}/>
            {props.children}
        </Layer>
    );
};

export default LayerWithSize;