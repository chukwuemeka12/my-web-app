import { useState } from 'react';
import { Button, Box, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { API_URL } from '../config';

interface Props {
  onUploadSuccess: () => void;
}

const FileUpload = ({ onUploadSuccess }: Props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      setSuccess(true);
      setSelectedFile(null);
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <input
        accept=".csv"
        style={{ display: 'none' }}
        id="csv-file-input"
        type="file"
        onChange={handleFileSelect}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <label htmlFor="csv-file-input">
          <Button
            component="span"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            Select CSV
          </Button>
        </label>
        {selectedFile && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        )}
      </Box>
      {selectedFile && !error && !uploading && !success && (
        <Box sx={{ mt: 1 }}>Selected file: {selectedFile.name}</Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 1 }}>
          File uploaded successfully!
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
