const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { notebooks } = require("../store");

// Configure multer for storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e10);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Upload a notebook
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const { roomCode, title } = req.body;
    const file = req.file;

    if (!roomCode || !file) {
      return res.status(400).json({ error: "Missing roomCode or file" });
    }

    const notebookEntry = {
      id: uuidv4(),
      roomCode,
      title: title || file.originalname,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadTime: Date.now(),
      url: `/api/notebooks/download/${file.filename}`
    };

    if (!notebooks.has(roomCode)) {
      notebooks.set(roomCode, []);
    }
    notebooks.get(roomCode).push(notebookEntry);

    res.status(201).json(notebookEntry);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Get notebooks for a room
router.get("/:roomCode", (req, res) => {
  const { roomCode } = req.params;
  const list = notebooks.get(roomCode) || [];
  res.json(list);
});

// Serve file download
router.get("/download/:fileName", (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.fileName);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

module.exports = router;
