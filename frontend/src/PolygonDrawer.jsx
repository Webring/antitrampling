import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

const GRID_SIZE = 50; // Расстояние между точками сетки
const POINT_RADIUS = 2; // Радиус точек сетки (еле заметные)
const POLYGON_POINT_RADIUS = 5; // Радиус опорных точек полигона

const PolygonDrawer = () => {
    const [polygons, setPolygons] = useState([]);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [previewPoint, setPreviewPoint] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [selectedPointIndex, setSelectedPointIndex] = useState(null);
    const [mode, setMode] = useState("draw"); // 'draw', 'select', 'edit'
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const stageRef = useRef(null);

    // Генерация точек сетки
    const generateGridPoints = () => {
        const points = [];
        const width = window.innerWidth;
        const height = window.innerHeight;
        for (let x = 0; x < width; x += GRID_SIZE) {
            for (let y = 0; y < height; y += GRID_SIZE) {
                points.push({ x, y });
            }
        }
        return points;
    };

    const gridPoints = generateGridPoints();

    // Обработчик нажатия клавиш
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && mode === "draw") {
                setCurrentPoints([]);
                setIsDrawing(false);
                setPreviewPoint(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mode]);

    const handleMouseDown = (e) => {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();

        if (mode === "draw") {
            if (!isDrawing) {
                setCurrentPoints([pointer]);
                setIsDrawing(true);
            } else {
                setCurrentPoints([...currentPoints, pointer]);
            }
        } else if (mode === "edit" && selectedPolygon !== null) {
            // Проверяем, была ли нажата опорная точка
            const polygon = polygons[selectedPolygon];
            const pointIndex = polygon.points.findIndex(
                (p) => Math.hypot(p.x - pointer.x, p.y - pointer.y) < POLYGON_POINT_RADIUS * 2
            );
            if (pointIndex !== -1) {
                setSelectedPointIndex(pointIndex);
            } else {
                setSelectedPointIndex(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (mode === "draw" && isDrawing) {
            const stage = e.target.getStage();
            const pointer = stage.getPointerPosition();
            setPreviewPoint(pointer);
        }
    };

    const handleMouseUp = () => {
        if (mode === "draw" && currentPoints.length >= 2) {
            const firstPoint = currentPoints[0];
            const lastPoint = currentPoints[currentPoints.length - 1];
            const distance = Math.hypot(firstPoint.x - lastPoint.x, firstPoint.y - lastPoint.y);

            if (distance < 10) {
                const newPolygon = {
                    points: [...currentPoints],
                    color: Math.random() > 0.5 ? "red" : "green",
                };
                setPolygons([...polygons, newPolygon]);
                setCurrentPoints([]);
                setIsDrawing(false);
                setPreviewPoint(null);
            }
        } else if (mode === "edit") {
            setSelectedPointIndex(null);
        }
    };

    const handlePolygonClick = (index) => {
        if (mode === "draw") return;
        setSelectedPolygon(index);
    };

    const handleRightClick = (e) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        setContextMenu({ visible: true, x: pointer.x, y: pointer.y });
    };

    const handleColorChange = () => {
        if (selectedPolygon === null) return;
        const newPolygons = [...polygons];
        newPolygons[selectedPolygon].color = newPolygons[selectedPolygon].color === "red" ? "green" : "red";
        setPolygons(newPolygons);
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleDeletePolygon = () => {
        if (selectedPolygon === null) return;
        setPolygons(polygons.filter((_, i) => i !== selectedPolygon));
        setSelectedPolygon(null);
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    return (
        <>
            <div>
                <button onClick={() => setMode("draw")} disabled={mode === "draw"}>Рисовать</button>
                <button onClick={() => setMode("select")} disabled={mode === "select"}>Выбирать</button>
                <button onClick={() => setMode("edit")} disabled={mode === "edit"}>Редактировать</button>
            </div>
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={handleRightClick}
                style={{ cursor: mode === "draw" ? "crosshair" : "pointer" }}
            >
                <Layer>
                    {/* Сетка точек */}
                    {gridPoints.map((point, i) => (
                        <Circle key={i} x={point.x} y={point.y} radius={POINT_RADIUS} fill="rgba(0, 0, 0, 0.1)" />
                    ))}

                    {/* Полигоны */}
                    {polygons.map((polygon, i) => (
                        <React.Fragment key={i}>
                            <Line
                                points={polygon.points.flatMap((p) => [p.x, p.y])}
                                closed
                                fill={polygon.color}
                                stroke={selectedPolygon === i ? "blue" : "black"}
                                strokeWidth={2}
                                onClick={() => handlePolygonClick(i)}
                                onContextMenu={() => setSelectedPolygon(i)}
                                draggable={mode === "edit" && selectedPolygon === i}
                                onDragEnd={(e) => {
                                    const newPolygons = [...polygons];
                                    const offsetX = e.target.x();
                                    const offsetY = e.target.y();
                                    newPolygons[i].points = newPolygons[i].points.map((p) => ({
                                        x: p.x + offsetX,
                                        y: p.y + offsetY,
                                    }));
                                    e.target.x(0);
                                    e.target.y(0);
                                    setPolygons(newPolygons);
                                }}
                            />
                            {mode === "edit" &&
                                selectedPolygon === i &&
                                polygon.points.map((point, j) => (
                                    <Circle
                                        key={j}
                                        x={point.x}
                                        y={point.y}
                                        radius={POLYGON_POINT_RADIUS}
                                        fill="yellow"
                                        stroke="black"
                                        strokeWidth={1}
                                        draggable
                                        onDragEnd={(e) => {
                                            const newPolygons = [...polygons];
                                            newPolygons[i].points[j] = { x: e.target.x(), y: e.target.y() };
                                            setPolygons(newPolygons);
                                        }}
                                    />
                                ))}
                        </React.Fragment>
                    ))}

                    {/* Предпросмотр текущего полигона */}
                    {currentPoints.length > 0 && mode === "draw" && (
                        <Line
                            points={currentPoints.flatMap((p) => [p.x, p.y])}
                            stroke="blue"
                            strokeWidth={2}
                        />
                    )}
                    {previewPoint && mode === "draw" && (
                        <Line
                            points={[...currentPoints.flatMap((p) => [p.x, p.y]), previewPoint.x, previewPoint.y]}
                            stroke="gray"
                            strokeWidth={2}
                            dash={[10, 5]}
                        />
                    )}
                </Layer>
            </Stage>

            {/* Контекстное меню */}
            {contextMenu.visible && (
                <div
                    style={{
                        position: "absolute",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: "white",
                        border: "1px solid black",
                        padding: "5px",
                        zIndex: 1000,
                    }}
                >
                    <button onClick={handleColorChange}>Изменить цвет</button>
                    <button onClick={handleDeletePolygon}>Удалить</button>
                    <button onClick={handleCloseContextMenu}>Закрыть</button>
                </div>
            )}
        </>
    );
};

export default PolygonDrawer;