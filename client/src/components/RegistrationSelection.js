// client/src/components/RegistrationSelection.js

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// --- THEME COLOR DEFINITIONS (Copied from LoginPage for consistency) ---
const COLORS = {
    primary: '#4472C4',      // Blue
    card: '#2C2C2C',         // Login card background
    text: '#F0F0F0',         // Light text
};

// --- STYLED COMPONENTS FOR SELECTION POPUP ---

const SelectionContainer = styled.div`
    /* Position absolute relative to the LoginForm (which must be position: relative) */
    position: absolute; 
    bottom: -150px; /* Position it below the 'Register' link */
    left: 50%;
    transform: translateX(-50%); 
    
    background: ${COLORS.card};
    border: 1px solid ${COLORS.primary};
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8); /* Darker shadow for dark mode */
    z-index: 100;
    min-width: 160px;
    text-align: center;
`;

const SelectionButton = styled(Link)`
    display: block;
    padding: 10px 15px;
    margin: 5px 0;
    text-decoration: none;
    color: ${COLORS.text};
    background-color: ${COLORS.primary};
    border-radius: 4px;
    text-align: center;
    font-weight: 600;
    font-size: 0.9em;
    transition: background-color 0.2s;

    &:hover {
        background-color: #33599a;
    }
`;

const SelectionText = styled.p`
    margin: 0 0 10px; 
    color: ${COLORS.text};
    font-size: 0.85em;
    text-align: center;
    font-weight: 300;
`;

// --- COMPONENT ---

const RegistrationSelection = ({ onClose }) => {
    return (
        <SelectionContainer>
            <SelectionText>
                Register as:
            </SelectionText>
            <SelectionButton to="/register/student" onClick={onClose}>
                Student
            </SelectionButton>
            <SelectionButton to="/register/teacher" onClick={onClose}>
                Teacher
            </SelectionButton>
        </SelectionContainer>
    );
};

export default RegistrationSelection;