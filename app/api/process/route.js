import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const UPLOAD_DIR = join(process.cwd(), 'temp');
const OUTPUT_DIR = join(process.cwd(), 'output');

// Ensure directories exist
async function ensureDirectories() {
  try {
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
    if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

// Clean up temporary files
async function cleanup(filePath) {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Failed to cleanup file:', error);
  }
}

// Check if FFmpeg is available
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('FFmpeg not found:', error);
    return false;
  }
}

// Process video with FFmpeg
async function processVideo(inputPath, outputPath, options = {}) {
  const {
    quality = '720p',
    mode = 'auto',
    audioFormat = 'mp3',
    videoCodec = 'libx264',
    audioCodec = 'aac'
  } = options;

  let ffmpegCommand = `ffmpeg -i "${inputPath}"`;

  // Set video quality
  const qualityMap = {
    '360p': 'scale=-2:360',
    '480p': 'scale=-2:480', 
    '720p': 'scale=-2:720',
    '1080p': 'scale=-2:1080',
    'max': ''
  };

  const scaleFilter = qualityMap[quality] || qualityMap['720p'];
  
  // Configure based on mode
  if (mode === 'audio') {
    // Audio only
    ffmpegCommand += ` -vn -acodec ${audioFormat === 'mp3' ? 'libmp3lame' : audioFormat}`;
    if (audioFormat === 'mp3') {
      ffmpegCommand += ' -ab 192k';
    }
  } else if (mode === 'mute') {
    // Muted video
    ffmpegCommand += ` -an -c:v ${videoCodec}`;
    if (scaleFilter) {
      ffmpegCommand += ` -vf "${scaleFilter}"`;
    }
    ffmpegCommand += ' -crf 23 -preset medium';
  } else {
    // Auto mode - video with audio
    ffmpegCommand += ` -c:v ${videoCodec} -c:a ${audioCodec}`;
    if (scaleFilter) {
      ffmpegCommand += ` -vf "${scaleFilter}"`;
    }
    ffmpegCommand += ' -crf 23 -preset medium -ab 128k';
  }

  // Output format
  if (mode === 'audio') {
    ffmpegCommand += ` "${outputPath}"`;
  } else {
    ffmpegCommand += ` -movflags +faststart "${outputPath}"`;
  }

  console.log('FFmpeg command:', ffmpegCommand);

  try {
    const { stdout, stderr } = await execAsync(ffmpegCommand);
    console.log('FFmpeg stdout:', stdout);
    console.log('FFmpeg stderr:', stderr);
    return { success: true };
  } catch (error) {
    console.error('FFmpeg error:', error);
    throw new Error(`Video processing failed: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    await ensureDirectories();

    // Check if FFmpeg is available
    const ffmpegAvailable = await checkFFmpeg();
    if (!ffmpegAvailable) {
      return NextResponse.json(
        { error: 'FFmpeg is not installed on the server' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('video');
    const quality = formData.get('quality') || '720p';
    const mode = formData.get('mode') || 'auto';
    const audioFormat = formData.get('audioFormat') || 'mp3';

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const inputExt = videoFile.name.split('.').pop();
    const inputPath = join(UPLOAD_DIR, `input_${timestamp}.${inputExt}`);
    
    let outputExt;
    if (mode === 'audio') {
      outputExt = audioFormat === 'mp3' ? 'mp3' : audioFormat;
    } else {
      outputExt = 'mp4';
    }
    const outputPath = join(OUTPUT_DIR, `output_${timestamp}.${outputExt}`);

    try {
      // Save uploaded file
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(inputPath, buffer);

      // Process the video
      await processVideo(inputPath, outputPath, {
        quality,
        mode,
        audioFormat
      });

      // Read the processed file
      const processedBuffer = await readFile(outputPath);
      
      // Create response with processed file
      const response = new NextResponse(processedBuffer);
      response.headers.set('Content-Type', 
        mode === 'audio' 
          ? `audio/${outputExt}`
          : 'video/mp4'
      );
      response.headers.set('Content-Disposition', 
        `attachment; filename="processed_${timestamp}.${outputExt}"`
      );

      // Cleanup temporary files
      setTimeout(async () => {
        await cleanup(inputPath);
        await cleanup(outputPath);
      }, 5000);

      return response;

    } catch (processingError) {
      // Cleanup on error
      await cleanup(inputPath);
      await cleanup(outputPath);
      throw processingError;
    }

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Video processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Video processing endpoint',
    ffmpeg: await checkFFmpeg() ? 'available' : 'not installed'
  });
}
