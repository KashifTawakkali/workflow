import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/reactflow.css';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Dialog,
  TextField,
  DialogContent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  Close as CloseIcon,
  ContentCopy,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { saveWorkflow } from '../services/workflowService';
import NodeSelector from '../components/NodeSelector';
import ApiCallConfig from '../components/ApiCallConfig';
import EmailConfig from '../components/EmailConfig';

const initialNodes: Node[] = [
  {
    id: 'start',
    position: { x: 350, y: 100 },
    data: { label: 'Start' },
    type: 'startEnd',
    className: 'start-node'
  },
  {
    id: 'add-1',
    position: { x: 368, y: 250 },
    data: { label: '+' },
    type: 'add',
    className: 'add-node'
  },
  {
    id: 'end',
    position: { x: 350, y: 400 },
    data: { label: 'End' },
    type: 'startEnd',
    className: 'end-node'
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'start',
    target: 'add-1',
    type: 'default',
    style: { stroke: '#E5E5E5', strokeWidth: 1 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#E5E5E5',
      width: 12,
      height: 12,
    },
  },
  {
    id: 'e2-3',
    source: 'add-1',
    target: 'end',
    type: 'default',
    style: { stroke: '#E5E5E5', strokeWidth: 1 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#E5E5E5',
      width: 12,
      height: 12,
    },
  },
];

const StartEndNode = ({ data }: { data: { label: string } }) => {
  const isStart = data.label === 'Start';
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: isStart ? '#8BC34A' : '#F44336',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 500,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        border: 'none'
      }}
    >
      {data.label}
    </div>
  );
};

const AddNode = ({ data }: { data: { label: string } }) => {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '20px',
        cursor: 'pointer',
        border: '1px solid #E5E5E5',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {data.label}
    </div>
  );
};

const nodeTypes = {
  startEnd: StartEndNode,
  add: AddNode,
};

