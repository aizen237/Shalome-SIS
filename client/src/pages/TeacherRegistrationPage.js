// client/src/pages/TeacherRegistrationPage.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
// NOTE: This file reuses the styled components and theme from StudentRegistrationPage.js

// --- THEME COLOR DEFINITIONS (Copied for independent use) ---
const COLORS = {
    primary: '#4472C4',      
    background: '#1E1E1E',   
    card: '#2C2C2C',         
    text: '#F0F0F0',         
    inputBg: '#383838',      
    error: '#ff6b6b',        
};

// --- REUSED STYLED COMPONENTS ---

const RegistrationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: ${COLORS.background}; 
    color: ${COLORS.text};
`;

const RegistrationFormWrapper = styled.div`
    background: ${COLORS.card}; 
    padding: 40px;
    border-radius: 10px; 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); 
    width: 100%;
    max-width: 450px; 
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const FormHeader = styled.h2`
    color: ${COLORS.primary};
    margin-bottom: 25px;
    font-size: 1.8em;
    display: flex;
    align-items: center;
    & i {
        margin-right: 10px;
    }
`;

const StyledForm = styled.form`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const InputGroup = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Icon = styled.i`
    position: absolute;
    left: 15px;
    color: ${COLORS.text};
    z-index: 1;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 12px 12px 40px; /* Adjust padding for icon */
    background-color: ${COLORS.inputBg};
    border: 1px solid #4a4a4a;
    border-radius: 5px;
    color: ${COLORS.text};
    font-size: 16px;
    transition: border-color 0.2s;
    &:focus {
        border-color: ${COLORS.primary};
        outline: none;
    }
`;

const Button = styled.button`
    padding: 12px;
    background-color: ${COLORS.primary};
    color: ${COLORS.text};
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    margin-top: 10px;
    transition: background-color 0.2s;
    &:hover:not(:disabled) {
        background-color: #355aa8;
    }
    &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    color: ${COLORS.error};
    font-size: 0.9em;
    text-align: center;
    margin-top: 10px;
`;

const SuccessMessage = styled.p`
    color: #28a745; 
    font-size: 0.9em;
    text-align: center;
    margin-top: 10px;
`;

const FormFooter = styled.p`
    margin-top: 25px;
    font-size: 0.9em;
    color: ${COLORS.text};
    & a {
        color: ${COLORS.primary};
        text-decoration: none;
        font-weight: 600;
        margin-left: 5px;
    }
`;

// --- TEACHER REGISTRATION COMPONENT ---
const TeacherRegistrationPage = () => {
    const navigate = useNavigate();
    const [teacherId, setTeacherId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            // API Endpoint: /register/teacher
            await axios.post('/register/teacher', { teacherId, password });
            
            setMessage('Account successfully activated! Redirecting to login...');
            
            // Redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Teacher Registration Error:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Activation failed. Check your ID number or contact Admin.');
        }
    };

    return (
        <RegistrationContainer>
            <RegistrationFormWrapper>
                <FormHeader><i className="fas fa-chalkboard-teacher"></i> Teacher Account Activation</FormHeader>
                <p style={{textAlign: 'center', marginBottom: '15px'}}>Enter your unique Teacher ID and set your password to activate your account.</p>

                <StyledForm onSubmit={handleSubmit}>
                    <InputGroup>
                        <Icon className="fas fa-id-card-alt" />
                        <Input
                            type="text"
                            placeholder="Teacher ID Number"
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value.toUpperCase())}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Icon className="fas fa-lock" />
                        <Input
                            type="password"
                            placeholder="Set Password (min 8 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </InputGroup>
                    <InputGroup>
                        <Icon className="fas fa-lock" />
                        <Input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </InputGroup>

                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {message && <SuccessMessage>{message}</SuccessMessage>}

                    <Button type="submit">Activate Account</Button>
                </StyledForm>

                <FormFooter>
                    Already have an account? <Link to="/login">Log in here</Link>
                </FormFooter>
            </RegistrationFormWrapper>
        </RegistrationContainer>
    );
};

export default TeacherRegistrationPage;