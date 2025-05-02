import {makeAutoObservable} from "mobx";

const socketStatus = {
    pending: "Подключение...",
    connected: "Подключено",
    disconnected: "Отключено",
}

class socketStore {
    host = "localhost:8080"
    socket = undefined
    status = socketStatus.disconnected

    constructor() {
        makeAutoObservable(this)
    }

    setHost(host) {
        if (host.length >= 1) {
            this.host = host;
        }
    }

    setStatus(status){
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
            console.log(e)
        }
    }

}

export default new socketStore();