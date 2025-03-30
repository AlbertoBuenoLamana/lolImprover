import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/system';

// Import the logos
import logoImage from '../../assets/images/logo.png';
import logoWhiteImage from '../../assets/images/logo_white.png';

/**
 * Props for the Logo component
 */
export interface LogoProps extends Omit<BoxProps, 'component'> {
  /**
   * Size of the logo
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'full';
  
  /**
   * Variant of the logo
   * @default 'default'
   */
  variant?: 'default' | 'light' | 'dark' | 'white' | 'icon-only';
  
  /**
   * Alt text for the logo
   * @default 'LoL Improve'
   */
  alt?: string;
}

const StyledImage = styled('img')(({ theme }) => ({
  display: 'block',
  transition: 'all 0.2s ease-in-out',
}));

/**
 * A reusable logo component that displays the LoL Improve logo with consistent styling across the application
 */
const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'default',
  alt = 'LoL Improve',
  sx,
  ...props
}) => {
  // Size mappings
  const sizeMap = {
    small: { width: 32, height: 'auto' },
    medium: { width: 100, height: 'auto' },
    large: { width: 150, height: 'auto' },
    full: { width: '100%', height: 'auto' },
  };
  
  // Get logo src based on variant
  const getLogoSrc = () => {
    switch (variant) {
      case 'white':
        return logoWhiteImage;
      default:
        return logoImage;
    }
  };
  
  // Additional styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'light':
        return { filter: 'brightness(1.2)' };
      case 'dark':
        return { filter: 'brightness(0.8)' };
      case 'icon-only':
        // You could create a cropped version or apply specific styling
        return {};
      default:
        return {};
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', ...sx }} {...props}>
      <StyledImage
        src={getLogoSrc()}
        alt={alt}
        sx={{
          ...sizeMap[size],
          ...getVariantStyles(),
        }}
      />
    </Box>
  );
};

export default Logo; 