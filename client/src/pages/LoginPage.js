// client/src/pages/LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom'; 
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
// NEW IMPORT
import RegistrationSelection from '../components/RegistrationSelection'; 

// --- THEME COLOR DEFINITIONS ---
const COLORS = {
    primary: '#4472C4',      // Blue
    background: '#1E1E1E',   // Dark background
    card: '#2C2C2C',         // Login card background
    text: '#F0F0F0',         // Light text
    inputBg: '#383838',      // Input field background
    error: '#ff6b6b',        // Error messages (Red)
};

// --- STYLED COMPONENTS ---

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: ${COLORS.background}; 
    color: ${COLORS.text};
`;

const LoginForm = styled.form`
    background: ${COLORS.card}; 
    padding: 40px;
    border-radius: 10px; 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); 
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    position: relative; /* CRITICAL: Allows RegistrationSelection to be positioned absolutely inside */
`;

const LoginHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 25px;
`;

const CollegeLogo = styled.img`
    height: 60px; 
    margin-bottom: 10px;
    border: 2px solid ${COLORS.primary};
    padding: 5px;
    border-radius: 8px;
`;

const CollegeName = styled.h1`
    font-size: 20px;
    color: ${COLORS.text};
    margin: 0;
    font-weight: 600;
    text-align: center;
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 25px;
    color: ${COLORS.primary};
`;

const InputGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 300; 
    color: ${COLORS.text};
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    background-color: ${COLORS.inputBg}; 
    border: 1px solid #4a4a4a; 
    border-radius: 5px;
    font-size: 16px;
    color: ${COLORS.text}; 
    transition: border-color 0.3s;

    &:focus {
        border-color: ${COLORS.primary};
        outline: none;
    }
`;

const Button = styled.button`
    background-color: ${COLORS.primary};
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    font-weight: 600;
    transition: background-color 0.3s;
    opacity: ${props => (props.disabled ? 0.7 : 1)};

    &:hover {
        background-color: ${props => (props.disabled ? COLORS.primary : '#33599a')};
    }
`;

const ErrorMessage = styled.p`
    color: ${COLORS.error};
    text-align: center;
    margin-top: 15px;
    font-weight: bold;
`;

// Link container styling (no change from your original)
const RegisterLinkText = styled.p`
    margin-top: 20px;
    font-size: 14px;
    text-align: center;
    color: ${COLORS.text};
`;

// NEW STYLED COMPONENT for the clickable word "Register"
const RegisterButton = styled.span`
    color: ${COLORS.primary};
    text-decoration: none;
    font-weight: 600;
    cursor: pointer; /* Indicate it's clickable */
    margin-left: 5px;

    &:hover {
        text-decoration: underline;
    }
`;
// --- END STYLED COMPONENTS ---

// --- COMPONENT LOGIC ---

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showRegistration, setShowRegistration] = useState(false); // NEW STATE FOR POPUP
    
    const { login, isLoggedIn, isLoading, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard'); 
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            return; 
        }
        await login(username, password);
    };

    return (
        <LoginContainer>
            <LoginForm onSubmit={handleSubmit}>
                {/* --- RENDER COLLEGE HEADER --- */}
                <LoginHeader>
                    <CollegeLogo src="/path/to/college_logo.png" alt="SBTC Logo" />
                    <CollegeName>Shalom Business and Technology College</CollegeName>
                </LoginHeader>
                <Title>LMS Login</Title>
                
                <InputGroup>
                    <Label htmlFor="username">Username (e.g., admin1)</Label>
                    <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </InputGroup>
                <InputGroup>
                    <Label htmlFor="password">Password (e.g., password123)</Label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </InputGroup>
                
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging In...' : 'Log In'}
                </Button>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                {/* UPDATED LINK SECTION */}
                <RegisterLinkText>
                    Don't have an account? 
                    <RegisterButton onClick={() => setShowRegistration(!showRegistration)}>
                        Register
                    </RegisterButton>
                </RegisterLinkText>

                <p style={{marginTop: '5px', fontSize: '12px', textAlign: 'center', color: '#999'}}>
                    Use the test credentials from the initial database setup.
                </p>

                {/* RENDER THE POPUP CONDITIONALLY */}
                {showRegistration && (
                    <RegistrationSelection onClose={() => setShowRegistration(false)} />
                )}
            </LoginForm>
        </LoginContainer>
    );
};

export default LoginPage;