import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { getWorkflows } from '../services/workflowService';
import type { Workflow } from '../services/workflowService';

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const workflows = await getWorkflows();
        const workflow = workflows.find(w => w.id === id);
        if (!workflow) {
          throw new Error('Workflow not found');
        }
        setWorkflow(workflow);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!workflow) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No workflow found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">{workflow.name}</Typography>
      <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
        {workflow.description}
      </Typography>
    </Box>
  );
};

export default WorkflowEditor; 