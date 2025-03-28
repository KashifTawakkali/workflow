import React, { useEffect, useState } from 'react';
import { getWorkflows, Workflow } from '../services/workflowService';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Add as AddIcon,
  KeyboardArrowDown,
  ExpandMore,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PushPin as PinIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  ContentCopy,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

interface ExtendedWorkflow extends Workflow {
  isPinned?: boolean;
  status?: 'passed' | 'failed';
  lastEditedBy?: string;
  executionHistory?: {
    date: string;
    status: 'passed' | 'failed';
    method?: string;
    url?: string;
    headers?: string;
    body?: string;
  }[];
  configuration?: {
    method: string;
    url: string;
    headers: string;
    body: string;
  };
}

const WorkflowList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, setWorkflows] = useState<ExtendedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ExtendedWorkflow | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [configuredWorkflow, setConfiguredWorkflow] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await getWorkflows();
      // Add default values for the extended properties
      const extendedData = data.map(workflow => ({
        ...workflow,
        isPinned: false,
        status: 'passed' as const,
        lastEditedBy: 'System',
        executionHistory: [
          { date: '28/05 - 22:43 IST', status: 'passed' as const },
          { date: '28/05 - 22:43 IST', status: 'failed' as const },
          { date: '28/05 - 22:43 IST', status: 'failed' as const },
        ]
      }));
      setWorkflows(extendedData);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleExecute = (workflow: ExtendedWorkflow) => {
    if (!workflow.configuration) {
      // Show error message if not configured
      setSnackbar({
        open: true,
        message: 'Please configure the workflow before executing',
        severity: 'error'
      });
      return;
    }
    setSelectedWorkflow(workflow);
    setShowExecuteModal(true);
  };

  const handleConfirmExecution = () => {
    // Add execution logic here
    setShowExecuteModal(false);
    setSelectedWorkflow(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workflow: ExtendedWorkflow) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkflow(workflow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkflow(null);
  };

  const handleEdit = (workflowId: string) => {
    if (workflowId) {
      navigate(`/workflows/${workflowId}/edit`);
    }
  };

  const togglePin = (workflowId: string | undefined) => {
    if (!workflowId) return;
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, isPinned: !w.isPinned } : w
    ));
  };

  const handleExpandClick = (workflowId: string | undefined) => {
    if (!workflowId) return;
    setExpandedWorkflow(expandedWorkflow === workflowId ? null : workflowId);
  };

  const handleConfigClick = (workflowId: string | undefined) => {
    if (!workflowId) return;
    setConfiguredWorkflow(workflowId);
  };

  const handleSaveConfiguration = (workflowId: string, config: any) => {
    setWorkflows(workflows.map(w => {
      if (w.id === workflowId) {
        return {
          ...w,
          configuration: config,
          executionHistory: [
            {
              date: new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Asia/Kolkata'
              }).replace(',', ' -') + ' IST',
              status: 'passed',
              ...config
            },
            ...(w.executionHistory || [])
          ]
        };
      }
      return w;
    }));
    setConfiguredWorkflow(null);
  };

  const filteredWorkflows = workflows.filter(workflow =>
    (workflow.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (workflow.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWorkflows.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: 'passed' | 'failed' | undefined) => {
    return status === 'passed' ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (status: 'passed' | 'failed' | undefined) => {
    return status === 'passed' ? (
      <CheckCircleIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
    ) : (
      <CancelIcon sx={{ fontSize: 16, color: '#F44336' }} />
    );
  };

  const handleCreateNewProcess = () => {
    navigate('/workflows/new');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <IconButton
            sx={{
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '8px',
              color: '#666',
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '20px', md: '24px' },
              fontWeight: 600,
              color: '#333',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Workflow Builder
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleCreateNewProcess}
          sx={{
            bgcolor: '#1A1A1A',
            color: 'white',
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '6px',
            px: 2.5,
            py: 1,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              bgcolor: '#000',
            },
          }}
        >
          + Create New Process
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search By Workflow Name/ID"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: '100%', sm: '320px' },
            '& .MuiOutlinedInput-root': {
              height: { xs: '48px', sm: '40px' },
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              '& fieldset': {
                borderColor: '#E5E5E5',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              }
            }
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{ 
            display: { xs: 'none', md: 'block' },
            boxShadow: 'none',
            border: '1px solid #E5E5E5',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  py: 2
                }}>
                  Workflow Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  py: 2
                }}>
                  ID
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  py: 2
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  py: 2
                }}>
                  Last Edited On
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  py: 2
                }}>
                  Description
                </TableCell>
                <TableCell sx={{ width: '280px', py: 2 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((workflow) => (
                <React.Fragment key={workflow.id}>
                  <TableRow 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: '#FAFAFA'
                      },
                      position: 'relative'
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        width: '40px',
                        p: 0,
                        position: 'relative'
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => handleConfigClick(workflow.id)}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%) rotate(-90deg)',
                          transformOrigin: 'left center',
                          minWidth: '120px',
                          height: '32px',
                          backgroundColor: workflow.configuration ? '#E3F2FD' : '#F5F5F5',
                          color: workflow.configuration ? '#1976D2' : '#666',
                          border: '1px solid',
                          borderColor: workflow.configuration ? '#1976D2' : '#E5E5E5',
                          textTransform: 'none',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '13px',
                          fontWeight: 500,
                          borderRadius: '4px',
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: workflow.configuration ? '#E3F2FD' : '#F5F5F5',
                            borderColor: workflow.configuration ? '#1565C0' : '#666',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        Configuration
                      </Button>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '14px',
                        py: 2,
                        pl: 5
                      }}
                    >
                      {workflow.name}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: "'Inter', sans-serif", 
                      color: '#666',
                      fontSize: '14px',
                      py: 2
                    }}>
                      {workflow.id}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: "'Inter', sans-serif", 
                      fontSize: '14px',
                      py: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getStatusIcon(workflow.status)}
                        <Typography sx={{ 
                          fontSize: '13px',
                          color: getStatusColor(workflow.status),
                          fontWeight: 500
                        }}>
                          {workflow.status ? workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1) : 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: "'Inter', sans-serif", 
                      color: '#666',
                      fontSize: '14px',
                      py: 2
                    }}>
                      {workflow.lastEditedBy} | {formatDate(workflow.updatedAt)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: "'Inter', sans-serif", 
                      color: '#666',
                      fontSize: '14px',
                      py: 2
                    }}>
                      {workflow.description}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          onClick={() => togglePin(workflow.id)}
                          sx={{ 
                            color: workflow.isPinned ? '#F4B400' : '#666',
                            padding: '6px',
                            transform: 'rotate(45deg)',
                            '&:hover': {
                              color: workflow.isPinned ? '#F4B400' : '#1A1A1A'
                            }
                          }}
                        >
                          <PinIcon fontSize="small" />
                        </IconButton>
                        <Button
                          variant="outlined"
                          onClick={() => handleExecute(workflow)}
                          sx={{
                            color: '#666',
                            borderColor: '#E5E5E5',
                            textTransform: 'none',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            py: 0.75,
                            minWidth: '80px',
                            '&:hover': {
                              borderColor: '#666',
                              bgcolor: 'transparent'
                            }
                          }}
                        >
                          Execute
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => workflow.id && handleEdit(workflow.id)}
                          sx={{
                            color: '#666',
                            borderColor: '#E5E5E5',
                            textTransform: 'none',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: '6px',
                            py: 0.75,
                            minWidth: '80px',
                            '&:hover': {
                              borderColor: '#666',
                              bgcolor: 'transparent'
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, workflow)}
                          sx={{ 
                            color: '#666',
                            padding: '6px'
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleExpandClick(workflow.id)}
                          sx={{ 
                            color: '#666',
                            padding: '6px',
                            transform: expandedWorkflow === workflow.id ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <ExpandMore fontSize="small" sx={{ transform: 'scale(1.2)' }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {expandedWorkflow === workflow.id && (
                    <TableRow>
                      <TableCell 
                        colSpan={6}
                        sx={{ 
                          py: 2,
                          backgroundColor: '#FAFAFA',
                          borderBottom: '1px solid #E5E5E5'
                        }}
                      >
                        <Box sx={{ pl: 4 }}>
                          {workflow.executionHistory?.map((execution, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: index !== (workflow.executionHistory?.length || 0) - 1 ? 2 : 0
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: '#FF5722',
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  color: '#666',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                {execution.date}
                              </Typography>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: '4px',
                                  backgroundColor: execution.status === 'passed' ? '#E8F5E9' : '#FFEBEE',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: '12px',
                                    color: execution.status === 'passed' ? '#4CAF50' : '#F44336',
                                    fontWeight: 500,
                                    fontFamily: "'Inter', sans-serif",
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {execution.status}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                sx={{
                                  p: 0.5,
                                  color: '#666',
                                  '&:hover': {
                                    backgroundColor: 'transparent',
                                    color: '#333'
                                  }
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {workflows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ py: 2, color: '#666' }}>
                      No workflows found. Create your first workflow!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3 }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>

      <Dialog
        open={showExecuteModal}
        onClose={() => setShowExecuteModal(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: { xs: '90%', sm: '480px' },
            p: 0,
            m: { xs: 2, sm: 0 }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ 
            textAlign: 'center',
            fontSize: '16px',
            color: '#333',
            fontWeight: 500,
            mb: 1
          }}>
            Are You Sure You Want To Execute The Process '{selectedWorkflow?.name}'?
          </Typography>
          <Typography sx={{ 
            textAlign: 'center',
            fontSize: '14px',
            color: '#F44336',
            mb: 3
          }}>
            You Cannot Undo This Step
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 2 
          }}>
            <Button
              onClick={() => setShowExecuteModal(false)}
              variant="outlined"
              sx={{
                color: '#666',
                borderColor: '#E5E5E5',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '4px',
                px: 3,
                '&:hover': {
                  borderColor: '#666',
                  bgcolor: 'transparent'
                }
              }}
            >
              No
            </Button>
            <Button
              onClick={handleConfirmExecution}
              variant="contained"
              sx={{
                bgcolor: '#1A1A1A',
                color: 'white',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '4px',
                px: 3,
                '&:hover': {
                  bgcolor: '#000'
                }
              }}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '8px',
            border: '1px solid #E5E5E5',
            minWidth: { xs: '200px', sm: '160px' },
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={handleMenuClose}
          sx={{ 
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: '#D32F2F',
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: '#FAFAFA'
            }
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={configuredWorkflow !== null}
        onClose={() => setConfiguredWorkflow(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: { xs: '90%', sm: '480px' },
            p: 0,
            m: { xs: 2, sm: 0 }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography sx={{ 
            fontSize: '18px',
            color: '#333',
            fontWeight: 600,
            mb: 3
          }}>
            Configuration
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
                Method
              </Typography>
              <TextField
                select
                fullWidth
                defaultValue="GET"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E5E5',
                    },
                  },
                }}
              >
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </TextField>
            </Box>
            <Box>
              <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
                URL
              </Typography>
              <TextField
                fullWidth
                placeholder="Type here.."
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E5E5',
                    },
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
                Headers
              </Typography>
              <TextField
                fullWidth
                placeholder="Header Name"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E5E5',
                    },
                  },
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
                Body
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter Descriptions..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#E5E5E5',
                    },
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 2,
            mt: 3
          }}>
            <Button
              onClick={() => setConfiguredWorkflow(null)}
              sx={{
                color: '#666',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#333',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const config = {
                  method: 'GET',
                  url: 'https://api.example.com',
                  headers: '{}',
                  body: ''
                };
                if (configuredWorkflow) {
                  handleSaveConfiguration(configuredWorkflow, config);
                }
              }}
              variant="contained"
              sx={{
                bgcolor: '#1A1A1A',
                color: 'white',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                '&:hover': {
                  bgcolor: '#000'
                }
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkflowList; 