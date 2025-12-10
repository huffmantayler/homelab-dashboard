export interface HassEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        icon?: string;
        brightness?: number;
        [key: string]: unknown;
    };
    last_changed: string;
    last_updated: string;
}

export const getHassStates = async (): Promise<HassEntity[]> => {
    try {
        // Token is handled by the backend proxy
        const response = await fetch('/api/hass/states', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch HA states: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching HA states:', error);
        return [];
    }
};

export const toggleLight = async (entityId: string, turnOn: boolean): Promise<boolean> => {
    try {
        const service = turnOn ? 'turn_on' : 'turn_off';
        // Token is handled by the backend proxy
        const response = await fetch(`/api/hass/services/homeassistant/${service}`, {
            method: 'POST',
            headers: {
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
