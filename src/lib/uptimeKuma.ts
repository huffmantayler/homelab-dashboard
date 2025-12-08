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

class UptimeKumaClient {
    private socket: Socket | null = null;
    private url: string;

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
        this.url = import.meta.env.VITE_UPTIME_KUMA_URL;
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
        if (!this.url) {
            console.error('VITE_UPTIME_KUMA_URL is not set');
            return;
        }

        if (this.socket) {
            return; // Already connected or connecting
        }

        this.socket = io('/', {
            path: '/uptime-kuma/socket.io',
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Uptime Kuma');
            this.connected = true;
            this.listeners.forEach(l => l.onConnect?.());

            // Authentication Logic
            const token = import.meta.env.VITE_UPTIME_KUMA_TOKEN;
            const username = import.meta.env.VITE_UPTIME_KUMA_USERNAME;
            const password = import.meta.env.VITE_UPTIME_KUMA_PASSWORD;

            if (token) {
                console.log('Authenticating with Session Token...');
                this.socket?.emit('loginByToken', {
                    token,
                }, (res: any) => {
                    if (res.ok) {
                        console.log('Logged in to Uptime Kuma with Token successfully');
                    } else {
                        console.error('Uptime Kuma Token Login failed:', res.msg);
                    }
                });
            } else if (username && password) {
                console.log('Authenticating with Username/Password...');
                this.socket?.emit('login', {
                    username,
                    password,
                }, (res: any) => {
                    if (res.ok) {
                        console.log('Logged in to Uptime Kuma successfully');
                    } else {
                        console.error('Uptime Kuma Login failed:', res.msg);
                    }
                });
            } else {
                console.warn('No credentials found. Set VITE_UPTIME_KUMA_USERNAME/PASSWORD or VITE_UPTIME_KUMA_TOKEN in .env');
            }
        });

        // Debug: Log all incoming events
        this.socket.onAny((event) => {
            // Debugging missing heartbeatList
            if (event === 'heartbeatList') {
                // console.log(`Socket Debug: Incoming event '${event}'`);
            }
        });

        this.socket.on('login required', () => {
            console.log('Uptime Kuma reported: Login Required');
        });

        this.socket.on('monitorList', (data: { [key: string]: Monitor }) => {
            // API returns an object map, convert to array
            const monitors = Object.values(data);

            // Debug: Inspect the first monitor to see if 'status' is present
            if (monitors.length > 0) {
                console.log('Socket Debug: Sample Monitor Structure:', monitors[0]);
            }

            // Update cache
            this.monitors = monitors;

            // Notify all listeners
            this.listeners.forEach(l => l.onMonitorList?.(this.monitors));
        });

        this.socket.on('heartbeat', (heartbeat: any) => {
            const hb: Heartbeat = {
                monitorID: heartbeat.monitorID || heartbeat.monitor_id,
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

        this.socket.on('heartbeatList', (monitorID: any, data: any) => {
            let newHeartbeats: any[] = [];

            if (Array.isArray(data)) {
                // Format: (id, [heartbeats])
                const last = data[data.length - 1];
                if (last) newHeartbeats.push(last);
            } else if (typeof monitorID === 'object') {
                // Format: { id: [heartbeats], id2: [heartbeats] }
                Object.values(monitorID).forEach((list: any) => {
                    if (Array.isArray(list) && list.length > 0) {
                        const last = list[list.length - 1];
                        if (last) newHeartbeats.push(last);
                    }
                });
            }

            // Update cache and notify
            newHeartbeats.forEach(rawHb => {
                const hb: Heartbeat = {
                    monitorID: rawHb.monitorID || rawHb.monitor_id,
                    status: rawHb.status,
                    time: rawHb.time,
                    msg: rawHb.msg,
                    ping: rawHb.ping
                };
                this.lastHeartbeats[hb.monitorID] = hb;
                this.listeners.forEach(l => l.onHeartbeat?.(hb));
            });
        });

        this.socket.on('uptime', (monitorID: any, period: any, percent: any) => {
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

        this.socket.on('connect_error', (err) => {
            console.error('Uptime Kuma Connection Error:', err.message);
            // @ts-ignore
            if (err.data) { console.error('Error Data:', err.data); }
            // @ts-ignore
            if (err.req) { console.error('Request:', err.req); } // Might be too verbose or undefined
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
