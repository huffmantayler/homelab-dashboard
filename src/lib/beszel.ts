import PocketBase, { type RecordModel } from 'pocketbase';

// Initialize the PocketBase client
// You can override this with an environment variable VITE_BESZEL_URL
const pb = new PocketBase(import.meta.env.VITE_BESZEL_URL || 'http://localhost:8090');

// Disable auto-cancellation to allow multiple requests
pb.autoCancellation(false);

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

interface SystemRecord extends RecordModel {
    name: string;
    status: string;
    info?: {
        cpu?: number;
        mp?: number;
        dp?: number;
        dt?: number;
    };
    updated: string;
}

export const getSystems = async (): Promise<SystemStats[]> => {
    try {
        // Authenticate if credentials are provided
        const email = import.meta.env.VITE_BESZEL_EMAIL;
        const password = import.meta.env.VITE_BESZEL_PASSWORD;

        if (email && password && !pb.authStore.isValid) {
            await pb.collection('users').authWithPassword(email, password);
        }

        // 'systems' is the default collection for Beszel agents
        const records = await pb.collection('systems').getFullList({
            sort: 'name',
        });

        // Map PocketBase records to our SystemStats interface
        return records.map((record) => {
            // Cast to SystemRecord to safely access fields
            const rec = record as unknown as SystemRecord;
            return {
                id: rec.id,
                name: rec.name,
                status: (rec.status === 'up' || rec.status === 'down') ? rec.status : 'up',
                // Metrics are nested in the 'info' object
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

interface ContainerRecord extends RecordModel {
    name: string;
    image: string;
    status: string;
    system: string;
    cpu: number;
    memory: number;
}

export const getContainers = async (): Promise<ContainerStats[]> => {
    try {
        // Authenticate if credentials are provided
        const email = import.meta.env.VITE_BESZEL_EMAIL;
        const password = import.meta.env.VITE_BESZEL_PASSWORD;

        if (email && password && !pb.authStore.isValid) {
            await pb.collection('users').authWithPassword(email, password);
        }

        const records = await pb.collection('containers').getFullList({
            sort: 'name',
        });

        return records.map((record) => {
            const rec = record as unknown as ContainerRecord;
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

export default pb;
