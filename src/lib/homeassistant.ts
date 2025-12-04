export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        icon?: string;
        brightness?: number;
        [key: string]: any;
    };
    last_changed: string;
    last_updated: string;
}

export const getHassStates = async (): Promise<HassEntity[]> => {
    try {
        const token = import.meta.env.VITE_HA_TOKEN?.trim();
        if (!token) {
            console.error('VITE_HA_TOKEN is missing');
            return [];
        }

        const response = await fetch('/api/hass/states', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('HA API Error Body:', text);
            throw new Error(`Home Assistant API error: ${response.status} ${response.statusText} - ${text}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch Home Assistant states:', error);
        return [];
    }
};

export const toggleLight = async (entityId: string, turnOn: boolean): Promise<boolean> => {
    try {
        const token = import.meta.env.VITE_HA_TOKEN?.trim();
        if (!token) return false;

        const service = turnOn ? 'turn_on' : 'turn_off';
        const response = await fetch(`/api/hass/services/homeassistant/${service}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                entity_id: entityId
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('HA Toggle Error Body:', text);
            throw new Error(`Failed to toggle light: ${response.statusText} - ${text}`);
        }

        return true;
    } catch (error) {
        console.error('Error toggling light:', error);
        return false;
    }
};
