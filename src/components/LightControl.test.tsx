import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LightControl from './LightControl';
import * as hassService from '../lib/homeassistant';

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

    it('renders lights', async () => {
        vi.mocked(hassService.getHassStates).mockResolvedValue(mockLights);
        render(<LightControl />);
        await waitFor(() => {
            expect(screen.getByText('Demo Light')).toBeInTheDocument();
        });
    });
});
