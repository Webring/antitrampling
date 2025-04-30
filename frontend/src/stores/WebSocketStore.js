import {makeAutoObservable} from "mobx";

const SocketStatus = {
    pending: "Подключение",
    connected: "Подключено",
    disconnected: "Отключено",
}

class WebSocket {
    host = "localhost:8080"
    ws = null
    status = ""

    constructor() {
        makeAutoObservable(this)
    }

    setHost(host) {
        if (host.length >= 1) {
            this.host = host;
        }
    }

    connect(){
        this.status = SocketStatus.pending;
        this.ws = new WebSocket(`ws://${this.host}`)

    }

}