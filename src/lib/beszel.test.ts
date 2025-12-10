import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystems, getContainers } from './beszel';

describe('Beszel Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    describe('getSystems', () => {
        it('should fetch and map systems correctly', async () => {
            const mockSystems = {
                items: [
                    {
                        id: 'sys1',
                        name: 'Server 1',
                        status: 'up',
                        info: { cpu: 10, mp: 20, dp: 30, dt: 40 },
                        updated: '2023-01-01',
                    },
                ],
            };

            (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                ok: true,
                json: async () => mockSystems,
            });

            const result = await getSystems();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'sys1',
                name: 'Server 1',
                status: 'up',
                cpu: 10,
                memory: 20,
                disk: 30,
                temperature: 40,
                updated: '2023-01-01',
            });
            expect(fetch).toHaveBeenCalledWith('/api/beszel/api/collections/systems/records?sort=name&perPage=500');
        });

        it('should handle errors gracefully', async () => {
            (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                ok: false,
                statusText: 'API Error',
            });

            const result = await getSystems();
            expect(result).toEqual([]);
        });

        it('should handle exception gracefully', async () => {
            (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network Error'));
            const result = await getSystems();
            expect(result).toEqual([]);
        });
    });

    describe('getContainers', () => {
        it('should fetch and map containers correctly', async () => {
            const mockContainers = {
                items: [
                    {
                        id: 'cont1',
                        name: 'nginx',
                        image: 'nginx:latest',
                        status: 'running',
                        system: 'sys1',
                        cpu: 5,
                        memory: 100,
                        created: '2023-01-01',
                        updated: '2023-01-02',
                    },
                ],
            };

            (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
                ok: true,
                json: async () => mockContainers,
            });

            const result = await getContainers();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'cont1',
                name: 'nginx',
                image: 'nginx:latest',
                status: 'running',
                systemId: 'sys1',
                cpu: 5,
                memory: 100,
                created: '2023-01-01',
                updated: '2023-01-02',
            });
            expect(fetch).toHaveBeenCalledWith('/api/beszel/api/collections/containers/records?sort=name&perPage=500');
        });
    });
});
