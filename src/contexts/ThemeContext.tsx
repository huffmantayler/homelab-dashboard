import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { themes, type ThemeKey } from '../theme';

interface ThemeContextType {
    currentTheme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
    availableThemes: ThemeKey[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize theme from localStorage or default to 'default'
    const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => {
        const savedTheme = localStorage.getItem('app-theme') as ThemeKey;
        return themes[savedTheme] ? savedTheme : 'default';
    });

    useEffect(() => {
        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    const activeTheme = themes[currentTheme];

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme: setCurrentTheme,
                availableThemes: Object.keys(themes) as ThemeKey[]
            }}
        >
            <MuiThemeProvider theme={activeTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
