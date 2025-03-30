import React from 'react';
import {Circle, Layer} from "react-konva";

const TrajectoryLayer = ({trajectory, setTrajectory}) => {
    console.log(trajectory);

    function dragEnd(e, index) {
        const newTrajectory = [...trajectory];
        newTrajectory[index] = [Math.round(e.target.x()), Math.round(e.target.y())];
        setTrajectory(newTrajectory);
    }

    return (
        <Layer>
            <Circle
                onDragEnd={(e) => dragEnd(e, 0)}
                radius={10}
                fill="purple"
                x={trajectory[0][0]}
                y={trajectory[0][1]}
                draggable={true}
            />
            <Circle
                onDragEnd={(e) => dragEnd(e, 1)}
                radius={10}
                fill="purple"
                x={trajectory[1][0]}
                y={trajectory[1][1]}
                draggable={true}
            />
        </Layer>
    );
};

export default TrajectoryLayer;