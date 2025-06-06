# PBI-2-1-1: OpenAPI Definition Creation

## Description
Create comprehensive OpenAPI 3.0 specifications for all API endpoints in the freee receipt automation system. This establishes clear contracts between frontend and backend, enabling type-safe development and automated testing before implementation begins.

## Implementation Details

### Files to Create/Modify
1. `docs/api/openapi.yaml` - Main OpenAPI specification
2. `docs/api/schemas/` - Reusable schema definitions
3. `src/types/api/generated.ts` - Generated TypeScript types
4. `scripts/generate-api-types.sh` - Type generation script
5. `docs/api/endpoints.md` - API endpoint documentation

### Technical Requirements
- Use OpenAPI 3.0.3 specification
- Define all REST API endpoints for receipt processing
- Include request/response schemas with validation rules
- Document error responses and status codes
- Support JSON and multipart/form-data content types

### API Endpoints to Define
```yaml
# Receipt Management
POST /api/receipts/upload - Upload receipt files
GET /api/receipts - List user receipts
GET /api/receipts/{id} - Get receipt details
PUT /api/receipts/{id} - Update receipt metadata
DELETE /api/receipts/{id} - Delete receipt

# OCR Processing
POST /api/ocr/process - Process receipt OCR
GET /api/ocr/status/{jobId} - Check OCR status

# Transaction Management
GET /api/transactions - List transactions
POST /api/transactions/sync - Sync with freee API
PUT /api/transactions/{id}/match - Match with receipt

# Email Processing
POST /api/email/scan - Trigger email scan
GET /api/email/receipts - List email receipts

# User Settings
GET /api/user/settings - Get user settings
PUT /api/user/settings - Update user settings
```

### Schema Definitions
```yaml
components:
  schemas:
    Receipt:
      type: object
      required: [id, user_id, file_name, status]
      properties:
        id: { type: string, format: uuid }
        user_id: { type: string, format: uuid }
        file_name: { type: string, maxLength: 255 }
        file_path: { type: string }
        file_size: { type: integer, minimum: 0 }
        ocr_text: { type: string }
        status: { type: string, enum: [pending, processing, completed, failed] }
        created_at: { type: string, format: date-time }
    
    Transaction:
      type: object
      required: [id, amount, date, description]
      properties:
        id: { type: string, format: uuid }
        freee_transaction_id: { type: string }
        amount: { type: number, format: decimal }
        date: { type: string, format: date }
        description: { type: string }
        matching_status: { type: string, enum: [unmatched, auto_matched, manual_matched, rejected] }
```

### Code Patterns to Follow
- Use consistent naming conventions (camelCase for properties)
- Include comprehensive example values
- Define proper HTTP status codes for each endpoint
- Use discriminator for polymorphic types

### Interface Specifications
- **Input Interfaces**: None (foundational task)
- **Output Interfaces**: Provides API contracts for all other PBIs
  ```typescript
  // Generated from OpenAPI spec
  export interface Receipt {
    id: string;
    user_id: string;
    file_name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
  }
  
  export interface UploadReceiptRequest {
    file: File;
    metadata?: Record<string, any>;
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
- [ ] OpenAPI 3.0 specification is complete and valid
- [ ] All API endpoints are documented with examples
- [ ] TypeScript types are generated successfully
- [ ] API documentation is accessible and readable
- [ ] Schema validation rules are comprehensive
- [ ] Error responses are properly documented

### Verification Commands
```bash
# Validate OpenAPI specification
npx swagger-codegen validate -i docs/api/openapi.yaml
# Generate TypeScript types
npm run generate:api-types
# Build API documentation
npx redoc-cli build docs/api/openapi.yaml --output docs/api/index.html
```

## Dependencies
- **Required**: PBI-1-1-1 - Basic project structure must exist

## Testing Requirements
- Unit tests: Test generated TypeScript types compilation
- Integration tests: Validate API spec against mock servers
- Test data: Sample request/response examples

## Estimate
1 story point

## Priority
High - API contracts needed before any endpoint implementation

## Implementation Notes
- Use tools like Swagger Editor for specification development
- Consider using OpenAPI Generator for client SDK generation
- Include versioning strategy for API evolution
- Document authentication requirements for each endpoint
