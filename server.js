const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Keep original filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const originalName = file.originalname;
        cb(null, `${timestamp}_${originalName}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API endpoint to get all uploaded images
app.get('/api/images', (req, res) => {
    // This should return an array of image objects, e.g.:
    // [{ url: '/uploads/filename.jpg', uploadTime: 1234567890 }, ...]
    // Example:
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) return res.json([]);
        const images = files.map(file => ({
            url: '/uploads/' + file,
            uploadTime: fs.statSync(path.join(uploadsDir, file)).mtime
        }));
        res.json(images);
    });
});

// API endpoint to upload images
app.post('/api/upload', upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadTime: new Date(),
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        };

        console.log(`New image uploaded: ${req.file.originalname}`);
        res.json({ success: true, image: imageInfo });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Photo sharing server running on http://localhost:${PORT}`);
    console.log('Upload directory:', uploadsDir);
});
