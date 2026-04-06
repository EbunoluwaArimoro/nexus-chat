import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Importing our new styles

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            alert('Login Successful! (Redirect coming in Phase 3)');
        } catch (err) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome to Nexus Chat</h2>
                    <p>Enter your credentials to access the workspace.</p>
                </div>
                
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="auth-input" 
                            placeholder="Username" 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            className="auth-input" 
                            placeholder="Password" 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-button">Sign In</button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create one now</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;