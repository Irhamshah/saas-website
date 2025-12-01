import React, { useState } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, Download, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import './ImageCompressor.css';

function ImageCompressor({ onClose }) {
  const [imageFiles, setImageFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [quality, setQuality] = useState(0.8);

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
          originalSize: file.size,
          originalSizeFormatted: formatFileSize(file.size),
          compressedSize: null,
          compressedSizeFormatted: null,
          preview: preview,
          dimensions: dimensions,
          status: 'ready',
          compressedBlob: null,
          compressedPreview: null
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

  const compressImage = async (fileData) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                blob: blob,
                size: blob.size,
                preview: e.target.result
              });
            };
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = fileData.preview;
    });
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

        // Compress
        const { blob, size, preview } = await compressImage(fileData);
        
        // Calculate reduction
        const reduction = ((fileData.originalSize - size) / fileData.originalSize * 100).toFixed(1);
        
        // Update with results
        setImageFiles(prev => prev.map((f, idx) => 
          idx === i ? {
            ...f,
            status: 'completed',
            compressedBlob: blob,
            compressedSize: size,
            compressedSizeFormatted: formatFileSize(size),
            compressedPreview: preview,
            reduction: reduction
          } : f
        ));
      }

      toast.success('All images compressed successfully! 🎉');

    } catch (error) {
      console.error('Error compressing images:', error);
      toast.error('Failed to compress some images');
      
      // Reset status
      setImageFiles(prev => prev.map(f => ({ ...f, status: 'ready' })));
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
    if (quality >= 0.9) return 'High Quality (90-100%)';
    if (quality >= 0.7) return 'Good Quality (70-89%)';
    if (quality >= 0.5) return 'Medium Quality (50-69%)';
    return 'Low Quality (<50%)';
  };

  return (
    <div className="compressor-modal">
      <div className="compressor-container">
        <div className="compressor-header">
          <div>
            <h2>Image Compressor</h2>
            <p>Reduce image file sizes while maintaining quality</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="compressor-content">
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
              className="quality-slider"
              disabled={compressing}
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
            <p>JPG, PNG, WebP supported • Select multiple images</p>
          </div>

          {/* Image Grid */}
          {imageFiles.length > 0 && (
            <div className="files-section">
              <div className="files-header">
                <h3>Images to Compress ({imageFiles.length})</h3>
                <button className="btn-text" onClick={clearAll} disabled={compressing}>
                  Clear All
                </button>
              </div>

              <div className="image-grid">
                {imageFiles.map((file) => (
                  <div key={file.id} className={`image-card ${file.status}`}>
                    <div className="image-preview">
                      <img 
                        src={file.compressedPreview || file.preview} 
                        alt={file.name}
                      />
                      
                      {file.status === 'processing' && (
                        <div className="processing-overlay">
                          <div className="spinner-large"></div>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="completed-badge">✓</div>
                      )}
                    </div>

                    <div className="image-info">
                      <div className="image-name">{file.name}</div>
                      <div className="image-details">
                        <span>{file.dimensions.width} × {file.dimensions.height}</span>
                      </div>
                      <div className="image-sizes">
                        <div className="size-item">
                          <span className="size-label">Original</span>
                          <span className="size-value">{file.originalSizeFormatted}</span>
                        </div>
                        {file.compressedSizeFormatted && (
                          <>
                            <ArrowDown size={12} className="arrow-icon" />
                            <div className="size-item compressed">
                              <span className="size-label">Compressed</span>
                              <span className="size-value">{file.compressedSizeFormatted}</span>
                            </div>
                            <span className="reduction-badge">-{file.reduction}%</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="image-actions">
                      {file.status === 'completed' && (
                        <button
                          className="btn-icon-small download"
                          onClick={() => downloadFile(file)}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      {!compressing && (
                        <button
                          className="btn-icon-small delete"
                          onClick={() => removeFile(file.id)}
                          title="Remove"
                        >
                          <Trash2 size={16} />
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
                disabled={compressing}
              >
                {compressing ? (
                  <>
                    <span className="spinner"></span>
                    Compressing...
                  </>
                ) : (
                  <>
                    Compress {imageFiles.length} Image{imageFiles.length > 1 ? 's' : ''}
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