import './App.css'
import FieldEdit from "./FieldEdit.jsx";
import WebSocketConsole from "./WebSocketConsole.jsx";
import {useEffect, useState} from "react";

import {Layout, message} from 'antd';
import SideMenu from "./SideMenu.jsx";
import {SOCKET_STATUSES} from "./WebsocketStatuses.js";
import {MODE} from "./FieldEdit/consts.js";
import LoadingModal from "./LoadingModal.jsx";
import SettingsModal from "./SettingsModal.jsx";


function App() {
    const [mode, setMode] = useState(MODE.DRAW);
    const [size, setSize] = useState({width: 1920, height: 1080});
    const [polygons, setPolygons] = useState({});
    const [paths, setPaths] = useState([]);
    const [trajectory, setTrajectory] = useState([[200, 100], [500, 500]]);


    const [socket, setSocket] = useState(null);
    const [socketStatus, setSocketStatus] = useState(null);

    const [currentTask, setCurrentTask] = useState(null)

    const [consoleVisible, setConsoleVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [settings, setSettings] = useState({host: "localhost:8765", tension: 1});

    const [modalWindow, setModalWindow] = useState(null);

    const [messageApi, contextHolder] = message.useMessage();


    function connectSocket() {
        setSocketStatus(SOCKET_STATUSES.PENDING);
        const ws = new WebSocket(`ws://${settings.host}`); // Замените на ваш WebSocket сервер
        setSocket(ws);
        ws.onopen = () => {
            setSocketStatus(SOCKET_STATUSES.CONNECTED);
        };
        ws.onerror = (e) => {
            setSocketStatus(SOCKET_STATUSES.ERROR);
            setConsoleVisible(false);
        }
        ws.onclose = () => {
            setSocketStatus(SOCKET_STATUSES.ERROR);
            setConsoleVisible(false);
        }
        ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            console.log("received websocket data", data);
            if ("uuid" in data) { // Если мы отправили таску
                setCurrentTask(JSON.parse(e.data).uuid);
            } else if ("status" in data) {// Если мы получили состояние таску
                if (data.status !== "pending") {

                    if (data.status === "error") {
                        messageApi.error(data.result.message);
                    }
                    if (data.status === "success") {
                        messageApi.success(data.result.message);
                        setPaths(data.result.paths);
                    }

                    setCurrentTask(null);
                }
            }

        }
    }

    function getStatus() {
        socket.send(JSON.stringify({"type": "check", "uuid": currentTask}));
    }


    function findPath() {
        socket.send(JSON.stringify({"type": "find_path", "polygons": polygons, "trajectory": trajectory}));
    }


    function loadScene() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const data = JSON.parse(event.target.result);

                    if (typeof data.width !== 'number' || typeof data.height !== 'number' || typeof data.polygons !== 'object') {
                        throw new Error("Invalid scene format");
                    }

                    // Проверка корректности данных внутри polygons
                    for (const key in data.polygons) {
                        const polygon = data.polygons[key];
                        if (typeof polygon.type !== 'string' || !Array.isArray(polygon.points)) {
                            throw new Error("Invalid polygon structure");
                        }

                        if (polygon.points.some(point =>
                            !Array.isArray(point) || point.length !== 2 ||
                            typeof point[0] !== 'number' || typeof point[1] !== 'number')) {
                            throw new Error("Invalid polygon points format");
                        }
                    }

                    setSize({width: data.width, height: data.height});
                    setPolygons(data.polygons);
                    messageApi.success(`Файл ${file.name} успешно загружен!`)
                } catch (error) {
                    messageApi.error(`Файл ${file.name} невозможно загрузить!`)
                }
            };
            reader.readAsText(file);
        });

        input.click();
    }

    function exportScene() {
        const jsonString = JSON.stringify({
            width: 1920,
            height: 1080,
            polygons: polygons,

        });
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const filename = `scene_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}__${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        messageApi.success(`Сцена успешно экспортирована!`)
    }


    useEffect(() => {
        connectSocket();
    }, []);

    return (
        <Layout style={{
            minHeight: '100vh',
        }}>
            {currentTask &&
                <LoadingModal
                    task={currentTask}
                    setTask={setCurrentTask}
                    getStatus={getStatus}
                />}
            {contextHolder}
            <SideMenu
                socket_status={socketStatus}
                connectSocket={connectSocket}
                setConsoleVisible={setConsoleVisible}
                mode={mode}
                setMode={setMode}
                findPath={findPath}
                exportSceneFunc={exportScene}
                loadSceneFunc={loadScene}
                setSettingsVisible={setSettingsVisible}
            />
            <Layout>
                <FieldEdit
                    scene_width={size.width}
                    scene_height={size.height}
                    mode={mode}
                    setMode={setMode}
                    polygons={polygons}
                    setPolygons={setPolygons}
                    trajectory={trajectory}
                    setTrajectory={setTrajectory}
                    paths={paths}
                />


                {settingsVisible &&
                    <SettingsModal
                    isModalOpen={settingsVisible}
                    setIsModalOpen={setSettingsVisible}
                    settings={settings}
                    setSettings={setSettings}
                    />
                }


                {consoleVisible &&
                    socket &&
                    <WebSocketConsole
                        socket={socket}
                        visible={consoleVisible}
                        setVisible={setConsoleVisible}
                    />}
            </Layout>

        </Layout>
    )
}

export default App
