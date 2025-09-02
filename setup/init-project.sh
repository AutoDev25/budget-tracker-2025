#!/bin/bash

# Project Initialization Script
# This script sets up the project structure and prepares for development

echo "🚀 Initializing Project Structure..."

# Create documentation directories
mkdir -p docs/specifications
mkdir -p docs/design/wireframes
mkdir -p docs/design/mockups
mkdir -p docs/architecture
mkdir -p docs/business-logic

# Create placeholder documentation files
touch docs/specifications/requirements.md
touch docs/specifications/user-stories.md
touch docs/specifications/api-spec.yaml
touch docs/design/user-flow.md
touch docs/design/style-guide.md
touch docs/architecture/system-design.md
touch docs/architecture/database-schema.md
touch docs/architecture/tech-stack.md
touch docs/architecture/deployment.md
touch docs/business-logic/workflows.md
touch docs/business-logic/rules.md
touch docs/business-logic/calculations.md

echo "📁 Documentation structure created!"

# Create a sample requirements file if it doesn't exist
if [ ! -s docs/specifications/requirements.md ]; then
    cat > docs/specifications/requirements.md << 'EOF'
# Project Requirements

## Overview
[Describe your project here]

## Functional Requirements
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

## Non-Functional Requirements
1. Performance: [Define performance requirements]
2. Security: [Define security requirements]
3. Usability: [Define usability requirements]

## User Roles
- [Role 1]: [Description]
- [Role 2]: [Description]

## Success Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]
EOF
fi

echo "📝 Sample requirements template created!"
echo ""
echo "✅ Project structure initialized!"
echo ""
echo "Next steps:"
echo "1. Add your wireframes to: docs/design/wireframes/"
echo "2. Update requirements in: docs/specifications/requirements.md"
echo "3. Define business logic in: docs/business-logic/"
echo "4. Run: ./setup/build-from-docs.sh to generate the application"