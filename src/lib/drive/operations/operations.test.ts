/**
 * Tests for Drive file operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DriveFileCreator } from './file-create';
import { DriveFileLister } from './file-list';
import { DriveFileGetter } from './file-get';
import { DriveErrorType } from '../types';

describe('Drive File Operations', () => {
  let mockDrive: any;

  beforeEach(() => {
    mockDrive = {
      files: {
        create: vi.fn(),
        list: vi.fn(),
        get: vi.fn()
      }
    };
  });

  describe('DriveFileCreator', () => {
    let fileCreator: DriveFileCreator;

    beforeEach(() => {
      fileCreator = new DriveFileCreator(mockDrive);
    });

    describe('createFile', () => {
      it('should create a file successfully', async () => {
        const result = await fileCreator.createFile('test.pdf', {
          content: 'test content',
          mimeType: 'application/pdf'
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.name).toBe('test.pdf');
      });

      it('should handle file creation errors', async () => {
        // Mock error by creating file creator that throws
        const errorCreator = new DriveFileCreator(mockDrive);
        vi.spyOn(errorCreator as any, 'simulateDriveRequest')
          .mockRejectedValue({ code: 507, message: 'Storage full' });

        const result = await errorCreator.createFile('test.pdf');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.type).toBe(DriveErrorType.STORAGE_FULL);
      });

      it('should create file without content', async () => {
        const result = await fileCreator.createFile('empty.txt');

        expect(result.success).toBe(true);
        expect(result.data!.name).toBe('empty.txt');
      });
    });

    describe('createFolder', () => {
      it('should create a folder successfully', async () => {
        const result = await fileCreator.createFolder('test-folder');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.name).toBe('test-folder');
      });

      it('should create folder without parent', async () => {
        const result = await fileCreator.createFolder('root-folder');

        expect(result.success).toBe(true);
        expect(result.data!.name).toBe('root-folder');
      });
    });
  });

  describe('DriveFileLister', () => {
    let fileLister: DriveFileLister;

    beforeEach(() => {
      fileLister = new DriveFileLister(mockDrive);
    });

    describe('listFiles', () => {
      it('should list files successfully', async () => {
        const result = await fileLister.listFiles();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      it('should handle empty options', async () => {
        const result = await fileLister.listFiles({});

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });
    });

    describe('buildQuery', () => {
      it('should build query with multiple filters', () => {
        const options = {
          query: 'name contains "test"',
          parents: ['folder1', 'folder2']
        };

        const query = fileLister.buildQuery(options);

        expect(query).toContain('name contains "test"');
        expect(query).toContain('folder1');
        expect(query).toContain('folder2');
        expect(query).toContain('trashed=false');
      });

      it('should build query with date filters', () => {
        const options = {
          query: 'modifiedTime > "2024-01-01"'
        };

        const query = fileLister.buildQuery(options);

        expect(query).toContain('modifiedTime > "2024-01-01"');
        expect(query).toContain('trashed=false');
      });
    });
  });

  describe('DriveFileGetter', () => {
    let fileGetter: DriveFileGetter;

    beforeEach(() => {
      fileGetter = new DriveFileGetter(mockDrive);
    });

    describe('getFileMetadata', () => {
      it('should get file metadata successfully', async () => {
        const result = await fileGetter.getFileMetadata('test-file-id');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.id).toBe('test-file-id');
      });

      it('should handle file not found error', async () => {
        const result = await fileGetter.getFileMetadata('nonexistent');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error!.type).toBe(DriveErrorType.FILE_NOT_FOUND);
      });
    });

    describe('fileExists', () => {
      it('should return true for existing file', async () => {
        const result = await fileGetter.fileExists('existing-file');

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });

      it('should return false for non-existing file', async () => {
        const result = await fileGetter.fileExists('nonexistent');

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
      });

      it('should return error for other errors', async () => {
        vi.spyOn(fileGetter as any, 'simulateDriveRequest')
          .mockRejectedValue({ code: 500, message: 'Server error' });

        const result = await fileGetter.fileExists('error-file');

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('downloadFile', () => {
      it('should download file successfully', async () => {
        const result = await fileGetter.downloadFile('download-file');

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(Buffer.isBuffer(result.data)).toBe(true);
      });
    });
  });
});