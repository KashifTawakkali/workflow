import { Box, IconButton } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mt: 3,
        mb: 2,
      }}
    >
      <IconButton 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        sx={{
          color: '#666',
          '&.Mui-disabled': {
            color: '#E5E5E5'
          }
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      {renderPageNumbers().map((page, index) => (
        <Box
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            cursor: typeof page === 'number' ? 'pointer' : 'default',
            bgcolor: currentPage === page ? '#333' : 'transparent',
            color: currentPage === page ? 'white' : '#666',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            '&:hover': typeof page === 'number' ? {
              bgcolor: currentPage === page ? '#333' : '#f5f5f5'
            } : {},
            transition: 'all 0.2s',
          }}
        >
          {page}
        </Box>
      ))}

      <IconButton 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={{
          color: '#666',
          '&.Mui-disabled': {
            color: '#E5E5E5'
          }
        }}
      >
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  );
};

export default Pagination; 