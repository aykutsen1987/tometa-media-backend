app.post("/media-convert", upload.single("file"), (req, res) => {
  const target = req.query.target;

  console.log("TARGET:", target);
  console.log("FILE:", req.file?.mimetype);

  if (!req.file || !target) {
    return res.status(400).json({ error: "file or target missing" });
  }

  const inputPath = `/tmp/${Date.now()}_${req.file.originalname}`;
  const outputPath = `/tmp/output.${target}`;

  fs.writeFileSync(inputPath, req.file.buffer);

  let command;

  if (req.file.mimetype.startsWith("video")) {
    command = `ffmpeg -i "${inputPath}" "${outputPath}"`;
  } else if (req.file.mimetype.startsWith("audio")) {
    command = `ffmpeg -i "${inputPath}" "${outputPath}"`;
  } else {
    return res.status(400).json({ error: "unsupported file type" });
  }

  exec(command, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "ffmpeg failed" });
    }

    res.download(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});
