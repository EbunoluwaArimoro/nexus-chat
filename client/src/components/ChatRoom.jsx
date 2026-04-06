import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const ChatRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomName, setRoomName] = useState('Loading...');
    const scrollRef = useRef();
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('username') || "User";

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoomName(res.data.name);
            } catch (err) { setRoomName("Channel"); }
        };
        fetchRoom();
        socket.emit('joinRoom', { roomId });
        socket.on('message', (message) => setMessages((prev) => [...prev, message]));
        return () => socket.off('message');
    }, [roomId, token]);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit('sendMessage', { roomId, sender: currentUser, text: input });
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <header className="h-20 border-b border-gray-100 flex items-center px-8 justify-between shrink-0 shadow-sm">
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
                    ← Channels
                </button>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight"># {roomName}</h2>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                    </span>
                </div>
                <div className="w-20"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-bold text-gray-400 mb-1 px-1 uppercase">{msg.sender}</span>
                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            msg.sender === currentUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                            {msg.text}
                            <div className={`text-[9px] mt-2 opacity-60 text-right font-medium`}>
                                {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <div className="p-6 border-top border-gray-100">
                <form className="max-w-5xl mx-auto flex items-center bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all" onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
                        placeholder={`Message in #${roomName}...`} 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={!input.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;