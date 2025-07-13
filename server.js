const express = require('express');
const cors = require('cors');
const ffmpeg = require('./ffmpeg');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/downloads', express.static('downloads'));

app.post('/process-video', async (req, res) => {
  const { videoUrl, startTime, endTime, textOverlay } = req.body;

  if (!videoUrl || (!startTime && startTime !== 0) || !endTime || !textOverlay) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const outputFilename = await ffmpeg.processVideo(videoUrl, startTime, endTime, textOverlay);
    res.json({
      downloadUrl: `https://<seu-backend>.up.railway.app/downloads/${outputFilename}`
    });
  } catch (error) {
    console.error('Erro ao processar vídeo:', error);
    res.status(500).json({ error: 'Erro ao processar o vídeo' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
