import {useEffect, useState} from 'react';
import socketStore from "./stores/socketStore.js";
import {observer} from "mobx-react-lite";

const TasksPopup = observer(() => {
    const [isVisible, setIsVisible] = useState(false);

    const [progresses, setProgresses] = useState({});

    function getProgress(uuid) {
        return progresses[uuid] ? progresses[uuid] : 0
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            setProgresses(prevProgresses => {
                const newProgresses = {...prevProgresses};

                socketStore.tasks.forEach(taskUUID => {
                    socketStore.getStatus(taskUUID);

                    const newValue = prevProgresses[taskUUID]
                        ? Math.min(prevProgresses[taskUUID] + 1, 99)
                        : 1;

                    newProgresses[taskUUID] = newValue;
                });

                return newProgresses;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    return (
        <div
            className={`fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isVisible ? 'w-64' : 'w-10'}`}>
            {isVisible ? (
                <div>
                    <div className="flex justify-between items-center bg-gray-800 text-white p-2">
                        <h3 className="font-semibold">Выполнение задач</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-white hover:text-gray-300"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {socketStore.tasks.length === 0 ? (
                            <p className="p-3 text-gray-500">Нет активных задач</p>
                        ) : (
                            <ul>
                                {socketStore.tasks.map(task => (
                                    <li key={task.uuid} className="border-b border-gray-200 p-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium truncate">{task}</span>
                                            <button
                                                onClick={() => socketStore.removeTask(task)}
                                                className="text-gray-400 hover:text-red-500 text-xs"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{width: `${getProgress(task)}%`}}
                                            ></div>
                                        </div>
                                        <div className="text-right text-xs text-gray-500 mt-1">
                                            {getProgress(task)}%
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsVisible(true)}
                    className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700"
                    title="Показать задачи"
                >
                    <span className="text-lg font-bold">{socketStore.tasks.length}</span>
                </button>
            )}
        </div>
    );
});

export default TasksPopup;