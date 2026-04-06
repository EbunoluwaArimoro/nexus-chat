import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://nexus-chat-backend-50v0.onrender.com/api/auth/register', { username, password });
            alert('Account created successfully!');
            navigate('/');
        } catch (err) {
            alert('Registration failed. Username might already exist.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Get Started</h2>
                    <p className="mt-2 text-sm text-gray-500">Create your Nexus profile</p>
                </div>
                <form className="space-y-6" onSubmit={handleRegister}>
                    <input 
                        type="text" 
                        placeholder="Choose Username" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        onChange={e => setUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Choose Password" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                    <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transform active:scale-95 transition-all">
                        Create Account
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/" className="font-bold text-indigo-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;