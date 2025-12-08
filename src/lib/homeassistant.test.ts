// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHassStates, toggleLight } from './homeassistant';

describe('Home Assistant Service', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Mock env var
        import.meta.env.VITE_HA_TOKEN = 'test-token';
    });

    describe('getHassStates', () => {
        it('should fetch and return states', async () => {
            const mockStates = [{ entity_id: 'light.living_room', state: 'on' }];
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockStates,
            });

            const result = await getHassStates();
            expect(result).toEqual(mockStates);
            expect(fetch).toHaveBeenCalledWith('/api/hass/states', expect.objectContaining({
                headers: expect.objectContaining({ 'Authorization': 'Bearer test-token' })
            }));
        });

        it('should return empty array on failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                text: async () => 'Error',
            });
            const result = await getHassStates();
            expect(result).toEqual([]);
        });
    });

    describe('toggleLight', () => {
        it('should send correct request to turn on', async () => {
            global.fetch = vi.fn().mockResolvedValue({ ok: true });

            const success = await toggleLight('light.test', true);

            expect(success).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                '/api/hass/services/homeassistant/turn_on',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ entity_id: 'light.test' })
                })
            );
        });
    });
});
