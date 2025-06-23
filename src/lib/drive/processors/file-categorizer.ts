/**
 * File Categorization Logic for Receipt Processing
 */

import { DriveFile, FolderStructure } from '../types';

export interface FileCategory {
  category: string;
  confidence: number;
  suggestedFolder: string;
}

export class DriveFileCategorizer {
  categorizeFile(file: DriveFile): FileCategory {
    const filename = file.name.toLowerCase();
    
    // Receipt categorization logic
    if (this.isReceiptFile(filename)) {
      return {
        category: 'receipt',
        confidence: 0.9,
        suggestedFolder: 'receipts'
      };
    }
    
    if (this.isInvoiceFile(filename)) {
      return {
        category: 'invoice',
        confidence: 0.85,
        suggestedFolder: 'invoices'
      };
    }
    
    if (this.isExpenseFile(filename)) {
      return {
        category: 'expense',
        confidence: 0.8,
        suggestedFolder: 'expenses'
      };
    }
    
    return {
      category: 'other',
      confidence: 0.5,
      suggestedFolder: 'miscellaneous'
    };
  }

  generateFolderStructure(date: Date): FolderStructure {
    return {
      year: date.getFullYear().toString(),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      category: 'receipts'
    };
  }

  generateFileName(file: DriveFile, vendor?: string, amount?: number): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const category = this.categorizeFile(file).category;
    
    let filename = `${dateStr}_${category}`;
    
    if (vendor) {
      filename += `_${vendor.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    if (amount) {
      filename += `_${Math.round(amount)}`;
    }
    
    // Preserve original extension
    const extension = file.name.split('.').pop();
    if (extension) {
      filename += `.${extension}`;
    }
    
    return filename;
  }

  private isReceiptFile(filename: string): boolean {
    const receiptKeywords = [
      'receipt', 'レシート', 'recibo', '領収書',
      'purchase', '買い物', 'shopping'
    ];
    
    return receiptKeywords.some(keyword => 
      filename.includes(keyword.toLowerCase())
    );
  }

  private isInvoiceFile(filename: string): boolean {
    const invoiceKeywords = [
      'invoice', '請求書', 'bill', 'factura',
      'statement', '明細書'
    ];
    
    return invoiceKeywords.some(keyword => 
      filename.includes(keyword.toLowerCase())
    );
  }

  private isExpenseFile(filename: string): boolean {
    const expenseKeywords = [
      'expense', '経費', 'cost', 'payment',
      '支払', 'gastos'
    ];
    
    return expenseKeywords.some(keyword => 
      filename.includes(keyword.toLowerCase())
    );
  }

  extractMetadata(file: DriveFile): Record<string, unknown> {
    const category = this.categorizeFile(file);
    
    return {
      originalName: file.name,
      category: category.category,
      confidence: category.confidence,
      processingDate: new Date().toISOString(),
      fileSize: file.size,
      mimeType: file.mimeType
    };
  }
}