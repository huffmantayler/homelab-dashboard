import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getSystems, getContainers, type SystemStats, type ContainerStats } from '../lib/beszel';

export interface Alert {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
}

interface DataContextType {
    systems: SystemStats[];
    containers: ContainerStats[];
    alerts: Alert[];
    loading: boolean;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [systems, setSystems] = useState<SystemStats[]>([]);
    const [containers, setContainers] = useState<ContainerStats[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = useCallback(async () => {
        try {
            const [systemsData, containersData] = await Promise.all([
                getSystems(),
                getContainers()
            ]);
            setSystems(systemsData);

            // Filter out stale containers (not updated in last 5 minutes)
            // This prevents "ghost" containers from previous deployments from showing up
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).getTime();
            const activeContainers = containersData.filter(c => {
                const updatedTime = new Date(c.updated).getTime();
                return updatedTime > fiveMinutesAgo;
            });

            setContainers(activeContainers);
            generateAlerts(systemsData, activeContainers);
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateAlerts = (currentSystems: SystemStats[], currentContainers: ContainerStats[]) => {
        const newAlerts: Alert[] = [];

        // Check Systems
        currentSystems.forEach(sys => {
            // System Offline
            if (sys.status !== 'up') {
                newAlerts.push({
                    id: `sys-down-${sys.id}`,
                    type: 'error',
                    message: `System ${sys.name} is OFFLINE`,
                    timestamp: new Date()
                });
            }

            // High Temperature (> 165F)
            // Assuming sys.temperature is in Celsius. 165F = 73.88C
            if (sys.temperature && sys.temperature > 73.8) {
                const tempF = (sys.temperature * 9 / 5) + 32;
                newAlerts.push({
                    id: `sys-temp-${sys.id}`,
                    type: 'warning',
                    message: `High Temp: ${sys.name} is ${tempF.toFixed(1)}°F`,
                    timestamp: new Date()
                });
            }
        });

        // Check Containers
        const storedIds = localStorage.getItem('knownContainerIds');
        const knownIds = new Set(storedIds ? JSON.parse(storedIds) : []);
        const currentIds = new Set<string>();
        let hasNewContainers = false;

        currentContainers.forEach(cont => {
            currentIds.add(cont.id);

            // New Container Alert (only if created in the last 2 hours)
            if (!knownIds.has(cont.id)) {
                const createdTime = new Date(cont.created).getTime();
                const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

                if (createdTime > twoHoursAgo) {
                    newAlerts.push({
                        id: `new-cont-${cont.id}`,
                        type: 'info',
                        message: `New Container Detected: ${cont.name}`,
                        timestamp: new Date()
                    });
                    hasNewContainers = true;
                }
            }

            // Unhealthy/Down Alert
            // Beszel might return 'up' or 'running' for healthy containers
            if (cont.status !== 'running' && cont.status !== 'up') {
                newAlerts.push({
                    id: `cont-status-${cont.id}`,
                    type: 'warning',
                    message: `Container ${cont.name} is ${cont.status}`,
                    timestamp: new Date()
                });
            }
        });

        // Update known containers if new ones found
        if (hasNewContainers) {
            localStorage.setItem('knownContainerIds', JSON.stringify(Array.from(currentIds)));
        } else if (knownIds.size === 0 && currentContainers.length > 0) {
            // Initial population
            if (!storedIds) {
                const filteredAlerts = newAlerts.filter(a => !a.id.startsWith('new-cont-'));
                localStorage.setItem('knownContainerIds', JSON.stringify(Array.from(currentIds)));
                setAlerts(filteredAlerts);
                return;
            }
        }

        // console.log('Generated Alerts:', newAlerts);
        // if (newAlerts.length > 0) {
        //     console.log('First Alert Details:', newAlerts[0]);
        //     const firstCont = currentContainers.find(c => newAlerts[0].id.includes(c.id));
        //     if (firstCont) console.log('Container causing alert:', firstCont);
        // }

        setAlerts(newAlerts);
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [refreshData]);

    return (
        <DataContext.Provider value={{ systems, containers, alerts, loading, refreshData }}>
            {children}
        </DataContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
