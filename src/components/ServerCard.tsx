import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    Storage as StorageIcon,
    Memory as MemoryIcon,
    Speed as SpeedIcon,
    Dns as DnsIcon,
    Apps as AppsIcon
} from '@mui/icons-material';
import type { SystemStats } from '../lib/beszel';

interface MetricRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    progress?: number;
    color?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({ icon, label, value, progress, color = 'primary.main' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: 'text.secondary', mr: 2, display: 'flex' }}>
            {icon}
        </Box>
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
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: color
                        }
                    }}
                />
            )}
        </Box>
    </Box>
);

interface ServerCardProps {
    system: SystemStats;
}

const ServerCard: React.FC<ServerCardProps> = ({ system }) => {
    const isOnline = system.status === 'up';

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DnsIcon color="primary" />
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {system.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            size="small"
                            component={Link}
                            to={`/containers#${system.id}`}
                            title="View Containers"
                        >
                            <AppsIcon fontSize="small" />
                        </IconButton>
                        <Chip
                            label={isOnline ? 'ONLINE' : 'OFFLINE'}
                            color={isOnline ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
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
