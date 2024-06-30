import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';


const Navigation = () => {
  const activeStyle = {
    backgroundColor: 'grey.dark', // Darker shade for active state
    color: '#fff', // White text for better visibility
    '&:hover': {
      backgroundColor: 'grey.darker', // Even darker on hover for active link
    }
  };
  return (
    <AppBar position="static" sx={{ background: '#40E0D0', boxShadow: 'none', padding: '0 20px' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '500', letterSpacing: '0.05rem' }}>
        Health Equalizer
        </Typography>
        <Button
          color="inherit"
          component={NavLink}
          to="/"
          startIcon={<HomeIcon />}
          sx={(theme) => ({
            fontWeight: '500',
            fontSize: '1rem',
            margin: '0 10px',
            textDecoration: 'none',
            color: theme.palette.common.white,
            '&.active': activeStyle,
            '&:hover': {
              backgroundColor: 'grey.light',
            },
            '&:focus': {
              backgroundColor: '#777',
            }
          })}
        >
          Health Query
        </Button>
        <Button
          color="inherit"
          component={NavLink}
          to="/providers"
          startIcon={<MapIcon />}
          sx={(theme) => ({
            fontWeight: '500',
            fontSize: '1rem',
            margin: '0 10px',
            textDecoration: 'none',
            color: theme.palette.common.white,
            '&.active': activeStyle,
            '&:hover': {
              backgroundColor: 'grey.light',
            },
            '&:focus': {
              backgroundColor: '#777',
            }
          })}
        >
          Providers Map
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;


