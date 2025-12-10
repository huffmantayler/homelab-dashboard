
import { io, Socket } from 'socket.io-client';

export interface Monitor {
    id: number;
    name: string;
    url: string;
    type: string;
    hostname: string;
    port: number;
    active: boolean;
    interval: number;
    keyword: string | null;
    status: number; // 0 = Down, 1 = Up, 2 = Pending, 3 = Maintenance
    weight: number;
    ping: number;
    tags: Tag[];
}

export interface Tag {
    id: number;
    name: string;
    color: string;
    slug: string;
}

export interface Heartbeat {
    monitorID: number;
    status: number;
    time: string;
    msg: string;
    ping: number;
}

export interface Uptime {
    monitorID: number;
    period: number; // 24 = 24h
    percent: number;
}

// Define specific types for socket events to avoid 'any'
interface SocketError {
    message: string;
    data?: unknown;
    req?: unknown;
}

interface RawHeartbeat {
    monitorID?: number;
    monitor_id?: number;
    status: number;
    time: string;
    msg: string;
    ping: number;
}

class UptimeKumaClient {
    private socket: Socket | null = null;
    // private url: string; // Removed

    // Cache
    private monitors: Monitor[] = [];
    private lastHeartbeats: { [id: number]: Heartbeat } = {};
    private activeUptimes: { [id: number]: Uptime } = {};
    private connected = false;

    // Subscribers
    private listeners: {
        onMonitorList?: (monitors: Monitor[]) => void;
        onHeartbeat?: (heartbeat: Heartbeat) => void;
        onUptime?: (uptime: Uptime) => void;
        onConnect?: () => void;
        onDisconnect?: () => void;
    }[] = [];

    constructor() {
        // No URL needed, connects to same origin (our backend)
    }

    public subscribe(
        onMonitorList: (monitors: Monitor[]) => void,
        onHeartbeat: (heartbeat: Heartbeat) => void,
        onUptime: (uptime: Uptime) => void,
        onConnect: () => void,
        onDisconnect: () => void
    ) {
        // Register new listener
        const listener = { onMonitorList, onHeartbeat, onUptime, onConnect, onDisconnect };
        this.listeners.push(listener);

        // If we already have data, send it immediately (Instant Load)
        if (this.monitors.length > 0) {
            onMonitorList(this.monitors);
        }

        // Replay cached heartbeats and uptimes
        Object.values(this.lastHeartbeats).forEach(hb => onHeartbeat(hb));
        Object.values(this.activeUptimes).forEach(ut => onUptime(ut));

        if (this.connected) {
            onConnect();
        }

        // Ensure connection is open
        this.connectSocket();

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private connectSocket() {
        if (this.socket) {
            return; // Already connected or connecting
        }

        // Connect to our backend proxy
        this.socket = io('/', {
            path: '/socket.io',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Backend Kuma Proxy');
            this.connected = true;
            this.listeners.forEach(l => l.onConnect?.());
        });

        // Debug: Log all incoming events (commented out for production)
        /*
        this.socket.onAny((event) => {
             console.log(`Socket Debug: Incoming event '${event}'`);
        });
        */

        this.socket.on('monitorList', (data: { [key: string]: Monitor }) => {
            // console.log('Received monitorList:', data);

            // Expected data is object: { "1": { ... }, "2": { ... } }
            // Convert to array
            this.monitors = Object.values(data);

            // Notify listeners
            this.listeners.forEach(l => l.onMonitorList?.(this.monitors));
        });

        this.socket.on('heartbeat', (heartbeat: RawHeartbeat) => {
            const hb: Heartbeat = {
                monitorID: heartbeat.monitorID || heartbeat.monitor_id || 0,
                status: heartbeat.status,
                time: heartbeat.time,
                msg: heartbeat.msg,
                ping: heartbeat.ping
            };

            // Update cache
            this.lastHeartbeats[hb.monitorID] = hb;
            // Notify all listeners
            this.listeners.forEach(l => l.onHeartbeat?.(hb));
        });

        this.socket.on('heartbeatList', (monitorID: unknown, data: unknown) => {
            const newHeartbeats: RawHeartbeat[] = [];

            if (Array.isArray(data)) {
                // Format: (id, [heartbeats])
                const last = data[data.length - 1];
                if (last) newHeartbeats.push(last);
            } else if (typeof monitorID === 'object' && monitorID !== null) {
                // Format: { id: [heartbeats], id2: [heartbeats] }
                Object.values(monitorID).forEach((list) => {
                    if (Array.isArray(list) && list.length > 0) {
                        const last = list[list.length - 1];
                        if (last) newHeartbeats.push(last);
                    }
                });
            }

            // Update cache and notify
            newHeartbeats.forEach(rawHb => {
                const hb: Heartbeat = {
                    monitorID: rawHb.monitorID || rawHb.monitor_id || 0,
                    status: rawHb.status,
                    time: rawHb.time,
                    msg: rawHb.msg,
                    ping: rawHb.ping
                };
                this.lastHeartbeats[hb.monitorID] = hb;
                this.listeners.forEach(l => l.onHeartbeat?.(hb));
            });
        });

        this.socket.on('uptime', (monitorID: number | string, period: number | string, percent: number | string) => {
            const uptime = {
                monitorID: Number(monitorID),
                period: Number(period),
                percent: Number(percent)
            };

            // Update cache
            if (uptime.period === 24) { // Only cache 24h for now as that's what we display
                this.activeUptimes[uptime.monitorID] = uptime;
            }

            // Notify listeners
            this.listeners.forEach(l => l.onUptime?.(uptime));
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from Uptime Kuma:', reason);
            this.connected = false;
            this.listeners.forEach(l => l.onDisconnect?.());
        });

        this.socket.on('connect_error', (err: SocketError | Error) => {
            console.error('Uptime Kuma Connection Error:', err.message);
            // @ts-expect-error - Checking for data property on error
            if (err.data) { console.error('Error Data:', err.data); }
            // @ts-expect-error - Checking for req property on error
            if (err.req) { console.error('Request:', err.req); }
        });

        this.socket.on('error', (err) => {
            console.error('Uptime Kuma Socket Error:', err);
        });
    }

    public close() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.monitors = [];
            this.lastHeartbeats = {};
            this.activeUptimes = {};
        }
    }
}

export const uptimeKuma = new UptimeKumaClient();
