import { createTheme, type ThemeOptions } from '@mui/material/styles';

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
};

export const themes = {
  default: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#90caf9' }, // Light Blue
      secondary: { main: '#f48fb1' }, // Pink
      background: {
        default: '#0a1929', // Deep dark blue
        paper: '#132f4c',
      },
    },
  }),
  light: createTheme({
    ...baseOptions,
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    },
  }),
  midnight: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#ce93d8' }, // Purple
      secondary: { main: '#80deea' }, // Cyan
      background: {
        default: '#000000', // True Black
        paper: '#121212',
      },
    },
  }),
  nature: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#81c784' },
      secondary: { main: '#e6ee9c' },
      background: {
        default: '#051405', // Near Black Green
        paper: '#0b200b',
      },
    },
  }),
  ocean: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#4fc3f7' },
      secondary: { main: '#4db6ac' },
      background: {
        default: '#021014', // Near Black Teal
        paper: '#04181d',
      },
    },
  }),
  sunset: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#ffb74d' },
      secondary: { main: '#ff8a65' },
      background: {
        default: '#1a0500', // Near Black Orange
        paper: '#2d0e05',
      },
    },
  }),
  hacker: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#00ff41' }, // Matrix Green
      secondary: { main: '#008f11' },
      background: {
        default: '#000000',
        paper: '#0d0d0d',
      },
      text: {
        primary: '#00ff41',
        secondary: '#008f11',
      },
    },
    components: {
      ...baseOptions.components,
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: '1px solid #00ff41',
            backgroundColor: '#050505',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            border: '1px solid #00ff41',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 65, 0.1)',
            },
          },
        },
      },
    },
  }),
  glass: createTheme({
    ...baseOptions,
    palette: {
      mode: 'dark',
      primary: { main: '#7c4dff' },
      secondary: { main: '#69f0ae' },
      background: {
        default: '#0f0524',
        paper: 'rgba(255, 255, 255, 0.05)',
      },
    },
    components: {
      ...baseOptions.components,
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(30, 30, 40, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }),
};

export type ThemeKey = keyof typeof themes;
