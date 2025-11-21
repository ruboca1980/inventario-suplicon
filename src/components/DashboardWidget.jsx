import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const DashboardWidget = ({ title, value, icon, color, onClick }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
        borderLeft: `6px solid ${color}`, // Una línea de color elegante a la izquierda
      }}
      onClick={onClick}
    >
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#333' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        backgroundColor: `${color}20`, // Color con 20% de opacidad
        p: 1.5, 
        borderRadius: '50%', 
        display: 'flex', 
        color: color 
      }}>
        {icon}
      </Box>
    </Paper>
  );
};

export default DashboardWidget;