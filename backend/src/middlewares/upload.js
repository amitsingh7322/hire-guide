const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'general';
    
    if (file.fieldname === 'avatar') subDir = 'avatars';
    else if (file.fieldname === 'hotelImages') subDir = 'hotels';
    else if (file.fieldname === 'vehicleImages') subDir = 'vehicles';
    else if (file.fieldname === 'verificationDocs') subDir = 'documents';
    else if (file.fieldname === 'reviewImages') subDir = 'reviews';
    
    const dir = path.join(uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

// Upload routes
const uploadSingle = upload.single('file');
const uploadAvatar = upload.single('avatar');
const uploadMultiple = upload.array('files', 10);
const uploadHotelImages = upload.array('hotelImages', 10);
const uploadVehicleImages = upload.array('vehicleImages', 5);
const uploadVerificationDocs = upload.array('verificationDocs', 5);
const uploadReviewImages = upload.array('reviewImages', 5);

module.exports = {
  uploadSingle,
  uploadAvatar,
  uploadMultiple,
  uploadHotelImages,
  uploadVehicleImages,
  uploadVerificationDocs,
  uploadReviewImages,
};
