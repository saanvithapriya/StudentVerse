const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
const productUploadDir = path.join(uploadDir, 'products');

[uploadDir, productUploadDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Generic storage (for notes)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
    }
});

// Product image storage
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, productUploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
    }
});

// Image file filter
const imageFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    if (ext && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10 MB
});

const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 8 * 1024 * 1024 },  // 8 MB
    fileFilter: imageFilter
});

module.exports = upload;
module.exports.uploadProduct = uploadProduct;
