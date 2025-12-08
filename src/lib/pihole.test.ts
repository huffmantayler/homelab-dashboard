
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPiholeStats, getPiholeHistory } from './pihole';

describe('Pi-hole Service', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('getPiholeStats', () => {
        it('should fetch and return stats correctly', async () => {
            const mockData = { queries: { total: 100 }, clients: { active: 5 } };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockData,
            });

            const result = await getPiholeStats();
            expect(result).toEqual(mockData);
            expect(fetch).toHaveBeenCalledWith('/api/pihole/stats/summary');
        });

        it('should return null on error', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));
            const result = await getPiholeStats();
            expect(result).toBeNull();
        });
    });

    describe('getPiholeHistory', () => {
        it('should fetch and return history correctly', async () => {
            const mockData = { history: [] };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockData,
            });

            const result = await getPiholeHistory();
            expect(result).toEqual(mockData);
        });
    });
});
