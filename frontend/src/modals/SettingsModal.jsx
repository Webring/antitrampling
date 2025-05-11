import React from 'react';
import {observer} from 'mobx-react-lite';
import {Modal, Tabs, Form, Input, Upload, Button, Radio, Switch, InputNumber} from 'antd';
import interfaceStore, {modalType} from "../stores/interfaceStore.js";
import socketStore from "../stores/socketStore.js";
import editorStore, {backgroundType} from "../stores/EditorStore.js";
import {UploadOutlined} from "@ant-design/icons";

const {TabPane} = Tabs;

const backgroundModes = {
    clear: "none",
    imagePath: "imagePath",
    imageFile: "imageFile",
    grid: "grid",
}

const SettingsModal = observer(() => {
    const [form] = Form.useForm();

    const setImage = (url) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            editorStore.setBackgroundImage(img)
            interfaceStore.showSuccessMessage("Задний фон успешно загружен")
        };

        img.onerror = () => {
            interfaceStore.showErrorMessage("Ошибка загрузки заднего фона!")
        }
    }

    const handleOk = () => {
        form.validateFields().then(values => {
            console.log(values);
            socketStore.setHost(values.host);

            switch(values.backgroundMode) {
                case backgroundModes.clear:
                    editorStore.clearBackground();
                    break;
                case backgroundModes.imagePath:
                    if (values.imagePath) {
                        setImage(values.imagePath);
                    }
                    break;
                case backgroundModes.imageFile:
                    if (values.uploadedImage && values.uploadedImage.file) {
                        const file = values.uploadedImage.file;
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const base64Image = e.target.result;
                            setImage(base64Image);
                        };
                        reader.readAsDataURL(file);
                    }
                    break;
                case 'grid':
                    editorStore.setBackgroundGrid(values.cellSize, values.usePoints);
                    break;
                default:
                    break;
            }

            interfaceStore.closeModal();
        });
    };

    const handleCancel = () => {
        interfaceStore.closeModal();
    };

    return (
        <Modal
            title="Настройки"
            open={interfaceStore.openedModal === modalType.settings}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Сохранить"
            cancelText="Отмена"
        >
            <Tabs defaultActiveKey="2">
                <TabPane tab="Cокет" key="1" forceRender>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            host: socketStore.host,
                        }}
                    >
                        <Form.Item
                            label='Адрес бэкэнда в формате "адрес:порт"'
                            name="host"
                        >
                            <Input/>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab="Редактор" key="2" forceRender>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            backgroundMode: backgroundModes.clear,
                            usePoints: editorStore.background.type === backgroundType.points,
                            cellSize: editorStore.background.cellSize,
                        }}
                    >
                        <Form.Item
                            name="backgroundMode"
                            label="Задний фон"
                        >
                            <Radio.Group>
                                <Radio value={backgroundModes.clear}>Нет</Radio>
                                <Radio value={backgroundModes.imagePath}>По ссылке</Radio>
                                <Radio value={backgroundModes.imageFile}>Загрузка изображения</Radio>
                                <Radio value={backgroundModes.grid}>Сетка</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.backgroundMode !== currentValues.backgroundMode
                            }
                        >
                            {({ getFieldValue }) => {
                                const backgroundMode = getFieldValue('backgroundMode');

                                if (backgroundMode === backgroundModes.imagePath) {
                                    return (
                                        <Form.Item
                                            label='Адрес изображения в интернете'
                                            name="imagePath"
                                        >
                                            <Input/>
                                        </Form.Item>
                                    );
                                }

                                if (backgroundMode === backgroundModes.imageFile) {
                                    return (
                                        <Form.Item
                                            label="Загрузите файл"
                                            name="uploadedImage"
                                        >
                                            <Upload
                                                accept="image/*"
                                                maxCount={1}
                                                beforeUpload={() => false}
                                            >
                                                <Button icon={<UploadOutlined/>}>
                                                    Выбрать изображение
                                                </Button>
                                            </Upload>
                                        </Form.Item>
                                    );
                                }

                                if (backgroundMode === backgroundModes.grid) {
                                    return (
                                        <>
                                            <Form.Item
                                                label="Размер ячейки (px)"
                                                name="cellSize"
                                            >
                                                <InputNumber
                                                    min={5}
                                                    step={5}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                label="Точки вместо сетки"
                                                name="usePoints"
                                                valuePropName="checked"
                                            >
                                                <Switch />
                                            </Form.Item>
                                        </>
                                    );
                                }

                                return null;
                            }}
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </Modal>
    );
});

export default SettingsModal;