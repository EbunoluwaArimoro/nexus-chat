import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. We MUST import useNavigate
import axios from 'axios';
import '../App.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // 2. We MUST initialize the hook here

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            
            // Save the token so the user stays logged in
            localStorage.setItem('token', res.data.token);
            
            // 3. SUCCESS! Instead of an alert, we move to the dashboard
            navigate('/dashboard'); 
            
        } catch (err) {
            // We only show an alert if something goes wrong
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