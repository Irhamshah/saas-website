import React, { useState } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, Download, ArrowDown, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ImageCompressor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ImageCompressor({ onClose }) {
  const [imageFiles, setImageFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast.error('Please drop image files only');
      return;
    }
    
    addFiles(files);
  };

  const addFiles = async (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were not images and were skipped');
    }

    if (validFiles.length === 0) {
      return;
    }

    // Create file objects with previews
    const newFiles = await Promise.all(
      validFiles.map(async (file, index) => {
        const preview = await createPreview(file);
        const dimensions = await getImageDimensions(file);
        
        return {
          id: Date.now() + index,
          file: file,
          name: file.name,
          preview: preview,
          width: dimensions.width,
          height: dimensions.height,
          originalSize: file.size,
          originalSizeFormatted: formatFileSize(file.size),
          compressedSize: null,
          compressedSizeFormatted: null,
          status: 'ready',
          compressedBlob: null
        };
      })
    );

    setImageFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} image${newFiles.length > 1 ? 's' : ''}`);
  };

  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const removeFile = (id) => {
    setImageFiles(prev => prev.filter(file => file.id !== id));
    toast.success('Image removed');
  };

  const compressImageBackend = async (fileData) => {
    try {
      const formData = new FormData();
      formData.append('image', fileData.file);
      formData.append('quality', quality);
      formData.append('format', 'jpeg'); // Can be made configurable

      const response = await axios.post(`${API_URL}/image/compress`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob'
      });

      // Get metadata from response headers
      const originalSize = parseInt(response.headers['x-original-size'] || fileData.originalSize);
      const compressedSize = parseInt(response.headers['x-compressed-size'] || response.data.size);
      const reduction = response.headers['x-reduction'] || 
        ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      return {
        blob: response.data,
        size: compressedSize,
        reduction: reduction
      };
    } catch (error) {
      console.error('Backend compression error:', error);
      if (error.response?.status === 500) {
        setBackendAvailable(false);
        throw new Error('Backend compression failed. Server may not have Sharp installed.');
      }
      throw error;
    }
  };

  const compressAllImages = async () => {
    if (imageFiles.length === 0) {
      toast.error('Please add images to compress');
      return;
    }

    setCompressing(true);

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const fileData = imageFiles[i];
        
        // Update status
        setImageFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' } : f
        ));

        // Compress using backend
        const { blob, size, reduction } = await compressImageBackend(fileData);
        
        // Update with results
        setImageFiles(prev => prev.map((f, idx) => 
          idx === i ? {
            ...f,
            status: 'completed',
            compressedBlob: blob,
            compressedSize: size,
            compressedSizeFormatted: formatFileSize(size),
            reduction: reduction
          } : f
        ));
      }

      toast.success('All images compressed successfully! 🎉');

    } catch (error) {
      console.error('Error compressing images:', error);
      toast.error(error.message || 'Failed to compress some images');
      
      // Reset status
      setImageFiles(prev => prev.map(f => ({ 
        ...f, 
        status: f.status === 'processing' ? 'ready' : f.status 
      })));
    } finally {
      setCompressing(false);
    }
  };

  const downloadFile = (fileData) => {
    if (!fileData.compressedBlob) return;

    const url = URL.createObjectURL(fileData.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.name.replace(/\.[^/.]+$/, '_compressed.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded!');
  };

  const downloadAll = () => {
    const compressed = imageFiles.filter(f => f.compressedBlob);
    
    if (compressed.length === 0) {
      toast.error('No compressed images to download');
      return;
    }

    compressed.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
    
    toast.success(`Downloading ${compressed.length} images...`);
  };

  const clearAll = () => {
    if (confirm('Remove all images?')) {
      setImageFiles([]);
      toast.success('All images removed');
    }
  };

  const getQualityLabel = () => {
    const percent = Math.round(quality * 100);
    if (quality >= 0.9) return `High Quality (${percent}%)`;
    if (quality >= 0.7) return `Good Quality (${percent}%) - Recommended`;
    if (quality >= 0.5) return `Medium Quality (${percent}%)`;
    return `Low Quality (${percent}%)`;
  };

  return (
    <div className="compressor-modal">
      <div className="compressor-container">
        <div className="compressor-header">
          <h2>Image Compressor</h2>
          <p>Reduce image file sizes with professional compression</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="compressor-content">
          {/* Backend Status */}
          {!backendAvailable && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <div>
                <strong>Backend Error:</strong> Compression server is not available or Sharp is not installed. 
                Please check the backend setup.
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="info-banner">
            <AlertCircle size={18} />
            <div>
              <strong>Server-Side Compression:</strong> Images are compressed using professional Sharp technology. 
              Typical compression: 60-80% reduction. Your files are deleted after compression.
            </div>
          </div>

          {/* Quality Slider */}
          <div className="quality-settings">
            <div className="quality-label">
              <span>Compression Quality</span>
              <span className="quality-value">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              disabled={compressing}
              className="quality-slider"
            />
            <p className="quality-description">{getQualityLabel()}</p>
          </div>

          {/* Upload Area */}
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('image-compress-input').click()}
          >
            <input
              id="image-compress-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={48} />
            <h3>Drop images here or click to browse</h3>
            <p>Professional compression • Multiple images supported • Max 20MB per file</p>
          </div>

          {/* Image List */}
          {imageFiles.length > 0 && (
            <div className="files-section">
              <div className="files-header">
                <h3>Images to Compress ({imageFiles.length})</h3>
                <button className="btn-text" onClick={clearAll} disabled={compressing}>
                  Clear All
                </button>
              </div>

              <div className="images-grid">
                {imageFiles.map((image) => (
                  <div key={image.id} className={`image-item ${image.status}`}>
                    <div className="image-preview">
                      <img src={image.preview} alt={image.name} />
                      {image.status === 'processing' && (
                        <div className="processing-overlay">
                          <div className="spinner-large"></div>
                        </div>
                      )}
                      {image.status === 'completed' && (
                        <div className="completed-badge">✓</div>
                      )}
                    </div>
                    
                    <div className="image-info">
                      <div className="image-name">{image.name}</div>
                      <div className="image-meta">
                        <span>{image.width} × {image.height}</span>
                        <span>Original: {image.originalSizeFormatted}</span>
                      </div>
                      {image.compressedSizeFormatted && (
                        <div className="image-meta compressed">
                          <ArrowDown size={14} className="arrow-icon" />
                          <span>Compressed: {image.compressedSizeFormatted}</span>
                          {parseFloat(image.reduction) > 0 ? (
                            <span className="reduction-badge">-{image.reduction}%</span>
                          ) : (
                            <span className="reduction-badge minimal">No change</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="image-actions">
                      {image.status === 'completed' && (
                        <button
                          className="btn-icon download"
                          onClick={() => downloadFile(image)}
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      {!compressing && (
                        <button
                          className="btn-icon delete"
                          onClick={() => removeFile(image.id)}
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {imageFiles.length > 0 && (
            <div className="compress-actions">
              {imageFiles.some(f => f.compressedBlob) && (
                <button
                  className="btn-secondary"
                  onClick={downloadAll}
                  disabled={compressing}
                >
                  <Download size={20} />
                  Download All
                </button>
              )}
              <button
                className="btn-primary"
                onClick={compressAllImages}
                disabled={compressing || !backendAvailable}
              >
                {compressing ? (
                  <>
                    <span className="spinner"></span>
                    Compressing...
                  </>
                ) : (
                  <>
                    Compress {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageCompressor;