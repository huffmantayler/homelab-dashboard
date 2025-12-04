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
    network_rx: number;
    network_tx: number;
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
        return records.map((record: any) => ({
            id: record.id,
            name: record.name,
            status: record.status || 'up',
            // Metrics are nested in the 'info' object
            // cpu: CPU usage percentage
            // mp: Memory usage percentage
            // dp: Disk usage percentage
            cpu: record.info?.cpu || 0,
            memory: record.info?.mp || 0,
            disk: record.info?.dp || 0,
            network_rx: 0,
            network_tx: 0,
            updated: record.updated,
        }));
    } catch (error) {
        console.error('Failed to fetch systems:', error);
        return [];
    }
};

export default pb;
