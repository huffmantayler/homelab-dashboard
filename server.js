import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const PIHOLE_URL = process.env.VITE_PIHOLE_URL || 'http://pi.hole';
const PIHOLE_PASSWORD = process.env.VITE_PIHOLE_PASSWORD;

// Middleware to parse JSON
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
    res.send('Backend is healthy');
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Pi-hole URL configured: ${PIHOLE_URL}`);
});
