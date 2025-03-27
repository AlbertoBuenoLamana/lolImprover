import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  fetchVideos, 
  importVideos, 
  fetchRecentlyWatched, 
  fetchBookmarkedVideos, 
  searchVideos,
  updateVideoProgress,
  fetchCategories,
  fetchCreators,
} from '../../store/slices/videoSlice';
import { VideoTutorial, VideoProgress } from '../../types';
import { RootState, AppDispatch } from '../../store';

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`videos-tabpanel-${index}`}
      aria-labelledby={`videos-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `videos-tab-${index}`,
    'aria-controls': `videos-tabpanel-${index}`,
  };
}

const VideosPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { 
    videos, 
    loading, 
    error, 
    categories,
    creators
  } = useSelector(
    (state: RootState) => state.videos
  );
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('published_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showWatched, setShowWatched] = useState<boolean | null>(null);
  const [showBookmarked, setShowBookmarked] = useState<boolean | null>(null);
  
  // Fetch data based on active tab
  useEffect(() => {
    if (tabValue === 0) {
      // All videos - apply other filters but not category filter
      dispatch(fetchVideos({
        sort_by: sortBy,
        sort_order: sortOrder,
        creator: selectedCreator || undefined, 
        tag: selectedTag || undefined,
      }));
    } else if (tabValue > 0 && categories.length >= tabValue) {
      // Category tab selected - filter by that category
      const categoryId = categories[tabValue - 1]?.id;
      if (categoryId) {
        dispatch(fetchVideos({
          sort_by: sortBy,
          sort_order: sortOrder,
          creator: selectedCreator || undefined,
          category_id: categoryId,
          tag: selectedTag || undefined,
        }));
      }
    }
  }, [dispatch, tabValue, sortBy, sortOrder, selectedCreator, selectedTag, categories]);
  
  // Fetch additional data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCreators());
  }, [dispatch]);
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleViewVideo = (id: number) => {
    navigate(`/videos/${id}`);
  };
  
  const handleImportDialogOpen = () => {
    setImportDialogOpen(true);
  };
  
  const handleImportDialogClose = () => {
    setImportDialogOpen(false);
    setJsonContent('');
  };
  
  const handleImportVideos = () => {
    try {
      const videosData = JSON.parse(jsonContent);
      dispatch(importVideos(videosData));
      handleImportDialogClose();
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  };

  const handleToggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as string);
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as string);
  };
  
  const handleAdvancedSearch = () => {
    dispatch(searchVideos({
      q: searchTerm || undefined,
      creator_id: selectedCreator ? Number(selectedCreator) : undefined,
      category_id: tabValue > 0 ? categories[tabValue - 1]?.id : undefined,
      tags: selectedTag ? [selectedTag] : undefined,
      watched: showWatched === null ? undefined : showWatched,
      bookmarked: showBookmarked === null ? undefined : showBookmarked,
      sort_by: sortBy,
      sort_order: sortOrder
    }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSortBy('published_date');
    setSortOrder('desc');
    setSelectedCreator('');
    setSelectedTag('');
    setShowWatched(null);
    setShowBookmarked(null);
    // Don't reset tabValue since it controls the category display
    dispatch(fetchVideos({
      category_id: tabValue > 0 ? categories[tabValue - 1]?.id : undefined
    }));
  };

  const handleToggleBookmark = (videoId: number, isCurrentlyBookmarked: boolean) => {
    dispatch(updateVideoProgress({
      videoId,
      progressData: { 
        is_bookmarked: !isCurrentlyBookmarked 
      } as any // Use type assertion to bypass type check
    }));
  };
  
  // Filter videos based on search term (client-side filtering for simple searches)
  const filteredVideos = videos.filter((video: VideoTutorial) =>
    searchTerm ? (
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (video.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false)
    ) : true
  );
  
  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId || '';
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Video Tutorials
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={handleImportDialogOpen}
              sx={{ mr: 2 }}
            >
              Import from Kemono
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/videos/new')}
            >
              Add Video
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Category tabs that match the screenshot */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="video categories" 
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="ALL VIDEOS" {...a11yProps(0)} />
            {categories.map((category, index) => (
              <Tab key={category.id} label={category.name.toUpperCase()} {...a11yProps(index + 1)} />
            ))}
            <Tab 
              icon={<AddIcon fontSize="small" />} 
              aria-label="setup categories" 
              onClick={(e) => {e.stopPropagation(); navigate('/videos/categories');}}
              sx={{ minWidth: 'auto' }}
            />
          </Tabs>
        </Box>

        {/* Search and filter container */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search videos..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />} 
            onClick={handleToggleFilters}
            size="medium"
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAdvancedSearch}
            size="medium"
          >
            Search
          </Button>
        </Box>
        
        {/* Advanced filters panel */}
        <Accordion expanded={filtersOpen} onChange={handleToggleFilters} sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Advanced Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-by-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    value={sortBy}
                    onChange={handleSortByChange}
                    label="Sort By"
                  >
                    <MenuItem value="published_date">Published Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="creator">Creator</MenuItem>
                    <MenuItem value="last_watched">Last Watched</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-order-label">Sort Order</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    value={sortOrder}
                    onChange={handleSortOrderChange}
                    label="Sort Order"
                  >
                    <MenuItem value="desc">Newest First</MenuItem>
                    <MenuItem value="asc">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="creator-label">Creator</InputLabel>
                  <Select
                    labelId="creator-label"
                    value={selectedCreator}
                    onChange={(e) => setSelectedCreator(e.target.value as string)}
                    label="Creator"
                  >
                    <MenuItem value="">All Creators</MenuItem>
                    {creators.map((creator) => (
                      <MenuItem key={creator.id} value={creator.id.toString()}>
                        {creator.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="tag-label">Tag</InputLabel>
                  <Select
                    labelId="tag-label"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value as string)}
                    label="Tag"
                  >
                    <MenuItem value="">All Tags</MenuItem>
                    {Array.from(new Set(videos.flatMap(video => video.tags || []))).map((tag, idx) => (
                      <MenuItem key={idx} value={tag.toString()}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showWatched === true}
                      indeterminate={showWatched === null}
                      onChange={() => {
                        if (showWatched === null) setShowWatched(true);
                        else if (showWatched === true) setShowWatched(false);
                        else setShowWatched(null);
                      }}
                    />
                  }
                  label="Watched"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showBookmarked === true}
                      indeterminate={showBookmarked === null}
                      onChange={() => {
                        if (showBookmarked === null) setShowBookmarked(true);
                        else if (showBookmarked === true) setShowBookmarked(false);
                        else setShowBookmarked(null);
                      }}
                    />
                  }
                  label="Bookmarked"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={handleResetFilters} sx={{ mr: 1 }}>
                    Reset
                  </Button>
                  <Button variant="contained" onClick={handleAdvancedSearch}>
                    Apply
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Videos grid display */}
        {renderVideoGrid(filteredVideos)}
      
        {/* Import Videos Dialog */}
        <Dialog open={importDialogOpen} onClose={handleImportDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Import from Kemono</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Paste JSON array of videos to import. Each video should have title, url, creator, and video_type fields.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={jsonContent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJsonContent(e.target.value)}
              placeholder='[{"title": "Example Video", "url": "https://youtube.com/watch?v=example", "creator": "Creator Name", "video_type": "guide", "description": "Optional description", "tags": ["tag1", "tag2"]}]'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImportDialogClose}>Cancel</Button>
            <Button 
              onClick={handleImportVideos}
              variant="contained" 
              color="primary"
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
  
  // Helper function to render the video grid
  function renderVideoGrid(videos: VideoTutorial[]) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (videos.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm
              ? 'No videos found matching your search criteria.'
              : 'No videos available in this category. Add your first video or import a collection.'}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {videos.map((video: VideoTutorial) => (
          <Grid item key={video.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%', // 16:9 aspect ratio
                  position: 'relative',
                  bgcolor: 'rgba(0, 0, 0, 0.08)',
                }}
                image={`https://img.youtube.com/vi/${getYouTubeVideoId(video.url)}/hqdefault.jpg`}
              >
                {typeof video.progress === 'object' && video.progress?.is_watched && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'success.main',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'white' }} />
                  </Box>
                )}
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ mr: 2 }}>
                    {video.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {video.description && video.description.length > 100
                    ? `${video.description.substring(0, 100)}...`
                    : video.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {video.tags && video.tags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleViewVideo(video.id)}
                >
                  Watch
                </Button>
                <IconButton 
                  color={typeof video.progress === 'object' && (video.progress as any)?.is_bookmarked ? 'primary' : 'default'}
                  onClick={() => handleToggleBookmark(
                    video.id, 
                    typeof video.progress === 'object' && !!(video.progress as any)?.is_bookmarked
                  )}
                >
                  <BookmarkIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default VideosPage;
