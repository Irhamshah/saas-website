import React, { useState } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, Download, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';
import './ImageToPDF.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function ImageToPDF({ onClose }) {
  const [imageFiles, setImageFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pageSize, setPageSize] = useState('A4'); // A4, Letter, or Fit

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  // ✅ Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('image-pdf', 3);

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
          size: file.size,
          sizeFormatted: formatFileSize(file.size)
        };
      })
    );

    setImageFiles(prev => [...prev, ...newFiles]);
    setPdfBlob(null); // Reset PDF when adding new images
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
    setPdfBlob(null);
    toast.success('Image removed');
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...imageFiles];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setImageFiles(newFiles);
    setPdfBlob(null);
  };

  const moveDown = (index) => {
    if (index === imageFiles.length - 1) return;
    const newFiles = [...imageFiles];
    [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    setImageFiles(newFiles);
    setPdfBlob(null);
  };

  const getPageDimensions = () => {
    switch (pageSize) {
      case 'A4':
        return { width: 595, height: 842 }; // A4 in points (72 DPI)
      case 'Letter':
        return { width: 612, height: 792 }; // US Letter in points
      case 'Fit':
        return null; // Will use image dimensions
      default:
        return { width: 595, height: 842 };
    }
  };

  const convertToPDF = async () => {
    // ✅ CHECK LIMIT FIRST
    if (!canUse) {
      showLimitError();
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Please add images to convert');
      return;
    }

    setConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageFile of imageFiles) {
        const imageBytes = await imageFile.file.arrayBuffer();
        let image;

        // Embed image based on type
        if (imageFile.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (imageFile.file.type === 'image/jpeg' || imageFile.file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          // Convert other formats to canvas then to JPEG
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();

          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageFile.preview;
          });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
          image = await pdfDoc.embedJpg(jpegBytes);
        }

        const imageDims = image.scale(1);
        let page;

        if (pageSize === 'Fit') {
          // Create page to fit image
          page = pdfDoc.addPage([imageDims.width, imageDims.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height,
          });
        } else {
          // Create standard size page
          const pageDims = getPageDimensions();
          page = pdfDoc.addPage([pageDims.width, pageDims.height]);

          // Calculate scaling to fit image on page (maintain aspect ratio)
          const scale = Math.min(
            pageDims.width / imageDims.width,
            pageDims.height / imageDims.height
          );

          const scaledWidth = imageDims.width * scale;
          const scaledHeight = imageDims.height * scale;

          // Center image on page
          const x = (pageDims.width - scaledWidth) / 2;
          const y = (pageDims.height - scaledHeight) / 2;

          page.drawImage(image, {
            x: x,
            y: y,
            width: scaledWidth,
            height: scaledHeight,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfBlob(blob);

      await incrementUsage();
      
      toast.success('PDF created successfully! 🎉');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to create PDF');
    } finally {
      setConverting(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'images-to-pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Downloaded!');
  };

  const clearAll = () => {
    if (confirm('Remove all images?')) {
      setImageFiles([]);
      setPdfBlob(null);
      toast.success('All images removed');
    }
  };

  return (
    <div className="image-pdf-modal">
      <div className="image-pdf-container">
        <div className="image-pdf-header">
          <h2>Image to PDF Converter</h2>
          <p>Convert multiple images into a single PDF document</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="image-pdf-content">
          {/* ✅ ADD USAGE INDICATOR */}
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />
          {/* Page Size Selection */}
          <div className="page-size-settings">
            <div className="settings-label">
              <FileText size={18} />
              Page Size
            </div>
            <div className="page-size-options">
              <button
                className={`page-btn ${pageSize === 'A4' ? 'active' : ''}`}
                onClick={() => { setPageSize('A4'); setPdfBlob(null); }}
                disabled={converting}
              >
                A4
              </button>
              <button
                className={`page-btn ${pageSize === 'Letter' ? 'active' : ''}`}
                onClick={() => { setPageSize('Letter'); setPdfBlob(null); }}
                disabled={converting}
              >
                Letter
              </button>
              <button
                className={`page-btn ${pageSize === 'Fit' ? 'active' : ''}`}
                onClick={() => { setPageSize('Fit'); setPdfBlob(null); }}
                disabled={converting}
              >
                Fit to Image
              </button>
            </div>
            <p className="settings-description">
              {pageSize === 'A4' && 'Standard A4 size (210 × 297 mm)'}
              {pageSize === 'Letter' && 'US Letter size (8.5 × 11 inches)'}
              {pageSize === 'Fit' && 'Each page sized to fit the image'}
            </p>
          </div>

          {/* Upload Area */}
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('image-pdf-input').click()}
          >
            <input
              id="image-pdf-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={48} />
            <h3>Drop images here or click to browse</h3>
            <p>Supports JPG, PNG, WebP, and more • Multiple images supported</p>
          </div>

          {/* Image List */}
          {imageFiles.length > 0 && (
            <div className="files-section">
              <div className="files-header">
                <h3>Images ({imageFiles.length})</h3>
                <button className="btn-text" onClick={clearAll} disabled={converting}>
                  Clear All
                </button>
              </div>

              <div className="images-grid">
                {imageFiles.map((image, index) => (
                  <div key={image.id} className="image-item">
                    <div className="image-preview">
                      <img src={image.preview} alt={image.name} />
                      <div className="image-order">{index + 1}</div>
                    </div>

                    <div className="image-info">
                      <div className="image-name">{image.name}</div>
                      <div className="image-meta">
                        <span>{image.width} × {image.height}</span>
                        <span>{image.sizeFormatted}</span>
                      </div>
                    </div>

                    <div className="image-actions">
                      <button
                        className="btn-icon"
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || converting}
                        title="Move up"
                      >
                        <ArrowUp size={18} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => moveDown(index)}
                        disabled={index === imageFiles.length - 1 || converting}
                        title="Move down"
                      >
                        <ArrowDown size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => removeFile(image.id)}
                        disabled={converting}
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {imageFiles.length > 0 && (
            <div className="convert-actions">
              {pdfBlob && (
                <button
                  className="btn-secondary"
                  onClick={downloadPDF}
                >
                  <Download size={20} />
                  Download PDF
                </button>
              )}
              <button
                className="btn-primary"
                onClick={convertToPDF}
                disabled={converting}
              >
                {converting ? (
                  <>
                    <span className="spinner"></span>
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Create PDF from {imageFiles.length} image{imageFiles.length > 1 ? 's' : ''}
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

export default ImageToPDF;