import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

const Login: React.FC = () => {
    const auth = useAuth();

    if (auth.isAuthenticated) {
        // If already authenticated, redirect to root (which will be handled by router)
        window.location.href = '/';
        return null;
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 2
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Home Dashboard
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                        Please sign in to access your dashboard.
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={() => auth.signinRedirect()}
                        sx={{ mt: 1, mb: 2 }}
                    >
                        Sign in with Authentik
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
