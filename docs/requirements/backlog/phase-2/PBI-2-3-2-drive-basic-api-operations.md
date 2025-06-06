# PBI-2-3-2: Google Drive Basic API Operations

## Description
Implement core Google Drive API operations for file and folder management. This provides the foundation for organizing receipt files in a structured folder hierarchy with proper naming conventions and metadata handling.

## Implementation Details

### Files to Create/Modify
1. `src/lib/drive/operations.ts` - Drive API operation implementations
2. `src/lib/drive/folder-manager.ts` - Folder creation and management
3. `src/lib/drive/file-manager.ts` - File upload and organization
4. `src/lib/drive/types.ts` - Drive-specific TypeScript types
5. `src/lib/drive/utils.ts` - Drive utility functions
6. `src/pages/api/drive/folders.ts` - Folder management API endpoint
7. `docs/drive/api-operations.md` - Drive operations documentation

### Technical Requirements
- Implement folder creation with hierarchical structure
- Support file upload with metadata and organization
- Handle Drive API rate limiting and quotas
- Support file search and listing operations
- Manage duplicate file names with numbering

### Drive Folder Operations
```typescript
export class DriveOperations {
  constructor(private client: drive_v3.Drive) {}
  
  async createFolder(name: string, parentId?: string): Promise<DriveFolder> {
    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    };
    
    const response = await this.client.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, parents, createdTime, modifiedTime'
    });
    
    return {
      id: response.data.id!,
      name: response.data.name!,
      parentId: parentId,
      createdAt: new Date(response.data.createdTime!),
      modifiedAt: new Date(response.data.modifiedTime!)
    };
  }
  
  async findFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    const query = [
      `name='${name}'`,
      "mimeType='application/vnd.google-apps.folder'",
      'trashed=false'
    ];
    
    if (parentId) {
      query.push(`'${parentId}' in parents`);
    }
    
    const response = await this.client.files.list({
      q: query.join(' and '),
      fields: 'files(id, name, parents, createdTime, modifiedTime)',
      pageSize: 1
    });
    
    const file = response.data.files?.[0];
    if (!file) return null;
    
    return {
      id: file.id!,
      name: file.name!,
      parentId: file.parents?.[0],
      createdAt: new Date(file.createdTime!),
      modifiedAt: new Date(file.modifiedTime!)
    };
  }
  
  async ensureFolder(path: string, rootFolderId?: string): Promise<string> {
    const pathParts = path.split('/').filter(Boolean);
    let currentParentId = rootFolderId;
    
    for (const folderName of pathParts) {
      let folder = await this.findFolder(folderName, currentParentId);
      
      if (!folder) {
        folder = await this.createFolder(folderName, currentParentId);
      }
      
      currentParentId = folder.id;
    }
    
    return currentParentId!;
  }
}
```

### File Upload Operations
```typescript
export class DriveFileManager {
  constructor(private driveOps: DriveOperations) {}
  
  async uploadFile(
    fileName: string,
    fileData: Buffer,
    mimeType: string,
    folderId: string,
    metadata: FileMetadata = {}
  ): Promise<DriveFile> {
    // Handle duplicate names
    const finalFileName = await this.getUniqueFileName(fileName, folderId);
    
    const fileMetadata = {
      name: finalFileName,
      parents: [folderId],
      description: metadata.description,
      properties: {
        source: metadata.source || 'freee-automation',
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
        ...metadata.customProperties
      }
    };
    
    const media = {
      mimeType: mimeType,
      body: Readable.from(fileData)
    };
    
    const response = await this.driveOps.client.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size, mimeType, createdTime, webViewLink, parents'
    });
    
    return {
      id: response.data.id!,
      name: response.data.name!,
      size: parseInt(response.data.size || '0'),
      mimeType: response.data.mimeType!,
      webViewLink: response.data.webViewLink!,
      createdAt: new Date(response.data.createdTime!),
      parentId: folderId
    };
  }
  
  async getUniqueFileName(fileName: string, folderId: string): Promise<string> {
    const existingFiles = await this.listFiles(folderId, fileName);
    
    if (existingFiles.length === 0) {
      return fileName;
    }
    
    // Extract name and extension
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
    
    // Find highest number suffix
    let maxNumber = 0;
    for (const file of existingFiles) {
      const match = file.name.match(new RegExp(`^${baseName}(?:_(\\d+))?${extension}$`));
      if (match) {
        const number = match[1] ? parseInt(match[1]) : 1;
        maxNumber = Math.max(maxNumber, number);
      }
    }
    
    return `${baseName}_${maxNumber + 1}${extension}`;
  }
  
  async listFiles(folderId: string, nameFilter?: string): Promise<DriveFile[]> {
    const query = [
      `'${folderId}' in parents`,
      "mimeType!='application/vnd.google-apps.folder'",
      'trashed=false'
    ];
    
    if (nameFilter) {
      query.push(`name contains '${nameFilter}'`);
    }
    
    const response = await this.driveOps.client.files.list({
      q: query.join(' and '),
      fields: 'files(id, name, size, mimeType, createdTime, webViewLink)',
      orderBy: 'createdTime desc',
      pageSize: 100
    });
    
    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      size: parseInt(file.size || '0'),
      mimeType: file.mimeType!,
      webViewLink: file.webViewLink!,
      createdAt: new Date(file.createdTime!),
      parentId: folderId
    })) || [];
  }
}
```

### Receipt Folder Structure Manager
```typescript
export class ReceiptFolderManager {
  constructor(private driveOps: DriveOperations) {}
  
  async setupReceiptFolders(userId: string): Promise<FolderStructure> {
    // Create root receipt folder
    const rootFolder = await this.driveOps.ensureFolder('01.領収書');
    
    // Create monthly folders (01-12)
    const monthlyFolders: Record<string, string> = {};
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const folderId = await this.driveOps.ensureFolder(monthStr, rootFolder);
      monthlyFolders[monthStr] = folderId;
    }
    
    // Create fixed assets folder
    const fixedAssetsFolder = await this.driveOps.ensureFolder('99.固定資産分');
    
    // Store folder structure in database
    await this.saveFolderStructure(userId, {
      rootFolderId: rootFolder,
      monthlyFolders,
      fixedAssetsFolderId: fixedAssetsFolder
    });
    
    return {
      rootFolderId: rootFolder,
      monthlyFolders,
      fixedAssetsFolderId: fixedAssetsFolder
    };
  }
  
  getFolderForReceipt(receipt: ReceiptInfo, structure: FolderStructure): string {
    // Determine if this is a fixed asset
    if (this.isFixedAsset(receipt)) {
      return structure.fixedAssetsFolderId;
    }
    
    // Get month folder
    const month = receipt.date.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    
    return structure.monthlyFolders[monthStr];
  }
  
  private isFixedAsset(receipt: ReceiptInfo): boolean {
    // Logic to determine if receipt is for fixed assets
    const fixedAssetKeywords = ['パソコン', 'PC', '設備', '器具', '備品'];
    const content = (receipt.description || '').toLowerCase();
    
    return fixedAssetKeywords.some(keyword => content.includes(keyword.toLowerCase()));
  }
}
```

### API Endpoints
```typescript
// GET /api/drive/folders
interface ListFoldersResponse {
  folders: DriveFolder[];
  structure?: FolderStructure;
}

// POST /api/drive/folders
interface CreateFolderRequest {
  name: string;
  parentId?: string;
}

// POST /api/drive/upload
interface UploadFileRequest {
  fileName: string;
  folderId: string;
  metadata?: FileMetadata;
  // File data sent as multipart/form-data
}

interface UploadFileResponse {
  file: DriveFile;
  folder: string;
}
```

### Interface Specifications
- **Input Interfaces**: Requires Drive client from PBI-2-3-1
- **Output Interfaces**: Provides file management for business logic
  ```typescript
  export interface DriveFolder {
    id: string;
    name: string;
    parentId?: string;
    createdAt: Date;
    modifiedAt: Date;
  }
  
  export interface DriveFile {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    webViewLink: string;
    createdAt: Date;
    parentId: string;
  }
  
  export interface FolderStructure {
    rootFolderId: string;
    monthlyFolders: Record<string, string>; // MM -> folderId
    fixedAssetsFolderId: string;
  }
  
  export interface FileMetadata {
    description?: string;
    source?: string;
    customProperties?: Record<string, string>;
  }
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] Folder structure (01.領収書/MM/) is created correctly
- [ ] File uploads work with proper metadata
- [ ] Duplicate file names are handled with numbering
- [ ] Fixed asset receipts are organized in separate folder
- [ ] File search and listing operations work properly
- [ ] Folder structure is persisted in database

### Verification Commands
```bash
# Test Drive folder operations
npm run test:drive -- --grep "folder operations"
# Test file upload
curl -X POST http://localhost:3000/api/drive/upload -F "file=@test.pdf"
# Test folder structure creation
npm run test:integration -- drive-folders
```

## Dependencies
- **Required**: PBI-2-3-1 - Drive OAuth must be configured
- **Required**: PBI-2-1-3 - Observability for API monitoring

## Testing Requirements
- Unit tests: Test folder and file management operations
- Integration tests: Test actual Drive API operations with test account
- Test data: Sample files and folder structures

## Estimate
1 story point

## Priority
High - Basic operations needed before business logic integration

## Implementation Notes
- Use googleapis npm package for type-safe Drive API access
- Implement proper error handling for Drive API quotas
- Add comprehensive logging for file operations
- Consider implementing file caching for frequently accessed metadata
- Test with various file types and sizes
- Respect Drive API quotas and implement appropriate rate limiting
- Handle Japanese characters in folder/file names properly
