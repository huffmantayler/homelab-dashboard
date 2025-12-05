import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
            auth.signinRedirect();
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.signinRedirect, auth.error]);

    if (auth.isLoading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Authenticating...
                </Typography>
            </Box>
        );
    }

    if (auth.error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">Authentication Error: {auth.error.message}</Typography>
            </Box>
        );
    }

    if (auth.isAuthenticated) {
        return <>{children}</>;
    }

    // While redirecting or waiting
    return null;
};

export default ProtectedRoute;
