# Software Bill of Materials (SBOM)

## Overview

This directory contains the Software Bill of Materials (SBOM) for the project.
SBOM is a formal record containing the details and supply chain relationships
of various components used in building software.

## Contents

- `sbom.xml`: CycloneDX format SBOM
- `sbom.json`: JSON format SBOM
- `licenses/`: License information for dependencies

## Generation

SBOM is automatically generated using CycloneDX:

```bash
# Install CycloneDX CLI
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM
cyclonedx-npm --output-file docs/standards/sbom/sbom.xml
cyclonedx-npm --output-file docs/standards/sbom/sbom.json --format json
```

## Update Schedule

- Manual generation on dependency updates
- Review and validation before each release
- Future: Weekly automatic generation planned

## Usage

- Security audits
- License compliance checks
- Dependency vulnerability scanning
- Supply chain risk assessment

## Reference

- [CycloneDX Specification](https://cyclonedx.org/specification/overview/)
- [SPDX License List](https://spdx.org/licenses/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
