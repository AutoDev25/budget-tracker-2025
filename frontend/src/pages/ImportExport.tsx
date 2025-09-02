import React, { useState, useEffect } from 'react';
import { csvApi, userApi, categoryApi, User, Category } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface PreviewData {
  valid_rows: any[];
  error_rows: any[];
  new_users: string[];
  summary: {
    total_rows: number;
    valid_count: number;
    error_count: number;
    new_user_count: number;
  };
}

const ImportExport: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFilters, setExportFilters] = useState({
    range: 'current',
    user_id: '',
    category_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const [usersResponse, categoriesResponse] = await Promise.all([
        userApi.getAll(),
        categoryApi.getAll()
      ]);
      
      setUsers(usersResponse.data);
      setCategories(categoriesResponse.data);
      
      // Set default date range to current month
      const now = new Date();
      const startDate = startOfMonth(now);
      const endDate = endOfMonth(now);
      setExportFilters(prev => ({
        ...prev,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      }));
    } catch (err) {
      console.error('Failed to fetch form data:', err);
      setError('Failed to load form data');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setPreviewData(null);
      setError(null);
      setSuccess(null);
    }
  };

  const handleFilePreview = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await csvApi.previewImport(selectedFile);
      setPreviewData(response.data);
    } catch (err: any) {
      console.error('Failed to preview import:', err);
      setError(err.response?.data?.detail || 'Failed to preview import');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    try {
      setLoading(true);
      setError(null);
      const response = await csvApi.confirmImport(previewData);
      setSuccess(response.data.message);
      setPreviewData(null);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('Failed to import:', err);
      setError(err.response?.data?.detail || 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExportFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      
      if (exportFilters.range === 'custom' && exportFilters.start_date && exportFilters.end_date) {
        params.start_date = exportFilters.start_date;
        params.end_date = exportFilters.end_date;
      } else if (exportFilters.range === 'current') {
        const now = new Date();
        params.start_date = format(startOfMonth(now), 'yyyy-MM-dd');
        params.end_date = format(endOfMonth(now), 'yyyy-MM-dd');
      } else if (exportFilters.range === 'last3months') {
        const now = new Date();
        const start = new Date(now);
        start.setMonth(now.getMonth() - 2);
        params.start_date = format(startOfMonth(start), 'yyyy-MM-dd');
        params.end_date = format(endOfMonth(now), 'yyyy-MM-dd');
      }
      
      if (exportFilters.user_id) {
        params.user_id = parseInt(exportFilters.user_id);
      }
      
      if (exportFilters.category_id) {
        params.category_id = parseInt(exportFilters.category_id);
      }

      const response = await csvApi.export(params);
      
      // Create and download the file
      const blob = new Blob([response.data.csv_content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Export downloaded successfully');
    } catch (err: any) {
      console.error('Failed to export:', err);
      setError(err.response?.data?.detail || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="import-export">
      <div className="section-header">
        &gt; DATA IMPORT/EXPORT
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={clearMessages} className="close-button">×</button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
          <button onClick={clearMessages} className="close-button">×</button>
        </div>
      )}
      
      <div className="form-section">
        <div className="section-title">─ IMPORT CSV ───────────────────────────────────────────────────────</div>
        
        <div className="import-section">
          <div className="file-upload">
            <input
              type="file"
              id="file-input"
              accept=".csv"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {selectedFile ? selectedFile.name : 'Drag CSV file here or choose file'}
            </label>
            {selectedFile && (
              <button onClick={handleFilePreview} disabled={loading} className="primary-button">
                {loading ? 'Processing...' : 'Preview Import'}
              </button>
            )}
          </div>
          
          <div className="format-info">
            <div className="section-subtitle">─ OR ─────────────────────────────────────────────────────────────</div>
            <div className="format-example">
              Expected format:<br/>
              date,amount,category,description,user<br/>
              2025-09-01,45.67,Food,Groceries,You<br/>
              2025-08-31,12.50,Transportation,Bus fare,Partner
            </div>
          </div>
        </div>
        
        {previewData && (
          <div className="preview-section">
            <div className="section-subtitle">─ IMPORT PREVIEW ──────────────────────────────────────────────────</div>
            
            <div className="preview-info">
              <div>Total rows: {previewData.summary.total_rows}</div>
              <div>Valid rows: {previewData.summary.valid_count}</div>
              <div>Error rows: {previewData.summary.error_count}</div>
              <div>New users: {previewData.summary.new_user_count}</div>
            </div>
            
            {previewData.valid_rows.length > 0 && (
              <div className="preview-data">
                <div className="preview-header">First 5 valid rows:</div>
                {previewData.valid_rows.slice(0, 5).map((row, index) => (
                  <div key={index} className="preview-row">
                    {row.date} | ${row.amount} | {row.category} | {row.description} | {row.user}
                  </div>
                ))}
              </div>
            )}
            
            {previewData.error_rows.length > 0 && (
              <div className="error-data">
                <div className="error-header">Errors found:</div>
                {previewData.error_rows.slice(0, 3).map((error, index) => (
                  <div key={index} className="error-row">
                    Row {error.row}: {error.error}
                  </div>
                ))}
                {previewData.error_rows.length > 3 && (
                  <div>... and {previewData.error_rows.length - 3} more errors</div>
                )}
              </div>
            )}
            
            <div className="import-actions">
              <button 
                onClick={handleConfirmImport} 
                disabled={loading || previewData.summary.valid_count === 0}
                className="primary-button"
              >
                {loading ? 'Importing...' : `Import ${previewData.summary.valid_count} expenses`}
              </button>
              <button onClick={() => setPreviewData(null)} className="secondary-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="form-section">
        <div className="section-title">─ EXPORT OPTIONS ──────────────────────────────────────────────────</div>
        
        <div className="export-form">
          <div className="form-group">
            <label>Export Range:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="range"
                  value="current"
                  checked={exportFilters.range === 'current'}
                  onChange={handleExportFilterChange}
                />
                Current Month ({format(new Date(), 'MMMM yyyy')})
              </label>
              <label>
                <input
                  type="radio"
                  name="range"
                  value="last3months"
                  checked={exportFilters.range === 'last3months'}
                  onChange={handleExportFilterChange}
                />
                Last 3 Months
              </label>
              <label>
                <input
                  type="radio"
                  name="range"
                  value="all"
                  checked={exportFilters.range === 'all'}
                  onChange={handleExportFilterChange}
                />
                All Time
              </label>
              <label>
                <input
                  type="radio"
                  name="range"
                  value="custom"
                  checked={exportFilters.range === 'custom'}
                  onChange={handleExportFilterChange}
                />
                Custom Range:
              </label>
            </div>
            
            {exportFilters.range === 'custom' && (
              <div className="date-range">
                <input
                  type="date"
                  name="start_date"
                  value={exportFilters.start_date}
                  onChange={handleExportFilterChange}
                />
                <span>to</span>
                <input
                  type="date"
                  name="end_date"
                  value={exportFilters.end_date}
                  onChange={handleExportFilterChange}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Filter by User:</label>
            <select name="user_id" value={exportFilters.user_id} onChange={handleExportFilterChange}>
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>@{user.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Filter by Category:</label>
            <select name="category_id" value={exportFilters.category_id} onChange={handleExportFilterChange}>
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="export-actions">
            <button onClick={handleExport} disabled={loading} className="primary-button">
              {loading ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;