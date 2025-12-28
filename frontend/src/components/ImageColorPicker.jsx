import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Droplet, Copy, Check, Download, Palette, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import './ImageColorPicker.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function ImageColorPicker({ onClose }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);
  const [extractionMode, setExtractionMode] = useState('click'); // 'click' or 'palette'
  const [paletteSize, setPaletteSize] = useState(5);
  
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('color-picker', 3);

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      toast.error('Please upload an image file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Process uploaded image
  const processImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImagePreview(e.target.result);
        setSelectedColor(null);
        setColorPalette([]);
        
        // Draw image on canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions to fit canvas
        const maxWidth = 600;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Also draw on hidden canvas for color extraction
        const hiddenCanvas = hiddenCanvasRef.current;
        hiddenCanvas.width = img.width;
        hiddenCanvas.height = img.height;
        const hiddenCtx = hiddenCanvas.getContext('2d');
        hiddenCtx.drawImage(img, 0, 0);
        
        toast.success('Image loaded! Click to pick colors');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle canvas click to pick color
  const handleCanvasClick = (e) => {
    if (!image) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to actual image size
    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;
    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);
    
    // Get color from hidden canvas (full resolution)
    const hiddenCanvas = hiddenCanvasRef.current;
    const ctx = hiddenCanvas.getContext('2d');
    const pixel = ctx.getImageData(actualX, actualY, 1, 1).data;
    
    const color = {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      hex: rgbToHex(pixel[0], pixel[1], pixel[2]),
      rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
      hsl: rgbToHsl(pixel[0], pixel[1], pixel[2])
    };
    
    setSelectedColor(color);
    
    // Draw crosshair
    const displayCanvas = canvasRef.current;
    const displayCtx = displayCanvas.getContext('2d');
    displayCtx.drawImage(hiddenCanvas, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    
    // Draw crosshair at click position
    displayCtx.strokeStyle = color.r + color.g + color.b > 382 ? '#000' : '#fff';
    displayCtx.lineWidth = 2;
    displayCtx.beginPath();
    displayCtx.moveTo(x - 10, y);
    displayCtx.lineTo(x + 10, y);
    displayCtx.moveTo(x, y - 10);
    displayCtx.lineTo(x, y + 10);
    displayCtx.stroke();
    
    // Draw circle
    displayCtx.beginPath();
    displayCtx.arc(x, y, 20, 0, Math.PI * 2);
    displayCtx.stroke();
  };

  // Extract color palette from image
  const extractPalette = () => {
    if (!image) return;
    
    const hiddenCanvas = hiddenCanvasRef.current;
    const ctx = hiddenCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const pixels = imageData.data;
    
    // Sample pixels (every 10th pixel for performance)
    const colorMap = new Map();
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const hex = rgbToHex(r, g, b);
      colorMap.set(hex, { r, g, b, count: (colorMap.get(hex)?.count || 0) + 1 });
    }
    
    // Get most common colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, paletteSize)
      .map(([hex, rgb]) => ({
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        hex,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: rgbToHsl(rgb.r, rgb.g, rgb.b)
      }));
    
    setColorPalette(sortedColors);
    toast.success(`Extracted ${sortedColors.length} dominant colors`);
  };

  // Color conversion utilities
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Copy color to clipboard
  const copyColor = (format, color) => {
    let text;
    switch (format) {
      case 'hex':
        text = color.hex;
        break;
      case 'rgb':
        text = color.rgb;
        break;
      case 'hsl':
        text = color.hsl;
        break;
      default:
        text = color.hex;
    }
    
    navigator.clipboard.writeText(text);
    setCopiedColor(`${format}-${color.hex}`);
    toast.success(`Copied ${text}`);
    
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Export palette
  const exportPalette = () => {
    if (colorPalette.length === 0) {
      toast.error('No palette to export');
      return;
    }
    
    const paletteData = colorPalette.map((color, index) => ({
      index: index + 1,
      hex: color.hex,
      rgb: color.rgb,
      hsl: color.hsl
    }));
    
    const json = JSON.stringify(paletteData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Palette exported!');
  };

  return (
    <div className="color-picker-modal">
      <div className="color-picker-container">
        <div className="color-picker-header">
          <h2>Image Color Picker</h2>
          <p>Upload an image and click to extract colors</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="color-picker-content">
          {!imagePreview ? (
            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={64} />
              <h3>Upload Image</h3>
              <p>Click or drag & drop an image to extract colors</p>
              <button className="upload-btn">
                <Upload size={20} />
                Choose Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <>
              {/* Image Canvas */}
              <div className="canvas-section">
                <div className="canvas-wrapper">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{ cursor: 'crosshair' }}
                  />
                  <canvas
                    ref={hiddenCanvasRef}
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="canvas-controls">
                  <button
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={18} />
                    Change Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Mode Selection */}
              <div className="mode-section">
                <div className="mode-tabs">
                  <button
                    className={`mode-tab ${extractionMode === 'click' ? 'active' : ''}`}
                    onClick={() => setExtractionMode('click')}
                  >
                    <Droplet size={18} />
                    Click to Pick
                  </button>
                  <button
                    className={`mode-tab ${extractionMode === 'palette' ? 'active' : ''}`}
                    onClick={() => setExtractionMode('palette')}
                  >
                    <Palette size={18} />
                    Extract Palette
                  </button>
                </div>
              </div>

              {/* Click Mode - Selected Color */}
              {extractionMode === 'click' && selectedColor && (
                <div className="selected-color-section">
                  <h3>Selected Color</h3>
                  <div className="color-details">
                    <div
                      className="color-swatch-large"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <div className="color-values">
                      <div className="color-value-row">
                        <span className="label">HEX:</span>
                        <code>{selectedColor.hex}</code>
                        <button
                          className="btn-copy"
                          onClick={() => copyColor('hex', selectedColor)}
                        >
                          {copiedColor === `hex-${selectedColor.hex}` ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <div className="color-value-row">
                        <span className="label">RGB:</span>
                        <code>{selectedColor.rgb}</code>
                        <button
                          className="btn-copy"
                          onClick={() => copyColor('rgb', selectedColor)}
                        >
                          {copiedColor === `rgb-${selectedColor.hex}` ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <div className="color-value-row">
                        <span className="label">HSL:</span>
                        <code>{selectedColor.hsl}</code>
                        <button
                          className="btn-copy"
                          onClick={() => copyColor('hsl', selectedColor)}
                        >
                          {copiedColor === `hsl-${selectedColor.hex}` ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Palette Mode */}
              {extractionMode === 'palette' && (
                <div className="palette-section">
                  <div className="palette-controls">
                    <div className="form-group">
                      <label>Palette Size</label>
                      <select
                        value={paletteSize}
                        onChange={(e) => setPaletteSize(Number(e.target.value))}
                      >
                        <option value={3}>3 colors</option>
                        <option value={5}>5 colors</option>
                        <option value={8}>8 colors</option>
                        <option value={10}>10 colors</option>
                        <option value={15}>15 colors</option>
                      </select>
                    </div>
                    <button className="btn-extract" onClick={extractPalette}>
                      <Palette size={18} />
                      Extract Palette
                    </button>
                  </div>

                  {colorPalette.length > 0 && (
                    <>
                      <div className="palette-grid">
                        {colorPalette.map((color, index) => (
                          <div key={index} className="palette-item">
                            <div
                              className="color-swatch"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="palette-item-details">
                              <div className="color-value-row">
                                <code className="small">{color.hex}</code>
                                <button
                                  className="btn-copy-small"
                                  onClick={() => copyColor('hex', color)}
                                >
                                  {copiedColor === `hex-${color.hex}` ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                              <div className="color-value-row">
                                <code className="small">{color.rgb}</code>
                                <button
                                  className="btn-copy-small"
                                  onClick={() => copyColor('rgb', color)}
                                >
                                  {copiedColor === `rgb-${color.hex}` ? (
                                    <Check size={14} />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button className="btn-export" onClick={exportPalette}>
                        <Download size={18} />
                        Export Palette JSON
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageColorPicker;