import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import {
    Storage as StorageIcon,
    Memory as MemoryIcon,
    Speed as SpeedIcon,
    Dns as DnsIcon,
} from '@mui/icons-material';
import type { SystemStats } from '../lib/beszel';

interface ServerCardProps {
    system: SystemStats;
}

const MetricRow = ({ icon, label, value, progress, color }: any) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ color: color, mr: 1.5, display: 'flex' }}>{icon}</Box>
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                    {value}
                </Typography>
            </Box>
            {progress !== undefined && (
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={color === 'error.main' ? 'error' : 'primary'}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}
                />
            )}
        </Box>
    </Box>
);

const ServerCard: React.FC<ServerCardProps> = ({ system }) => {
    const isOnline = system.status === 'up';

    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DnsIcon color="primary" />
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {system.name}
                        </Typography>
                    </Box>
                    <Chip
                        label={isOnline ? 'ONLINE' : 'OFFLINE'}
                        color={isOnline ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <MetricRow
                    icon={<SpeedIcon fontSize="small" />}
                    label="CPU"
                    value={`${system.cpu.toFixed(1)}%`}
                    progress={system.cpu}
                    color="primary.main"
                />

                <MetricRow
                    icon={<MemoryIcon fontSize="small" />}
                    label="Memory"
                    value={`${system.memory.toFixed(1)}%`}
                    progress={system.memory}
                    color="secondary.main"
                />

                <MetricRow
                    icon={<StorageIcon fontSize="small" />}
                    label="Disk"
                    value={`${system.disk.toFixed(1)}%`}
                    progress={system.disk}
                    color="warning.main"
                />
            </CardContent>
        </Card>
    );
};

export default ServerCard;
