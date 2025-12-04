import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const DashboardWidget = ({ title, value, icon, color, onClick }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          borderColor: color,
        } : {},
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: '800', color: '#1a1a1a', mt: 1 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{
        backgroundColor: `${color}15`, // Más sutil
        p: 2,
        borderRadius: '16px',
        display: 'flex',
        color: color,
        position: 'relative',
        zIndex: 1
      }}>
        {icon}
      </Box>
      {/* Elemento decorativo de fondo */}
      <Box sx={{
        position: 'absolute',
        right: -20,
        bottom: -20,
        width: 100,
        height: 100,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.05,
        zIndex: 0
      }} />
    </Paper>
  );
};

export default DashboardWidget;