import React from 'react';
import { Box, Typography, Link, Container, Stack } from '@mui/material';
import Logo from '../Ui/Logo';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme: any) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Stack 
          direction="column" 
          spacing={2} 
          alignItems="center"
        >
          <Logo size="small" variant="default" />
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' '}
            <Link color="inherit" href="/">
              LoL Improve
            </Link>
            {' - Track your League of Legends performance'}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
