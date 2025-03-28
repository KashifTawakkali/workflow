import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

interface WorkflowStep {
  id: string;
  type: 'api' | 'email';
  data: {
    url?: string;
    method?: string;
    email?: string;
    subject?: string;
    body?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

interface StepData {
  type?: 'api' | 'email';
  url?: string;
  method?: string;
  email?: string;
  subject?: string;
  body?: string;
}

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: 'end',
    type: 'output',
    data: { label: 'End' },
    position: { x: 250, y: 500 },
  },
];

const initialEdges: Edge[] = [
  { id: 'start-end', source: 'start', target: 'end' },
];

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [stepData, setStepData] = useState<StepData>({});

  useEffect(() => {
    if (id && id !== 'new') {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const docRef = doc(db, 'workflows', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWorkflow(docSnap.data() as Workflow);
        // TODO: Convert workflow steps to nodes and edges
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddStep = () => {
    setDialogOpen(true);
    setSelectedNode(null);
    setStepData({});
  };

  const handleEditStep = (node: Node) => {
    setDialogOpen(true);
    setSelectedNode(node);
    // TODO: Load step data from node
  };

  const handleSaveStep = () => {
    if (!selectedNode) {
      // Add new step
      const newNode: Node = {
        id: `step-${nodes.length}`,
        type: 'default',
        data: { 
          label: stepData.type === 'api' ? 'API Call' : 'Email',
          type: stepData.type,
          ...stepData
        },
        position: { x: 250, y: 250 },
      };
      setNodes((nds) => [...nds, newNode]);
    } else {
      // Update existing step
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, ...stepData } }
            : node
        )
      );
    }
    setDialogOpen(false);
  };

  const handleSaveWorkflow = async () => {
    try {
      const workflowData: Workflow = {
        id: id || 'new',
        name: 'New Workflow', // TODO: Add name input
        steps: nodes
          .filter((node) => node.id !== 'start' && node.id !== 'end')
          .map((node) => ({
            id: node.id,
            type: node.data.type as 'api' | 'email',
            data: node.data,
          })),
      };

      if (id === 'new') {
        const docRef = doc(collection(db, 'workflows'));
        await setDoc(docRef, workflowData);
      } else {
        await setDoc(doc(db, 'workflows', id!), workflowData);
      }

      navigate('/workflows');
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 4 }}>
      <Paper sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {id === 'new' ? 'Create New Workflow' : 'Edit Workflow'}
          </Typography>
          <Button variant="contained" onClick={handleSaveWorkflow}>
            Save Workflow
          </Button>
        </Box>

        <Box sx={{ height: 'calc(100% - 80px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => handleEditStep(node)}
            fitView
          >
            <Background />
            <Controls />
            <Panel position="top-right">
              <Button variant="contained" onClick={handleAddStep}>
                Add Step
              </Button>
            </Panel>
          </ReactFlow>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedNode ? 'Edit Step' : 'Add New Step'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Step Type</InputLabel>
            <Select
              value={stepData.type || ''}
              onChange={(e) =>
                setStepData({ ...stepData, type: e.target.value as 'api' | 'email' })
              }
            >
              <MenuItem value="api">API Call</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>

          {stepData.type === 'api' && (
            <>
              <TextField
                fullWidth
                label="URL"
                value={stepData.url || ''}
                onChange={(e) =>
                  setStepData({ ...stepData, url: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={stepData.method || 'GET'}
                  onChange={(e) =>
                    setStepData({ ...stepData, method: e.target.value })
                  }
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {stepData.type === 'email' && (
            <>
              <TextField
                fullWidth
                label="Email"
                value={stepData.email || ''}
                onChange={(e) =>
                  setStepData({ ...stepData, email: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Subject"
                value={stepData.subject || ''}
                onChange={(e) =>
                  setStepData({ ...stepData, subject: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Body"
                multiline
                rows={4}
                value={stepData.body || ''}
                onChange={(e) =>
                  setStepData({ ...stepData, body: e.target.value })
                }
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStep} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkflowEditor; 