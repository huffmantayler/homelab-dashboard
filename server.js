import { Server } from 'socket.io';
import { io as ClientSocket } from 'socket.io-client';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO attachment
const PORT = process.env.PORT || 3000;

// ... (existing env vars)

// Uptime Kuma Env Vars
const KUMA_URL = process.env.UPTIME_KUMA_URL || process.env.VITE_UPTIME_KUMA_URL;
const KUMA_USERNAME = process.env.UPTIME_KUMA_USERNAME || process.env.VITE_UPTIME_KUMA_USERNAME;
const KUMA_PASSWORD = process.env.UPTIME_KUMA_PASSWORD || process.env.VITE_UPTIME_KUMA_PASSWORD;
const KUMA_TOKEN = process.env.UPTIME_KUMA_TOKEN || process.env.VITE_UPTIME_KUMA_TOKEN;

// ... (existing middleware)

// ... (existing Pi-hole/Beszel/HA proxy routes)

// --- Uptime Kuma Socket Proxy ---
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this env, or restrict to frontend
        methods: ["GET", "POST"]
    },
    path: '/socket.io' // Standard path
});

io.on('connection', (frontendSocket) => {
    console.log(`Frontend connected to Kuma Proxy: ${frontendSocket.id}`);

    if (!KUMA_URL) {
        console.error('UPTIME_KUMA_URL not set');
        frontendSocket.emit('error', { message: 'Backend not configured for Uptime Kuma' });
        return;
    }

    // Connect to real Uptime Kuma
    // Note: Kuma uses /uptime-kuma/socket.io path typically if proxied, or root if direct.
    // We assume KUMA_URL is base like http://192.168.1.10:3001
    const kumaSocket = ClientSocket(KUMA_URL, {
        path: '/socket.io', // Standard Kuma path usually? 
        // Actually Kuma often sits behind a reverse proxy or uses default socket.io path
        // Creating a client to Kuma:
        transports: ['websocket', 'polling']
    });

    kumaSocket.on('connect', () => {
        console.log(`Backend connected to Real Uptime Kuma (${KUMA_URL})`);

        // Authenticate immediately
        if (KUMA_TOKEN) {
            console.log('Authenticating Kuma with Token...');
            kumaSocket.emit('loginByToken', { token: KUMA_TOKEN }, (res) => {
                if (res?.ok) console.log('Kuma Token Login Success');
                else console.error('Kuma Token Login Failed:', res);
            });
        } else if (KUMA_USERNAME && KUMA_PASSWORD) {
            console.log('Authenticating Kuma with User/Pass...');
            kumaSocket.emit('login', { username: KUMA_USERNAME, password: KUMA_PASSWORD }, (res) => {
                if (res?.ok) console.log('Kuma Login Success');
                else console.error('Kuma Login Failed:', res);
            });
        }
    });

    // Relay Events from Kuma -> Frontend
    const eventsToRelay = ['monitorList', 'heartbeat', 'heartbeatList', 'uptime', 'info', 'disconnect'];

    // Wildcard listener to relay everything? 
    // socket.io-client doesn't support wildcard on() easily without a plugin, 
    // so we list common Kuma events.

    kumaSocket.onAny((event, ...args) => {
        // console.log(`[Relay] Kuma -> Frontend: ${event}`);
        frontendSocket.emit(event, ...args);
    });

    // Handle Frontend Disconnect
    frontendSocket.on('disconnect', () => {
        console.log(`Frontend disconnected: ${frontendSocket.id}`);
        kumaSocket.disconnect();
    });

    kumaSocket.on('connect_error', (err) => {
        console.error('Kuma Connection Error:', err.message);
    });
});

