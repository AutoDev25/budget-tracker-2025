#!/bin/bash

# Build Application from Documentation Script
# This script analyzes your documentation and prompts Claude to build accordingly

echo "🔍 Analyzing project documentation..."

# Check if documentation exists
check_file() {
    if [ -s "$1" ]; then
        echo "✅ Found: $1"
        return 0
    else
        echo "⚠️  Missing or empty: $1"
        return 1
    fi
}

echo ""
echo "📋 Documentation Checklist:"

# Core documentation checks
check_file "docs/specifications/requirements.md"
REQUIREMENTS_EXISTS=$?

check_file "docs/specifications/user-stories.md"
USER_STORIES_EXISTS=$?

check_file "docs/business-logic/workflows.md"
WORKFLOWS_EXISTS=$?

# Design documentation checks
if ls docs/design/wireframes/*.{png,jpg,jpeg,pdf} 1> /dev/null 2>&1; then
    WIREFRAME_COUNT=$(ls docs/design/wireframes/*.{png,jpg,jpeg,pdf} 2>/dev/null | wc -l)
    echo "✅ Found: $WIREFRAME_COUNT wireframe(s) in docs/design/wireframes/"
    WIREFRAMES_EXIST=0
else
    echo "⚠️  No wireframes found in docs/design/wireframes/"
    WIREFRAMES_EXIST=1
fi

echo ""

# Generate Claude prompt based on available documentation
generate_claude_prompt() {
    echo "# Build Application from Documentation"
    echo ""
    echo "Please build an application based on the following documentation:"
    echo ""
    
    if [ $REQUIREMENTS_EXISTS -eq 0 ]; then
        echo "## Requirements"
        cat docs/specifications/requirements.md
        echo ""
    fi
    
    if [ $USER_STORIES_EXISTS -eq 0 ]; then
        echo "## User Stories"
        cat docs/specifications/user-stories.md
        echo ""
    fi
    
    if [ $WORKFLOWS_EXISTS -eq 0 ]; then
        echo "## Business Workflows"
        cat docs/business-logic/workflows.md
        echo ""
    fi
    
    if [ -s docs/business-logic/rules.md ]; then
        echo "## Business Rules"
        cat docs/business-logic/rules.md
        echo ""
    fi
    
    if [ -s docs/business-logic/calculations.md ]; then
        echo "## Calculations & Formulas"
        cat docs/business-logic/calculations.md
        echo ""
    fi
    
    if [ $WIREFRAMES_EXIST -eq 0 ]; then
        echo "## Wireframes"
        echo "Please reference the wireframe files in docs/design/wireframes/ for UI design."
        echo "Wireframes available:"
        ls docs/design/wireframes/*.{png,jpg,jpeg,pdf} 2>/dev/null | sed 's/^/- /'
        echo ""
    fi
    
    if [ -s docs/architecture/tech-stack.md ]; then
        echo "## Technology Stack"
        cat docs/architecture/tech-stack.md
        echo ""
    fi
    
    if [ -s docs/architecture/database-schema.md ]; then
        echo "## Database Schema"
        cat docs/architecture/database-schema.md
        echo ""
    fi
    
    echo "## Instructions"
    echo "Based on the above documentation:"
    echo "1. Create a comprehensive implementation plan"
    echo "2. Set up the project structure according to the tech stack"
    echo "3. Implement the backend API following the business rules"
    echo "4. Build the frontend UI based on wireframes (if provided)"
    echo "5. Ensure all user stories and requirements are met"
    echo "6. Include proper error handling and validation"
    echo "7. Add appropriate styling and responsive design"
    echo ""
}

# Check if we have enough documentation to proceed
if [ $REQUIREMENTS_EXISTS -eq 0 ] || [ $USER_STORIES_EXISTS -eq 0 ] || [ $WORKFLOWS_EXISTS -eq 0 ]; then
    echo "🚀 Ready to build! Generating Claude prompt..."
    echo ""
    
    # Create the prompt file
    generate_claude_prompt > claude-build-prompt.md
    
    echo "✅ Generated: claude-build-prompt.md"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the generated prompt: cat claude-build-prompt.md"
    echo "2. Copy the prompt content"
    echo "3. Paste it to Claude to build your application"
    echo ""
    echo "💡 Pro tip: If you have wireframes, make sure Claude can access them"
    echo "   by mentioning their file paths in your conversation"
    
else
    echo "❌ Insufficient documentation to proceed"
    echo ""
    echo "Please ensure you have at least one of:"
    echo "- Requirements documentation (docs/specifications/requirements.md)"
    echo "- User stories (docs/specifications/user-stories.md)"
    echo "- Business workflows (docs/business-logic/workflows.md)"
    echo ""
    echo "Run './setup/init-project.sh' to create template files"
fi