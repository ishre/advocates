import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export interface BackupData {
  cases: any[];
  clients: any[];
  users: any[];
  teams: any[];
  timestamp: Date;
  version: string;
}

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: any;

  constructor(config: GoogleDriveConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken,
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  // Set credentials (for OAuth flow)
  setCredentials(credentials: any) {
    this.oauth2Client.setCredentials(credentials);
  }

  // Get authorization URL for OAuth flow
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Create or find the main backup folder
  async getOrCreateBackupFolder(folderName: string = 'LegalCaseManager_Backups') {
    try {
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }

      // Create new folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id, name',
      });

      return folder.data;
    } catch (error) {
      console.error('Error creating/finding backup folder:', error);
      throw error;
    }
  }

  // Create a daily backup folder
  async createDailyBackupFolder(parentFolderId: string) {
    const today = new Date().toISOString().split('T')[0];
    const folderName = `Backup_${today}`;

    try {
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id, name',
      });

      return folder.data;
    } catch (error) {
      console.error('Error creating daily backup folder:', error);
      throw error;
    }
  }

  // Upload file to Google Drive
  async uploadFile(fileName: string, content: string, mimeType: string, parentFolderId?: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const media = {
        mimeType: mimeType,
        body: content,
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, size, webViewLink',
      });

      return file.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Download file from Google Drive
  async downloadFile(fileId: string): Promise<string> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // List files in a folder
  async listFiles(folderId: string) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)',
        orderBy: 'createdTime desc',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  // Create a complete backup
  async createBackup(data: BackupData, userId: string) {
    try {
      // Get or create main backup folder
      const mainFolder = await this.getOrCreateBackupFolder();
      
      // Create daily backup folder
      const dailyFolder = await this.createDailyBackupFolder(mainFolder.id);
      
      // Create backup data
      const backupData = {
        ...data,
        backupInfo: {
          createdBy: userId,
          createdAt: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      // Upload backup files
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      const files = [
        {
          name: `backup_${timestamp}.json`,
          content: JSON.stringify(backupData, null, 2),
          mimeType: 'application/json',
        },
        {
          name: `cases_${timestamp}.json`,
          content: JSON.stringify(data.cases, null, 2),
          mimeType: 'application/json',
        },
        {
          name: `clients_${timestamp}.json`,
          content: JSON.stringify(data.clients, null, 2),
          mimeType: 'application/json',
        },
        {
          name: `users_${timestamp}.json`,
          content: JSON.stringify(data.users, null, 2),
          mimeType: 'application/json',
        },
      ];

      const uploadedFiles = [];
      for (const file of files) {
        const uploadedFile = await this.uploadFile(
          file.name,
          file.content,
          file.mimeType,
          dailyFolder.id
        );
        uploadedFiles.push(uploadedFile);
      }

      return {
        folderId: dailyFolder.id,
        folderName: dailyFolder.name,
        files: uploadedFiles,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(folderId: string) {
    try {
      const files = await this.listFiles(folderId);
      const backupFile = files.find(file => file.name.includes('backup_') && file.name.endsWith('.json'));
      
      if (!backupFile) {
        throw new Error('Backup file not found');
      }

      const backupContent = await this.downloadFile(backupFile.id);
      const backupData = JSON.parse(backupContent);

      return backupData;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  // Get backup history
  async getBackupHistory() {
    try {
      const mainFolder = await this.getOrCreateBackupFolder();
      const folders = await this.listFiles(mainFolder.id);
      
      const backupHistory = [];
      for (const folder of folders) {
        if (folder.mimeType === 'application/vnd.google-apps.folder') {
          const files = await this.listFiles(folder.id);
          const backupFile = files.find(file => file.name.includes('backup_'));
          
          if (backupFile) {
            backupHistory.push({
              folderId: folder.id,
              folderName: folder.name,
              backupFile: backupFile,
              createdAt: folder.createdTime,
              modifiedAt: folder.modifiedTime,
            });
          }
        }
      }

      return backupHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting backup history:', error);
      throw error;
    }
  }

  // Delete backup
  async deleteBackup(folderId: string) {
    try {
      // List all files in the folder
      const files = await this.listFiles(folderId);
      
      // Delete all files
      for (const file of files) {
        await this.drive.files.delete({
          fileId: file.id,
        });
      }

      // Delete the folder
      await this.drive.files.delete({
        fileId: folderId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  }

  // Check if user has valid Google Drive access
  async checkAccess() {
    try {
      await this.drive.files.list({
        pageSize: 1,
        fields: 'files(id)',
      });
      return true;
    } catch (error) {
      console.error('Google Drive access check failed:', error);
      return false;
    }
  }
}

// Singleton instance
let googleDriveService: GoogleDriveService | null = null;

export function getGoogleDriveService(): GoogleDriveService | null {
  return googleDriveService;
}

export function initializeGoogleDriveService(config: GoogleDriveConfig): GoogleDriveService {
  googleDriveService = new GoogleDriveService(config);
  return googleDriveService;
} 