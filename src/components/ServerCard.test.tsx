import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ServerCard from './ServerCard';
import type { SystemStats } from '../lib/beszel';

describe('ServerCard Component', () => {
    const mockSystem = {
        id: '1',
        name: 'Test Server',
        status: 'up',
        cpu: 45,
        memory: 60,
        disk: 80,
        temperature: 55,
        updated: new Date().toISOString(),
    } as const;

    it('displays offline status', () => {
        const offlineSys = { ...mockSystem, status: 'down' } as SystemStats;
        render(
            <BrowserRouter>
                <ServerCard system={offlineSys} />
            </BrowserRouter>
        );
        expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });
});
