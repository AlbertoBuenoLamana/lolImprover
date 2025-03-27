import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
  Tooltip,
  alpha,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import axios from '../../api/axios';

interface VideoCategory {
  id: number;
  name: string;
  description?: string;
}

interface VideoTutorial {
  id: number;
  title: string;
  creator: string;
  url: string;
  description?: string;
  upload_date?: string;
  video_type: string;
  key_points?: string;
  tags?: string[];
  category?: VideoCategory;
  category_id?: number;
  kemono_id?: string;
  service?: string;
  creator_id?: string;
  added_date?: string;
  published_date?: string;
  creator_relation_id?: number;
  creator_obj?: {
    id: number;
    name: string;
    description?: string;
    website?: string;
  };
  is_bookmarked?: boolean;
}

interface KemonoImportResponse {
  total_videos: number;
  imported_videos: number;
  skipped_videos: number;
  videos: VideoTutorial[];
  creators_processed?: boolean;
}

interface KemonoPreviewCategory {
  [category: string]: Array<{
    title: string;
    kemono_id: string;
    url: string;
    description: string;
    key_points: string;
    tags: string[];
  }>;
}

const VideoTutorialsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for videos and categories
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for kemono import
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [creatorId, setCreatorId] = useState('');
  const [service, setService] = useState('patreon');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<KemonoImportResponse | null>(null);
  const [previewData, setPreviewData] = useState<KemonoPreviewCategory | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('published_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showWatched, setShowWatched] = useState<boolean | null>(null);
  const [showBookmarked, setShowBookmarked] = useState<boolean | null>(null);
  
  // State for creators
  const [creators, setCreators] = useState<any[]>([]);
  
  // Get token from auth state
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Fetch videos and categories on component mount
  useEffect(() => {
    fetchVideos();
    fetchCategories();
    fetchCreators();
  }, []);
  
  // Fetch videos with optional category filter
  const fetchVideos = async (categoryId?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/videos/';
      const params = new URLSearchParams();
      
      if (categoryId) {
        params.append('category_id', categoryId.toString());
      }
      
      // Request expanded response with creator objects
      params.append('expand', 'creator');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVideos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/videos/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories(response.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };
  
  // Fetch creators
  const fetchCreators = async () => {
    try {
      const response = await axios.get('/videos/creators/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCreators(response.data);
    } catch (err: any) {
      console.error('Error fetching creators:', err);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<{}>, newValue: number | null) => {
    setSelectedCategory(newValue);
    fetchVideos(newValue === null || newValue === 0 ? undefined : newValue);
  };
  
  // Preview videos from kemono.su
  const handlePreviewVideos = async () => {
    if (!creatorId) return;
    
    setPreviewLoading(true);
    setPreviewData(null);
    
    try {
      const response = await axios.get(`/videos/kemono/preview/${creatorId}?service=${service}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPreviewData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to preview videos');
      console.error('Error previewing videos:', err);
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Import videos from kemono.su
  const handleImportVideos = async () => {
    if (!creatorId) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      // Create category mapping
      const categoryMapping: Record<string, number> = {};
      
      // Add mappings for standard categories if they exist
      const fundamentalsCategory = categories.find(c => c.name === 'Fundamentals');
      const earlyGameCategory = categories.find(c => c.name === 'Early Game Course');
      const midgameCategory = categories.find(c => c.name === 'Midgame Course');
      const classesCategory = categories.find(c => c.name === 'Classes');
      const practicalCategory = categories.find(c => c.name === 'Practical Course');
      
      if (fundamentalsCategory) categoryMapping['Snowball fundamentals'] = fundamentalsCategory.id;
      if (earlyGameCategory) categoryMapping['Early game 1v9 course'] = earlyGameCategory.id;
      if (midgameCategory) categoryMapping['Midgame course'] = midgameCategory.id;
      if (classesCategory) categoryMapping['Ganking & Playing for wincon class'] = classesCategory.id;
      if (practicalCategory) categoryMapping['Practical course'] = practicalCategory.id;
      
      const response = await axios.post('/videos/kemono/import', {
        creator_id: creatorId,
        service,
        category_mapping: categoryMapping
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setImportResult(response.data);
      
      // Refresh videos list and creators list
      fetchVideos(selectedCategory === null || selectedCategory === 0 ? undefined : selectedCategory);
      fetchCreators(); // Refresh the creators list after import
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to import videos');
      console.error('Error importing videos:', err);
    } finally {
      setImporting(false);
    }
  };
  
  // Create default categories if they don't exist
  const createDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Fundamentals', description: 'Fundamental League of Legends concepts' },
      { name: 'Early Game Course', description: 'Early game strategy and execution' },
      { name: 'Midgame Course', description: 'Midgame decision making and objectives' },
      { name: 'Classes', description: 'Specialized class videos on specific topics' },
      { name: 'Practical Course', description: 'Practical applications and examples' },
    ];
    
    try {
      setLoading(true);
      
      // Check if categories exist, otherwise create them
      for (const category of defaultCategories) {
        if (!categories.some(c => c.name === category.name)) {
          await axios.post('/videos/categories/', category, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      // Refresh categories
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create categories');
      console.error('Error creating categories:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle video play
  const handlePlayVideo = (videoId: number) => {
    navigate(`/video-tutorials/${videoId}`);
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const videoId = url?.split('v=')[1]?.split('&')[0];
    return videoId || '';
  };
  
  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };
  
  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Toggle filter panel
  const handleToggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  // Apply filters function
  const applyFilters = () => {
    setLoading(true);
    setError(null);
    
    let url = '/videos/';
    const params = new URLSearchParams();
    
    // Apply category filter if selected
    if (selectedCategory && selectedCategory > 0) {
      params.append('category_id', selectedCategory.toString());
    }
    
    // Apply search term if provided
    if (searchTerm) {
      params.append('title', searchTerm);
    }
    
    // Apply creator filter if selected
    if (selectedCreator) {
      params.append('creator_id', selectedCreator);
    }
    
    // Apply tag filter if selected
    if (selectedTag) {
      params.append('tag', selectedTag);
    }
    
    // Apply sort options
    params.append('sort_by', sortBy);
    params.append('sort_order', sortOrder);
    
    // Request expanded response with creator objects
    params.append('expand', 'creator');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setVideos(response.data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.response?.data?.detail || 'Failed to fetch videos');
      setLoading(false);
      console.error('Error fetching videos:', err);
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('published_date');
    setSortOrder('desc');
    setSelectedCreator('');
    setSelectedTag('');
    setShowWatched(null);
    setShowBookmarked(null);
    
    // Refresh videos with just the category filter
    fetchVideos(selectedCategory === null || selectedCategory === 0 ? undefined : selectedCategory);
  };

  // Simple client-side filtering for quick search results
  const filteredVideos = videos.filter(video => 
    searchTerm ? (
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (video.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false)
    ) : true
  );

  // Add a function to toggle bookmark status
  const toggleBookmark = async (videoId: number, isBookmarked: boolean) => {
    try {
      await axios.post(`/videos/${videoId}/progress`, {
        is_bookmarked: !isBookmarked
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh the videos list to get updated bookmark status
      fetchVideos(selectedCategory === null || selectedCategory === 0 ? undefined : selectedCategory);
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark status');
    }
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
              startIcon={<CloudDownloadIcon />}
              onClick={() => setImportDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Import from Kemono
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/video-tutorials/new')}
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
        
        {/* Categories Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Videos" value={0} />
            {categories.map((category) => (
              <Tab key={category.id} label={category.name} value={category.id} />
            ))}
            
            {/* Add setup button at the end */}
            <Tab 
              label="Setup Categories" 
              value={null}
              icon={<AddIcon />} 
              iconPosition="end"
              onClick={(e) => {
                e.stopPropagation();
                createDefaultCategories();
              }}
              sx={{ marginLeft: 'auto' }}
            />
          </Tabs>
        </Paper>
        
        {/* Add this search and filter section after the category tabs */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search videos..."
            value={searchTerm}
            onChange={handleSearchChange}
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
            onClick={applyFilters}
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
                    onChange={(e) => setSortBy(e.target.value)}
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
                    onChange={(e) => setSortOrder(e.target.value)}
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
                    onChange={(e) => setSelectedCreator(e.target.value)}
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
                    onChange={(e) => setSelectedTag(e.target.value)}
                    label="Tag"
                  >
                    <MenuItem value="">All Tags</MenuItem>
                    {Array.from(new Set(videos.flatMap(video => video.tags || []))).map((tag, idx) => (
                      <MenuItem key={idx} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={resetFilters} sx={{ mr: 1 }}>
                    Reset
                  </Button>
                  <Button variant="contained" onClick={applyFilters}>
                    Apply
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : videos.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No videos found. Add videos or import from Kemono.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      position: 'relative',
                      height: 0,
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      backgroundColor: '#000',
                      overflow: 'hidden',
                    }}
                    image={video.video_type === 'direct' ? '' : getYouTubeThumbnail(video.url)}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconButton
                        color="primary"
                        sx={{
                          bgcolor: alpha('#fff', 0.1),
                          '&:hover': {
                            bgcolor: alpha('#fff', 0.2),
                          },
                          padding: 2,
                        }}
                        onClick={() => handlePlayVideo(video.id)}
                      >
                        <PlayArrowIcon sx={{ fontSize: 50 }} />
                      </IconButton>
                    </Box>
                    
                    {video.category && (
                      <Chip
                        label={video.category.name}
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: alpha('#000', 0.7),
                        }}
                      />
                    )}
                  </CardMedia>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Tooltip title={video.title}>
                      <Typography variant="h6" gutterBottom component="div" noWrap>
                        {video.title}
                      </Typography>
                    </Tooltip>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {video.creator || 'Unknown Creator'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {video.description || 'No description available'}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handlePlayVideo(video.id)}
                    >
                      Watch
                    </Button>
                    <Button 
                      size="small"
                      onClick={() => navigate(`/video-tutorials/edit/${video.id}`)}
                    >
                      Edit
                    </Button>
                    <IconButton 
                      color="primary"
                      onClick={() => toggleBookmark(video.id, video.is_bookmarked || false)}
                      aria-label={video.is_bookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                      {video.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Kemono Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setPreviewData(null);
          setImportResult(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Videos from Kemono.su</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              Import videos from a creator on Kemono.su. Enter the creator ID and service.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This process will automatically create creator entities for imported videos.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={8}>
                <TextField
                  label="Creator ID"
                  fullWidth
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  placeholder="e.g. 66222987"
                  helperText="The numeric ID of the creator on Kemono.su"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    label="Service"
                  >
                    <MenuItem value="patreon">Patreon</MenuItem>
                    <MenuItem value="fanbox">Fanbox</MenuItem>
                    <MenuItem value="gumroad">Gumroad</MenuItem>
                    <MenuItem value="subscribestar">SubscribeStar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handlePreviewVideos}
                disabled={!creatorId || previewLoading}
                startIcon={previewLoading ? <CircularProgress size={20} /> : <FilterListIcon />}
              >
                Preview Videos
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleImportVideos}
                disabled={!creatorId || importing}
                startIcon={importing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              >
                Import Videos
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Preview Results */}
          {previewLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {previewData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Preview Results
              </Typography>
              
              {Object.entries(previewData).map(([category, videos]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {category} ({videos.length} videos)
                  </Typography>
                  
                  {videos.length > 0 ? (
                    <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                      {videos.map((video, index) => (
                        <Box key={video.kemono_id} sx={{ mb: 1, p: 1, bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover' }}>
                          <Typography variant="body2" noWrap>
                            {video.title}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No videos in this category
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
          
          {/* Import Results */}
          {importResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Import Results
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                Successfully imported {importResult.imported_videos} videos. Skipped {importResult.skipped_videos} existing videos.
              </Alert>
              
              <Typography variant="body2" gutterBottom>
                Total videos: {importResult.total_videos}
              </Typography>
              
              {importResult.creators_processed ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Creator entities were automatically created and linked to videos.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Creator entities were not processed automatically. You may need to run the creator migration manually.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VideoTutorialsPage; 