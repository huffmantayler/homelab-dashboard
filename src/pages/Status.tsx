import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Chip, Tooltip, Grid } from '@mui/material';
import { uptimeKuma, type Monitor, type Heartbeat, type Uptime } from '../lib/uptimeKuma';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Pending as PendingIcon,
    Construction as ConstructionIcon
} from '@mui/icons-material';

const Status: React.FC = () => {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [lastHeartbeats, setLastHeartbeats] = useState<{ [id: number]: Heartbeat }>({});
    const [activeUptimes, setActiveUptimes] = useState<{ [id: number]: Uptime }>({});

    useEffect(() => {
        const unsubscribe = uptimeKuma.subscribe(
            (monitorList) => {
                setMonitors(monitorList);
                setLoading(false);
            },
            (heartbeat) => {
                setLastHeartbeats(prev => ({
                    ...prev,
                    [heartbeat.monitorID]: heartbeat
                }));
            },
            (uptime) => {
                if (uptime.period === 24) {
                    setActiveUptimes(prev => ({
                        ...prev,
                        [uptime.monitorID]: uptime
                    }));
                }
            },
            () => setConnected(true),
            () => setConnected(false)
        );

        return () => {
            unsubscribe();
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
            default: return `Unknown (${status})`;
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
                        const uptime = activeUptimes[monitor.id];
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
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
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

                                        {/* Tags */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            <Chip
                                                label={monitor.type}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.7rem', opacity: 0.7 }}
                                            />
                                            {monitor.tags?.map(tag => (
                                                <Chip
                                                    key={tag.id}
                                                    label={tag.name}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        backgroundColor: tag.color,
                                                        color: '#fff', // Assuming mostly dark tag colors, or we could calculate contrast
                                                        textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
                                                    }}
                                                />
                                            ))}
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Tooltip title={`Response Time (Last Checked: ${heartbeat?.time || 'Unknown'})`}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <span role="img" aria-label="ping">📶</span>
                                                        {ping ? `${ping}ms` : '--'}
                                                    </Typography>
                                                </Tooltip>

                                                <Tooltip title="24-Hour Uptime">
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <span role="img" aria-label="uptime">⏱️</span>
                                                        {uptime ? `${(uptime.percent * 100).toFixed(2)}%` : '--'}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>

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
