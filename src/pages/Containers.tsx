import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Chip } from '@mui/material';
import { useData } from '../contexts/DataContext';
import type { ContainerStats } from '../lib/beszel';

const Containers: React.FC = () => {
    const { containers, systems, loading } = useData();

    // Handle hash scrolling after data load
    useEffect(() => {
        if (!loading && containers.length > 0 && window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading, containers, window.location.hash]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Create a map of system ID to system Name
    const systemMap = new Map(systems.map(s => [s.id, s.name]));

    // Group containers by systemId
    const groupedContainers: Record<string, ContainerStats[]> = {};
    containers.forEach(container => {
        const sysId = container.systemId || 'unknown';
        if (!groupedContainers[sysId]) {
            groupedContainers[sysId] = [];
        }
        groupedContainers[sysId].push(container);
    });

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Containers
            </Typography>

            {Object.keys(groupedContainers).length === 0 ? (
                <Alert severity="info">No containers found.</Alert>
            ) : (
                Object.entries(groupedContainers).map(([systemId, systemContainers]) => {
                    const systemName = systemMap.get(systemId) || 'Unknown System';

                    return (
                        <Box key={systemId} id={systemId} sx={{ mb: 5, scrollMarginTop: '80px' }}>
                            <Typography variant="h5" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                                {systemName}
                            </Typography>
                            <Grid container spacing={3}>
                                {systemContainers.map((container) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={container.id}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" noWrap title={container.name}>
                                                        {container.name}
                                                    </Typography>
                                                    <Chip
                                                        label={container.status}
                                                        color={container.status === 'running' ? 'success' : 'default'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="textSecondary" noWrap title={container.image} sx={{ mb: 2 }}>
                                                    {container.image}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        CPU: {container.cpu.toFixed(1)}%
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Mem: {container.memory.toFixed(1)} MB
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    );
                })
            )}
        </Box>
    );
};

export default Containers;
