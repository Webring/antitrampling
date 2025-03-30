import React from 'react';
import {FloatButton} from "antd";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";

const ControlButtons = ({zoomIn, zoomOut}) => {
    return (
        <div>
            <FloatButton.Group
                shape="square">
                <FloatButton icon={<PlusOutlined/>} onClick={zoomIn}/>
                <FloatButton icon={<MinusOutlined/>} onClick={zoomOut}/>
            </FloatButton.Group>
        </div>
    );
};

export default ControlButtons;