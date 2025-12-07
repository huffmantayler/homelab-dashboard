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

class UptimeKumaClient {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = import.meta.env.VITE_UPTIME_KUMA_URL;
        // user/pass auth logic would go here if we were doing full auth
        // for public status pages or read-only access depending on config
    }

    public connect(onMonitorList: (monitors: Monitor[]) => void, onHeartbeat: (heartbeat: Heartbeat) => void) {
        if (!this.url) {
            console.error('VITE_UPTIME_KUMA_URL is not set');
            return;
        }

        if (this.socket) {
            return;
        }

        console.log('Connecting to Uptime Kuma at', this.url);

        this.socket = io(this.url, {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to Uptime Kuma');
        });

        this.socket.on('monitorList', (data: { [key: string]: Monitor }) => {
            // API returns an object map, convert to array
            const monitors = Object.values(data);
            onMonitorList(monitors);
        });

        this.socket.on('heartbeat', (heartbeat: Heartbeat) => {
            onHeartbeat(heartbeat);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Uptime Kuma');
        });

        this.socket.on('error', (err) => {
            console.error('Uptime Kuma Socket Error:', err);
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const uptimeKuma = new UptimeKumaClient();
