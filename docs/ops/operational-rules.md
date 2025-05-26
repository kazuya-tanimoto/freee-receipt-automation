# Operational Rules Guidelines

## Update Flow
### 1. Updates via PR
- All updates must be done via PR
- Direct commits are prohibited
- Review is mandatory

### 2. ADR Addition
- Required for technology selection changes
- Format: `docs/adr/ADR-xxxx.md`
- Content:
  - Background
  - Decision
  - Impact
  - Alternatives

### 3. CHANGELOG Management
- Follows Keep-a-Changelog format
- Required sections:
  - Added
  - Changed
  - Fixed
- Complies with Semantic Versioning

## Quality Management
### 1. CI/CD
- CI pass required for all PRs
- Check items:
  - Guideline size
  - Build
  - Security

### 2. Documentation
- Manual editing of summary is prohibited
- Prioritize automatic updates
- Major changes require ADR

### 3. Security
- Weekly scanning
- Immediate response to vulnerabilities
- Strict secret management

## Maintenance
### 1. Regular Updates
- Weekly submodule updates
- Monthly dependency updates
- Quarterly security reviews

### 2. Monitoring
- Performance metrics
- Error rates
- Resource utilization

### 3. Backup
- Daily backups
- Restore testing
- Disaster recovery procedures 