import './App.css'
import FieldEdit from "./FieldEdit.jsx";
import SimpleToolBar from "./simpleToolBar.jsx";
import {message} from "antd";
import InterfaceStore from "./stores/interfaceStore.js";


function App() {
    const [messageApi, contextHolder] = message.useMessage();

    InterfaceStore.setMessageApi(messageApi)

    return (
        <>
            {contextHolder}
            <FieldEdit/>
            <SimpleToolBar/>
        </>

    )
}

export default App
