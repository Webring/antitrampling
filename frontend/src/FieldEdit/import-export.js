import FieldStore from "../stores/FieldStore.js";
import InterfaceStore from "../stores/interfaceStore.js";

export function loadScene() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                FieldStore.import(event.target.result)
                InterfaceStore.showSuccessMessage(`Файл ${file.name} успешно загружен!`)
            } catch {
                InterfaceStore.showErrorMessage(`Файл ${file.name} невозможно загрузить! Возможно, он поврежден или был создан в другой версии программы!`)
            }
        };
        reader.readAsText(file);
    });

    input.click();
}

function getExportFilename() {
    const now = new Date();
    return `scene_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}__${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}.json`;
}

export function exportScene() {
    const blob = new Blob([FieldStore.export()], {type: 'application/json'});
    const url = URL.createObjectURL(blob);


    const a = document.createElement('a');
    a.href = url;
    a.download = getExportFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    InterfaceStore.showSuccessMessage(`Сцена успешно экспортирована!`)
}