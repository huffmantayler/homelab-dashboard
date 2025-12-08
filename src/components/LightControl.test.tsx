import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LightControl from './LightControl';
import * as hassService from '../lib/homeassistant';

// Mock the entire module
vi.mock('../lib/homeassistant');

describe('LightControl Component', () => {
    const mockLights = [{
        entity_id: 'light.demo',
        state: 'off',
        attributes: { friendly_name: 'Demo Light' },
        last_changed: '',
        last_updated: ''
    }];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders light status from API', async () => {
        // @ts-ignore
        hassService.getHassStates.mockResolvedValue(mockLights);
        const toggleSpy = vi.spyOn(hassService, 'toggleLight').mockResolvedValue(true);

        render(<LightControl />);

        await waitFor(() => {
            expect(screen.getByText('Demo Light')).toBeInTheDocument();
        });

        // Switch uses switch role
        const storedSwitch = screen.getByRole('switch');
        expect(storedSwitch).not.toBeChecked();
        fireEvent.click(storedSwitch);

        await waitFor(() => {
            expect(toggleSpy).toHaveBeenCalledWith('light.demo', true);
        });
    });
});
