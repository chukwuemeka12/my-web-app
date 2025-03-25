import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Box,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import { Member } from '../types';

interface Props {
  members: Member[];
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return 'Invalid date';
  }
};

const MemberHealthTable = ({ members }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryChip = (category: string, color: string) => (
    <Chip
      label={category}
      sx={{
        backgroundColor: color,
        color: 'white',
        fontWeight: 'bold',
      }}
      size="small"
    />
  );

  const generateUniqueKey = (member: Member, index: number) => {
    return `${member.name}-${member.joinDate}-${member.lastVisit}-${member.role}-${index}`;
  };

  if (!members || members.length === 0) {
    return (
      <Paper elevation={2} sx={{ width: '100%', mt: 4, p: 2 }}>
        <Alert severity="info">No member data available</Alert>
      </Paper>
    );
  }

  const displayedMembers = members
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={2} sx={{ width: '100%', mt: 4 }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Member Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>CHI Score</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Current Streak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedMembers.map((member, index) => (
              <TableRow key={generateUniqueKey(member, index)} hover>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {getCategoryChip(member.category, member.categoryColor)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '100px' }}>
                      <LinearProgress
                        variant="determinate"
                        value={member.chiScore}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          backgroundColor: '#eee',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: member.categoryColor,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2">{member.chiScore}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(member.lastVisit)}</TableCell>
                <TableCell>{member.currentStreak} days</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={members.length}
        rowsPerPage={rowsPerPage}
        page={Math.min(page, Math.ceil(members.length / rowsPerPage) - 1)}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default MemberHealthTable;
