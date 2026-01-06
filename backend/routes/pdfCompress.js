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

// ✅ IMPROVED: Use environment variable for upload directory (Railway-friendly)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

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
        description: 'Low quality (72 dpi)',
        dpi: 72,
        colorImageResolution: 72,
        grayImageResolution: 72
      };
    case 'medium':
      return {
        setting: '/ebook',
        description: 'Medium quality (150 dpi)',
        dpi: 150,
        colorImageResolution: 150,
        grayImageResolution: 150
      };
    case 'high':
      return {
        setting: '/printer',
        description: 'High quality (300 dpi)',
        dpi: 300,
        colorImageResolution: 300,
        grayImageResolution: 300
      };
    case 'maximum':
      return {
        setting: '/prepress',
        description: 'Maximum quality (300+ dpi)',
        dpi: 300,
        colorImageResolution: 300,
        grayImageResolution: 300
      };
    default:
      return {
        setting: '/ebook',
        description: 'Medium quality (150 dpi)',
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

    // ✅ IMPROVED: Add timeout to prevent hanging (Railway has request timeouts)
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

    // ✅ IMPROVED: Execute with 60-second timeout
    await execPromise(gsCommand, { timeout: 60000 });

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

    // ✅ IMPROVED: Immediate cleanup using setImmediate instead of setTimeout
    setImmediate(async () => {
      try {
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
        console.log('🗑️  Cleaned up temp files');
      } catch (error) {
        console.error('Error cleaning up files:', error);
      }
    });

  } catch (error) {
    console.error('❌ Compression error:', error);

    // Cleanup on error
    try {
      if (inputPath) await fs.unlink(inputPath).catch(() => {});
      if (outputPath) await fs.unlink(outputPath).catch(() => {});
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    // ✅ IMPROVED: Better error messages
    let errorMessage = 'PDF compression failed';
    if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Compression timed out - file may be too large';
    }

    res.status(500).json({
      error: errorMessage,
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

        // ✅ IMPROVED: Add timeout for batch processing too
        await execPromise(gsCommand, { timeout: 60000 });

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
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});

        console.log(`✅ Compressed ${file.originalname}: ${reduction}% reduction`);

      } catch (error) {
        console.error(`❌ Error compressing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });

        // Cleanup on error
        try {
          if (inputPath) await fs.unlink(inputPath).catch(() => {});
          if (outputPath) await fs.unlink(outputPath).catch(() => {});
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
      instructions: 'Add nixpacks.toml with ghostscript to your Railway project'
    });
  }
});

// ✅ NEW: Cleanup old files periodically (prevents disk space issues)
const cleanupOldFiles = async () => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        
        // Delete files older than 1 hour
        if (now - stats.mtimeMs > ONE_HOUR) {
          await fs.unlink(filePath);
          console.log('🗑️  Cleaned up old file:', file);
        }
      } catch (error) {
        // File might have been deleted already
        continue;
      }
    }
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// ✅ NEW: Initial cleanup on startup
cleanupOldFiles();

export default router;