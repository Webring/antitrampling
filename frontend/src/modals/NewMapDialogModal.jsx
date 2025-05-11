import React from 'react';
import { Modal, Form, InputNumber } from 'antd';
import { observer } from 'mobx-react-lite';
import interfaceStore, { modalType } from '../stores/interfaceStore.js';
import FieldStore from '../stores/FieldStore.js';

const NewMapDialogModal = observer(() => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields().then(values => {
            const { width, height } = values;
            FieldStore.new(width, height);
            interfaceStore.closeModal();
        });
    };

    const handleCancel = () => {
        interfaceStore.closeModal();
    };

    return (
        <Modal
            title="Создать новую карту"
            open={interfaceStore.openedModal === modalType.newMap}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Создать"
            cancelText="Отмена"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    width: 500,
                    height: 500,
                }}
            >
                <Form.Item
                    label="Ширина"
                    name="width"
                    rules={[{ required: true, message: 'Укажите ширину карты' }]}
                >
                    <InputNumber min={500} step={50} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    label="Высота"
                    name="height"
                    rules={[{ required: true, message: 'Укажите высоту карты' }]}
                >
                    <InputNumber min={500} step={50} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
});

export default NewMapDialogModal;