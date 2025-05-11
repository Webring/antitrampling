import React, {useEffect} from "react";
import {observer} from "mobx-react-lite";
import ZoomAndScrollStage from "./FieldEdit/ZoomAndScrollStage.jsx";
import FieldStore from "./stores/FieldStore.js";
import EditorStore, {modeType} from "./stores/EditorStore.js";
import DrawingLayer from "./FieldEdit/DrawingLayer.jsx";
import PolygonsLayer from "./FieldEdit/PolygonsLayer.jsx";
import ContextMenuPopup from "./FieldEdit/ContextMenuPopup.jsx";
import BackgroundLayer from "./FieldEdit/BackgroundLayer.jsx";
import PathsLayer from "./FieldEdit/PathsLayer.jsx";
import InterestPointsLayer from "./FieldEdit/InterestPointsLayer.jsx";

const FieldEdit = observer(() => {
    const handleRightClick = (e) => {
        e.evt.preventDefault();

        const x = e.evt.pageX;
        const y = e.evt.pageY;
        let element = e.target;

        if ([modeType.view, modeType.drag].includes(EditorStore.mode)) {
            if (["Layer", "Stage", "Circle"].includes(element.getClassName())) {
                EditorStore.closeContextMenu()
            } else {
                EditorStore.setContextMenu({visible: true, x: x, y: y, element: element});
            }
        }

    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (FieldStore.isEmpty) return;
            e.preventDefault();
            e.returnValue = ""; // нужно для срабатывания диалога
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [FieldStore.isEmpty]);

    return (
        <>
            <ZoomAndScrollStage
                sceneHeight={FieldStore.height}
                sceneWidth={FieldStore.width}

                onContextMenu={handleRightClick}
                onMouseDown={() => EditorStore.closeContextMenu()}
            >
                <BackgroundLayer/>
                <PolygonsLayer/>
                <PathsLayer/>
                <InterestPointsLayer/>
                {EditorStore.mode === modeType.draw && <DrawingLayer/>}
            </ZoomAndScrollStage>

            {EditorStore.contextMenuIsVisible && <ContextMenuPopup/>}
        </>
    );
})

export default FieldEdit;
