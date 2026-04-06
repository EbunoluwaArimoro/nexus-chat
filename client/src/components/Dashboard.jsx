import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Dashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms");
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName) return;
        try {
            await axios.post('http://localhost:5000/api/rooms/create', 
                { name: newRoomName, description: "A new collaboration space." }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewRoomName('');
            setShowCreateForm(false);
            fetchRooms();
        } catch (err) {
            alert("Room creation failed");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="dashboard-layout">
            {/* Left Sidebar */}
            <aside className="sidebar">
                <div className="workspace-name">
                    <span style={{color: '#818cf8'}}>●</span> Nexus Chat
                </div>
                
                <nav className="sidebar-nav">
                    <h3>Channels</h3>
                    <button 
                        className="create-room-btn" 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        + Create Channel
                    </button>
                    
                    {showCreateForm && (
                        <form onSubmit={handleCreateRoom} style={{marginBottom: '20px'}}>
                            <input 
                                className="modern-input"
                                style={{background: '#2e2a5b', color: 'white', border: 'none'}}
                                value={newRoomName} 
                                onChange={(e) => setNewRoomName(e.target.value)} 
                                placeholder="Channel name..." 
                            />
                            <button className="join-button" style={{width: '100%'}} type="submit">Confirm</button>
                        </form>
                    )}
                </nav>

                <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
            </aside>

            {/* Main Content Area */}
            <main className="main-viewport">
                <header className="viewport-header">
                    Welcome to the Lobby
                </header>

                <div className="content-body">
                    <div style={{marginBottom: '24px'}}>
                        <h2 style={{fontSize: '24px', marginBottom: '8px'}}>Explore Channels</h2>
                        <p style={{color: '#6b7280'}}>Join a space to start collaborating in real-time.</p>
                    </div>

                    <div className="room-grid">
                        {rooms.length > 0 ? (
                            rooms.map(room => (
                                <div key={room._id} className="room-card">
                                    <h4># {room.name}</h4>
                                    <p>{room.description || 'No description provided.'}</p>
                                    <button className="join-button">Join Channel</button>
                                </div>
                            ))
                        ) : (
                            <p style={{color: '#9ca3af', gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
                                No channels available. Create one to get started!
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;