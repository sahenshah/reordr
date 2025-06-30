import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import type { ReactNode } from 'react';

// Define column configuration
export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: T[keyof T]) => ReactNode;
}

// Define the props interface for dynamic data
interface StickyHeadTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  getRowKey?: (row: T, index: number) => string | number;
}

function StickyHeadTable<T>({ data, columns, getRowKey }: StickyHeadTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Calculate paginated data
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => {
              const originalIndex = page * rowsPerPage + index;
              return (
                <TableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={getRowKey ? getRowKey(row, originalIndex) : originalIndex}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const formattedValue: ReactNode = column.format 
                      ? column.format(value) 
                      : String(value ?? '');
                    
                    return (
                      <TableCell 
                        key={String(column.key)} 
                        align={column.align || 'left'}
                      >
                        {formattedValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default StickyHeadTable;