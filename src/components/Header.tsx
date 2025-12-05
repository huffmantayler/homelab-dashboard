import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    InputBase,
    Box,
    Avatar,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useData } from '../contexts/DataContext';
import { useAuth } from 'react-oidc-context';

const drawerWidth = 240;

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.05),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

interface HeaderProps {
    handleDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle }) => {
    const { alerts } = useData();
    const auth = useAuth();

    // Debugging: Log user profile to see available claims
    React.useEffect(() => {
        if (auth.user) {
            console.log("User Profile:", auth.user.profile);
        }
    }, [auth.user]);

    // Notifications Menu State
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // User Modal State
    const [userModalOpen, setUserModalOpen] = React.useState(false);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUserClick = () => {
        setUserModalOpen(true);
    };

    const handleUserModalClose = () => {
        setUserModalOpen(false);
    };

    const handleLogout = () => {
        handleUserModalClose();
        auth.signoutRedirect();
    };

    // Improved Initials Logic
    const getInitials = () => {
        const profile = auth.user?.profile;
        if (!profile) return 'U';

        if (profile.given_name && profile.family_name) {
            return `${profile.given_name.charAt(0)}${profile.family_name.charAt(0)}`.toUpperCase();
        }

        if (profile.name) {
            const parts = profile.name.split(' ');
            if (parts.length >= 2) {
                return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
            }
            return profile.name.charAt(0).toUpperCase();
        }

        if (profile.preferred_username) {
            return profile.preferred_username.charAt(0).toUpperCase();
        }

        return 'U';
    };

    const userInitials = getInitials();
    const userName = auth.user?.profile.name || auth.user?.profile.preferred_username || 'User';
    const userEmail = auth.user?.profile.email || '';

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                    Dashboard
                </Typography>

                <Search>
                    <SearchIconWrapper>
                        <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search..."
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </Search>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        color="inherit"
                        onClick={handleMenuClick}
                        aria-controls={open ? 'alert-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Badge badgeContent={alerts.length} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <Menu
                        id="alert-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'alert-button',
                        }}
                        PaperProps={{
                            style: {
                                maxHeight: 400,
                                width: '350px',
                            },
                        }}
                    >
                        {alerts.length === 0 ? (
                            <MenuItem onClick={handleMenuClose}>No new alerts</MenuItem>
                        ) : (
                            alerts.map((alert) => (
                                <MenuItem key={alert.id} onClick={handleMenuClose} sx={{ whiteSpace: 'normal' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" color={alert.type === 'error' ? 'error' : 'warning.main'}>
                                            {alert.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {alert.timestamp.toLocaleTimeString()}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        )}
                    </Menu>

                    {/* User Profile Section */}
                    <IconButton
                        onClick={handleUserClick}
                        sx={{ p: 0 }}
                    >
                        <Avatar alt={userName} sx={{ bgcolor: 'secondary.main' }}>
                            {userInitials}
                        </Avatar>
                    </IconButton>

                    {/* User Profile Modal */}
                    <Dialog open={userModalOpen} onClose={handleUserModalClose} maxWidth="xs" fullWidth>
                        <DialogTitle>User Profile</DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                                <Avatar alt={userName} sx={{ width: 80, height: 80, bgcolor: 'secondary.main', fontSize: '2rem' }}>
                                    {userInitials}
                                </Avatar>
                                <Typography variant="h5">{userName}</Typography>
                                <Typography variant="body1" color="text.secondary">{userEmail}</Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleUserModalClose}>Close</Button>
                            <Button onClick={handleLogout} color="error" variant="contained">Logout</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
