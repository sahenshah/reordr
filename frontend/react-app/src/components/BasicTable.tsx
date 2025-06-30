import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import type { ReactNode } from 'react';

// Define column configuration
export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: T[keyof T]) => ReactNode;
}

// Define the props interface for dynamic data
interface BasicTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  getRowKey?: (row: T, index: number) => string | number;
}

function BasicTable<T>({ data, columns, getRowKey }: BasicTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="dynamic table">
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
          {data.map((row, index) => (
            <TableRow
              key={getRowKey ? getRowKey(row, index) : index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                    component={column.key === columns[0].key ? "th" : "td"}
                    scope={column.key === columns[0].key ? "row" : undefined}
                  >
                    {formattedValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default BasicTable;