import {makeAutoObservable} from "mobx";
import interfaceStore from "./interfaceStore.js";
import fieldStore from "./FieldStore.js";
import viewStore from "./algorithmStore.js";

const socketStatus = {
    pending: "Подключение...",
    connected: "Подключено",
    disconnected: "Отключено",
}

class socketStore {
    host = "localhost:8765"
    socket = undefined
    status = socketStatus.disconnected

    tasks = []

    constructor() {
        makeAutoObservable(this)
    }

    setHost(host) {
        if (host.length >= 1) {
            this.host = host;
        }
    }

    setStatus(status) {
        this.status = status
    }

    connect() {
        this.status = socketStatus.pending;
        this.socket = new WebSocket(`ws://${this.host}`)

        this.socket.onopen = () => {
            this.setStatus(socketStatus.connected)
        };
        this.socket.onerror = () => {
            this.setStatus(socketStatus.disconnected)
        }
        this.socket.onclose = () => {
            this.setStatus(socketStatus.disconnected)
        }
        this.socket.onmessage = (e) => {
            let data = JSON.parse(e.data);
            console.log("received websocket data", data);
            if ("uuid" in data) { // Если мы отправили таску
                this.addTask(data.uuid)
            } else if ("status" in data) {// Если мы получили состояние таску
                if (data.status !== "pending") {
                    if (data.status === "error") {
                        interfaceStore.showErrorMessage(data.result);
                    }
                    if (data.status === "success") {
                        interfaceStore.showSuccessMessage(data.result.message);
                        console.log("paths", data.result.paths);
                        viewStore.addPaths(data.result.paths);
                    }

                    this.removeTask(data.uuid);
                }
            }
        }
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(uuid) {
        this.tasks.splice(this.tasks.indexOf(uuid), 1);
    }

    getStatus(uuid) {
        this.socket.send(JSON.stringify({
            "type": "check",
            "uuid": uuid
        }));
    }

    findPath() {
        this.socket.send(JSON.stringify({
            "type": "find_path",
            "polygons": fieldStore.polygons,
            "points_of_interest": fieldStore.interestPoints,
            "size": {
                width: fieldStore.width,
                height: fieldStore.height
            },
            "settings": {
                "weights": {
                    "fence": 5,
                    "grass": 3,
                    "road": 1
                }
            }
        }));
    }
}

export default new socketStore();