import React, {useState} from "react";
import {Modal, InputNumber, Input, Button} from "antd";

export default function SettingsModal({isModalOpen, setIsModalOpen, settings, setSettings}) {
    const [tempSettings, setTempSettings] = useState(settings);

    const openModal = () => {
        setTempSettings(settings);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setSettings(tempSettings);
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (

        <Modal
            title="Настройки"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Сохранить"
            cancelText="Отмена"
        >
            <div className="flex flex-col gap-4">
                <label className="flex flex-col text-sm">
                    Хост
                    <Input
                        value={tempSettings.host}
                        onChange={(e) =>
                            setTempSettings({...tempSettings, host: e.target.value})
                        }
                    />
                </label>

                <label className="flex flex-col text-sm">
                    Натяжение (tension)
                    <InputNumber
                        min={0}
                        max={10}
                        step={0.1}
                        value={tempSettings.tension}
                        onChange={(value) =>
                            setTempSettings({...tempSettings, tension: value})
                        }
                    />
                </label>
            </div>
        </Modal>

    );
}
