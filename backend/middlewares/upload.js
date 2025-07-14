const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Organize files by type
    if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
      uploadPath += 'photos/';
    } else if (file.fieldname === 'idProof') {
      uploadPath += 'documents/';
    } else if (file.fieldname === 'signature') {
      uploadPath += 'signatures/';
    } else if (file.fieldname === 'logo') {
      uploadPath += 'logos/';
    } else {
      uploadPath += 'misc/';
    }
    
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'photo' || file.fieldname === 'avatar' || file.fieldname === 'logo') {
    // Images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photos'), false);
    }
  } else if (file.fieldname === 'idProof') {
    // Images and PDFs for ID proof
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed for ID proof'), false);
    }
  } else if (file.fieldname === 'signature') {
    // Images only for signatures
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for signatures'), false);
    }
  } else if (file.fieldname === 'csvFile') {
    // CSV files for bulk import
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected file field'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5, // Maximum 5 files per request
    fieldSize: 1024 * 1024 // 1MB field size limit
  }
});

// Middleware for handling file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum allowed size is 5MB.'
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum 5 files allowed.'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to delete uploaded files
const deleteFile = (filePath) => {
  const fs = require('fs');
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Helper function to get file URL
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath}`;
};

// Specific upload middlewares
const uploadVisitorFiles = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

const uploadUserAvatar = upload.single('avatar');

const uploadCompanyLogo = upload.single('logo');

const uploadBulkFile = upload.single('csvFile');

module.exports = {
  upload,
  uploadVisitorFiles,
  uploadUserAvatar,
  uploadCompanyLogo,
  uploadBulkFile,
  handleUploadError,
  deleteFile,
  getFileUrl
};