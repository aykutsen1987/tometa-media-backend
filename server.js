import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const upload = multer();
const PORT = process.env.PORT || 10000;

app.post("/media-convert", upload.single("file"), (req, res) => {
  if (!req.file || !req.body.target) {
    return res.status(400).json({ error: "file or target missing" });
  }

  const inputPath = `/tmp/${Date.now()}_${req.file.originalname}`;
  const outputPath = `/tmp/output_${Date.now()}.${req.body.target}`;

  fs.writeFileSync(inputPath, req.file.buffer);

  let command;

  if (req.file.mimetype.startsWith("video")) {
    if (["mp3", "wav"].includes(req.body.target)) {
      command = `ffmpeg -i "${inputPath}" "${outputPath}"`;
    } else {
      command = `ffmpeg -i "${inputPath}" -c copy "${outputPath}"`;
    }
  } else if (req.file.mimetype.startsWith("audio")) {
    command = `ffmpeg -i "${inputPath}" "${outputPath}"`;
  } else {
    return res.status(400).json({ error: "unsupported file type" });
  }

  exec(command, (err) => {
    if (err) {
      return res.status(500).json({ error: "ffmpeg failed" });
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.get("/", (req, res) => {
  res.send("ToMeta Media Server Running");
});

app.listen(PORT, () => {
  console.log("ToMeta Media server running on port", PORT);
});
