.PHONY: help install lint format test check-docs

help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies using yarn"
	@echo "  lint         - Run markdownlint"
	@echo "  format       - Format markdown files with prettier"
	@echo "  test         - (Placeholder for future tests)"
	@echo "  check-docs   - Run pre-commit documentation checks"

install:
	yarn install

lint:
	yarn lint:md

format:
	yarn format:md

test:
	@echo "No tests configured yet."

check-docs:
	yarn check:docs
