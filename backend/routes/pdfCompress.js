import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const execPromise = promisify(exec);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `pdf-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get Ghostscript settings based on quality level
const getGhostscriptSettings = (quality) => {
  switch (quality) {
    case 'low':
      return {
        setting: '/screen',
        description: 'Screen quality (72 dpi)',
        dpi: 72,
        colorImageResolution: 72,
        grayImageResolution: 72
      };
    case 'medium':
      return {
        setting: '/ebook',
        description: 'eBook quality (150 dpi)',
        dpi: 150,
        colorImageResolution: 150,
        grayImageResolution: 150
      };
    case 'high':
      return {
        setting: '/printer',
        description: 'Printer quality (300 dpi)',
        dpi: 300,
        colorImageResolution: 300,
        grayImageResolution: 300
      };
    case 'maximum':
      return {
        setting: '/prepress',
        description: 'Prepress quality (300+ dpi)',
        dpi: 300,
        colorImageResolution: 300,
        grayImageResolution: 300
      };
    default:
      return {
        setting: '/ebook',
        description: 'eBook quality (150 dpi)',
        dpi: 150,
        colorImageResolution: 150,
        grayImageResolution: 150
      };
  }
};

// @route   POST /api/pdf/compress
// @desc    Compress a PDF file
// @access  Public (add auth if needed)
router.post('/compress', upload.single('pdf'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    inputPath = req.file.path;
    const quality = req.body.quality || 'medium';
    const settings = getGhostscriptSettings(quality);
    
    // Create output path
    outputPath = path.join(
      path.dirname(inputPath),
      `compressed-${path.basename(inputPath)}`
    );

    console.log('🔵 Compressing PDF:', {
      input: inputPath,
      output: outputPath,
      quality: quality,
      settings: settings.description
    });

    // Get original file size
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    // Ghostscript compression command
    const gsCommand = `gs -sDEVICE=pdfwrite \
      -dCompatibilityLevel=1.4 \
      -dPDFSETTINGS=${settings.setting} \
      -dNOPAUSE \
      -dQUIET \
      -dBATCH \
      -dDownsampleColorImages=true \
      -dColorImageResolution=${settings.colorImageResolution} \
      -dDownsampleGrayImages=true \
      -dGrayImageResolution=${settings.grayImageResolution} \
      -dCompressPages=true \
      -dColorImageDownsampleType=/Bicubic \
      -dGrayImageDownsampleType=/Bicubic \
      -sOutputFile="${outputPath}" \
      "${inputPath}"`;

    // Execute compression
    await execPromise(gsCommand);

    // Check if output file exists
    try {
      await fs.access(outputPath);
    } catch (error) {
      throw new Error('Compression failed - output file not created');
    }

    // Get compressed file size
    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size;

    // Calculate reduction
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

    console.log('✅ Compression successful:', {
      originalSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
      compressedSize: `${(compressedSize / 1024 / 1024).toFixed(2)} MB`,
      reduction: `${reduction}%`
    });

    // Read compressed file
    const compressedBuffer = await fs.readFile(outputPath);

    // Set response headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${req.file.originalname.replace('.pdf', '_compressed.pdf')}"`,
      'X-Original-Size': originalSize,
      'X-Compressed-Size': compressedSize,
      'X-Reduction': reduction
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
      error: 'PDF compression failed',
      message: error.message
    });
  }
});

// @route   POST /api/pdf/compress-batch
// @desc    Compress multiple PDF files
// @access  Public (add auth if needed)
router.post('/compress-batch', upload.array('pdfs', 10), async (req, res) => {
  const processedFiles = [];
  const errors = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded' });
    }

    const quality = req.body.quality || 'medium';
    const settings = getGhostscriptSettings(quality);

    console.log(`🔵 Batch compressing ${req.files.length} PDFs with ${quality} quality`);

    for (const file of req.files) {
      let inputPath = file.path;
      let outputPath = null;

      try {
        outputPath = path.join(
          path.dirname(inputPath),
          `compressed-${path.basename(inputPath)}`
        );

        // Get original size
        const originalStats = await fs.stat(inputPath);
        const originalSize = originalStats.size;

        // Compress
        const gsCommand = `gs -sDEVICE=pdfwrite \
          -dCompatibilityLevel=1.4 \
          -dPDFSETTINGS=${settings.setting} \
          -dNOPAUSE \
          -dQUIET \
          -dBATCH \
          -dDownsampleColorImages=true \
          -dColorImageResolution=${settings.colorImageResolution} \
          -dDownsampleGrayImages=true \
          -dGrayImageResolution=${settings.grayImageResolution} \
          -sOutputFile="${outputPath}" \
          "${inputPath}"`;

        await execPromise(gsCommand);

        // Get compressed size
        const compressedStats = await fs.stat(outputPath);
        const compressedSize = compressedStats.size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        // Read compressed file
        const compressedBuffer = await fs.readFile(outputPath);

        processedFiles.push({
          originalName: file.originalname,
          originalSize,
          compressedSize,
          reduction,
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
      processed: processedFiles.length,
      errors: errors.length,
      files: processedFiles,
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

// @route   GET /api/pdf/check
// @desc    Check if Ghostscript is installed
// @access  Public
router.get('/check', async (req, res) => {
  try {
    const { stdout } = await execPromise('gs --version');
    res.json({
      installed: true,
      version: stdout.trim(),
      message: 'Ghostscript is installed and ready'
    });
  } catch (error) {
    res.status(500).json({
      installed: false,
      message: 'Ghostscript is not installed',
      instructions: 'Install with: brew install ghostscript (Mac) or apt-get install ghostscript (Linux)'
    });
  }
});

export default router;