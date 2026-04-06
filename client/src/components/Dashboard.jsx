import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [roomForm, setRoomForm] = useState({ name: '', description: '', logo: '💬' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || "User";

    const fetchRooms = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
        } catch (err) { console.error("Fetch error"); }
    }, [token]);

    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/rooms/create', roomForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoomForm({ name: '', description: '', logo: '💬' });
            setShowCreateForm(false);
            fetchRooms();
        } catch (err) { alert("Failed to create channel."); }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-indigo-950 text-white flex flex-col p-6">
                <div className="text-2xl font-bold mb-10 flex items-center gap-2">
                    <span className="text-indigo-400">●</span> Nexus
                </div>
                <nav className="flex-1 space-y-4">
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="w-full py-3 px-4 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
                    >
                        {showCreateForm ? "✕ Close Form" : "+ Create Channel"}
                    </button>
                </nav>
                <button 
                    onClick={() => { localStorage.clear(); navigate('/'); }}
                    className="mt-auto py-2 px-4 rounded-lg border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all text-sm font-bold"
                >
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center px-10 shadow-sm">
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
                        {username}'s Workspace
                    </h1>
                </header>

                <div className="p-10">
                    {showCreateForm ? (
                        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Channel</h3>
                            <p className="text-gray-500 mb-8">Launch a new communication node.</p>
                            <form onSubmit={handleCreateRoom} className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Name</label>
                                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                        onChange={(e) => setRoomForm({...roomForm, name: e.target.value})} required placeholder="engineering-team" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Description</label>
                                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                        onChange={(e) => setRoomForm({...roomForm, description: e.target.value})} placeholder="What is this for?" />
                                </div>
                                <button className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg" type="submit">Deploy Channel</button>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map(room => (
                                <div key={room._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                                    <div className="text-3xl mb-4">{room.logo || '💬'}</div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2"># {room.name}</h4>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{room.description}</p>
                                    <button onClick={() => navigate(`/chat/${room._id}`)} className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        Enter Workspace
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;