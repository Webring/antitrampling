import React, {useEffect, useRef} from 'react';
import {Stage} from "react-konva";
import EditorStore from "../stores/EditorStore.js";
import {observer} from "mobx-react-lite";

const ZoomAndScrollStage = observer(({sceneWidth, sceneHeight, ...props}) => {
    const stageRef = useRef(null);

    useEffect(() => {
        if (stageRef.current) {
            stageRef.current.container().style.transform = `scale(${EditorStore.zoom})`;
        }
    }, [EditorStore.zoom]);

    return (
        <div
            style={{
                overflow: 'auto', // появление скроллов, если сцена выходит за пределы
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f1f1f1', // Добавим фон для визуального эффекта
            }}
        >
            <Stage
                width={sceneWidth}
                height={sceneHeight}
                ref={stageRef}
                {...props}

                style={{transformOrigin: 'center center'}}
                className="shadow-sm bg-white rounded-lg"
            >
                {props.children}
            </Stage>
        </div>
    );
});

export default ZoomAndScrollStage;