const defaultEdgeOptions = {
  style: { stroke: '#E5E5E5', strokeWidth: 1 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#E5E5E5',
    width: 12,
    height: 12,
  },
};

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);
  const [executionHistory, setExecutionHistory] = useState<{
    [nodeId: string]: {
      status: 'passed' | 'failed';
      timestamp: string;
      method?: string;
      url?: string;
      headers?: string;
      body?: string;
      response?: any;
      error?: string;
    }[];
  }>({});

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.type === 'add') {
      setSelectedNode(node);
      setShowNodeSelector(true);
      setNodeSelectorPosition(node.position);
    } else if (node.type === 'default') {
      setSelectedNode(node);
      setShowApiConfig(true);
    }
  };

  const handleAddNode = (nodeType: string) => {
    if (!selectedNode) return;

    const addNode = nodes.find(n => n.id === selectedNode.id);
    if (!addNode) return;

    // Find the nodes above and below the add node
    const incomingEdge = edges.find(e => e.target === selectedNode.id);
    const outgoingEdge = edges.find(e => e.source === selectedNode.id);
    const nodeAbove = nodes.find(n => n.id === incomingEdge?.source);
    const nodeBelow = nodes.find(n => n.id === outgoingEdge?.target);

    if (!nodeAbove || !nodeBelow) return;

    // Calculate vertical positions to maintain equal spacing
    const totalSpace = nodeBelow.position.y - nodeAbove.position.y;
    const spacing = totalSpace / 3; // Divide space into 3 equal parts
    
    const newNodeY = nodeAbove.position.y + spacing; // Position new node 1/3 of the way down
    const newAddNodeY = nodeAbove.position.y + (spacing * 2); // Position add node 2/3 of the way down

    // Create new node
    const newNodeId = `${nodeType}-${nodeCount}`;
    const newNode: Node = {
      id: newNodeId,
      position: { x: addNode.position.x - 86, y: newNodeY }, // Center the node horizontally
      data: { label: nodeType === 'apiCall' ? 'API Call' : nodeType === 'email' ? 'Email' : 'Text Box' },
      type: 'default',
      className: 'workflow-node'
    };

    // Create new add node
    const newAddNodeId = `add-${nodeCount + 1}`;
    const newAddNode: Node = {
      id: newAddNodeId,
      position: { x: addNode.position.x, y: newAddNodeY }, // Position at 2/3 of the space
      data: { label: '+' },
      type: 'add',
      className: 'add-node'
    };

    // Update edges
    const newEdges = edges.filter(e => 
      e.source !== selectedNode.id && e.target !== selectedNode.id
    );

    if (incomingEdge) {
      newEdges.push({
        ...incomingEdge,
        target: newNodeId,
        id: `e-${incomingEdge.source}-${newNodeId}`
      });
    }

    newEdges.push({
      id: `e-${newNodeId}-${newAddNodeId}`,
      source: newNodeId,
      target: newAddNodeId,
      type: 'default',
      style: { stroke: '#E5E5E5', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#E5E5E5',
        width: 15,
        height: 15,
      },
    });

    if (outgoingEdge) {
      newEdges.push({
        ...outgoingEdge,
        source: newAddNodeId,
        id: `e-${newAddNodeId}-${outgoingEdge.target}`
      });
    }

    // Update nodes
    const updatedNodes = nodes
      .filter(n => n.id !== selectedNode.id)
      .concat([newNode, newAddNode]);

    // Adjust End node position if needed
    const endNode = nodes.find(n => n.id === 'end');
    if (endNode) {
      const adjustedEndNode = {
        ...endNode,
        position: { ...endNode.position, y: nodeBelow.position.y }
      };
      updatedNodes.push(adjustedEndNode);
    }

    // Update state
    setNodes(updatedNodes);
    setEdges(newEdges);
    setNodeCount(prev => prev + 1);
    setShowNodeSelector(false);
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a workflow name',
        severity: 'error'
      });
      return;
    }

    try {
      await saveWorkflow({
        name: workflowName,
        description: workflowDescription,
        nodes: nodes,
        edges: edges,
      });

      setSnackbar({
        open: true,
        message: 'Workflow saved successfully',
        severity: 'success'
      });
      setSaveDialogOpen(false);
      setWorkflowName('');
      setWorkflowDescription('');
      
      // Navigate back to workflow list
      navigate('/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
      setSnackbar({
        open: true,
        message: 'Error saving workflow',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleApiCallExecutionComplete = (nodeId: string, result: {
    status: 'passed' | 'failed';
    method: string;
    url: string;
    headers: string;
    body: string;
    response?: any;
    error?: string;
  }) => {
    setExecutionHistory(prev => ({
      ...prev,
      [nodeId]: [
        {
          ...result,
          timestamp: new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Kolkata'
          }).replace(',', ' -') + ' IST'
        },
        ...(prev[nodeId] || [])
      ]
    }));

    // Update node data to show execution status
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              executionStatus: result.status,
              lastExecution: {
                ...result,
                timestamp: new Date().toISOString()
              }
            }
          };
        }
        return node;
      })
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#FDF7F2' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        bgcolor: 'transparent'
      }}>
        <Button
          startIcon={<KeyboardArrowLeft />}
          onClick={() => navigate(-1)}
          sx={{ 
            color: '#333',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': { bgcolor: 'transparent' }
          }}
        >
          Go Back
        </Button>
        <Typography sx={{ 
          ml: 2,
          fontSize: '14px',
          color: '#333',
          fontWeight: 500
        }}>
          Untitled
        </Typography>
        <IconButton 
          onClick={() => setSaveDialogOpen(true)}
          sx={{ 
            ml: 1,
            color: '#666',
            padding: '4px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.7 0H1.3C0.58 0 0 0.58 0 1.3V14.7C0 15.42 0.58 16 1.3 16H14.7C15.42 16 16 15.42 16 14.7V3.3L12.7 0ZM8 14.7C6.58 14.7 5.3 13.42 5.3 12C5.3 10.58 6.58 9.3 8 9.3C9.42 9.3 10.7 10.58 10.7 12C10.7 13.42 9.42 14.7 8 14.7ZM11.3 6H1.3V1.3H11.3V6Z" fill="currentColor"/>
          </svg>
        </IconButton>
        <IconButton 
          sx={{ 
            ml: 1,
            color: '#666',
            padding: '4px'
          }}
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        bgcolor: '#FDF7F2',
        position: 'relative'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          style={{ background: '#FDF7F2' }}
          defaultViewport={{ x: 0, y: 0, zoom: zoom / 100 }}
          minZoom={0.5}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnScroll={false}
        >
          <Background 
            color="#E5E5E5" 
            gap={20} 
            size={1} 
            style={{ opacity: 0.1 }} 
          />
        </ReactFlow>

        {/* Zoom Controls - Bottom Right */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'white',
          borderRadius: '4px',
          padding: '4px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <IconButton 
            size="small"
            onClick={() => setZoom(Math.max(zoom - 10, 50))}
            sx={{ 
              color: '#666',
              '&:hover': { color: '#333' }
            }}
          >
            -
          </IconButton>
          <Box sx={{ 
            width: 120,
            height: 2,
            bgcolor: '#E5E5E5',
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              left: `${((zoom - 50) / 150) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#8BC34A'
            }} />
          </Box>
          <IconButton 
            size="small"
            onClick={() => setZoom(Math.min(zoom + 10, 200))}
            sx={{ 
              color: '#666',
              '&:hover': { color: '#333' }
            }}
          >
            +
          </IconButton>
        </Box>
      </Box>

      {/* Node Selector Dialog */}
      <NodeSelector
        open={showNodeSelector}
        onClose={() => setShowNodeSelector(false)}
        onSelect={handleAddNode}
        position={nodeSelectorPosition}
      />

      {/* Configuration Dialogs */}
      {selectedNode && selectedNode.data.label === 'API Call' && (
        <ApiCallConfig
          open={showApiConfig}
          onClose={() => setShowApiConfig(false)}
          nodeId={selectedNode.id}
          onExecutionComplete={
            selectedNode
              ? (result) => handleApiCallExecutionComplete(selectedNode.id, result)
              : undefined
          }
        />
      )}
      {selectedNode && selectedNode.data.label === 'Email' && (
        <EmailConfig
          open={showEmailConfig}
          onClose={() => setShowEmailConfig(false)}
          nodeId={selectedNode.id}
        />
      )}

      {/* Save Workflow Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: {
            width: '480px',
            borderRadius: '8px',
            m: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            '& .MuiDialogTitle-root': {
              padding: '24px',
              paddingBottom: '16px',
            },
            '& .MuiDialogContent-root': {
              padding: '24px',
              paddingTop: '16px',
            }
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 3,
          pt: 3,
          pb: 2
        }}>
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#333'
            }}
          >
            Save your workflow
          </Typography>
          <IconButton
            onClick={() => setSaveDialogOpen(false)}
            sx={{
              p: 0,
              color: '#666',
              '&:hover': { color: '#333' }
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Name here"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              variant="outlined"
              required
              error={!workflowName.trim()}
              helperText={!workflowName.trim() ? 'Name is required' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E5E5E5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '12px',
                  fontSize: '14px',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write here.."
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E5E5E5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '12px',
                  fontSize: '14px',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                minWidth: '80px',
                fontSize: '14px',
                px: 2,
                py: 1,
                backgroundColor: '#F44336',
                '&:hover': {
                  backgroundColor: '#D32F2F',
                },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {selectedNode && (
        <Box
          sx={{
            position: 'absolute',
            right: 24,
            top: 24,
            width: '320px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>
              Node Details
            </Typography>
            <IconButton
              onClick={() => setSelectedNode(null)}
              sx={{ color: '#666', p: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {selectedNode.type === 'default' && executionHistory[selectedNode.id] && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#333', mb: 1 }}>
                Execution History
              </Typography>
              {executionHistory[selectedNode.id].map((execution, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: index !== executionHistory[selectedNode.id].length - 1 ? 2 : 0,
                    p: 1.5,
                    borderRadius: '6px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5'
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: execution.status === 'passed' ? '#4CAF50' : '#F44336'
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '13px', color: '#333', mb: 0.5 }}>
                      {execution.timestamp}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>
                      {execution.method} {execution.url}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify({
                          method: execution.method,
                          url: execution.url,
                          headers: execution.headers,
                          body: execution.body,
                          response: execution.response,
                          error: execution.error
                        }, null, 2)
                      );
                    }}
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
          )}
        </Box>
      )}
    </Box>
  );
};

export default WorkflowBuilder; 