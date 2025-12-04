import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

import ServerCard from '../components/ServerCard';
import LightControl from '../components/LightControl';
import { SortableItem } from '../components/SortableItem';
import { getSystems, type SystemStats } from '../lib/beszel';

const LIGHT_CONTROL_ID = 'widget-light-control';

const DashboardHome: React.FC = () => {
    const [systems, setSystems] = useState<SystemStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [layoutOrder, setLayoutOrder] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load saved layout on mount
    useEffect(() => {
        const savedLayout = localStorage.getItem('dashboardLayout');
        if (savedLayout) {
            try {
                setLayoutOrder(JSON.parse(savedLayout));
            } catch (e) {
                console.error('Failed to parse saved layout', e);
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const data = await getSystems();
            setSystems(data);
            setError(null);

            // Sync layout with new data
            setLayoutOrder(prevOrder => {
                const currentIds = new Set(prevOrder);
                const systemIds = data.map(s => s.id);

                // Add LightControl if missing
                if (!currentIds.has(LIGHT_CONTROL_ID)) {
                    currentIds.add(LIGHT_CONTROL_ID);
                    // Default: LightControl at the end or beginning? Let's append if new.
                    // But for initial load, we might want a default order.
                }

                // Add new systems
                const newIds = systemIds.filter(id => !currentIds.has(id));

                // If layout is empty (first run), create default layout
                if (prevOrder.length === 0) {
                    return [...systemIds, LIGHT_CONTROL_ID];
                }

                // Otherwise append new items
                return [...prevOrder, ...newIds];
            });

        } catch (err) {
            setError('Failed to load system data. Please check your Beszel connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLayoutOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Save to localStorage
                localStorage.setItem('dashboardLayout', JSON.stringify(newOrder));
                return newOrder;
            });
        }
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    if (loading && systems.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Filter out IDs that no longer exist (e.g. removed servers) for rendering
    // But keep them in state just in case they come back? Or filter them out?
    // Let's filter for rendering only.
    const validSystemIds = new Set(systems.map(s => s.id));
    const renderableItems = layoutOrder.filter(id => id === LIGHT_CONTROL_ID || validSystemIds.has(id));

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        System Overview
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        Auto-refreshing every 5s
                    </Typography>
                </Box>
                <Button
                    variant={isEditMode ? "contained" : "outlined"}
                    color={isEditMode ? "primary" : "inherit"}
                    startIcon={isEditMode ? <SaveIcon /> : <EditIcon />}
                    onClick={toggleEditMode}
                >
                    {isEditMode ? "Done Editing" : "Edit Layout"}
                </Button>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error} - Make sure VITE_BESZEL_URL is set in .env
                </Alert>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={renderableItems}
                    strategy={rectSortingStrategy}
                >
                    <Grid container spacing={3}>
                        {renderableItems.map((id) => {
                            if (id === LIGHT_CONTROL_ID) {
                                return (
                                    <SortableItem
                                        key={id}
                                        id={id}
                                        isEditMode={isEditMode}
                                        gridSize={{ xs: 12, sm: 12, md: 8, lg: 6 }}
                                    >
                                        <LightControl />
                                    </SortableItem>
                                );
                            }

                            const system = systems.find(s => s.id === id);
                            if (system) {
                                return (
                                    <SortableItem
                                        key={id}
                                        id={id}
                                        isEditMode={isEditMode}
                                        gridSize={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                    >
                                        <ServerCard system={system} />
                                    </SortableItem>
                                );
                            }
                            return null;
                        })}
                    </Grid>
                </SortableContext>
            </DndContext>
        </Box>
    );
};

export default DashboardHome;
