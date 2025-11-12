import React, { useEffect, useState } from 'react'
import { socket } from '../../sockets/socketManager'
import '../../styles/home-styles.css'

interface Message {
    text: string;
    isOwn: boolean;
    username: string;
    timestamp: Date;
}

const Home: React.FC = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [username, setUsername] = useState("");

    const sendMessage = () => {
        if (message.trim() === "") return;

        const newMessage: Message = {
            text: message,
            isOwn: true,
            username: "Tú",
            timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);

        // Enviar mensaje con información del usuario
        socket.emit("send_message", {
            message,
            username: username,
            timestamp: new Date()
        });

        setMessage("");
    };

    useEffect(() => {
        // Generar un nombre de usuario único
        const userId = Math.random().toString(36).substring(2, 15);
        const generatedUsername = `Usuario_${userId}`;
        setUsername(generatedUsername);

        // Conectar al servidor
        socket.emit("newUser", userId);

        socket.on("receive_message", (data) => {
            const receivedMessage: Message = {
                text: data.message,
                isOwn: false,
                username: data.username || 'Usuario Anónimo',
                timestamp: new Date(data.timestamp || Date.now())
            };
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });

        return () => {
            socket.off("receive_message");
            socket.off("newUser");
        };
    }, []);

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className='chat-container'>
            <div className='chat-header'>
                <h1 className='title'>EISC Meet - Chat</h1>
                <span className='username'>Conectado como: {username}</span>
            </div>

            <div className='chat-messages'>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.isOwn ? 'own-bubble' : 'other-bubble'}`}>

                        <div className="user-name">{msg.username}</div>

                        <div className="bubble-content">
                            <span className="bubble-text">{msg.text}</span>
                            <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    </div>
                ))}
            </div>


            <div className='chat-input-container'>
                <input
                    className='message-input'
                    type="text"
                    value={message}
                    placeholder='mensaje'
                    onChange={(event) => {
                        setMessage(event.target.value)
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    }}
                />

                <button
                    className='send-button'
                    onClick={sendMessage}
                >
                    Enviar
                </button>
            </div>
        </div >
    )
}

export default Home