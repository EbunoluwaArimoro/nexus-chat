import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Importing our new styles

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password });
            alert('Account created successfully! You can now log in.');
            navigate('/'); // This will smoothly redirect to the login page
        } catch (err) {
            alert('Registration failed. Username might already exist.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create an Account</h2>
                    <p>Join Nexus Chat to start collaborating.</p>
                </div>
                
                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="auth-input" 
                            placeholder="Choose a Username" 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            className="auth-input" 
                            placeholder="Choose a Password" 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/">Sign in here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;