import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Chip, Tooltip, Grid } from '@mui/material';
import { uptimeKuma, type Monitor, type Heartbeat } from '../lib/uptimeKuma';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import ConstructionIcon from '@mui/icons-material/Construction';

const Status: React.FC = () => {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [lastHeartbeats, setLastHeartbeats] = useState<{ [id: number]: Heartbeat }>({});

    useEffect(() => {
        uptimeKuma.connect(
            (monitorList) => {
                setMonitors(monitorList);
                setLoading(false);
                setConnected(true);
            },
            (heartbeat) => {
                setLastHeartbeats(prev => ({
                    ...prev,
                    [heartbeat.monitorID]: heartbeat
                }));
            }
        );

        return () => {
            uptimeKuma.disconnect();
        };
    }, []);

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return 'success'; // Up
            case 0: return 'error';   // Down
            case 2: return 'warning'; // Pending
            case 3: return 'info';    // Maintenance
            default: return 'default';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1: return 'Up';
            case 0: return 'Down';
            case 2: return 'Pending';
            case 3: return 'Maintenance';
            default: return 'Unknown';
        }
    };

    const getStatusIcon = (status: number) => {
        switch (status) {
            case 1: return <CheckCircleIcon fontSize="small" />;
            case 0: return <ErrorIcon fontSize="small" />;
            case 2: return <PendingIcon fontSize="small" />;
            case 3: return <ConstructionIcon fontSize="small" />;
            default: return undefined;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Sort monitors by status (down first) then name
    const sortedMonitors = [...monitors].sort((a, b) => {
        // Effective status (use heartbeat if available, else monitor status)
        const activeA = lastHeartbeats[a.id]?.status ?? a.status;
        const activeB = lastHeartbeats[b.id]?.status ?? b.status;

        // Push "Down" (0) to top
        if (activeA === 0 && activeB !== 0) return -1;
        if (activeA !== 0 && activeB === 0) return 1;

        return a.name.localeCompare(b.name);
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    System Status
                </Typography>
                {!connected && (
                    <Chip label="Disconnected" color="error" variant="outlined" />
                )}
            </Box>

            {monitors.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No monitors found via Uptime Kuma.
                </Alert>
            ) : (
                <Grid container spacing={2}>
                    {sortedMonitors.map((monitor) => {
                        const heartbeat = lastHeartbeats[monitor.id];
                        const currentStatus = heartbeat?.status ?? monitor.status;
                        const ping = heartbeat?.ping ?? monitor.ping;

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={monitor.id}>
                                <Card sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }} title={monitor.name}>
                                                {monitor.name}
                                            </Typography>
                                            <Chip
                                                icon={getStatusIcon(currentStatus)}
                                                label={getStatusLabel(currentStatus)}
                                                color={getStatusColor(currentStatus)}
                                                size="small"
                                                variant={currentStatus === 1 ? 'outlined' : 'filled'}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Tooltip title={`Last Checked: ${heartbeat?.time || 'Unknown'}`}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {ping ? `${ping}ms` : '--'}
                                                </Typography>
                                            </Tooltip>

                                            {monitor.url && (
                                                <Typography
                                                    variant="caption"
                                                    component="a"
                                                    href={monitor.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        textDecoration: 'none',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                >
                                                    Visit
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default Status;
