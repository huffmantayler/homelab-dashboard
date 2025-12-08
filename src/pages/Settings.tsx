import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, useTheme as useMuiTheme } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../theme';

const Settings: React.FC = () => {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const muiTheme = useMuiTheme();

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Settings
            </Typography>

            <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Appearance
                </Typography>
                <Grid container spacing={4}>
                    {availableThemes.map((themeKey) => {
                        const theme = themes[themeKey];
                        const isActive = currentTheme === themeKey;
                        const primaryColor = theme.palette.primary.main;
                        const backgroundColor = theme.palette.background.default;
                        const paperColor = theme.palette.background.paper;

                        return (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={themeKey}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: isActive ? `2px solid ${muiTheme.palette.primary.main}` : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => setTheme(themeKey)}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        <Box sx={{ height: 120, bgcolor: backgroundColor, position: 'relative', p: 2 }}>
                                            {/* Preview UI Elements */}
                                            <Box sx={{
                                                width: '100%',
                                                height: 20,
                                                bgcolor: paperColor,
                                                mb: 1,
                                                borderRadius: 0.5
                                            }} />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Box sx={{ width: 40, height: 40, bgcolor: primaryColor, borderRadius: '50%' }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ width: '60%', height: 10, bgcolor: 'text.primary', opacity: 0.3, mb: 1, borderRadius: 0.5 }} />
                                                    <Box sx={{ width: '40%', height: 10, bgcolor: 'text.primary', opacity: 0.3, borderRadius: 0.5 }} />
                                                </Box>
                                            </Box>

                                            {isActive && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    px: 1,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ACTIVE
                                                </Box>
                                            )}
                                        </Box>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                                {themeKey}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
};

export default Settings;