// Update app.listen to server.listen
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Pi-hole URL grouped: ${PIHOLE_URL}`);
    console.log('Socket.IO Proxy for Uptime Kuma active');
});

// Environment variables
// Environment variables
const PIHOLE_URL = process.env.PIHOLE_URL || process.env.VITE_PIHOLE_URL || 'http://pi.hole';
const PIHOLE_PASSWORD = process.env.PIHOLE_PASSWORD || process.env.VITE_PIHOLE_PASSWORD;

const BESZEL_URL = process.env.BESZEL_URL || process.env.VITE_BESZEL_URL || 'http://localhost:8090';
const BESZEL_EMAIL = process.env.BESZEL_EMAIL || process.env.VITE_BESZEL_EMAIL;
const BESZEL_PASSWORD = process.env.BESZEL_PASSWORD || process.env.VITE_BESZEL_PASSWORD;

const HA_URL = process.env.HA_URL || process.env.VITE_HA_URL;
const HA_TOKEN = process.env.HA_TOKEN || process.env.VITE_HA_TOKEN;

// Middleware to parse JSON
// Middleware to parse JSON
app.use(express.json());

// Request logging middleware for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Session store (in-memory)
let sessionSid = null;
let lastAuthTime = 0;

// Helper to authenticate with Pi-hole
async function authenticatePihole() {
    try {
        if (!PIHOLE_PASSWORD) {
            console.warn('VITE_PIHOLE_PASSWORD not set. Assuming no auth needed or will fail.');
            return null;
        }

        console.log('Authenticating with Pi-hole...');
        // Pi-hole auth usually involves POSTing the password to /api/auth or similar,
        // but typically for the API it uses a token (pwhash) or session.
        // The user request says: "POST request to the /api/auth endpoint with a payload containing your password"

        const response = await axios.post(`${PIHOLE_URL}/api/auth`, {
            password: PIHOLE_PASSWORD
        });

        if (response.data.session && response.data.session.valid) {
            const sid = response.data.session.sid;
            sessionSid = sid;
            lastAuthTime = Date.now();
            console.log('Pi-hole authenticated successfully. SID obtained.');
            return sid;
        } else {
            console.error('Pi-hole auth failed:', response.data);
            return null;
        }
    } catch (error) {
        console.error('Error authenticating with Pi-hole:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

// Proxy endpoint for Pi-hole
// Using Regex to avoid Express 5 string path syntax issues with path-to-regexp
app.all(/^\/api\/pihole\/(.*)/, async (req, res) => {
    const targetPath = req.params[0]; // e.g., 'stats/summary' or 'history'

    // Ensure we have a session
    if (!sessionSid && PIHOLE_PASSWORD) {
        await authenticatePihole();
    }

    try {
        const config = {
            method: req.method,
            url: `${PIHOLE_URL}/api/${targetPath}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: req.body,
            // Ensure axios doesn't throw on error status so we can proxy it back
            validateStatus: () => true,
        };

        if (sessionSid) {
            config.headers['Cookie'] = `PH_SESSID=${sessionSid}`;
            // Also header based auth often accepted if specified? 
            // The user prompt specifically mentioned SID.
            // Usually passed as a cookie "PH_SESSID" or header "sid"?
            // User said: "you will be given a session ID (SID) that you will have to use."
            // Let's try explicit custom header 'sid' as well based on previous implementation attempt,
            // but standard web auth is Cookie.
            config.headers['sid'] = sessionSid;
        }

        const response = await axios(config);

        // If 401/403, might need to re-auth
        if (response.status === 401 || response.status === 403) {
            console.log('Got 401/403 from Pi-hole, retrying auth...');
            const newSid = await authenticatePihole();
            if (newSid) {
                config.headers['Cookie'] = `PH_SESSID=${newSid}`;
                config.headers['sid'] = newSid;
                const retryResponse = await axios(config);
                res.status(retryResponse.status).send(retryResponse.data);
                return;
            }
        }

        res.status(response.status).send(response.data);

    } catch (error) {
        console.error(`Proxy error for /api/pihole/${targetPath}:`, error instanceof Error ? error.message : String(error));
        res.status(500).json({ error: 'Proxy Request Failed' });
    }
});

// --- Beszel Proxy ---
let beszelToken = null;

async function authenticateBeszel() {
    try {
        if (!BESZEL_EMAIL || !BESZEL_PASSWORD) {
            console.warn('BESZEL_EMAIL/PASSWORD not set.');
            return null;
        }

        console.log('Authenticating with Beszel...');
        const response = await axios.post(`${BESZEL_URL}/api/collections/users/auth-with-password`, {
            identity: BESZEL_EMAIL,
            password: BESZEL_PASSWORD
        });

        if (response.data.token) {
            console.log('Beszel authenticated successfully.');
            beszelToken = response.data.token;
            return beszelToken;
        }
    } catch (error) {
        console.error('Error authenticating with Beszel:', error instanceof Error ? error.message : String(error));
    }
    return null;
}

// Beszel Proxy Endpoint
app.all(/^\/api\/beszel\/(.*)/, async (req, res) => {
    const targetPath = req.params[0];

    if (!beszelToken && BESZEL_PASSWORD) {
        await authenticateBeszel();
    }

    try {
        const config = {
            method: req.method,
            url: `${BESZEL_URL}/${targetPath}`, // targetPath already includes 'api/...' if the client sends it, or we assume client sends 'api/...'? Client usually sends 'api/collections...'. So path is just full path.
            // Wait, standard PB URL is http://host/api/...
            // If Client requests /api/beszel/api/collections..., targetPath is 'api/collections...'
            // So `${BESZEL_URL}/${targetPath}` is correct if BESZEL_URL is base.
            headers: {
                'Content-Type': 'application/json',
            },
            data: req.body,
            validateStatus: () => true,
        };

        if (beszelToken) {
            config.headers['Authorization'] = beszelToken; // PB uses just the token string or 'Bearer ...'? PB usually accepts just the token in 'Authorization' header or 'Bearer <token>'. Let's try Bearer.
            // Correction: PB docs say "Authorization: <token>" (no Bearer needed usually) OR "Authorization: Bearer <token>". It checks both.
        }

        const response = await axios(config);

        if (response.status === 401 || response.status === 403) {
            console.log('Got 401/403 from Beszel, retrying auth...');
            const newToken = await authenticateBeszel();
            if (newToken) {
                config.headers['Authorization'] = newToken;
                const retryResponse = await axios(config);
                res.status(retryResponse.status).send(retryResponse.data);
                return;
            }
        }

        res.status(response.status).send(response.data);

    } catch (error) {
        console.error(`Proxy error for Beszel /${targetPath}:`, error instanceof Error ? error.message : String(error));
        res.status(500).json({ error: 'Beszel Proxy Request Failed' });
    }
});

// --- Home Assistant Proxy ---
app.all(/^\/api\/hass\/(.*)/, async (req, res) => {
    const targetPath = req.params[0]; // e.g. 'states' or 'services/...'

    if (!HA_TOKEN) {
        console.warn('HA_TOKEN not set');
        return res.status(500).json({ error: 'HA_TOKEN not configured' });
    }

    try {
        const config = {
            method: req.method,
            url: `${HA_URL}/api/${targetPath}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HA_TOKEN}`
            },
            data: req.body,
            validateStatus: () => true,
        };

        const response = await axios(config);
        res.status(response.status).send(response.data);

    } catch (error) {
        console.error(`Proxy error for HA /${targetPath}:`, error instanceof Error ? error.message : String(error));
        res.status(500).json({ error: 'HA Proxy Request Failed' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.send('Backend is healthy');
});


