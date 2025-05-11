import {makeAutoObservable} from "mobx";


export const modalType = {
    closed: "",
    settings: "Настройки",
    newMap: "Создать новую карту",
}

class InterfaceStore {
    messageApi = undefined
    openedModal = modalType.closed

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

    closeModal(){
        this.openedModal = modalType.closed
    }

    openModal(modal){
        this.openedModal = modal
    }

}

export default new InterfaceStore();