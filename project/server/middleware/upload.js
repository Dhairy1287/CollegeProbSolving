const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const dir = path.join(__dirname, '../uploads', req.uploadFolder || 'misc');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

module.exports = upload;
