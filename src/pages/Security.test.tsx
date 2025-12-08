import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Security from './Security';
import * as piholeService from '../lib/pihole';

vi.mock('../lib/pihole');

describe('Security Page', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders loading initially and then data', async () => {
        const mockStats = {
            queries: { total: 5000, blocked: 500, percent_blocked: 10 },
            clients: { active: 5, total: 10 },
            gravity: { domains_being_blocked: 100000 },
        };

        // Mock request to take 100ms
        // @ts-ignore
        piholeService.getPiholeStats.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockStats), 100)));
        // @ts-ignore
        piholeService.getPiholeHistory.mockResolvedValue({ history: [] });

        render(<Security />);

        // Should be loading immediately
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // Should eventually resolve
        await waitFor(() => {
            expect(screen.getByText('5,000')).toBeInTheDocument();
        });
    });

    it('shows error message on failure', async () => {
        // @ts-ignore
        piholeService.getPiholeStats.mockResolvedValue(null);
        // @ts-ignore
        piholeService.getPiholeHistory.mockResolvedValue({ history: [] });

        render(<Security />);

        await waitFor(() => {
            expect(screen.getByText(/Failed to load Pi-hole stats/i)).toBeInTheDocument();
        });
    });
});
