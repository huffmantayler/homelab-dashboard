import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface HistoryChartProps {
    data: any[];
    title: string;
    dataKey: string;
    color?: string;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, title, dataKey, color }) => {
    const theme = useTheme();
    const chartColor = color || theme.palette.primary.main;

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Card sx={{ height: '100%', minHeight: 300 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ flexGrow: 1, height: 300, minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis
                                dataKey="time"
                                stroke={theme.palette.text.secondary}
                                tickFormatter={(time) => new Date(time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            />
                            <YAxis stroke={theme.palette.text.secondary} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    borderColor: theme.palette.divider,
                                    color: theme.palette.text.primary
                                }}
                                labelFormatter={(label) => new Date(label * 1000).toLocaleString()}
                            />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={chartColor}
                                fillOpacity={1}
                                fill={`url(#color${dataKey})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default HistoryChart;
