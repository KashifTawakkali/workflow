import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/reactflow.css';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  TextField,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  ContentCopy,
  Close as CloseIcon,
  Delete as DeleteIcon,
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
    style: { stroke: '#E5E5E5', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#E5E5E5',
      width: 15,
      height: 15,
    },
  },
  {
    id: 'e2-3',
    source: 'add-1',
    target: 'end',
    type: 'default',
    style: { stroke: '#E5E5E5', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#E5E5E5',
      width: 15,
      height: 15,
    },
  },
];

const StartEndNode = ({ data }: { data: { label: string } }) => {
  const isStart = data.label === 'Start';
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: isStart ? '#8BC34A' : '#F44336',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: `3px solid ${isStart ? '#8BC34A' : '#F44336'}`,
      }}
    >
      <div
        style={{
          width: 'calc(100% - 8px)',
          height: 'calc(100% - 8px)',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '15px',
          fontWeight: 500,
          backgroundColor: 'transparent',
          position: 'absolute',
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

const AddNode = ({ data }: { data: { label: string } }) => {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: '2px solid #E5E5E5',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '18px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
          borderRadius: '50%',
          border: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

const nodeTypes = {
  startEnd: StartEndNode,
  add: AddNode,
};

const WorkflowBuilder = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  const [selectedAddNodeId, setSelectedAddNodeId] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'add') {
      setSelectedAddNodeId(node.id);
      setNodeSelectorOpen(true);
    } else if (node.type === 'default') {
      setSelectedNode(node);
      setConfigOpen(true);
    }
  };

  const handleAddNode = (nodeType: string) => {
    if (!selectedAddNodeId) return;

    const addNode = nodes.find(n => n.id === selectedAddNodeId);
    if (!addNode) return;

    // Find the nodes above and below the add node
    const incomingEdge = edges.find(e => e.target === selectedAddNodeId);
    const outgoingEdge = edges.find(e => e.source === selectedAddNodeId);
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
      e.source !== selectedAddNodeId && e.target !== selectedAddNodeId
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
      .filter(n => n.id !== selectedAddNodeId)
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
    setNodeSelectorOpen(false);
    setSelectedAddNodeId(null);
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

  const handleCloseConfig = () => {
    setConfigOpen(false);
    setSelectedNode(null);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        p: 2, 
        borderBottom: '1px solid #E5E5E5',
        backgroundColor: 'white',
        zIndex: 10
      }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            color: '#666',
            '&:hover': { color: '#333' }
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant="h6" sx={{ 
          fontSize: '20px',
          fontWeight: 500,
          color: '#333',
          flex: 1
        }}>
          Edit Workflow
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => setSaveDialogOpen(true)}
          sx={{
            textTransform: 'none',
            borderRadius: '4px',
            mr: 1,
            fontSize: '14px',
            px: 2,
            py: 1
          }}
        >
          Save Workflow
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            px: 2,
            py: 1
          }}
        >
          Exit Flow
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        backgroundColor: '#FDF7F2',
        position: 'relative'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
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
            gap={24} 
            size={1.5} 
            style={{ opacity: 0.15 }} 
          />
        </ReactFlow>
      </Box>

      {/* Node Selector Dialog */}
      <NodeSelector
        open={nodeSelectorOpen}
        onClose={() => setNodeSelectorOpen(false)}
        onSelect={handleAddNode}
        position={
          selectedAddNodeId 
            ? nodes.find(n => n.id === selectedAddNodeId)?.position || { x: 0, y: 0 }
            : { x: 0, y: 0 }
        }
      />

      {/* Configuration Dialogs */}
      {selectedNode && selectedNode.data.label === 'API Call' && (
        <ApiCallConfig
          open={configOpen}
          onClose={handleCloseConfig}
          nodeId={selectedNode.id}
        />
      )}
      {selectedNode && selectedNode.data.label === 'Email' && (
        <EmailConfig
          open={configOpen}
          onClose={handleCloseConfig}
          nodeId={selectedNode.id}
        />
      )}

      {/* Footer Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderTop: '1px solid #E5E5E5',
        backgroundColor: 'white',
        zIndex: 10
      }}>
        {/* Zoom Controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton 
            sx={{ 
              color: '#666',
              '&:hover': { color: '#333' }
            }}
            onClick={() => setZoom(Math.max(zoom - 10, 50))}
          >
            -
          </IconButton>
          <Box sx={{ 
            width: { xs: 100, sm: 200 },
            height: 2,
            backgroundColor: '#E5E5E5',
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              left: `${((zoom - 50) / 150) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#8BC34A',
              cursor: 'pointer'
            }} />
          </Box>
          <IconButton 
            sx={{ 
              color: '#666',
              '&:hover': { color: '#333' }
            }}
            onClick={() => setZoom(Math.min(zoom + 10, 200))}
          >
            +
          </IconButton>
        </Box>
      </Box>

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
    </Box>
  );
};

export default WorkflowBuilder; 