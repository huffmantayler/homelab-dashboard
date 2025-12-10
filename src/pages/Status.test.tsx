import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Status from './Status';
import { uptimeKuma } from '../lib/uptimeKuma';

// Mock the singleton instance
vi.mock('../lib/uptimeKuma', () => ({
    uptimeKuma: {
        subscribe: vi.fn(() => () => { }),
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
        const mockMonitors = {
            1: { id: 1, name: 'Main Site', status: 1, ping: 20, uptime: 99.9, tags: [] }
        };

        // Setup mock to call the callback immediately with data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (uptimeKuma.subscribe as any).mockImplementation((
            setMonitorList: (data: unknown) => void
        ) => {
            setMonitorList(Object.values(mockMonitors));
            return () => { };
        });

        render(<Status />);

        // Wait for the monitor to appear
        await waitFor(() => {
            expect(screen.getByText('Main Site')).toBeInTheDocument();
        });
    });
});
