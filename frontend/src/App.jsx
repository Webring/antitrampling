import './App.css'
import FieldEdit from "./FieldEdit.jsx";
import SimpleToolBar from "./simpleToolBar.jsx";
import {message} from "antd";
import InterfaceStore from "./stores/interfaceStore.js";
import {useEffect} from "react";
import Modals from "./modals/Modals.jsx";
import TasksPopup from "./TasksPopup.jsx";


function App() {
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        InterfaceStore.setMessageApi(messageApi)
    }, [])

    return (
        <>
            {contextHolder}
            <FieldEdit/>
            <SimpleToolBar/>
            <TasksPopup/>
            <Modals/>
        </>

    )
}

export default App
