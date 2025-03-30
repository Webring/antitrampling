import React, { useState, useEffect } from "react";
import { Button, Input, Card } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";

const WebSocketConsole = ({ socket, visible, setVisible }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            setMessages((prev) => [...prev, { type: "received", text: event.data }]);
        };

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    const sendMessage = () => {
        if (input.trim() && socket) {
            socket.send(input);
            setMessages((prev) => [...prev, { type: "sent", text: input }]);
            setInput("");
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <Card
                title="Отладочная консоль"
                extra={<CloseOutlined onClick={() => setVisible(false)} className="cursor-pointer" />}
                className="w-96 bg-white shadow-lg rounded-xl p-1 max-h-[80vh] overflow-hidden"
            >
                <div className="h-64 overflow-y-auto p-2 rounded bg-gray-100">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 my-1 rounded ${msg.type === "sent" ? "bg-blue-200 text-right" : "bg-gray-200"}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                        placeholder="Введите сообщение"
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} className="ml-2" />
                </div>
            </Card>
        </div>
    );
};

export default WebSocketConsole;