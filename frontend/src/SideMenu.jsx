import React, {useState} from 'react';
import {Layout, Menu} from "antd";
import {
    AppstoreOutlined,
    CheckCircleTwoTone,
    CloseCircleTwoTone,
    CodeOutlined,
    EyeOutlined,
    FileAddOutlined,
    FileOutlined,
    FileTextOutlined,
    FileZipOutlined, FormatPainterOutlined,
    NodeIndexOutlined, PauseCircleTwoTone, SettingOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from "@ant-design/icons";
import SubMenu from "antd/es/menu/SubMenu.js";
import {SOCKET_STATUSES} from "./WebsocketStatuses.js";
import {MODE} from "./FieldEdit/consts.js";

const {Header, Content, Footer, Sider} = Layout;

const WEBSOCKET_STATUS_ICONS = {
    [SOCKET_STATUSES.ERROR]: <CloseCircleTwoTone twoToneColor="#ff0808"/>
    ,
    [SOCKET_STATUSES.PENDING]: <PauseCircleTwoTone twoToneColor="#ffc700"/>
    ,
    [SOCKET_STATUSES.CONNECTED]: <CheckCircleTwoTone twoToneColor="#52c41a"/>
}

const WEBSOCKET_STATUS_TITLE = {
    [SOCKET_STATUSES.ERROR]: "Ошибка подключения"
    ,
    [SOCKET_STATUSES.PENDING]: "Подключение"
    ,
    [SOCKET_STATUSES.CONNECTED]: "Подключено"
}

const SideMenu = ({socket_status, ...props}) => {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <Sider theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <Menu mode="inline">
                <Menu.Item
                    key="1"
                    icon={WEBSOCKET_STATUS_ICONS[socket_status]}
                    onClick={props.connectSocket}
                >
                    {WEBSOCKET_STATUS_TITLE[socket_status]}
                </Menu.Item>
                <SubMenu
                    key="file-menu"
                    title="Файлы"
                    icon={<FileOutlined/>}
                >
                    <Menu.Item
                        key="new_file"
                        icon={<FileTextOutlined/>}>
                        Новый
                    </Menu.Item>
                    <Menu.Item
                        key="open_file"
                        icon={<FileAddOutlined/>}
                        onClick={props.loadSceneFunc}
                    >
                        Открыть
                    </Menu.Item>
                    <Menu.Item
                        key="export_file"
                        icon={<FileZipOutlined/>}
                        onClick={props.exportSceneFunc}
                    >
                        Экспортировать
                    </Menu.Item>

                    {socket_status === SOCKET_STATUSES.CONNECTED && <Menu.Item
                        key="console"
                        icon={<CodeOutlined/>}
                        onClick={() => {
                            props.setConsoleVisible(true)
                        }}
                    >
                        Консоль
                    </Menu.Item>}

                </SubMenu>
                <SubMenu
                    key="mode-menu"
                    title="Режим"
                    icon={<AppstoreOutlined/>}
                >
                    <Menu.Item
                        key="mode-view"
                        icon={<EyeOutlined/>}
                        onClick={() => {
                            props.setMode(MODE.VIEW);
                        }}
                    >
                        Просмотр
                    </Menu.Item>
                    <Menu.Item
                        key="mode-draw"
                        icon={<FormatPainterOutlined/>}
                        onClick={() => {
                            props.setMode(MODE.DRAW);
                        }}
                    >
                        Рисовать
                    </Menu.Item>
                </SubMenu>

                {socket_status === SOCKET_STATUSES.CONNECTED && <Menu.Item
                    key="find_path"
                    icon={<NodeIndexOutlined/>}
                    onClick={props.findPath}
                >
                    Найти путь
                </Menu.Item>}

                <Menu.Item
                    key="settings"
                    icon={<SettingOutlined />}
                    onClick={() => {props.setSettingsVisible(true)}}
                >
                    Настройки
                </Menu.Item>

                <Menu.Item
                    key="zoom_in"
                    icon={<ZoomInOutlined/>}
                >
                    Приблизить
                </Menu.Item>
                <Menu.Item
                    key="zoom_out"
                    icon={<ZoomOutOutlined/>}
                >
                    Отдалить
                </Menu.Item>

            </Menu>
        </Sider>

    );
};

export default SideMenu;