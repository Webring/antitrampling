import React from 'react';
import {observer} from "mobx-react-lite";
import interfaceStore, {modalType} from "../stores/interfaceStore.js";
import SettingsModal from "./SettingsModal.jsx";
import NewMapDialogModal from "./NewMapDialogModal.jsx";

const Modals = observer(() => {
    return (
        <>
            {interfaceStore.openedModal === modalType.newMap && <NewMapDialogModal/>}
            {interfaceStore.openedModal === modalType.settings && <SettingsModal/>}
        </>
    );
});

export default Modals;