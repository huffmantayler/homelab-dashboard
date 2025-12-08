import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Containers from './Containers';

// Mock DataContext
const mockUseData = vi.fn();
vi.mock('../contexts/DataContext', () => ({
    useData: () => mockUseData()
}));

describe('Containers Page', () => {
    it('renders loading state', () => {
        mockUseData.mockReturnValue({ loading: true, systems: [], containers: [] });
        render(
            // @ts-ignore
            <MemoryRouter>
                <Containers />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders containers grouped by system', () => {
        const mockContainers = [
            { id: 'c1', name: 'nginx-proxy', status: 'running', systemId: 'sys1', image: 'nginx', cpu: 0, memory: 0 }
        ];
        const mockSystems = [
            { id: 'sys1', name: 'Primary Server' }
        ];

        mockUseData.mockReturnValue({
            loading: false,
            systems: mockSystems,
            containers: mockContainers
        });

        render(
            // @ts-ignore
            <MemoryRouter>
                <Containers />
            </MemoryRouter>
        );

        expect(screen.getByText('Primary Server')).toBeInTheDocument();
        expect(screen.getByText('nginx-proxy')).toBeInTheDocument();
    });

    it('shows message when no containers found', () => {
        mockUseData.mockReturnValue({
            loading: false,
            systems: [],
            containers: []
        });

        // @ts-ignore
        render(
            <MemoryRouter>
                <Containers />
            </MemoryRouter>
        );
        expect(screen.getByText('No containers found.')).toBeInTheDocument();
    });
});
