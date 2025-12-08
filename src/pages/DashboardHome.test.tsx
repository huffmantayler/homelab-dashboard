import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardHome from './DashboardHome';
import { BrowserRouter } from 'react-router-dom';

// Mock DataContext
const mockUseData = vi.fn();
vi.mock('../contexts/DataContext', () => ({
    useData: () => mockUseData()
}));

// Mock Home Assistant
vi.mock('../lib/homeassistant', () => ({
    getHassStates: vi.fn().mockResolvedValue([]),
    toggleLight: vi.fn()
}));

describe('DashboardHome Page', () => {
    it('renders loading state', () => {
        mockUseData.mockReturnValue({ loading: true, systems: [], containers: [], alerts: [] });
        render(
            <BrowserRouter>
                <DashboardHome />
            </BrowserRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders system overview', () => {
        mockUseData.mockReturnValue({
            loading: false,
            systems: [{
                id: '1',
                name: 'Server A',
                status: 'up',
                cpu: 10,
                memory: 20,
                disk: 30,
                temperature: 40,
                updated: 'now' // Add other required fields if any
            }],
            containers: [],
            alerts: []
        });

        render(
            <BrowserRouter>
                <DashboardHome />
            </BrowserRouter>
        );

        expect(screen.getByText('Server A')).toBeInTheDocument();
    });
});
