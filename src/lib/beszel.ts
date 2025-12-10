
// Removed PocketBase SDK to avoid client-side credentials
// Using fetch to proxy requests through backend

export interface SystemStats {
    id: string;
    name: string;
    status: 'up' | 'down';
    cpu: number;
    memory: number;
    disk: number;
    temperature: number;
    updated: string;
}

// Internal interface for raw API response
interface SystemRecord {
    id: string;
    name: string;
    status: string;
    info?: {
        cpu?: number;
        mp?: number;
        dp?: number;
        dt?: number;
    };
    updated: string;
    [key: string]: unknown;
}

export const getSystems = async (): Promise<SystemStats[]> => {
    try {
        // Fetch from backend proxy
        // Using perPage=500 to ensure we get all records
        const response = await fetch('/api/beszel/api/collections/systems/records?sort=name&perPage=500');

        if (!response.ok) {
            console.error('Beszel fetch failed:', response.statusText);
            return [];
        }

        const data = await response.json();
        // PocketBase returns { items: [], ... } for getList/getFullList logic if using SDK, 
        // but raw API returns { items: [...], totalItems: ... }
        const records = (data.items || []) as SystemRecord[];

        return records.map((rec) => {
            return {
                id: rec.id,
                name: rec.name,
                status: (rec.status === 'up' || rec.status === 'down') ? rec.status : 'up',
                cpu: rec.info?.cpu || 0,
                memory: rec.info?.mp || 0,
                disk: rec.info?.dp || 0,
                temperature: rec.info?.dt || 0,
                updated: rec.updated,
            };
        });
    } catch (error) {
        console.error('Failed to fetch systems:', error);
        return [];
    }
};

export interface ContainerStats {
    id: string;
    name: string;
    image: string;
    status: string;
    systemId: string;
    cpu: number;
    memory: number;
    created: string;
    updated: string;
}

interface ContainerRecord {
    id: string;
    name: string;
    image: string;
    status: string;
    system: string;
    cpu: number;
    memory: number;
    created: string;
    updated: string;
    [key: string]: unknown;
}

export const getContainers = async (): Promise<ContainerStats[]> => {
    try {
        const response = await fetch('/api/beszel/api/collections/containers/records?sort=name&perPage=500');

        if (!response.ok) {
            console.error('Beszel containers fetch failed:', response.statusText);
            return [];
        }

        const data = await response.json();
        const records = (data.items || []) as ContainerRecord[];

        return records.map((rec) => {
            return {
                id: rec.id,
                name: rec.name,
                image: rec.image || 'Unknown Image',
                status: rec.status || 'unknown',
                systemId: rec.system || '',
                cpu: rec.cpu || 0,
                memory: rec.memory || 0,
                created: rec.created,
                updated: rec.updated,
            };
        });
    } catch (error) {
        console.error('Failed to fetch containers:', error);
        return [];
    }
};
