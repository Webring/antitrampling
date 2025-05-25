import React from 'react';
import {Layer, Image as KonvaImage, Line, Circle} from "react-konva";
import {observer} from "mobx-react-lite";
import editorStore, {backgroundType} from "../stores/EditorStore.js";
import FieldStore from "../stores/FieldStore.js";

const BackgroundLayer = observer(() => {
    const {background} = editorStore;
    const {width, height} = FieldStore;

    const renderGrid = () => {
        if (!background.cellSize || background.cellSize <= 0) return null;

        const cellSize = background.cellSize;
        const lines = [];

        for (let x = 0; x <= width; x += cellSize) {
            lines.push(
                <Line
                    key={`v_${x}`}
                    points={[x, 0, x, height]}
                    stroke="#ddd"
                    strokeWidth={1}
                    opacity={editorStore.background.opacity}
                />
            );
        }

        for (let y = 0; y <= height; y += cellSize) {
            lines.push(
                <Line
                    key={`h_${y}`}
                    points={[0, y, width, y]}
                    stroke="#ddd"
                    strokeWidth={1}
                    opacity={editorStore.background.opacity}
                />
            );
        }

        return lines;
    };

    const renderDots = () => {
        if (!background.cellSize || background.cellSize <= 0) return null;

        const cellSize = background.cellSize;
        const dots = [];

        for (let x = 0; x <= width; x += cellSize) {
            for (let y = 0; y <= height; y += cellSize) {
                dots.push(
                    <Circle
                        key={`dot_${x}_${y}`}
                        x={x}
                        y={y}
                        radius={2}
                        fill="#999"
                        opacity={editorStore.background.opacity}
                    />
                );
            }
        }

        return dots;
    };


    return (
        <Layer>
            {
                editorStore.background.type === backgroundType.image &&
                editorStore.background.image &&
                <KonvaImage
                    image={editorStore.background.image}
                    x={0}
                    y={0}
                    width={FieldStore.width}
                    height={FieldStore.height}
                    opacity={editorStore.background.opacity}
                />
            }

            {editorStore.background.type === backgroundType.grid && renderGrid()}
            {editorStore.background.type === backgroundType.points && renderDots()}
        </Layer>
    );
});

export default BackgroundLayer;