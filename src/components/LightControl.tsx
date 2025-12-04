import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Switch,
    CircularProgress,
    Alert,
    Box,
    Grid
} from '@mui/material';
import { Lightbulb as LightbulbIcon } from '@mui/icons-material';
import { getHassStates, toggleLight, type HassEntity } from '../lib/homeassistant';

const LightControl: React.FC = () => {
    // Component to control smart lights
    const [lights, setLights] = useState<HassEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLights = async () => {
        const states = await getHassStates();
        if (states.length > 0) {
            // Filter for entities that start with 'light.'
            const lightEntities = states.filter(entity =>
                entity.entity_id.startsWith('light.') &&
                !entity.attributes.hidden
            );
            setLights(lightEntities);
            setError(null);
        } else {
            // Only set error if we haven't loaded any lights yet
            if (lights.length === 0) {
                setError('Failed to load lights. Check VITE_HA_URL and VITE_HA_TOKEN.');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLights();
        // Poll every 5 seconds to keep states in sync
        const interval = setInterval(fetchLights, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggle = async (entityId: string, currentState: string) => {
        const newState = currentState === 'on' ? false : true;

        // Optimistic update
        setLights(prev => prev.map(light =>
            light.entity_id === entityId
                ? { ...light, state: newState ? 'on' : 'off' }
                : light
        ));

        const success = await toggleLight(entityId, newState);

        if (!success) {
            // Revert if failed
            fetchLights();
        }
    };

    if (loading && lights.length === 0) {
        return (
            <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <LightbulbIcon color="warning" />
                    <Typography variant="h6" component="div">
                        Smart Lights
                    </Typography>
                </Box>

                {error && lights.length === 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ maxHeight: 300, overflow: 'auto', pr: 1 }}>
                    <Grid container spacing={2}>
                        {lights.map((light) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={light.entity_id}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                    height: '100%'
                                }}>
                                    <Box sx={{ overflow: 'hidden', mr: 1 }}>
                                        <Typography variant="body1" noWrap>
                                            {light.attributes.friendly_name || light.entity_id}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {light.state === 'on' && light.attributes.brightness
                                                ? `${Math.round((light.attributes.brightness / 255) * 100)}%`
                                                : light.state.toUpperCase()}
                                        </Typography>
                                    </Box>
                                    <Switch
                                        edge="end"
                                        onChange={() => handleToggle(light.entity_id, light.state)}
                                        checked={light.state === 'on'}
                                        color="warning"
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    {lights.length === 0 && !error && (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No lights found.
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default LightControl;
