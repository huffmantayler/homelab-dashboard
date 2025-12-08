import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystems, getContainers } from './beszel';

// Mock PocketBase
const mockGetFullList = vi.fn();
const mockAuthWithPassword = vi.fn();

vi.mock('pocketbase', () => {
    return {
        default: class {
            authStore = { isValid: false };
            collection() {
                return {
                    getFullList: mockGetFullList,
                    authWithPassword: mockAuthWithPassword,
                };
            }
            autoCancellation() { }
        },
    };
});

describe('Beszel Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getSystems', () => {
        it('should fetch and map systems correctly', async () => {
            const mockSystems = [
                {
                    id: 'sys1',
                    name: 'Server 1',
                    status: 'up',
                    info: { cpu: 10, mp: 20, dp: 30, dt: 40 },
                    updated: '2023-01-01',
                },
            ];
            mockGetFullList.mockResolvedValue(mockSystems);

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
        });

        it('should handle errors gracefully', async () => {
            mockGetFullList.mockRejectedValue(new Error('API Error'));
            const result = await getSystems();
            expect(result).toEqual([]);
        });
    });

    describe('getContainers', () => {
        it('should fetch and map containers correctly', async () => {
            const mockContainers = [
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
            ];
            mockGetFullList.mockResolvedValue(mockContainers);

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
        });
    });
});
