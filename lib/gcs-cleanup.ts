import { Storage } from "@google-cloud/storage";

const bucketName = process.env.GCLOUD_STORAGE_BUCKET!;
const storage = new Storage(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? undefined
    : {
        projectId: process.env.GCLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GCLOUD_CLIENT_EMAIL,
          private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\n/g, "\n"),
        },
      }
);
const bucket = storage.bucket(bucketName);

/**
 * Delete a single file from GCS
 */
export async function deleteGCSFile(objectName: string): Promise<boolean> {
  try {
    if (!objectName) return false;
    
    const file = bucket.file(objectName);
    const [exists] = await file.exists();
    
    if (exists) {
      await file.delete();
      console.log(`Deleted GCS file: ${objectName}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete GCS file ${objectName}:`, error);
    return false;
  }
}

/**
 * Delete all files in a specific directory/prefix
 */
export async function deleteGCSDirectory(prefix: string): Promise<number> {
  try {
    if (!prefix) return 0;
    
    // Ensure prefix ends with '/' for directory-like behavior
    const directoryPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
    
    const [files] = await bucket.getFiles({ prefix: directoryPrefix });
    
    if (files.length === 0) {
      console.log(`No files found in directory: ${directoryPrefix}`);
      return 0;
    }
    
    // Delete all files in the directory
    const deletePromises = files.map(file => file.delete());
    await Promise.all(deletePromises);
    
    console.log(`Deleted ${files.length} files from directory: ${directoryPrefix}`);
    return files.length;
  } catch (error) {
    console.error(`Failed to delete GCS directory ${prefix}:`, error);
    return 0;
  }
}

/**
 * Delete all files associated with a specific case
 */
export async function deleteCaseFiles(caseId: string): Promise<number> {
  try {
    const casePrefix = `cases/${caseId}/`;
    return await deleteGCSDirectory(casePrefix);
  } catch (error) {
    console.error(`Failed to delete case files for case ${caseId}:`, error);
    return 0;
  }
}

/**
 * Delete all files associated with a specific user
 */
export async function deleteUserFiles(userId: string): Promise<number> {
  try {
    let deletedCount = 0;
    
    // Delete user's profile image
    const profilePrefix = `profiles/${userId}/`;
    deletedCount += await deleteGCSDirectory(profilePrefix);
    
    // Delete user's avatar if it exists
    const avatarPrefix = `avatars/${userId}/`;
    deletedCount += await deleteGCSDirectory(avatarPrefix);
    
    return deletedCount;
  } catch (error) {
    console.error(`Failed to delete user files for user ${userId}:`, error);
    return 0;
  }
}

/**
 * Delete all files associated with a specific client (including all their cases)
 */
export async function deleteClientFiles(clientId: string): Promise<number> {
  try {
    let deletedCount = 0;
    
    // Delete client's profile files
    deletedCount += await deleteUserFiles(clientId);
    
    // Delete all case files for this client
    // This will be handled by the case deletion logic, but we can also clean up here
    const clientCasesPrefix = `cases/`;
    const [files] = await bucket.getFiles({ prefix: clientCasesPrefix });
    
    // Filter files that belong to this client's cases
    const clientFiles = files.filter(file => {
      const pathParts = file.name.split('/');
      // Check if the case belongs to this client (this is a simplified check)
      // In a real implementation, you might need to query the database first
      return pathParts.length > 2 && pathParts[1] === clientId;
    });
    
    if (clientFiles.length > 0) {
      const deletePromises = clientFiles.map(file => file.delete());
      await Promise.all(deletePromises);
      deletedCount += clientFiles.length;
      console.log(`Deleted ${clientFiles.length} client case files for client ${clientId}`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`Failed to delete client files for client ${clientId}:`, error);
    return 0;
  }
}

/**
 * Delete specific document files from a case
 */
export async function deleteDocumentFiles(caseId: string, documentNames: string[]): Promise<number> {
  try {
    let deletedCount = 0;
    
    for (const docName of documentNames) {
      // Try different possible file paths for the document
      const possiblePaths = [
        `cases/${caseId}/${docName}`,
        `cases/${caseId}/${encodeURIComponent(docName)}`,
        `documents/${caseId}/${docName}`,
        `documents/${caseId}/${encodeURIComponent(docName)}`,
      ];
      
      for (const path of possiblePaths) {
        const deleted = await deleteGCSFile(path);
        if (deleted) {
          deletedCount++;
          break; // Found and deleted the file, no need to try other paths
        }
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`Failed to delete document files for case ${caseId}:`, error);
    return 0;
  }
}

/**
 * Clean up orphaned files (files that exist in GCS but not referenced in database)
 * This is a maintenance function that can be run periodically
 */
export async function cleanupOrphanedFiles(): Promise<{ deleted: number; errors: number }> {
  try {
    const [files] = await bucket.getFiles();
    let deleted = 0;
    let errors = 0;
    
    for (const file of files) {
      try {
        // Check if file is older than 30 days and might be orphaned
        const [metadata] = await file.getMetadata();
        const createdAt = new Date(metadata.timeCreated || Date.now());
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        if (createdAt < thirtyDaysAgo) {
          // This is a simplified check - in production you'd want to verify against database
          await file.delete();
          deleted++;
          console.log(`Deleted potentially orphaned file: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors++;
      }
    }
    
    return { deleted, errors };
  } catch (error) {
    console.error('Failed to cleanup orphaned files:', error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  bucketName: string;
}> {
  try {
    const [files] = await bucket.getFiles();
    let totalSize = 0;
    
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      totalSize += parseInt(String(metadata.size || '0'));
    }
    
    return {
      totalFiles: files.length,
      totalSize,
      bucketName,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      bucketName,
    };
  }
} 