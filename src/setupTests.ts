// @ts-nocheck
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock ResizeObserver (needed for Recharts)
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock ScrollIntoView (used in Containers page)
Element.prototype.scrollIntoView = vi.fn();
