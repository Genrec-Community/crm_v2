import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';
import { teal, blueGrey, deepOrange, grey } from '@mui/material/colors';

// Common theme settings
const baseTheme = {
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 800,
      letterSpacing: '-0.01em',
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: { 
      fontSize: '1.75rem', 
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: { 
      fontSize: '1.5rem', 
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: { 
      fontSize: '1.25rem', 
      fontWeight: 600,
    },
    h6: { 
      fontSize: '1rem', 
      fontWeight: 600,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.7,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
};

// Component overrides for both themes
const getComponentOverrides = (mode: 'light' | 'dark') => ({
  MuiCssBaseline: {
    styleOverrides: {
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      body: {
        scrollBehavior: 'smooth',
        transition: 'background-color 0.3s ease, color 0.3s ease !important',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        fontWeight: 600,
        boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease !important',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.3)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: mode === 'light' ? '0 6px 12px rgba(0,0,0,0.2)' : '0 6px 12px rgba(0,0,0,0.4)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease !important',
        '&:hover': {
          boxShadow: mode === 'light' ? '0 8px 24px rgba(0,0,0,0.12)' : '0 8px 24px rgba(0,0,0,0.2)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'box-shadow 0.3s ease !important',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.15)',
          },
          '&.Mui-focused': {
            boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove default gradient
      },
      elevation1: {
        boxShadow: mode === 'light' 
          ? '0px 2px 8px rgba(0,0,0,0.05)'
          : '0px 2px 8px rgba(0,0,0,0.2)',
      },
      elevation2: {
        boxShadow: mode === 'light' 
          ? '0px 4px 12px rgba(0,0,0,0.06)'
          : '0px 4px 12px rgba(0,0,0,0.25)',
      },
      elevation3: {
        boxShadow: mode === 'light' 
          ? '0px 6px 16px rgba(0,0,0,0.07)'
          : '0px 6px 16px rgba(0,0,0,0.3)',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease !important',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        borderRadius: 6,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: '0.75rem',
        backdropFilter: 'blur(4px)',
        backgroundColor: mode === 'light' 
          ? 'rgba(33, 33, 33, 0.8)'
          : 'rgba(15, 15, 15, 0.9)',
      },
      arrow: {
        color: mode === 'light' 
          ? 'rgba(33, 33, 33, 0.8)'
          : 'rgba(15, 15, 15, 0.9)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none', // Remove default gradient
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none', // Remove default gradient
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        transition: 'all 0.2s ease !important',
      },
    },
  },
});

// Create light theme
let lightThemeBase = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: teal[700],
      light: teal[500],
      dark: teal[800],
      contrastText: '#fff',
    },
    secondary: {
      main: deepOrange[600],
      light: deepOrange[400],
      dark: deepOrange[800],
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: blueGrey[900],
      secondary: blueGrey[700],
    },
    divider: alpha(blueGrey[900], 0.08),
    action: {
      active: blueGrey[600],
      hover: alpha(blueGrey[600], 0.05),
      selected: alpha(teal[700], 0.12),
      disabled: alpha(blueGrey[900], 0.26),
      disabledBackground: alpha(blueGrey[900], 0.12),
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#0b79d0',
    },
  },
  components: getComponentOverrides('light'),
});

// Create dark theme
let darkThemeBase = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: teal[400],
      light: teal[300],
      dark: teal[600],
      contrastText: '#fff',
    },
    secondary: {
      main: deepOrange[400],
      light: deepOrange[300],
      dark: deepOrange[600],
      contrastText: '#fff',
    },
    background: {
      default: '#0f172a', // Dark blue
      paper: '#1e293b', // Slightly lighter blue
    },
    text: {
      primary: grey[100],
      secondary: grey[400],
    },
    divider: alpha(grey[100], 0.08),
    action: {
      active: grey[300],
      hover: alpha(grey[300], 0.08),
      selected: alpha(teal[500], 0.16),
      disabled: alpha(grey[100], 0.3),
      disabledBackground: alpha(grey[100], 0.12),
    },
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#338a3e',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    warning: {
      main: '#ffa726',
      light: '#ffd95b',
      dark: '#c77800',
    },
    info: {
      main: '#29b6f6',
      light: '#73e8ff',
      dark: '#0086c3',
    },
  },
  components: getComponentOverrides('dark'),
});

// Apply responsive font sizes
export const lightTheme = responsiveFontSizes(lightThemeBase);
export const darkTheme = responsiveFontSizes(darkThemeBase);

export type ThemeMode = 'light' | 'dark';