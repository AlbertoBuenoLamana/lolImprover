import React from 'react';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from '../../config';

/**
 * ChampionCard
 * 
 * Card displaying a champion with its icon and name
 * 
 * @category ui
 */

export interface ChampionCardProps {
  championId: string;
  championName: string;
  onRemove?: () => void;
  onClick?: () => void;
  category?: 'blind' | 'situational' | 'test';
  showActions?: boolean;
  notes?: string;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
  version?: string;
}

const ChampionCard: React.FC<ChampionCardProps> = ({
  championId,
  championName,
  onRemove,
  onClick,
  category,
  showActions = true,
  notes,
  selected = false,
  size = 'medium',
  version = DEFAULT_DDRAGON_VERSION
}) => {
  // Calculate sizes based on the size prop
  const getCardSize = () => {
    switch(size) {
      case 'small': return { width: 80, height: 110, iconSize: 60, fontSize: '0.75rem' };
      case 'large': return { width: 140, height: 180, iconSize: 110, fontSize: '1rem' };
      default: return { width: 110, height: 140, iconSize: 80, fontSize: '0.875rem' };
    }
  };

  const cardSize = getCardSize();
  
  // Get category color
  const getCategoryColor = () => {
    switch(category) {
      case 'blind': return '#2196f3';
      case 'situational': return '#ff9800';
      case 'test': return '#9c27b0';
      default: return 'transparent';
    }
  };
  
  // Get champion image URL
  const getChampionImageUrl = () => {
    return `${DDRAGON_BASE_URL}/cdn/${version}/img/champion/${championId}.png`;
  };
  
  // Handle click on card
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };
  
  // Handle remove click
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <Card 
      sx={{ 
        width: cardSize.width, 
        height: cardSize.height,
        borderRadius: 2,
        position: 'relative',
        border: selected ? '2px solid #4caf50' : category ? `2px solid ${getCategoryColor()}` : 'none',
        boxShadow: selected ? '0 0 8px rgba(76, 175, 80, 0.6)' : 'initial',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {/* Category indicator */}
        {category && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              backgroundColor: getCategoryColor(),
              zIndex: 1
            }} 
          />
        )}
        
        <CardMedia
          component="img"
          image={getChampionImageUrl()}
          alt={championName}
          sx={{ 
            width: cardSize.iconSize,
            height: cardSize.iconSize,
            borderRadius: '50%',
            mt: 1,
            objectFit: 'cover',
            border: '2px solid #e0e0e0'
          }}
        />
        
        <CardContent sx={{ p: 1, pt: 0.5, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: cardSize.fontSize,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: cardSize.width - 16
            }}
          >
            {championName}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      {/* Action buttons */}
      {showActions && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 4,
            right: 4,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {notes && (
            <Tooltip title={notes}>
              <IconButton 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  mb: 0.5,
                  p: 0.5
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onRemove && (
            <Tooltip title="Remove">
              <IconButton 
                size="small" 
                onClick={handleRemove}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  p: 0.5
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Card>
  );
};

export default ChampionCard;
