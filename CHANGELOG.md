# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Removed redundant `implementation` directory and all associated links, unifying documentation
  strategy under the PBI as the single source of truth.
- Reduced token count in AI context summaries:
  - `ai/context/summary.md` and `summary-ja.md` optimized to fit within 2000 token limit
  - Condensed content while maintaining key information
  - Removed verbose examples and redundant explanations

### Fixed

- Resolved inconsistencies in documentation content across various files, including READMEs and workflow descriptions.
- Markdown lint errors in documentation:
  - Added proper blank lines around headings in `README-ja.md`
  - Fixed trailing spaces in `CHANGELOG-ja.md`
  - Added missing newlines at end of changelog files
