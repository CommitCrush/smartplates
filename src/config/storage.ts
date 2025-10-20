import path from 'path';
import fs from 'fs/promises';

/**
 * Storage Configuration for Render.com Deployment
 * Handles persistent disk storage and fallbacks for development
 */

export const storageConfig = {
  // Render persistent disk path
  basePath: process.env.RENDER ? '/opt/render/project/src/storage' : './storage',
  
  // Storage subdirectories
  directories: {
    uploads: 'uploads',
    temp: 'temp',
    logs: 'logs',
    pdfs: 'exports',
    cache: 'cache',
    backups: 'backups'
  },

  // Full paths (computed)
  get uploadsPath() {
    return path.join(this.basePath, this.directories.uploads);
  },
  
  get tempPath() {
    return path.join(this.basePath, this.directories.temp);
  },
  
  get logsPath() {
    return path.join(this.basePath, this.directories.logs);
  },

  get pdfsPath() {
    return path.join(this.basePath, this.directories.pdfs);
  },

  get cachePath() {
    return path.join(this.basePath, this.directories.cache);
  },

  // File constraints
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  maxTempFiles: 100,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocTypes: ['application/pdf'],

  // Cleanup settings
  tempFileRetention: 24 * 60 * 60 * 1000, // 24 hours
  logFileRetention: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Storage providers preference
  preferCloudinary: true, // For user uploads
  useLocalStorage: true,  // For logs, PDFs, temp files
};

/**
 * Initialize all required storage directories
 * Called on app startup
 */
export async function initializeStorage(): Promise<void> {
  console.log('🚀 Initializing storage directories...');
  
  const allPaths = [
    storageConfig.uploadsPath,
    storageConfig.tempPath,
    storageConfig.logsPath,
    storageConfig.pdfsPath,
    storageConfig.cachePath,
    path.join(storageConfig.basePath, storageConfig.directories.backups),
  ];

  for (const dirPath of allPaths) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dirPath}`);
    } catch (error) {
      console.log(`📁 Directory already exists: ${dirPath}`);
    }
  }

  // Create .gitkeep files to ensure directories exist in git
  for (const dirPath of allPaths) {
    const gitkeepPath = path.join(dirPath, '.gitkeep');
    try {
      await fs.writeFile(gitkeepPath, '# Storage directory\n');
    } catch (error) {
      // Ignore if file already exists
    }
  }

  console.log('✅ Storage initialization completed');
}

/**
 * Clean up old temporary files
 * Should be called periodically
 */
export async function cleanupTempFiles(): Promise<void> {
  try {
    const tempDir = storageConfig.tempPath;
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    for (const file of files) {
      if (file === '.gitkeep') continue;
      
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > storageConfig.tempFileRetention) {
        await fs.unlink(filePath);
        console.log(`🗑️ Cleaned up temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning temp files:', error);
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  directories: Record<string, { files: number; size: number }>;
}> {
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    directories: {} as Record<string, { files: number; size: number }>
  };

  const checkDirectory = async (dirPath: string, name: string) => {
    try {
      const files = await fs.readdir(dirPath);
      let dirSize = 0;
      let fileCount = 0;

      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(dirPath, file);
        const fileStat = await fs.stat(filePath);
        
        if (fileStat.isFile()) {
          dirSize += fileStat.size;
          fileCount++;
        }
      }

      stats.directories[name] = { files: fileCount, size: dirSize };
      stats.totalFiles += fileCount;
      stats.totalSize += dirSize;
    } catch (error) {
      stats.directories[name] = { files: 0, size: 0 };
    }
  };

  await Promise.all([
    checkDirectory(storageConfig.uploadsPath, 'uploads'),
    checkDirectory(storageConfig.tempPath, 'temp'),
    checkDirectory(storageConfig.logsPath, 'logs'),
    checkDirectory(storageConfig.pdfsPath, 'pdfs'),
    checkDirectory(storageConfig.cachePath, 'cache'),
  ]);

  return stats;
}

/**
 * Ensure a file path is safe and within storage boundaries
 */
export function sanitizeFilePath(fileName: string): string {
  // Remove any path traversal attempts
  const sanitized = fileName.replace(/[\.\/\\]/g, '_');
  
  // Ensure reasonable length
  const truncated = sanitized.length > 100 ? sanitized.substring(0, 100) : sanitized;
  
  // Add timestamp to prevent conflicts
  const timestamp = Date.now();
  
  return `${timestamp}_${truncated}`;
}

export default storageConfig;