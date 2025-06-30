import { Box, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BasicTable from './BasicTable';
import StickyHeadTable from './StickyHeadTable';
import type { ColumnConfig } from './BasicTable';

interface DataSectionProps<T> {
  title: string;
  data: T[];
  columns: ColumnConfig<T>[];
  onUpload: () => void;
  onDownload: () => void;
  getRowKey: (row: T, index: number) => string;
  useStickyHeader?: boolean;
}

const EmptyStateMessage = ({ message }: { message: string }) => (
  <p style={{ color: '#666', fontStyle: 'italic' }}>{message}</p>
);

export default function DataSection<T>({
  title,
  data,
  columns,
  onUpload,
  onDownload,
  getRowKey,
  useStickyHeader = false
}: DataSectionProps<T>) {
  const TableComponent = useStickyHeader ? StickyHeadTable : BasicTable;

  return (
    <section style={{ marginBottom: '40px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="16px">
        <h2 style={{ margin: 0 }}>
          {title} ({data.length} {data.length === 1 ? 'item' : 'items'})
        </h2>
        <Box display="flex" gap="8px">
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onDownload}
            color="secondary"
            disabled={data.length === 0}
          >
            Download CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={onUpload}
            color="primary"
          >
            Upload CSV
          </Button>
        </Box>
      </Box>
      {data.length > 0 ? (
        <TableComponent 
          data={data} 
          columns={columns}
          getRowKey={getRowKey}
        />
      ) : (
        <EmptyStateMessage message={`No ${title.toLowerCase()} data in database.`} />
      )}
    </section>
  );
}