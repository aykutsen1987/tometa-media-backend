import express from "express";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const upload = multer({ limits: { fileSize: 1024 * 1024 * 500 } }); // 500MB
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("ToMeta Media Server Running");
});

app.post("/media-convert", upload.single("file"), (req, res) => {
  try {
    const target = req.query.target;

    if (!req.file || !target) {
      return res.status(400).json({ error: "file or target missing" });
    }

    const inputPath = `/tmp/input_${Date.now()}`;
    const outputPath = `/tmp/output_${Date.now()}.${target}`;

    fs.writeFileSync(inputPath, req.file.buffer);

    const command = `ffmpeg -y -i "${inputPath}" "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error("FFmpeg error:", error);
        return res.status(500).json({ error: "ffmpeg failed" });
      }

      res.download(outputPath, () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "server crash" });
  }
});

app.listen(PORT, () => {
  console.log("ToMeta Media server running on port", PORT);
});
