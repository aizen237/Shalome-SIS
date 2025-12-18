// client/src/context/AuthContext.js (FINAL, STABLE VERSION - Confirmed Correct)

import React, { createContext, useContext, useState, useEffect } from 'react'; 
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000'; 

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // Initialize state from sessionStorage 
    const [token, setToken] = useState(
        sessionStorage.getItem('token') || null
    );
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!sessionStorage.getItem('token')
    );
    const [role, setRole] = useState(
        sessionStorage.getItem('user_role') || null
    );
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem('user')) || null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    
    // --- CRITICAL FIX: AXIOS INTERCEPTOR SETUP ---
    useEffect(() => {
        axios.defaults.baseURL = API_URL;

        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const sessionToken = sessionStorage.getItem('token');
                if (sessionToken && !config.headers.Authorization) { 
                    config.headers.Authorization = `Bearer ${sessionToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []); 


    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/login`, { username, password });
            
            if (response.data.token) {
                const { token, user } = response.data;
                const userRole = user.role.toLowerCase();

                // 1. Update React State - Stores the entire object with profile data
                setIsLoggedIn(true);
                setRole(userRole);
                setUser(user);
                setToken(token); 

                // 2. Update Session Storage - Stores the entire object with profile data
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user_role', userRole);
                sessionStorage.setItem('user', JSON.stringify(user));

                return true; 
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.message || 'Login failed. Check server status or credentials.');
            return false; 
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Clear State and Session Storage
        setIsLoggedIn(false);
        setRole(null);
        setUser(null);
        setToken(null); 
        sessionStorage.clear();
    };

    const value = {
        isLoggedIn,
        role,
        user,
        token, 
        isLoading,
        error,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};