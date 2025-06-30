import BasicButtons from './BasicButtons';
import { triggerFileInput } from '../utils/csvUtils';

interface FileUploadSectionProps {
  title: string;
  inputId: string;
  isLoading: boolean;
  dataCount: number;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadSection({
  title,
  inputId,
  isLoading,
  dataCount,
  onFileChange,
}: FileUploadSectionProps) {
  return (
    <>
      <input
        id={inputId}
        type="file"
        accept=".csv"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      
      <h2>{title}</h2>
      <div style={{ marginBottom: '20px' }}>
        <BasicButtons 
          variant="contained" 
          onClick={() => triggerFileInput(inputId)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : `Upload ${title} CSV`}
        </BasicButtons>
        {dataCount > 0 && (
          <span style={{ marginLeft: '10px', color: 'green' }}>
            ✓ {dataCount} items loaded
          </span>
        )}
      </div>
    </>
  );
}