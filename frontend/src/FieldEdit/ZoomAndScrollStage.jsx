import React, {useEffect, useRef, useState} from 'react';
import {Stage} from "react-konva";
import ControlButtons from "./ControlButtons.jsx";

const ZoomAndScrollStage = ({scene_width, scene_height, ...props}) => {
    const [zoom, setZoom] = useState(1); // начальный масштаб сцены
    const stageRef = useRef(null);

    // Плавное масштабирование
    const zoomIn = () => {
        setZoom((prevZoom) => Math.min(prevZoom + 0.1, 5)); // увеличиваем масштаб с максимальным значением 3
    };

    const zoomOut = () => {
        setZoom((prevZoom) => Math.max(prevZoom - 0.1, 0.2)); // уменьшаем масштаб с минимальным значением 0.2
    };

    // Центрирование сцены и настройка масштаба
    useEffect(() => {
        if (stageRef.current) {
            stageRef.current.container().style.transform = `scale(${zoom})`;
        }
    }, [zoom]);

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
                width={scene_width}
                height={scene_height}
                ref={stageRef}
                {...props}

                style={{transformOrigin: 'center center'}}
                className="shadow-sm bg-white rounded-lg"
            >
                {props.children}
            </Stage>
            <ControlButtons zoomIn={zoomIn} zoomOut={zoomOut}/>

        </div>
    );
};

export default ZoomAndScrollStage;