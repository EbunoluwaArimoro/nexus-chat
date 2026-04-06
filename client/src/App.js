import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import ChatRoom from './components/ChatRoom'; // <-- ADD THIS LINE

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat/:roomId" element={<ChatRoom />} /> {/* Ensure this line is here */}
            </Routes>
        </Router>
    );
}

export default App;