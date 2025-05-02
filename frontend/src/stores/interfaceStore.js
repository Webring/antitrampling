import {makeAutoObservable} from "mobx";


class InterfaceStore {
    messageApi = undefined

    constructor() {
        makeAutoObservable(this);
    }

    setMessageApi(messageApi){
        this.messageApi = messageApi
    }

    showSuccessMessage(text){
        this.messageApi.success(text)
    }

    showErrorMessage(text){
        this.messageApi.error(text)
    }

}

export default new InterfaceStore();