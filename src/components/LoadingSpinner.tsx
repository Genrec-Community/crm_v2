import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

interface LoadingSpinnerProps {
  size?: number;
  fullscreen?: boolean;
  message?: string;
  withGradient?: boolean;
}

// Pulse animation for the background
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

export function LoadingSpinner({ 
  size = 40, 
  fullscreen = false, 
  message = "Loading...",
  withGradient = true
}: LoadingSpinnerProps) {
  const theme = useTheme();
  
  if (fullscreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withGradient 
            ? theme.palette.mode === 'dark' 
              ? 'rgba(17, 24, 39, 0.85)'
              : 'rgba(255, 255, 255, 0.85)'
            : theme.palette.mode === 'dark'
              ? 'rgba(17, 24, 39, 0.6)'
              : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: withGradient 
              ? theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #1e293b 30%, #111827 90%)'
                : 'linear-gradient(45deg, #ffffff 30%, #f3f4f6 90%)'
              : 'transparent',
            boxShadow: withGradient ? 4 : 'none',
            animation: withGradient ? `${pulse} 2s infinite ease-in-out` : 'none',
          }}
        >
          <CircularProgress 
            size={size} 
            thickness={4}
            sx={{ 
              color: theme.palette.primary.main,
              mb: message ? 2 : 0 
            }}
          />
          {message && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 2, fontWeight: 500 }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <CircularProgress 
        size={size} 
        thickness={4}
        sx={{ mb: message ? 2 : 0 }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}