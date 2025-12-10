import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Card, CardContent, CircularProgress, Alert, Chip } from '@mui/material';
import {
    Block as BlockIcon,
    Public as PublicIcon,
    Devices as DevicesIcon,
    Dns as DnsIcon,
} from '@mui/icons-material';
import HistoryChart from '../components/HistoryChart';
import { getPiholeStats, getPiholeHistory, type PiholeStats } from '../lib/pihole';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtext }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {value}
                    </Typography>
                    {subtext && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {subtext}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ color: color, p: 1, borderRadius: 1, bgcolor: `${color}22` }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const Security: React.FC = () => {
    const [stats, setStats] = useState<PiholeStats | null>(null);
    const [history, setHistory] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [statsData, historyData] = await Promise.all([
                getPiholeStats(),
                getPiholeHistory()
            ]);

            if (statsData) {
                setStats(statsData);
                setError(null);
            } else {
                setError('Failed to load Pi-hole stats. Check VITE_PIHOLE_URL in .env');
            }

            if (historyData && historyData.history) {
                // Map the history array from the API response
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setHistory((historyData.history as any[]).map((item: any) => ({
                    time: item.timestamp,
                    queries: item.total,
                    blocked: item.blocked,
                    cached: item.cached,
                    forwarded: item.forwarded
                })));
            }

            setLoading(false);
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s as requested
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Network Security
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Powered by Pi-hole
                        </Typography>
                        {stats && (
                            <Chip
                                label="ACTIVE"
                                color="success"
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>
            </Box>

            {error && !stats && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {stats && (
                <>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="TOTAL QUERIES"
                                value={stats.queries.total.toLocaleString()}
                                icon={<DnsIcon />}
                                color="info.main"
                                subtext="Queries today"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="BLOCKED"
                                value={stats.queries.blocked.toLocaleString()}
                                icon={<BlockIcon />}
                                color="error.main"
                                subtext={`${stats.queries.percent_blocked.toFixed(1)}% of total traffic`}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="DOMAINS ON BLOCKLIST"
                                value={stats.gravity.domains_being_blocked.toLocaleString()}
                                icon={<PublicIcon />}
                                color="success.main"
                                subtext="Known ad/malware domains"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="CLIENTS"
                                value={stats.clients.active.toLocaleString()}
                                icon={<DevicesIcon />}
                                color="warning.main"
                                subtext={`Active / ${stats.clients.total} Total`}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <HistoryChart
                                title="Queries over last 24 hours"
                                data={history}
                                dataKey="queries"
                                color="#2196f3"
                            />
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default Security;
