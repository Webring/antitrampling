import React from 'react';
import {observer} from "mobx-react-lite";
import EditorStore from "../stores/EditorStore.js";
import editorStore from "../stores/EditorStore.js";
import FieldStore, {polygonType} from "../stores/FieldStore.js";

const ContextMenuPopup = observer(() => {


    return (
        <div
            style={{
                position: "absolute",
                top: EditorStore.contextMenu.y,
                left: EditorStore.contextMenu.x,
            }}
            className="bg-white rounded-lg shadow-2xl p-1 flex flex-col justify-center"
        >
            {FieldStore.polygons[editorStore.contextElementPolygonId].type !== polygonType.grass &&
                <button
                    onClick={() => {
                        FieldStore.setPolygonType(editorStore.contextElementPolygonId, polygonType.grass);
                        EditorStore.closeContextMenu()
                    }}
                    className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                    🌿 Сделать газоном 🌿
                </button>
            }
            {FieldStore.polygons[editorStore.contextElementPolygonId].type !== polygonType.building &&
                <button
                    onClick={() => {
                        FieldStore.setPolygonType(editorStore.contextElementPolygonId, polygonType.building);
                        EditorStore.closeContextMenu()
                    }}
                    className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                    🏢 Сделать зданием 🏢
                </button>
            }
            {FieldStore.polygons[editorStore.contextElementPolygonId].type !== polygonType.fence &&

                <button
                    onClick={() => {
                        FieldStore.setPolygonType(editorStore.contextElementPolygonId, polygonType.fence);
                        EditorStore.closeContextMenu()
                    }}
                    className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                    🚧 Сделать забором 🚧
                </button>
            }
            <button
                onClick={() => {
                    FieldStore.removePolygon(editorStore.contextElementPolygonId);
                    EditorStore.closeContextMenu()
                }}
                className="p-2 rounded hover:bg-gray-100 active:bg-gray-200 text-red-500 font-bold">
                ⛔ Удалить ⛔
            </button>
        </div>
    );
});

export default ContextMenuPopup;