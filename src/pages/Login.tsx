import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  useTheme,
  Fade,
  CircularProgress,
  useMediaQuery,
  Card,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/sales');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
          : `linear-gradient(135deg, #e0f2f1 0%, #f5f5f5 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 25% 25%, rgba(53, 178, 165, 0.15) 0%, transparent 20%), radial-gradient(circle at 75% 75%, rgba(255, 112, 67, 0.1) 0%, transparent 25%)'
            : 'radial-gradient(circle at 25% 25%, rgba(53, 178, 165, 0.2) 0%, transparent 20%), radial-gradient(circle at 75% 75%, rgba(255, 112, 67, 0.15) 0%, transparent 25%)',
          zIndex: 0,
        },
        py: 4,
        zIndex: 1,
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Fade in={true} timeout={800}>
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Stack 
                direction="row" 
                spacing={1.5} 
                alignItems="center" 
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <BusinessIcon sx={{ 
                  fontSize: isMobile ? 32 : 40,
                  color: theme.palette.primary.main 
                }} />
                <Typography 
                  variant={isMobile ? 'h4' : 'h3'} 
                  component="h1" 
                  fontWeight="800" 
                  sx={{ 
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                      : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                  }}
                >
                  CRM Portal
                </Typography>
              </Stack>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 400, 
                  mx: 'auto',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  letterSpacing: '0.01em'
                }}
              >
                Access your dashboard to manage sales, expenses, and inventory
              </Typography>
            </Box>

            <Card 
              elevation={theme.palette.mode === 'dark' ? 5 : 1}
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(145deg, rgba(36, 58, 83, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
                  : '#ffffff',
                backdropFilter: 'blur(16px)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.06)',
                transform: 'translateY(0)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                    : '0 12px 40px rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <Box sx={{ 
                mb: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <FingerprintIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main,
                    mb: 2,
                    opacity: 0.9
                  }} 
                />
                <Typography 
                  component="h2" 
                  variant="h5" 
                  fontWeight="700" 
                  textAlign="center"
                  gutterBottom
                >
                  Sign In
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  textAlign="center"
                >
                  Enter your credentials to access your account
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1 }}
                />

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link 
                    href="#" 
                    variant="body2"
                    sx={{ 
                      fontWeight: 500,
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    mb: 2,
                    fontSize: '1rem',
                    position: 'relative',
                    fontWeight: 600,
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                      : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    boxShadow: `0 4px 14px ${theme.palette.mode === 'dark'
                      ? 'rgba(0, 150, 136, 0.4)'
                      : 'rgba(0, 150, 136, 0.2)'}`,
                    '&:hover': {
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${theme.palette.mode === 'dark'
                        ? 'rgba(0, 150, 136, 0.6)'
                        : 'rgba(0, 150, 136, 0.4)'}`,
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                        color: theme.palette.common.white,
                      }}
                    />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <Divider sx={{ 
                  my: 2.5,
                  '&::before, &::after': {
                    borderColor: theme.palette.divider,
                  }
                }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      px: 1,
                      fontWeight: 500,
                    }}
                  >
                    Employee Access Only
                  </Typography>
                </Divider>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center"
                  sx={{
                    lineHeight: 1.6,
                  }}
                >
                  If you're having trouble logging in, please contact your system administrator.
                </Typography>
              </Box>
            </Card>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mt: 4,
                opacity: 0.7,
              }}
            >
              &copy; {new Date().getFullYear()} CRM System. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}