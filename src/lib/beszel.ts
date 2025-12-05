import PocketBase from 'pocketbase';

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
        return records.map((record: any) => {
            return {
                id: record.id,
                name: record.name,
                status: record.status || 'up',
                // Metrics are nested in the 'info' object
                cpu: record.info?.cpu || 0,
                memory: record.info?.mp || 0,
                disk: record.info?.dp || 0,
                temperature: record.info?.dt || 0, // Assuming dt is temperature in Celsius
                updated: record.updated,
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

        // Remove debug log
        // if (records.length > 0) {
        //     console.log('Container Record:', records[0]);
        // }

        return records.map((record: any) => ({
            id: record.id,
            name: record.name,
            image: record.image || 'Unknown Image',
            status: record.status || 'unknown',
            systemId: record.system || '', // Assuming 'system' is the relation field
            cpu: record.cpu || 0, // Assuming direct field or nested in stats?
            memory: record.memory || 0,
            created: record.created,
            updated: record.updated,
        }));
    } catch (error) {
        console.error('Failed to fetch containers:', error);
        return [];
    }
};

export default pb;
