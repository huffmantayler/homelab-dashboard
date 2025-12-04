import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import ServerCard from '../components/ServerCard';
import LightControl from '../components/LightControl';
import { getSystems, type SystemStats } from '../lib/beszel';

const DashboardHome: React.FC = () => {
    const [systems, setSystems] = useState<SystemStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSystems();
                setSystems(data);
                setError(null);
            } catch (err) {
                setError('Failed to load system data. Please check your Beszel connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Poll every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && systems.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    System Overview
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Auto-refreshing every 5s
                </Typography>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Make sure VITE_BESZEL_URL is set in .env
                </Alert>
            )}

            {systems.length === 0 && !loading && !error ? (
                <Alert severity="info">No systems found in Beszel.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {systems.map((system) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={system.id}>
                            <ServerCard system={system} />
                        </Grid>
                    ))}
                    {/* Home Assistant Light Control */}
                    <Grid size={{ xs: 12, sm: 12, md: 8, lg: 6 }}>
                        <LightControl />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default DashboardHome;
