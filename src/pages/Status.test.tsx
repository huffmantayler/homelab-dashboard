import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Status from './Status';
import { uptimeKuma } from '../lib/uptimeKuma';

// Mock the singleton instance
vi.mock('../lib/uptimeKuma', () => ({
    uptimeKuma: {
        subscribe: vi.fn().mockReturnValue(() => { }),
    }
}));

describe('Status Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<Status />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders monitors when data is received', async () => {
        // Mock the subscribe implementation to immediately call the callback
        const mockMonitors = [
            { id: 1, name: 'Main Site', status: 1, ping: 20, uptime: 99.9, tags: [] }
        ];

        // @ts-ignore
        uptimeKuma.subscribe.mockImplementation((onMonitorList: any) => {
            onMonitorList(mockMonitors);
            return vi.fn(); // Return a mock function as unsubscribe
        });

        render(<Status />);

        await waitFor(() => {
            expect(screen.getByText('Main Site')).toBeInTheDocument();
            expect(screen.getByText('Up')).toBeInTheDocument();
        });
    });
});
