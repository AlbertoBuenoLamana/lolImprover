import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  TablePagination,
  Avatar,
  Collapse,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import NotesIcon from '@mui/icons-material/Notes';
import { format } from 'date-fns';
import { fetchGameSessions, deleteGameSession } from '../../store/slices/gameSessionSlice';
import { RootState, AppDispatch } from '../../store';
import { GameSession } from '../../types';
import { getLatestVersion, getChampionIconUrl } from '../../services/riotDataService';

const GameSessionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Use type assertion with the correct GameSession type from types.ts
  const gameSessionState = useSelector((state: RootState) => state.gameSessions);
  const { sessions, loading, error } = gameSessionState as {
    sessions: GameSession[];
    loading: boolean;
    error: string | null;
  };
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [ddragonVersion, setDdragonVersion] = useState('15.6.1'); // Default version
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  // Function to safely extract error message
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    // If error is already a string, return it
    if (typeof error === 'string') return error;
    
    // If error is an object with a message property
    if (error.msg) return error.msg;
    
    // If error is an object with another structure, try to extract useful info
    if (typeof error === 'object') {
      if (JSON.stringify(error) !== '{}') {
        return JSON.stringify(error);
      }
    }
    
    // Fallback error message
    return 'An unexpected error occurred';
  };
  
  useEffect(() => {
    dispatch(fetchGameSessions());
    
    // Fetch the latest Data Dragon version
    const loadVersion = async () => {
      try {
        const version = await getLatestVersion();
        setDdragonVersion(version);
      } catch (error) {
        console.error('Error loading DDragon version:', error);
      }
    };
    
    loadVersion();
  }, [dispatch]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleAddSession = () => {
    navigate('/game-sessions/new');
  };
  
  const handleEditSession = (id: number) => {
    navigate(`/game-sessions/${id}`);
  };
  
  const handleDeleteSession = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this game session?')) {
      await dispatch(deleteGameSession(id));
    }
  };
  
  const toggleRowExpanded = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Convert mood rating number to emoji
  const getMoodEmoji = (rating: number) => {
    const emojis = ['😡', '😕', '😐', '🙂', '😄'];
    return emojis[rating - 1] || '❓';
  };
  
  // Get result color
  const getResultColor = (result: string) => {
    return result.toLowerCase() === 'win' ? 'success' : 'error';
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Game Sessions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSession}
          >
            Add New Session
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : sessions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No game sessions found. Click "Add New Session" to create your first game record.
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="50px"></TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Player Character</TableCell>
                    <TableCell>Enemy Character</TableCell>
                    <TableCell align="center">Result</TableCell>
                    <TableCell align="center">Mood</TableCell>
                    <TableCell align="center">Goals</TableCell>
                    <TableCell align="center">Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((session: GameSession) => (
                      <React.Fragment key={session.id}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => toggleRowExpanded(session.id)}
                            >
                              {expandedRows[session.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            {format(new Date(session.date), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={getChampionIconUrl(session.player_character, ddragonVersion)}
                                alt={session.player_character}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              {session.player_character}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={getChampionIconUrl(session.enemy_character, ddragonVersion)}
                                alt={session.enemy_character}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              {session.enemy_character}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={session.result}
                              color={getResultColor(session.result)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={`Mood: ${session.mood_rating}/5`}>
                              <Box>
                                <Typography variant="body1">
                                  {getMoodEmoji(session.mood_rating)}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            {session.goals ? Object.keys(session.goals).length : 0}
                          </TableCell>
                          <TableCell align="center">
                            {session.notes ? (
                              <Tooltip title="Has notes">
                                <NotesIcon color="primary" fontSize="small" />
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No notes
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditSession(session.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSession(session.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                            <Collapse in={expandedRows[session.id]} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 2 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                  Session Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                {/* Notes */}
                                <Card variant="outlined" sx={{ mb: 2 }}>
                                  <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                      Notes:
                                    </Typography>
                                    {session.notes ? (
                                      <Typography variant="body1">
                                        {session.notes}
                                      </Typography>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                        No notes were added for this session.
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                                
                                {/* Goals */}
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                      Goals:
                                    </Typography>
                                    {session.goals && Object.keys(session.goals).length > 0 ? (
                                      <Box component="ul" sx={{ pl: 2 }}>
                                        {Object.entries(session.goals).map(([goal, achieved], index) => (
                                          <Box component="li" key={index} sx={{ mb: 1 }}>
                                            <Typography
                                              variant="body1"
                                              sx={{
                                                textDecoration: achieved ? 'line-through' : 'none',
                                                color: achieved ? 'success.main' : 'inherit',
                                              }}
                                            >
                                              {goal} {achieved ? '✓' : ''}
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                        No goals were set for this session.
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={sessions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default GameSessionsPage;
