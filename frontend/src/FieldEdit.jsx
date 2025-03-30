import ZoomAndScrollStage from "./FieldEdit/ZoomAndScrollStage.jsx";
import React, {useEffect, useState} from "react";
import DrawLayer from "./FieldEdit/DrawLayer.jsx";
import {MODE, POLYGON_TYPE, NEXT_TYPE, TYPE_COLORS} from "./FieldEdit/consts.js";
import PolygonsLayer from "./FieldEdit/PolygonsLayer.jsx";
import ContextMenuPopup from "./FieldEdit/ContextMenuPopup.jsx";
import EditLayer from "./FieldEdit/EditLayer.jsx";
import TrajectoryLayer from "./FieldEdit/TrajectoryLayer.jsx";
import {Layer, Line} from "react-konva";


const FieldEdit = ({scene_width, scene_height, mode, setMode, polygons, setPolygons, trajectory, setTrajectory, paths}) => {

    const [lastPolygonType, setLastPolygonType] = useState(POLYGON_TYPE.GRASS);
    const [lastPolygonId, setLastPolygonId] = useState(0);


    const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, element: null});


    function addPolygon(polygon_points) {
        setLastPolygonId(lastPolygonId + 1);

        const newPolygon = {
            type: lastPolygonType,
            points: polygon_points,
        }
        setPolygons({...polygons, [lastPolygonId]: newPolygon});
    }

    function changePolygonById(id, data) {
        setPolygons(prevState => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                ...data
            }
        }));
    }

    const handleRightClick = (e) => {
        e.evt.preventDefault();
        if (mode !== MODE.VIEW) return;
        const x = e.evt.pageX;
        const y = e.evt.pageY;
        let element = e.target;
        if (["Layer", "Stage"].includes(element.getClassName())) {
            closeContextMenu()
        } else {
            setContextMenu({visible: true, x: x, y: y, element: element});
        }
    };

    function closeContextMenu() {
        setContextMenu({visible: false, x: 0, y: 0, element: null});
    }

    function nextPolygonType() {
        if (contextMenu.element) {
            const currentPolygonId = contextMenu.element.attrs.polygonId;
            const currentPolygon = polygons[currentPolygonId]
            const nextPolygonType = NEXT_TYPE[currentPolygon.type];

            changePolygonById(currentPolygonId, {type: nextPolygonType});

            setLastPolygonType(nextPolygonType);
            closeContextMenu();
        }
    }

    function changeDraggable() {
        if (contextMenu.element) {
            contextMenu.element.setDraggable(!contextMenu.element.draggable());
        }
        closeContextMenu()
    }

    function deletePolygon(id) {
        if (contextMenu.element) {
            const currentPolygonId = contextMenu.element.attrs.polygonId;

            setPolygons(prevState => {
                const newState = {...prevState}; // Создаем копию состояния
                delete newState[currentPolygonId]; // Удаляем элемент с ключом 0
                return newState; // Возвращаем новое состояние
            });
        }
        closeContextMenu()
    }

    useEffect(() => {
        console.log(polygons);
        console.log(Object.entries(polygons))
    }, [polygons])


    return (
        <>
            <ZoomAndScrollStage
                scene_width={scene_width}
                scene_height={scene_height}
                onContextMenu={handleRightClick}
                onMouseDown={closeContextMenu}
            >

                <PolygonsLayer
                    polygons={polygons}
                    changePolygon={changePolygonById}
                />

                <Layer>
                    {paths.map((p, index) => (
                        <Line
                            key={index}
                            points={p.flat()}
                            stroke="purple"
                            strokeWidth={5}
                            lineCap="round"
                            lineJoin="round"
                            dash={[10, 20]}
                            tension={1}
                        />
                    ))}

                </Layer>

                <TrajectoryLayer
                    trajectory={trajectory}
                    setTrajectory={setTrajectory}
                />

                {mode === MODE.DRAW && <DrawLayer
                    width={scene_width}
                    height={scene_height}
                    polygonType={lastPolygonType}
                    addPolygon={addPolygon}
                />}


                {mode === MODE.EDIT && <EditLayer

                />}
            </ZoomAndScrollStage>

            <ContextMenuPopup
                contextMenu={contextMenu}
                nextPolygonType={nextPolygonType}
                changeDraggable={changeDraggable}
                deletePolygon={deletePolygon}
            />
        </>
    );
};

export default FieldEdit;
