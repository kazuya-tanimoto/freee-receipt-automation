# PBI-5-2-8: Rule Editing and Customization Features

## Description

Implement advanced rule management features including rule editing, manual rule creation, rule duplication, and batch
operations. This allows users to customize and fine-tune the automatically generated matching rules.

## Implementation Details

### Files to Create/Modify

1. `src/components/rules/RuleEditor.tsx` - Rule editing form component
2. `src/components/rules/RuleCreator.tsx` - Manual rule creation component
3. `src/components/rules/RuleBatchActions.tsx` - Batch operations component
4. `src/lib/rules/rule-editor-helpers.ts` - Rule editing utilities
5. `src/app/dashboard/rules/[id]/edit/page.tsx` - Rule editing page

### Technical Requirements

- Form-based rule editing with validation
- Support all rule types (vendor, keyword, amount, date)
- Real-time rule validation and preview
- Batch operations (enable/disable, delete multiple rules)
- Rule duplication and template creation

### Editing Architecture

```typescript
interface RuleEditorProps {
  rule?: MatchingRule;
  mode: 'create' | 'edit' | 'duplicate';
  onSave: (rule: MatchingRule) => Promise<void>;
  onCancel: () => void;
}

interface RuleFormData {
  name: string;
  description: string;
  ruleType: RuleType;
  ruleData: any;
  isActive: boolean;
  priority: number;
}

interface RuleBatchActionsProps {
  selectedRules: string[];
  onBatchAction: (action: BatchAction, ruleIds: string[]) => Promise<void>;
  availableActions: BatchAction[];
}
```

### Rule Form Validation

```typescript
interface RuleValidation {
  validateRuleForm(formData: RuleFormData): FormValidationResult;
  previewRule(formData: RuleFormData): RulePreview;
  validateRuleData(ruleType: RuleType, ruleData: any): RuleDataValidation;
}

interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string[]>;
  generalErrors: string[];
}

interface RulePreview {
  description: string;
  examples: MatchExample[];
  warnings: string[];
  estimatedPerformance: PerformanceEstimate;
}
```

## Acceptance Criteria

- [ ] Edit existing rules with form validation
- [ ] Create new rules manually with all rule types
- [ ] Duplicate rules with modification capability
- [ ] Perform batch operations on multiple rules
- [ ] Preview rule behavior before saving
- [ ] Validate rule consistency and conflicts

## Dependencies

- **Required**: PBI-5-2-7 (Rule Management UI Basic)
- **Required**: PBI-5-2-6 (Rule Validation System)

## Testing Requirements

- Unit tests: Form validation and rule editing logic
- Integration tests: Rule CRUD operations
- User tests: Rule editing workflow usability

## Estimate

1 story point

## Priority

Medium - Enhances user control over rules

## Implementation Notes

- Use React Hook Form for form management
- Implement auto-save for draft rules
- Provide rule templates for common patterns
