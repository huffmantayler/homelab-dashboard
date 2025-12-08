import '@testing-library/jest-dom';
import { vi } from 'vitest';

globalThis.fetch = vi.fn();

// Mock ResizeObserver (needed for Recharts)
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock ScrollIntoView (used in Containers page)
Element.prototype.scrollIntoView = vi.fn();
