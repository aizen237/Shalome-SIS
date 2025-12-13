// client/src/pages/StudentRegistrationPage.js (Styled & Functional)

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// --- THEME COLOR DEFINITIONS (Copied from LoginPage.js for consistency) ---
const COLORS = {
    primary: '#4472C4',      
    background: '#1E1E1E',   
    card: '#2C2C2C',         
    text: '#F0F0F0',         
    inputBg: '#383838',      
    error: '#ff6b6b',        
};

// --- REUSED/NEW STYLED COMPONENTS ---

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
`;

const FormHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 25px;
    text-align: center;
`;

const CollegeLogo = styled.img`
    height: 60px; 
    margin-bottom: 10px;
    border: 2px solid ${COLORS.primary};
    padding: 5px;
    border-radius: 8px;
`;

const FormTitle = styled.h1`
    font-size: 24px;
    color: ${COLORS.primary};
    margin: 10px 0 5px;
`;

const FormSubtitle = styled.p`
    font-size: 14px;
    color: ${COLORS.text};
    margin-top: 0;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
`;

const InputGroup = styled.div`
    margin-bottom: 15px;
    position: relative;
    display: flex;
    align-items: center;
`;

// Icon styling (assuming Font Awesome classes like fas fa-id-card are used in index.html)
const Icon = styled.i`
    position: absolute;
    left: 12px;
    color: ${COLORS.text};
    font-size: 16px;
    z-index: 10;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 12px 12px 40px; 
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
    &::placeholder {
        color: ${COLORS.text}; 
        opacity: 0.6;
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
    margin-top: 10px;
    transition: background-color 0.3s;
`;

const ErrorMessage = styled.p`
    color: ${COLORS.error};
    text-align: center;
    margin-top: 15px;
    font-weight: bold;
`;

const SuccessMessage = styled.p`
    color: #4CAF50; 
    text-align: center;
    margin-top: 15px;
    font-weight: bold;
`;

const FormFooter = styled.p`
    margin-top: 20px;
    font-size: 14px;
    text-align: center;
    color: ${COLORS.text};

    a {
        color: ${COLORS.primary};
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
`;

// --- COMPONENT LOGIC ---

const StudentRegistrationPage = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegistration = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            // Note: Axios baseURL must be set in AuthContext for this to work
            const response = await axios.post('/api/register/student', { 
                studentId, 
                password 
            });

            setMessage(response.data.message + " Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Network error occurred. Check server is running.';
            setError(errorMessage);
        }
    };

    return (
        <RegistrationContainer>
            <RegistrationFormWrapper>
                <FormHeader>
                    <CollegeLogo src="/path/to/college_logo.png" alt="SBTC Logo" /> 
                    <FormTitle>Student Account Activation</FormTitle>
                    <FormSubtitle>Enter your assigned Student ID to activate your account.</FormSubtitle>
                </FormHeader>

                <StyledForm onSubmit={handleRegistration}>
                    <InputGroup>
                        <Icon className="fas fa-id-card" />
                        <Input
                            type="text"
                            placeholder="Student ID Number (e.g., SBTC001)"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
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

export default StudentRegistrationPage;