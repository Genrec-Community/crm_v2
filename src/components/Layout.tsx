import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme as useMuiTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Collapse,

  alpha
} from '@mui/material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Icons
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BusinessIcon from '@mui/icons-material/Business';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const drawerWidth = 280;

export function Layout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useTheme();

  // New states for enhanced sidebar functionality
  const [salesExpanded, setSalesExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  useEffect(() => {
    // If path includes sales, expand the sales section
    if (location.pathname.includes('sales')) {
      setSalesExpanded(true);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleSalesExpand = () => {
    setSalesExpanded(!salesExpanded);
  };

  const mainNavItems = [
    {


      disabled: true,
      tooltip: 'Coming soon'
    },
    {
      text: 'Sales',
      path: '#',
      icon: <PointOfSaleIcon />,
      expandable: true,
      expanded: salesExpanded,
      onToggle: handleToggleSalesExpand,
      subItems: [
        { text: 'Record Sale', path: '/sales', icon: <BusinessCenterIcon sx={{ fontSize: '0.8rem' }} /> },
        { text: 'Create Quote', path: '/quote', icon: <RequestQuoteIcon sx={{ fontSize: '0.8rem' }} /> },
      ]
    },
    { text: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
    { text: 'Inventory', path: '/items', icon: <InventoryIcon /> },
  ];

  // Enhanced function for avatar and user display
  const getUserDisplay = () => {
    if (!user?.email) return { initials: '?', name: 'Guest', email: '' };

    const email = user.email;
    const nameParts = email.split('@')[0].split('.');
    const formattedName = nameParts.map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');

    const initials = nameParts
      .map(name => name.charAt(0).toUpperCase())
      .join('');

    return {
      initials: initials.substring(0, 2),
      name: formattedName,
      email: email
    };
  };

  const userDisplay = getUserDisplay();
  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2.5,
          background: mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          color: mode === 'dark' ? '#fff' : theme.palette.text.primary,
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            opacity: 0.03,
          }
        }}
      >
        {isMobile && (
          <IconButton
            onClick={() => setMobileDrawerOpen(false)}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              mr: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.2),
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 0.3),
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontWeight: 'bold',
              bgcolor: mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
              border: '2px solid',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.05)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            {userDisplay.initials}
          </Avatar>

          <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
            <Typography variant="subtitle1" fontWeight="600" noWrap>
              {userDisplay.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.8,
                display: 'block',
                color: theme.palette.text.secondary
              }}
              noWrap
            >
              {userDisplay.email}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Account options" arrow>
          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            sx={{
              color: theme.palette.text.primary,
              bgcolor: alpha(theme.palette.background.paper, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 0.2),
              }
            }}
            size="small"
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(0, 0, 0, 0.5)'
              : '0 10px 30px rgba(0, 0, 0, 0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={handleProfileMenuClose}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }
          }}
        >
          <AccountCircleIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={toggleTheme}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }
          }}
        >
          {mode === 'dark' ? <Brightness7Icon fontSize="small" sx={{ mr: 1.5 }} /> : <Brightness4Icon fontSize="small" sx={{ mr: 1.5 }} />}
          <Typography variant="body2">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleSignOut}
          sx={{
            py: 1.5,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            }
          }}
        >
          <ExitToAppIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">Sign Out</Typography>
        </MenuItem>
      </Menu>

      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: alpha(theme.palette.background.paper, 0.4),
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight="600"
          sx={{
            letterSpacing: '0.1em',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            background: mode === 'dark'
              ? `linear-gradient(90deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`
              : `linear-gradient(90deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Main Navigation
        </Typography>
      </Box>

      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          pb: 2,
          '::-webkit-scrollbar': {
            width: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: alpha(theme.palette.text.secondary, 0.3),
          }
        }}
      >
        <List sx={{ px: 2, py: 1 }}>
          {mainNavItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <Tooltip
                  title={item.disabled ? item.tooltip || 'Disabled' : ''}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={item.disabled ? 'div' : Link}
                    to={item.disabled ? undefined : (item.expandable ? undefined : item.path)}
                    selected={item.expandable ? false : location.pathname === item.path}
                    disabled={item.disabled}
                    onClick={item.expandable ? item.onToggle : (() => isMobile && setMobileDrawerOpen(false))}
                    sx={{
                      borderRadius: 2,
                      my: 0.5,
                      py: 1.2,
                      px: 1.5,
                      transition: 'all 0.2s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: 0,
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4,
                        transition: 'height 0.2s ease-in-out',
                        opacity: 0,
                      },
                      '&.Mui-selected': {
                        bgcolor: mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        '&::before': {
                          height: '60%',
                          opacity: 1,
                        },
                        '&:hover': {
                          bgcolor: mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.25)
                            : alpha(theme.palette.primary.main, 0.12),
                        },
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                      '&:hover': {
                        bgcolor: mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.1)
                          : alpha(theme.palette.background.paper, 0.3),
                        transform: 'translateX(4px)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: item.expandable && item.expanded
                          ? theme.palette.primary.main
                          : (location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary)
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={item.expandable && item.expanded ? 600 : 500}
                        >
                          {item.text}
                        </Typography>
                      }
                    />
                    {item.expandable && (
                      item.expanded ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>

              {item.expandable && item.subItems && (
                <Collapse in={item.expanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.subItems.map(subItem => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={subItem.path}
                          selected={location.pathname === subItem.path}
                          onClick={() => isMobile && setMobileDrawerOpen(false)}
                          sx={{
                            py: 0.8,
                            pl: 2,
                            borderRadius: 1.5,
                            mb: 0.5,
                            '&.Mui-selected': {
                              bgcolor: mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                              '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                              },
                            },
                            '&:hover': {
                              bgcolor: mode === 'dark'
                                ? alpha(theme.palette.background.paper, 0.1)
                                : alpha(theme.palette.background.paper, 0.3),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 26, fontSize: '0.9rem' }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                fontWeight={location.pathname === subItem.path ? 600 : 400}
                              >
                                {subItem.text}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} arrow>
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              borderRadius: 2,
              py: 1.2,
              px: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.1)
                  : alpha(theme.palette.background.paper, 0.3),
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: theme.palette.text.secondary
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500}>
                  {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Typography>
              }
            />
          </ListItemButton>
        </Tooltip>
      </Box>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            opacity: 0.8,
            fontWeight: 500
          }}
        >
          Dhishank System v1.2.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: mode === 'dark'
            ? `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: mode === 'dark'
            ? '0 4px 20px 0 rgba(0, 0, 0, 0.2)'
            : '0 4px 20px 0 rgba(0, 0, 0, 0.03)',
        }}
      >
        <Toolbar sx={{ height: 70, px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              sx={{
                mr: 2,
                color: theme.palette.text.primary,
                bgcolor: alpha(theme.palette.background.paper, 0.2),
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                },
                width: 40,
                height: 40
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Box
              component="img"
              src="/Dhishank Final With Compass.png"
              alt="Dhishank Logo"
              sx={{
                height: 55,
                mr: 1.5,
                display: { xs: 'none', sm: 'block' }
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                letterSpacing: '-0.01em',
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  right: -16,
                  width: 6,
                  height: 6,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                }
              }}
            >
              Dhishank Employee Portal
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {!isMobile && (
              <>
                <Button
                  onClick={handleSignOut}
                  startIcon={<ExitToAppIcon />}
                  sx={{
                    px: 2,
                    py: 1,
                    color: theme.palette.text.primary,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.2),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.3),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                  }}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={isMobile && mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: mode === 'dark'
                ? '4px 0 24px rgba(0, 0, 0, 0.3)'
                : '4px 0 24px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: mode === 'dark'
                ? '4px 0 24px rgba(0, 0, 0, 0.2)'
                : '4px 0 24px rgba(0, 0, 0, 0.03)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          mt: '70px', // AppBar height
          minHeight: 'calc(100vh - 70px)',
          background: mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.background.paper, 0.3)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.3)} 100%)`,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48.25 15c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23000000\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            opacity: mode === 'dark' ? 0.04 : 0.02,
          },
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Outlet />
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundImage: 'none',
          backgroundColor: mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.7)
            : alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            fontWeight: 500,
            fontSize: '0.75rem',
            '&::before, &::after': {
              content: '""',
              display: 'block',
              height: 1,
              width: { xs: 20, sm: 40 },
              bgcolor: alpha(theme.palette.text.secondary, 0.3),
            }
          }}
        >
          © {new Date().getFullYear()} Dhishank Employee Portal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}