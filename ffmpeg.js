const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

const INPUT_VIDEO_PATH = path.resolve(__dirname, 'downloads/input.mp4');
const OUTPUT_VIDEO_PATH = (filename) => path.resolve(__dirname, `downloads/${filename}`);

async function downloadYouTubeVideo(url) {
  const writeStream = fs.createWriteStream(INPUT_VIDEO_PATH);
  const video = ytdl(url, { quality: 'highest' });
  await pipeline(video, writeStream);
}

function generateOutputFilename() {
  const timestamp = Date.now();
  return `processed_video_${timestamp}.mp4`;
}

async function processVideo(videoUrl, startTime, endTime, textOverlay) {
  const filename = generateOutputFilename();

  await downloadYouTubeVideo(videoUrl);

  return new Promise((resolve, reject) => {
    ffmpeg(INPUT_VIDEO_PATH)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .videoFilters([
        {
          filter: 'drawtext',
          options: {
            text: textOverlay,
            fontsize: 24,
            fontcolor: 'white',
            x: '(w-text_w)/2',
            y: '(h-text_h)/2',
            box: 1,
            boxcolor: 'black@0.5'
          }
        }
      ])
      .output(OUTPUT_VIDEO_PATH(filename))
      .on('end', () => {
        resolve(filename);
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

module.exports = {
  processVideo
};
