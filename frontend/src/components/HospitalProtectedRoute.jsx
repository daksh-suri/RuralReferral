import React from 'react';
import { Navigate } from 'react-router-dom';

const HospitalProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('hospitalToken');

    if (!token) {
        return <Navigate to="/hospital/login" replace />;
    }

    return children;
};

export default HospitalProtectedRoute;
