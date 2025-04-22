import React from 'react';
import { Box, Button, Paper, Typography, useTheme, Divider } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
    this.setState({
      errorInfo,
    });
    
    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleNavigateHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackUI 
          error={this.state.error} 
          onReset={this.handleReset}
          onNavigateHome={this.handleNavigateHome}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackUIProps {
  error?: Error;
  onReset: () => void;
  onNavigateHome: () => void;
}

// Separate component for the error UI
function ErrorFallbackUI({ error, onReset, onNavigateHome }: ErrorFallbackUIProps) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f8f9fa',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ErrorOutlineIcon 
          color="error" 
          sx={{ fontSize: 60, mb: 2 }} 
        />
        
        <Typography variant="h5" gutterBottom color="error" fontWeight={600}>
          Something went wrong
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          We're sorry, but an unexpected error has occurred. Our team has been notified.
        </Typography>
        
        {error && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: 1,
            textAlign: 'left',
            overflow: 'auto'
          }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {error.message}
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onNavigateHome}
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
          <Button 
            variant="contained" 
            onClick={onReset}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
        </Box>
        
      </Paper>
    </Box>
  );
}