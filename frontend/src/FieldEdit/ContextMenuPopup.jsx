import React from 'react';
import { NEXT_TYPE } from "./consts.js";

const ContextMenuPopup = ({ contextMenu, changeDraggable, nextPolygonType, deletePolygon }) => {
    if (!contextMenu.visible || !contextMenu.element) {
        return null;
    }

    return (
        <div style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
        }}
             className="bg-white rounded-lg shadow-2xl p-1 flex flex-col justify-center">
            <button
                onClick={changeDraggable}
                className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                {contextMenu.element.draggable() ? 'Заблокировать' : 'Разблокировать'}
            </button>
            <button
                onClick={nextPolygonType}
                className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                Сделать "{NEXT_TYPE[contextMenu.element.attrs.polygonType]}"
            </button>
            <button
                className="p-2 rounded border-b-1 border-gray-100 hover:bg-gray-100 active:bg-gray-200">
                Редактировать
            </button>
            <button
                onClick={deletePolygon}
                className="p-2 rounded hover:bg-gray-100 active:bg-gray-200 text-red-500 font-bold">
                Удалить
            </button>
        </div>
    );
};

export default ContextMenuPopup;