import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [roomForm, setRoomForm] = useState({ name: '', description: '', category: 'General' });
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
            setRoomForm({ name: '', description: '', category: 'General' });
            setShowCreateForm(false);
            fetchRooms();
        } catch (err) { alert("Failed to create channel."); }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {/* =========================================
                REDESIGNED ENTERPRISE SIDEBAR
                ========================================= */}
            <aside className="hidden md:flex w-72 bg-indigo-950 text-indigo-100 flex-col shadow-2xl z-10 border-r border-indigo-900/50">
                
                {/* 1. Branding & User Profile */}
                <div className="p-6 border-b border-white/10 bg-indigo-950/50">
                    <div className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm">N</span>
                        </div>
                        Nexus Engine
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-800 border border-indigo-500/50 flex items-center justify-center text-white font-bold shadow-inner">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white leading-tight truncate w-36">{username}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">System Admin</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Scrollable Area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    
                    {/* 2. Main Navigation Menu */}
                    <div>
                        <h4 className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-3 px-2">Navigation</h4>
                        <div className="space-y-1">
                            <button 
                                onClick={() => setShowCreateForm(false)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${!showCreateForm ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/5 text-indigo-300 hover:text-white'}`}
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                Overview
                            </button>
                            <button 
                                onClick={() => setShowCreateForm(true)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${showCreateForm ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/5 text-indigo-300 hover:text-white'}`}
                            >
                                <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Create Channel
                            </button>
                        </div>
                    </div>

                    {/* 3. Quick Access Channels List */}
                    <div>
                        <div className="flex justify-between items-center px-2 mb-3">
                            <h4 className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Active Channels</h4>
                            <span className="bg-indigo-800/50 text-indigo-300 py-0.5 px-2 rounded-full text-[10px] font-bold border border-indigo-700/50">{rooms.length}</span>
                        </div>
                        <div className="space-y-0.5">
                            {rooms.length === 0 ? (
                                <p className="text-xs text-indigo-400/50 px-2 italic">No networks active.</p>
                            ) : (
                                rooms.map(room => (
                                    <button
                                        key={room._id}
                                        onClick={() => navigate(`/chat/${room._id}`)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm group text-left"
                                    >
                                        <span className="text-indigo-500 group-hover:text-indigo-400 font-bold opacity-70">#</span>
                                        <span className="truncate flex-1 text-indigo-200 group-hover:text-white font-medium">{room.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Footer Signout Button */}
                <div className="p-4 border-t border-white/10 bg-indigo-950/50">
                    <button 
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white/5 hover:bg-red-500 text-indigo-300 hover:text-white transition-all text-sm font-bold border border-transparent hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Signout
                    </button>
                </div>
            </aside>


            {/* =========================================
                MAIN VIEWPORT (Right Side)
                ========================================= */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)] sticky top-0 z-10">
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3">
                        {username}'s Workspace
                    </h1>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {showCreateForm ? 'Node Setup' : 'Network Overview'}
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto w-full">
                    {showCreateForm ? (
                        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Channel</h3>
                            <p className="text-gray-500 mb-8 text-sm">Launch a new communication node for your team.</p>
                            <form onSubmit={handleCreateRoom} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2 tracking-wider">Node Name</label>
                                    <input className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" 
                                        onChange={(e) => setRoomForm({...roomForm, name: e.target.value})} required placeholder="e.g. engineering-team" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2 tracking-wider">System Description</label>
                                    <input className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium" 
                                        onChange={(e) => setRoomForm({...roomForm, description: e.target.value})} placeholder="What is the purpose of this node?" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 block mb-2 tracking-wider">Classification</label>
                                    <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-gray-700 cursor-pointer" 
                                        onChange={(e) => setRoomForm({...roomForm, category: e.target.value})}>
                                        <option value="General">General Operations</option>
                                        <option value="Engineering">Engineering & Dev</option>
                                        <option value="Marketing">Marketing & Growth</option>
                                    </select>
                                </div>
                                <button className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]" type="submit">
                                    Create Channel
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map(room => (
                                <div key={room._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer" onClick={() => navigate(`/chat/${room._id}`)}>
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-white text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                                            {room.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 leading-tight"># {room.name}</h4>
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{room.category}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2 leading-relaxed">{room.description}</p>
                                    <button className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 text-sm">
                                        Enter Workspace →
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