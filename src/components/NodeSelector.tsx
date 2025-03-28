import React from 'react';
import { Box, Button, Dialog, DialogContent, Grid } from '@mui/material';
import { Api, Email, TextFields } from '@mui/icons-material';

interface NodeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (nodeType: string) => void;
  position: { x: number; y: number };
}

const NodeSelector: React.FC<NodeSelectorProps> = ({ open, onClose, onSelect, position }) => {
  const nodeTypes = [
    { type: 'apiCall', label: 'API Call', icon: <Api /> },
    { type: 'email', label: 'Email', icon: <Email /> },
    { type: 'textBox', label: 'Text Box', icon: <TextFields /> },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          position: 'absolute',
          left: position.x,
          top: position.y,
          m: 0,
          borderRadius: '8px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          maxWidth: 'none',
          width: 'auto'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <DialogContent sx={{ p: 1 }}>
        <Grid container spacing={1} sx={{ width: 'auto' }}>
          {nodeTypes.map((node) => (
            <Grid item key={node.type}>
              <Button
                variant="outlined"
                onClick={() => {
                  onSelect(node.type);
                  onClose();
                }}
                sx={{
                  color: '#666',
                  borderColor: '#E5E5E5',
                  backgroundColor: 'white',
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  minWidth: 0,
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                {node.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default NodeSelector; 