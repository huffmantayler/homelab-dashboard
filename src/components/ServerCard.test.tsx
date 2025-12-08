import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ServerCard from './ServerCard';

describe('ServerCard Component', () => {
    const mockSystem = {
        id: '1',
        name: 'Test Server',
        status: 'up',
        cpu: 45,
        memory: 60,
        disk: 80,
        temperature: 55,
        updated: 'now'
    };

    it('renders server info correctly', () => {
        // @ts-ignore
        render(
            <BrowserRouter>
                <ServerCard system={mockSystem} />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Server')).toBeInTheDocument();
        expect(screen.getByText('45.0%')).toBeInTheDocument(); // CPU
        expect(screen.getByText('60.0%')).toBeInTheDocument(); // RAM
    });

    it('displays offline status', () => {
        const offlineSys = { ...mockSystem, status: 'down' };
        // @ts-ignore
        render(
            <BrowserRouter>
                <ServerCard system={offlineSys} />
            </BrowserRouter>
        );
        expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });
});
