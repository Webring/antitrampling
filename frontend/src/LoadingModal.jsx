import React, {useState, useEffect} from "react";
import {Modal, Spin, Progress} from "antd";

const LoadingModal = ({task, setTask, getStatus}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            getStatus();
            setProgress((value) => {
                if (value === 99) return 99;
                return value + 1;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Modal
            open={task}
            onCancel={() => {
                setTask(null)
            }}
            footer={null}
            title={"Ожидание завершения задания"}>
            <div>
                <div className="flex justify-center p-10">
                    <Spin size="large" className="mb-4"/>
                </div>
                <div>
                    <Progress percent={progress}/>
                </div>

            </div>
        </Modal>
    );
};

export default LoadingModal;
