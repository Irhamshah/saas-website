import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Use /tmp directory for production (Render)
const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.NODE_ENV === 'production' ? '/tmp/uploads' : path.join(__dirname, '../uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_IMAGE_SIZE) || 20 * 1024 * 1024 // 20MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get compression settings based on quality
const getCompressionSettings = (quality) => {
  const qualityValue = parseFloat(quality);
  
  // Sharp uses quality 1-100 for JPEG
  // We receive 0.1-1.0, convert to 10-100
  const jpegQuality = Math.round(qualityValue * 100);
  
  return {
    jpeg: {
      quality: jpegQuality,
      progressive: true,
      mozjpeg: true // Better compression
    },
    png: {
      quality: jpegQuality,
      compressionLevel: jpegQuality < 50 ? 9 : jpegQuality < 80 ? 6 : 3,
      progressive: true
    },
    webp: {
      quality: jpegQuality,
      effort: 6 // Balance speed vs compression
    }
  };
};

// @route   POST /api/image/compress
// @desc    Compress a single image
// @access  Public
router.post('/compress', upload.single('image'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    inputPath = req.file.path;
    const quality = parseFloat(req.body.quality) || 0.8;
    const format = req.body.format || 'jpeg'; // jpeg, png, webp
    const settings = getCompressionSettings(quality);

    // Create output path
    const outputExt = format === 'jpeg' ? '.jpg' : `.${format}`;
    outputPath = path.join(
      path.dirname(inputPath),
      `compressed-${Date.now()}${outputExt}`
    );

    console.log('🔵 Compressing image:', {
      input: inputPath,
      output: outputPath,
      quality: quality,
      format: format
    });

    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();

    // Compress image with Sharp
    let sharpInstance = sharp(inputPath);

    // Apply format-specific compression
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg(settings.jpeg);
        break;
      case 'png':
        sharpInstance = sharpInstance.png(settings.png);
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp(settings.webp);
        break;
      default:
        sharpInstance = sharpInstance.jpeg(settings.jpeg);
    }

    // Save compressed image
    await sharpInstance.toFile(outputPath);

    // Get compressed file size
    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size;

    // Calculate reduction
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log('✅ Compression successful:', {
      originalSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
      compressedSize: `${(compressedSize / 1024 / 1024).toFixed(2)} MB`,
      reduction: `${reduction}%`,
      dimensions: `${metadata.width}x${metadata.height}`
    });

    // Read compressed file
    const compressedBuffer = await fs.readFile(outputPath);

    // Set response headers
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Disposition': `attachment; filename="${req.file.originalname.replace(/\.[^/.]+$/, outputExt)}"`,
      'X-Original-Size': originalSize,
      'X-Compressed-Size': compressedSize,
      'X-Reduction': reduction,
      'X-Width': metadata.width,
      'X-Height': metadata.height
    });

    // Send file
    res.send(compressedBuffer);

    // Cleanup files after sending
    setTimeout(async () => {
      try {
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
        console.log('🗑️ Cleaned up temp files');
      } catch (error) {
        console.error('Error cleaning up files:', error);
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Compression error:', error);

    // Cleanup on error
    try {
      if (inputPath) await fs.unlink(inputPath);
      if (outputPath) await fs.unlink(outputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    res.status(500).json({
      error: 'Image compression failed',
      message: error.message
    });
  }
});

// @route   POST /api/image/compress-batch
// @desc    Compress multiple images
// @access  Public
router.post('/compress-batch', upload.array('images', 20), async (req, res) => {
  const processedImages = [];
  const errors = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded' });
    }

    const quality = parseFloat(req.body.quality) || 0.8;
    const format = req.body.format || 'jpeg';
    const settings = getCompressionSettings(quality);

    console.log(`🔵 Batch compressing ${req.files.length} images with ${Math.round(quality * 100)}% quality`);

    for (const file of req.files) {
      let inputPath = file.path;
      let outputPath = null;

      try {
        const outputExt = format === 'jpeg' ? '.jpg' : `.${format}`;
        outputPath = path.join(
          path.dirname(inputPath),
          `compressed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${outputExt}`
        );

        // Get original size and metadata
        const originalStats = await fs.stat(inputPath);
        const originalSize = originalStats.size;
        const metadata = await sharp(inputPath).metadata();

        // Compress
        let sharpInstance = sharp(inputPath);
        switch (format) {
          case 'jpeg':
            sharpInstance = sharpInstance.jpeg(settings.jpeg);
            break;
          case 'png':
            sharpInstance = sharpInstance.png(settings.png);
            break;
          case 'webp':
            sharpInstance = sharpInstance.webp(settings.webp);
            break;
        }

        await sharpInstance.toFile(outputPath);

        // Get compressed size
        const compressedStats = await fs.stat(outputPath);
        const compressedSize = compressedStats.size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        // Read compressed file
        const compressedBuffer = await fs.readFile(outputPath);

        processedImages.push({
          originalName: file.originalname,
          originalSize,
          compressedSize,
          reduction,
          width: metadata.width,
          height: metadata.height,
          format: format,
          data: compressedBuffer.toString('base64')
        });

        // Cleanup
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);

        console.log(`✅ Compressed ${file.originalname}: ${reduction}% reduction`);

      } catch (error) {
        console.error(`❌ Error compressing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });

        // Cleanup on error
        try {
          if (inputPath) await fs.unlink(inputPath);
          if (outputPath) await fs.unlink(outputPath);
        } catch (cleanupError) {
          console.error('Error cleaning up:', cleanupError);
        }
      }
    }

    res.json({
      success: true,
      processed: processedImages.length,
      errors: errors.length,
      images: processedImages,
      errorDetails: errors
    });

  } catch (error) {
    console.error('❌ Batch compression error:', error);
    res.status(500).json({
      error: 'Batch compression failed',
      message: error.message
    });
  }
});

// @route   POST /api/image/resize
// @desc    Resize and compress an image
// @access  Public
router.post('/resize', upload.single('image'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    inputPath = req.file.path;
    const quality = parseFloat(req.body.quality) || 0.8;
    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);
    const fit = req.body.fit || 'cover'; // cover, contain, fill, inside, outside
    const format = req.body.format || 'jpeg';

    const settings = getCompressionSettings(quality);

    outputPath = path.join(
      path.dirname(inputPath),
      `resized-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`
    );

    console.log('🔵 Resizing image:', {
      input: inputPath,
      width: width || 'auto',
      height: height || 'auto',
      fit: fit,
      quality: quality
    });

    // Get original metadata
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;
    const metadata = await sharp(inputPath).metadata();

    // Resize and compress
    let sharpInstance = sharp(inputPath);

    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, { fit: fit });
    }

    // Apply format-specific compression
    switch (format) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg(settings.jpeg);
        break;
      case 'png':
        sharpInstance = sharpInstance.png(settings.png);
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp(settings.webp);
        break;
    }

    await sharpInstance.toFile(outputPath);

    // Get result stats
    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size;
    const resultMetadata = await sharp(outputPath).metadata();
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log('✅ Resize successful:', {
      originalDimensions: `${metadata.width}x${metadata.height}`,
      newDimensions: `${resultMetadata.width}x${resultMetadata.height}`,
      reduction: `${reduction}%`
    });

    // Read and send
    const compressedBuffer = await fs.readFile(outputPath);

    res.set({
      'Content-Type': `image/${format}`,
      'Content-Disposition': `attachment; filename="resized-${req.file.originalname}"`,
      'X-Original-Size': originalSize,
      'X-Compressed-Size': compressedSize,
      'X-Reduction': reduction,
      'X-Original-Width': metadata.width,
      'X-Original-Height': metadata.height,
      'X-New-Width': resultMetadata.width,
      'X-New-Height': resultMetadata.height
    });

    res.send(compressedBuffer);

    // Cleanup
    setTimeout(async () => {
      try {
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
        console.log('🗑️ Cleaned up temp files');
      } catch (error) {
        console.error('Error cleaning up files:', error);
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Resize error:', error);

    try {
      if (inputPath) await fs.unlink(inputPath);
      if (outputPath) await fs.unlink(outputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }

    res.status(500).json({
      error: 'Image resize failed',
      message: error.message
    });
  }
});

// @route   GET /api/image/check
// @desc    Check if Sharp is installed
// @access  Public
router.get('/check', async (req, res) => {
  try {
    const sharpVersion = sharp.versions;
    res.json({
      installed: true,
      sharp: sharpVersion.sharp,
      libvips: sharpVersion.vips,
      message: 'Sharp is installed and ready',
      uploadDir: UPLOAD_DIR,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      installed: false,
      message: 'Sharp is not installed',
      error: error.message,
      instructions: 'Install with: npm install sharp'
    });
  }
});

export default router;