export interface PiholeStats {
    queries: {
        total: number;
        blocked: number;
        percent_blocked: number;
        unique_domains: number;
        forwarded: number;
        cached: number;
        frequency: number;
        types: Record<string, number>;
        status: Record<string, number>;
        replies: Record<string, number>;
    };
    clients: {
        active: number;
        total: number;
    };
    gravity: {
        domains_being_blocked: number;
        last_update: number;
    };
    took: number;
}

export const getPiholeStats = async (): Promise<PiholeStats | null> => {
    try {
        // The backend server.js proxies /api/pihole/* requests and handles authentication
        const response = await fetch('/api/pihole/stats/summary');

        if (!response.ok) {
            throw new Error(`Pi-hole API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch Pi-hole stats:', error);
        return null;
    }
};

export const getPiholeHistory = async (): Promise<Record<string, unknown> | null> => {
    try {
        // The backend server.js proxies /api/pihole/* requests and handles authentication
        const response = await fetch('/api/pihole/history');

        if (!response.ok) {
            throw new Error(`Pi-hole API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch Pi-hole history:', error);
        return null;
    }
};
