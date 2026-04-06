import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const ChatRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    // Application State
    const [activeView, setActiveView] = useState('chat'); // 'chat', 'board', 'files'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomDetails, setRoomDetails] = useState({ name: 'Loading...', description: '', category: '' });
    
    // Action Board State (Starts Empty)
    const [tasks, setTasks] = useState([]);
    const [newTaskInput, setNewTaskInput] = useState(''); // Declared ONLY ONCE here

    const scrollRef = useRef();
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('username') || "User";

    // Fetch Room Details AND Tasks
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Room Info
                const roomRes = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoomDetails(roomRes.data);

                // Fetch Tasks for this room
                const taskRes = await axios.get(`http://localhost:5000/api/tasks/${roomId}`);
                setTasks(taskRes.data);
            } catch (err) { console.error("Could not load room data", err); }
        };
        fetchData();
        
        socket.emit('joinRoom', { roomId });
        socket.on('message', (message) => setMessages((prev) => [...prev, message]));
        
        return () => socket.off('message');
    }, [roomId, token]);

    useEffect(() => { 
        if (activeView === 'chat') {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
        }
    }, [messages, activeView]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit('sendMessage', { roomId, sender: currentUser, text: input });
            
            if (input.toLowerCase().startsWith('@task ')) {
                const taskText = input.replace('@task ', '');
                // Add to DB instead of just local state
                axios.post('http://localhost:5000/api/tasks', { room: roomId, text: taskText, author: currentUser })
                     .then(res => setTasks([...tasks, res.data]))
                     .catch(err => console.log(err));
            }
            setInput('');
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskInput.trim()) {
            try {
                const res = await axios.post('http://localhost:5000/api/tasks', {
                    room: roomId,
                    text: newTaskInput,
                    author: currentUser
                });
                setTasks([...tasks, res.data]);
                setNewTaskInput('');
            } catch (err) { console.error("Error adding task"); }
        }
    };

    const toggleTask = async (id) => {
        try {
            // Note: MongoDB uses _id, so we check for both local 'id' and DB '_id'
            const taskId = id; 
            const res = await axios.put(`http://localhost:5000/api/tasks/${taskId}`);
            setTasks(tasks.map(t => (t._id === id || t.id === id) ? res.data : t));
        } catch (err) { console.error("Error updating task"); }
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            
            {/* =========================================
                LEFT SIDEBAR (Node Navigation)
                ========================================= */}
            <aside className="hidden md:flex w-64 bg-indigo-950 text-indigo-100 flex-col shadow-xl z-20 border-r border-indigo-900/50">
                
                {/* Back to Network */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="h-16 px-4 flex items-center gap-3 border-b border-white/10 hover:bg-white/5 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-white text-sm">Overview</span>
                        <span className="text-[10px] text-indigo-400 uppercase tracking-widest">Return to Dashboard</span>
                    </div>
                </button>

                {/* Specific Room Header */}
                <div className="p-5 border-b border-white/5 bg-indigo-900/20">
                    <h2 className="text-lg font-black text-white truncate tracking-tight"># {roomDetails.name}</h2>
                    <p className="text-xs text-indigo-300 mt-1 line-clamp-2">{roomDetails.description}</p>
                </div>

                {/* Sub-Room Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                    <button onClick={() => setActiveView('chat')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${activeView === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-white/5 hover:text-white'}`}>
                        <span className="text-lg opacity-70">💬</span> Chat Room
                    </button>
                    
                    <button onClick={() => setActiveView('board')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${activeView === 'board' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-white/5 hover:text-white'}`}>
                        <span className="text-lg opacity-70">📋</span> Action Board
                        {tasks.filter(t => !t.completed).length > 0 && (
                            <span className="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">{tasks.filter(t => !t.completed).length}</span>
                        )}
                    </button>

                    <button onClick={() => setActiveView('files')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${activeView === 'files' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-white/5 hover:text-white'}`}>
                        <span className="text-lg opacity-70">📁</span> Files
                    </button>
                </div>

                {/* Current User */}
                <div className="h-14 bg-indigo-950/80 flex items-center px-4 gap-3 border-t border-white/10">
                    <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold relative">
                        {currentUser.charAt(0).toUpperCase()}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-indigo-950 rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">{currentUser}</span>
                        <span className="text-[10px] text-indigo-400 mt-1">Online</span>
                    </div>
                </div>
            </aside>

            {/* =========================================
                CENTER: DYNAMIC MAIN VIEWPORT
                ========================================= */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative">
                
                {/* Header */}
                <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between shrink-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dashboard')} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                            {activeView === 'chat' && 'Blue Dawn Chat Room'}
                            {activeView === 'board' && 'Action Board'}
                            {activeView === 'files' && 'Files'}
                        </h2>
                    </div>
                </header>

                {/* VIEW 1: COMMUNICATIONS (CHAT) */}
                {activeView === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="mb-10 pb-6 border-b border-gray-100">
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to # {roomDetails.name}!</h1>
                                <p className="text-gray-500 text-sm">This is the start of the communications history. Try typing `@task Schedule meeting` to add an action item.</p>
                            </div>

                            <div className="space-y-1">
                                {messages.map((msg, index) => {
                                    const isBot = msg.sender === 'Nexus AI';
                                    return (
                                        <div key={index} className="flex gap-4 hover:bg-gray-50 px-2 py-3 -mx-2 rounded-lg transition-colors group">
                                            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg mt-0.5 ${isBot ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                                                {isBot ? '🤖' : msg.sender.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                    <span className="font-bold text-[15px] text-gray-900">{msg.sender}</span>
                                                    {isBot && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">APP</span>}
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 shrink-0">
                            <form className="flex items-end bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm" onSubmit={sendMessage}>
                                <input 
                                    type="text" 
                                    className="flex-1 max-h-32 bg-transparent py-3.5 px-4 outline-none text-[15px] text-gray-900"
                                    placeholder="Message network (Type @nexus for bot)..." 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <div className="p-2">
                                    <button type="submit" disabled={!input.trim()} className={`px-4 py-2 rounded-lg font-bold transition-colors ${input.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>Send</button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* VIEW 2: ACTION BOARD (TASKS) */}
                {activeView === 'board' && (
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleAddTask} className="mb-8 flex gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Create a new action item..." 
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium"
                                    value={newTaskInput}
                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                />
                                <button type="submit" disabled={!newTaskInput.trim()} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all">
                                    Add Task
                                </button>
                            </form>

                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {tasks.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 font-medium">No tasks logged.</div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {tasks.map(task => (
                                            <div key={task.id} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => toggleTask(task.id)}>
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-indigo-400'}`}>
                                                    {task.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-[15px] font-medium transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.text}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Logged by <span className="font-bold">{task.author}</span></p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 3: VAULT (FILES MOCKUP) */}
                {activeView === 'files' && (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">📁</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Vault</h3>
                        <p className="text-gray-500 max-w-md">File uploads and document management are scheduled for Phase 6 deployment. Check back soon.</p>
                    </div>
                )}
            </main>

            {/* =========================================
                RIGHT SIDEBAR (Discord-style Members List)
                ========================================= */}
            <aside className="hidden lg:flex w-64 bg-gray-50 flex-col border-l border-gray-200 z-10">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Personnel — 2</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* The Bot */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm relative">
                            🤖
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-50 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">Nexus AI</h4>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase">System Bot</p>
                        </div>
                    </div>

                    {/* The User */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold relative">
                            {currentUser.charAt(0).toUpperCase()}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-50 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{currentUser}</h4>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default ChatRoom;