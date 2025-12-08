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
        let apiKey = import.meta.env.VITE_PIHOLE_API_KEY;
        const headers: HeadersInit = {};

        if (apiKey) {
            // Sanitize: trim whitespace and remove surrounding quotes
            apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
            headers['sid'] = apiKey;
        }

        // Use the proxy path configured in vite.config.ts (and nginx.conf for prod)
        // Pi-hole v6 uses /api/stats/summary
        const response = await fetch('/api/pihole/stats/summary', {
            headers
        });

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
        let apiKey = import.meta.env.VITE_PIHOLE_API_KEY;
        const headers: HeadersInit = {};

        if (apiKey) {
            // Sanitize: trim whitespace and remove surrounding quotes
            apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
            headers['sid'] = apiKey;
        }

        // Pi-hole v6 uses /api/history
        const response = await fetch('/api/pihole/history', {
            headers
        });

        if (!response.ok) {
            throw new Error(`Pi-hole API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Pi-hole History Data:', data); // Debug logging
        return data;
    } catch (error) {
        console.error('Failed to fetch Pi-hole history:', error);
        return null;
    }
};
