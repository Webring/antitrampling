import ZoomAndScrollStage from "./FieldEdit/ZoomAndScrollStage.jsx";
import React from "react";
import {observer} from "mobx-react-lite";
import FieldStore from "./stores/FieldStore.js";
import EditorStore, {modeType} from "./stores/EditorStore.js";
import DrawingLayer from "./FieldEdit/DrawingLayer.jsx";
import PolygonsLayer from "./FieldEdit/PolygonsLayer.jsx";
// import ContextMenuPopup from "./FieldEdit/ContextMenuPopup.jsx";

const FieldEdit = observer(() => {

    // const [lastPolygonType, setLastPolygonType] = useState(POLYGON_TYPE.GRASS);


    // const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, element: null});


    // function changePolygonById(id, data) {
    //     setPolygons(prevState => ({
    //         ...prevState,
    //         [id]: {
    //             ...prevState[id],
    //             ...data
    //         }
    //     }));
    // }
    //
    // const handleRightClick = (e) => {
    //     e.evt.preventDefault();
    //     if (mode !== MODE.VIEW) return;
    //     const x = e.evt.pageX;
    //     const y = e.evt.pageY;
    //     let element = e.target;
    //     if (["Layer", "Stage"].includes(element.getClassName())) {
    //         closeContextMenu()
    //     } else {
    //         setContextMenu({visible: true, x: x, y: y, element: element});
    //     }
    // };
    //
    // function closeContextMenu() {
    //     setContextMenu({visible: false, x: 0, y: 0, element: null});
    // }
    //
    // function nextPolygonType() {
    //     if (contextMenu.element) {
    //         const currentPolygonId = contextMenu.element.attrs.polygonId;
    //         const currentPolygon = polygons[currentPolygonId]
    //         const nextPolygonType = NEXT_TYPE[currentPolygon.type];
    //
    //         changePolygonById(currentPolygonId, {type: nextPolygonType});
    //
    //         setLastPolygonType(nextPolygonType);
    //         closeContextMenu();
    //     }
    // }
    //
    // function changeDraggable() {
    //     if (contextMenu.element) {
    //         contextMenu.element.setDraggable(!contextMenu.element.draggable());
    //     }
    //     closeContextMenu()
    // }
    //
    // function deletePolygon(id) {
    //     if (contextMenu.element) {
    //         const currentPolygonId = contextMenu.element.attrs.polygonId;
    //
    //         setPolygons(prevState => {
    //             const newState = {...prevState}; // Создаем копию состояния
    //             delete newState[currentPolygonId]; // Удаляем элемент с ключом 0
    //             return newState; // Возвращаем новое состояние
    //         });
    //     }
    //     closeContextMenu()
    // }
    //
    // useEffect(() => {
    //     console.log(polygons);
    //     console.log(Object.entries(polygons))
    // }, [polygons])
    //
    //
    // const [image, setImage] = useState(null);
    //
    // useEffect(() => {
    //     const img = new window.Image();
    //     img.crossOrigin = 'Anonymous'; // важно для кросс-доменных изображений
    //     img.src = settings.background_url;
    //     img.onload = () => {
    //         setImage(img);
    //     };
    // }, [settings.background_url]);


    return (
        <>
            <ZoomAndScrollStage
                sceneHeight={FieldStore.height}
                sceneWidth={FieldStore.width}
            >
                {/*<Layer>*/}

                {/*    {*/}
                {/*        settings.background_url &&*/}
                {/*        image &&*/}
                {/*        <KonvaImage*/}
                {/*            image={image}*/}
                {/*            x={0}*/}
                {/*            y={0}*/}
                {/*            width={scene_width}*/}
                {/*            height={scene_height}*/}
                {/*        />}*/}
                {/*</Layer>*/}


                <PolygonsLayer/>

                {/*<Layer>*/}
                {/*    {paths.map((p, index) => (*/}
                {/*        <Line*/}
                {/*            key={index}*/}
                {/*            points={p.flat()}*/}
                {/*            stroke="purple"*/}
                {/*            strokeWidth={5}*/}
                {/*            lineCap="round"*/}
                {/*            lineJoin="round"*/}
                {/*            dash={[10, 20]}*/}
                {/*            tension={0.1}*/}
                {/*        />*/}
                {/*    ))}*/}

                {/*</Layer>*/}

                {/*    <TrajectoryLayer*/}
                {/*        trajectory={trajectory}*/}
                {/*        setTrajectory={setTrajectory}*/}
                {/*    />*/}

                {EditorStore.mode === modeType.draw && <DrawingLayer/>}


                {/*    />}*/}
            </ZoomAndScrollStage>

            {/*<ContextMenuPopup/>*/}
        </>
    );
})

export default FieldEdit;
