import React, { useState } from 'react';
import EditorStore from "./stores/EditorStore.js";
import {exportScene, loadScene} from "./FieldEdit/import-export.js";
import {observer} from "mobx-react-lite";
import socketStore from "./stores/socketStore.js";
import interfaceStore, {modalType} from "./stores/interfaceStore.js";
import AlgorithmStore from "./stores/algorithmStore.js";

const SimpleToolBar = observer(() => {
    const [activeMenu, setActiveMenu] = useState(null);
    const baseBtn = "flex flex-col items-center text-lg px-2 py-1 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 hover:bg-gray-100 rounded-md font-monospace";
    const baseGroup = "flex gap-2 mx-2 relative";
    const dropdownBtn = "flex items-center gap-1 text-lg px-2 py-1 transition-all duration-150 hover:bg-gray-100 rounded-md font-monospace";
    const dropdownMenu = "absolute bottom-full mb-2 left-0 bg-white shadow-lg rounded-2xl p-2 min-w-max z-10";

    const menuGroups = [
        {
            name: "Режимы",
            icon: "./src/components/g.svg",
            items: [
                { icon: "./src/components/eye.png", label: "Смотреть", action: () => EditorStore.enableViewMode() },
                { icon: "./src/components/swipe.png", label: "Двигать", action: () => EditorStore.enableDragMode() },
                { icon: "./src/components/draw.png", label: "Рисовать", action: () => EditorStore.enableDrawingMode() },
                { icon: "./src/components/intrest.png", label: "Точки интереса", action: () => EditorStore.enableInterestPointMode() }
            ]
        },
        {
            name: "Объекты",
            icon: "./src/components/brush.png",
            items: [
                { icon: "./src/components/grass.png", label: "Газон", action: () => EditorStore.selectGrassPolygonType() },
                { icon: "./src/components/build.png", label: "Здание", action: () => EditorStore.selectBuildingPolygonType() },
                { icon: "./src/components/garden.png", label: "Заборчик", action: () => EditorStore.selectFencePolygonType() }
            ]
        },
        {
            name: "Масштаб",
            icon: "./src/components/search.png",
            items: [
                { icon: "./src/components/add_2.png", label: "Приблизить", action: () => EditorStore.zoomIn() },
                { icon: "./src/components/check_indeterminate_small.png", label: "Отдалить", action: () => EditorStore.zoomOut() }
            ]
        },
        {
            name: "Файл",
            icon: "./src/components/folder_open.png",
            items: [
                { icon: "./src/components/draft.png", label: "Новый", action: () => interfaceStore.openModal(modalType.newMap) },
                { icon: "./src/components/vertical_align_bottom.png", label: "Импорт", action: () => loadScene() },
                { icon: "./src/components/upgrade.png", label: "Экспорт", action: () => exportScene() }
            ]
        },
        {
            name: "Навигация",
            icon: "./src/components/distance.png",
            items: [
                { icon: "./src/components/offline_pin.png", label: "Найти путь", action: () => socketStore.findPath() },
                { icon: "./src/components/mop.png", label: "Убрать пути", action: () => AlgorithmStore.clearPaths() }
            ]
        },
        {
            name: "Система",
            icon: "./src/components/folder_managed.png",
            items: [
                { icon: "./src/components/mode_off_on.png", label: socketStore.status, action: () => socketStore.connect() },
                { icon: "./src/components/set.png", label: "Настройки", action: () => interfaceStore.openModal(modalType.settings) }
            ]
        }
    ];

    const toggleMenu = (menuName) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[50%] bg-white rounded-2xl shadow-lg px-4 py-3 flex justify-center flex-wrap gap-x-4 gap-y-2">
            {menuGroups.map((group) => (
                <div key={group.name} className={baseGroup}>
                    <button 
                        className={baseBtn}
                        onClick={() => toggleMenu(group.name)}
                    >
                        <img src={group.icon} alt={group.name} className="w-6 h-6" />
                        {group.name}
                    </button>
                    
                    {activeMenu === group.name && (
                        <div className={dropdownMenu}>
                            {group.items.map((item) => (
                                <button
                                    key={item.label}
                                    className={dropdownBtn}
                                    onClick={() => {
                                        item.action();
                                        setActiveMenu(null);
                                    }}
                                >
                                     <img src={item.icon} alt={item.label} className="w-5 h-5 mr-2" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

export default SimpleToolBar;