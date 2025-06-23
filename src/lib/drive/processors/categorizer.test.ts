/**
 * Tests for file categorization logic
 */

import { describe, it, expect } from 'vitest';
import { DriveFileCategorizer } from './file-categorizer';
import { DriveFile } from '../types';

describe('DriveFileCategorizer', () => {
  let categorizer: DriveFileCategorizer;

  beforeEach(() => {
    categorizer = new DriveFileCategorizer();
  });

  describe('categorizeFile', () => {
    it('should categorize receipt files correctly', () => {
      const file: DriveFile = {
        id: '1',
        name: 'receipt_2024.pdf',
        mimeType: 'application/pdf'
      };

      const category = categorizer.categorizeFile(file);

      expect(category.category).toBe('receipt');
      expect(category.confidence).toBe(0.9);
      expect(category.suggestedFolder).toBe('receipts');
    });

    it('should categorize invoice files correctly', () => {
      const file: DriveFile = {
        id: '2',
        name: 'invoice_123.pdf',
        mimeType: 'application/pdf'
      };

      const category = categorizer.categorizeFile(file);

      expect(category.category).toBe('invoice');
      expect(category.confidence).toBe(0.85);
      expect(category.suggestedFolder).toBe('invoices');
    });

    it('should categorize expense files correctly', () => {
      const file: DriveFile = {
        id: '3',
        name: 'expense_report.pdf',
        mimeType: 'application/pdf'
      };

      const category = categorizer.categorizeFile(file);

      expect(category.category).toBe('expense');
      expect(category.confidence).toBe(0.8);
      expect(category.suggestedFolder).toBe('expenses');
    });

    it('should categorize unknown files as other', () => {
      const file: DriveFile = {
        id: '4',
        name: 'random_document.pdf',
        mimeType: 'application/pdf'
      };

      const category = categorizer.categorizeFile(file);

      expect(category.category).toBe('other');
      expect(category.confidence).toBe(0.5);
      expect(category.suggestedFolder).toBe('miscellaneous');
    });

    it('should handle Japanese filenames', () => {
      const file: DriveFile = {
        id: '5',
        name: 'レシート_2024.pdf',
        mimeType: 'application/pdf'
      };

      const category = categorizer.categorizeFile(file);

      expect(category.category).toBe('receipt');
    });
  });

  describe('generateFolderStructure', () => {
    it('should generate correct folder structure', () => {
      const date = new Date('2024-06-15');
      const structure = categorizer.generateFolderStructure(date);

      expect(structure.year).toBe('2024');
      expect(structure.month).toBe('06');
      expect(structure.category).toBe('receipts');
    });
  });

  describe('generateFileName', () => {
    it('should generate filename with vendor and amount', () => {
      const file: DriveFile = {
        id: '1',
        name: 'receipt.pdf',
        mimeType: 'application/pdf'
      };

      const filename = categorizer.generateFileName(file, 'Amazon', 1500);

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}_receipt_amazon_1500\.pdf$/);
    });

    it('should generate filename without vendor and amount', () => {
      const file: DriveFile = {
        id: '1',
        name: 'document.txt',
        mimeType: 'text/plain'
      };

      const filename = categorizer.generateFileName(file);

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}_other\.txt$/);
    });

    it('should preserve original extension', () => {
      const file: DriveFile = {
        id: '1',
        name: 'receipt.jpg',
        mimeType: 'image/jpeg'
      };

      const filename = categorizer.generateFileName(file);

      expect(filename.endsWith('.jpg')).toBe(true);
    });
  });

  describe('extractMetadata', () => {
    it('should extract complete metadata', () => {
      const file: DriveFile = {
        id: '1',
        name: 'receipt_test.pdf',
        mimeType: 'application/pdf',
        size: 1024
      };

      const metadata = categorizer.extractMetadata(file);

      expect(metadata.originalName).toBe('receipt_test.pdf');
      expect(metadata.category).toBe('receipt');
      expect(metadata.confidence).toBe(0.9);
      expect(metadata.fileSize).toBe(1024);
      expect(metadata.mimeType).toBe('application/pdf');
      expect(metadata.processingDate).toBeDefined();
    });
  });
});