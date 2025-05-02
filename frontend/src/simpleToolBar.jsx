import React from 'react';
import EditorStore from "./stores/EditorStore.js";
import {exportScene, loadScene} from "./FieldEdit/import-export.js";
import {observer} from "mobx-react-lite";
import socketStore from "./stores/socketStore.js";

const SimpleToolBar = observer(() => {
    const baseBtn =
        "flex flex-col items-center text-xs px-2 py-1 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 hover:bg-gray-100 rounded-md";

    const baseGroup = "flex gap-2 mx-2"

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] bg-white rounded-2xl shadow-lg px-4 py-3 flex justify-center flex-wrap gap-x-4 gap-y-2">
            <div className={baseGroup}>
                <button className={baseBtn} onClick={() => EditorStore.enableViewMode()}>
                    <span className="text-lg">🖱️</span>Смотреть
                </button>
                <button className={baseBtn} onClick={() => EditorStore.enableDragMode()}>
                    <span className="text-lg">👋</span>Двигать
                </button>
                <button className={baseBtn} onClick={() => EditorStore.enableDrawingMode()}>
                    <span className="text-lg">✏️</span>Рисовать
                </button>
            </div>

            <div className={baseGroup}>
                <button className={baseBtn} onClick={() => EditorStore.selectGrassPolygonType()}>
                    <span className="text-lg">🌿</span>Газон
                </button>
                <button className={baseBtn} onClick={() => EditorStore.selectBuildingPolygonType()}>
                    <span className="text-lg">🏢</span>Здание
                </button>
                <button className={baseBtn} onClick={() => EditorStore.selectFencePolygonType()}>
                    <span className="text-lg">🚧</span>Заборчик
                </button>
            </div>

            <div className={baseGroup}>
                <button className={baseBtn} onClick={() => EditorStore.zoomIn()}>
                    <span className="text-lg">➕️</span>Приблизить
                </button>
                <button className={baseBtn} onClick={() => EditorStore.zoomOut()}>
                    <span className="text-lg">➖️</span>Отдалить
                </button>
            </div>

            <div className={baseGroup}>
                <button className={baseBtn} onClick={() => loadScene()}>
                    <span className="text-lg">📥</span>Импорт
                </button>
                <button className={baseBtn} onClick={() => exportScene()}>
                    <span className="text-lg">📤️</span>Экспорт
                </button>
            </div>

            <div className={baseGroup}>
                <button className={baseBtn} onClick={() => socketStore.connect()}>
                    <span className="text-lg">📡</span>{socketStore.status}
                </button>
            </div>
        </div>
    );
});

export default SimpleToolBar;