const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload/videos/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'));
        }
    }
});

router.get('/mechanic', (req, res) => {
    res.render('mechanic');
});


router.post('/upload-video', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log('Video uploaded successfully:', req.file.filename);
        console.log('File size:', req.file.size, 'bytes');
        console.log('Original name:', req.file.originalname);
        
        res.json({ 
            success: true, 
            message: 'Video uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

router.post('/upload-picture', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log('Video uploaded successfully:', req.file.filename);
        console.log('File size:', req.file.size, 'bytes');
        console.log('Original name:', req.file.originalname);
        
        res.json({ 
            success: true, 
            message: 'Video uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;
