# PBI-4-2-2: OCR Parameter Optimization

## Description

Optimize OCR engine parameters and configuration for maximum text recognition accuracy on receipt images,
including language settings, recognition modes, confidence thresholds, and engine-specific tuning.

## Implementation Details

### Files to Create/Modify

1. `src/services/ocr/optimization/ParameterOptimizer.ts` - OCR parameter optimization service
2. `src/services/ocr/optimization/profiles/` - Pre-configured optimization profiles
3. `src/config/ocr-parameters.ts` - OCR parameter configuration
4. `src/lib/ocr/tesseract-config.ts` - Tesseract-specific configuration
5. `src/lib/ocr/performance-metrics.ts` - OCR performance measurement
6. `src/services/ocr/optimization/AutoTuner.ts` - Automatic parameter tuning
7. `src/hooks/useOCROptimization.ts` - React hook for OCR optimization
8. `src/api/ocr/optimize.ts` - OCR optimization API endpoints

### Technical Requirements

- Tesseract.js v4+ parameter optimization
- Multi-language support (English, Japanese, numbers)
- Dynamic parameter adjustment based on image characteristics
- A/B testing framework for parameter sets
- Performance monitoring and metrics collection
- Automatic optimization based on success rates
- Configuration profiles for different receipt types

### OCR Parameter Configuration

```typescript
interface OCRParameters {
  languages: string[]; // ['eng', 'jpn', 'jpn_vert']
  engineMode: "LEGACY" | "NEURAL_NETS" | "DEFAULT" | "COMBINED";
  pageSegMode: number; // 0-13, PSM modes
  ocrEngineMode: number; // 0-3, OEM modes
  whiteList: string; // Characters to recognize
  blackList: string; // Characters to ignore
  minConfidence: number; // 0-100
  timeoutMs: number;
  customParameters: Record<string, string | number>;
}

interface OptimizationProfile {
  name: string;
  description: string;
  targetReceiptType:
    | "general"
    | "amazon"
    | "apple"
    | "gas_station"
    | "restaurant";
  parameters: OCRParameters;
  expectedAccuracy: number;
  averageProcessingTime: number;
}

interface OCROptimizationResult {
  originalParameters: OCRParameters;
  optimizedParameters: OCRParameters;
  accuracyImprovement: number;
  processingTimeChange: number;
  confidenceScores: {
    before: number;
    after: number;
  };
  testResults: {
    totalTests: number;
    successfulExtractions: number;
    averageConfidence: number;
  };
}
```

### Parameter Optimization Engine

```typescript
class OCRParameterOptimizer {
  // Optimize parameters for specific receipt types
  async optimizeForReceiptType(
    images: ImageData[],
    receiptType: string,
  ): Promise<OCRParameters>;

  // A/B test different parameter sets
  async compareParameterSets(
    parameterSets: OCRParameters[],
    testImages: ImageData[],
  ): Promise<OptimizationResult[]>;

  // Auto-tune parameters based on historical performance
  async autoTuneParameters(
    currentParams: OCRParameters,
    performanceHistory: PerformanceMetric[],
  ): Promise<OCRParameters>;

  // Validate parameter effectiveness
  async validateParameters(
    parameters: OCRParameters,
    validationSet: ImageData[],
  ): Promise<ValidationResult>;
}
```

### Optimization Profiles

```typescript
const OPTIMIZATION_PROFILES: OptimizationProfile[] = [
  {
    name: "general_receipts",
    description: "General purpose receipt OCR",
    targetReceiptType: "general",
    parameters: {
      languages: ["eng"],
      engineMode: "NEURAL_NETS",
      pageSegMode: 6, // Single uniform block
      ocrEngineMode: 3, // Default
      minConfidence: 60,
      whiteList:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$/¥-: ",
      timeoutMs: 30000,
    },
    expectedAccuracy: 85,
  },
  {
    name: "japanese_receipts",
    description: "Japanese receipt OCR optimization",
    targetReceiptType: "general",
    parameters: {
      languages: ["jpn", "eng"],
      engineMode: "NEURAL_NETS",
      pageSegMode: 6,
      ocrEngineMode: 3,
      minConfidence: 55,
      timeoutMs: 45000,
    },
    expectedAccuracy: 80,
  },
];
```

### Performance Monitoring

- Real-time accuracy tracking per parameter set
- Processing time measurement and optimization
- Confidence score distribution analysis
- Error pattern identification and correction
- Automated parameter adjustment based on trends

### State Management Integration

- Use React Query for optimization result caching
- Implement Zustand store for parameter configuration
- WebSocket updates for real-time optimization progress
- Persistent storage for optimization history

### Security Considerations

- Parameter validation to prevent malicious configurations
- Rate limiting for optimization requests
- Secure storage of optimization results
- Input sanitization for custom parameters

### Performance Optimizations

- Parallel parameter testing for faster optimization
- Caching of optimization results
- Incremental parameter adjustment
- Smart sampling for large image sets

## Metadata

- **Status**: Not Started
- **Created**: 2025-01-13
- **Owner**: AI Assistant
- **Reviewer**: Human Developer

## Acceptance Criteria

- [ ] OCR parameters are optimized for different receipt types
- [ ] A/B testing framework compares parameter effectiveness
- [ ] Automatic tuning improves accuracy over time
- [ ] Performance monitoring tracks optimization success
- [ ] Configuration profiles work for major receipt formats
- [ ] Processing time remains within acceptable limits
- [ ] Optimization results are persistent and reusable

### Verification Commands

```bash
npm run test:ocr-optimization
npm run test:parameter-profiles
npm run benchmark:ocr-accuracy
```

## Dependencies

- **Required**: PBI-4-2-1 - Image preprocessing pipeline

## Testing Requirements

- Unit Tests (Vitest): Parameter optimization logic, profile management, performance metrics
- Integration Tests (Testing Library): Complete optimization workflows
- Performance Tests: OCR accuracy and speed benchmarks
- A/B Tests: Parameter set effectiveness comparison

### Test Coverage Requirements

- Optimization algorithms: 95%
- Parameter validation: 100%
- Performance monitoring: 90%
- Profile management: 100%

## Estimate

1 story point

## Priority

High - Critical for maximizing OCR accuracy

## Implementation Notes

- Implement gradual parameter optimization to avoid performance degradation
- Use statistical significance testing for A/B test results
- Add rollback capability for parameter changes that reduce accuracy
- Ensure optimization works across different image qualities and conditions
- Implement proper logging for debugging optimization issues
