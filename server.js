import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 10000;

const upload = multer({
  dest: "/tmp",
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

app.post("/media-convert", upload.single("file"), (req, res) => {
  if (!req.file || !req.body.target) {
    return res.status(400).json({ error: "file or target missing" });
  }

  const inputPath = req.file.path;
  const target = req.body.target.toLowerCase();
  const outputPath = `${inputPath}.${target}`;

  let command;

  if (req.file.mimetype.startsWith("video")) {
    command = `ffmpeg -y -i "${inputPath}" "${outputPath}"`;
  } else if (req.file.mimetype.startsWith("audio")) {
    command = `ffmpeg -y -i "${inputPath}" "${outputPath}"`;
  } else {
    return res.status(400).json({ error: "unsupported file type" });
  }

  exec(command, (err) => {
  if (err) {
    console.error("FFmpeg error:", err);
    return res.status(500).json({ error: "ffmpeg failed" });
  }

  res.download(outputPath, () => {
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  });
});

