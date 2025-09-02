#!/bin/bash

# Claude Prompt Generation Script
echo "🔍 Analyzing project documentation..."

PROJECT_NAME=$(basename "$(pwd)")
PROMPT_FILE="claude-build-prompt.md"

# Check documentation files
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

check_file "docs/requirements.md"
REQUIREMENTS_EXISTS=$?

check_file "docs/user-stories.md"
STORIES_EXISTS=$?

check_file "docs/flows.md"
FLOWS_EXISTS=$?

# Check for wireframes
if ls docs/wireframes/*.{png,jpg,jpeg,pdf} 1> /dev/null 2>&1; then
    WIREFRAME_COUNT=$(ls docs/wireframes/*.{png,jpg,jpeg,pdf} 2>/dev/null | wc -l)
    echo "✅ Found: $WIREFRAME_COUNT wireframe(s)"
    WIREFRAMES_EXIST=0
else
    echo "⚠️  No wireframes found in docs/wireframes/"
    WIREFRAMES_EXIST=1
fi

echo ""

# Generate comprehensive prompt
cat > $PROMPT_FILE << 'PROMPT_EOF'
# Build Application from Comprehensive Documentation

I have prepared detailed documentation for my project. Please build a complete application based on these specifications:

PROMPT_EOF

if [ $REQUIREMENTS_EXISTS -eq 0 ]; then
    echo "## Requirements" >> $PROMPT_FILE
    cat docs/requirements.md >> $PROMPT_FILE
    echo "" >> $PROMPT_FILE
fi

if [ $STORIES_EXISTS -eq 0 ]; then
    echo "## User Stories" >> $PROMPT_FILE
    cat docs/user-stories.md >> $PROMPT_FILE
    echo "" >> $PROMPT_FILE
fi

if [ $FLOWS_EXISTS -eq 0 ]; then
    echo "## User Flows" >> $PROMPT_FILE
    cat docs/flows.md >> $PROMPT_FILE
    echo "" >> $PROMPT_FILE
fi

if [ -s docs/style-guide.md ]; then
    echo "## Style Guide" >> $PROMPT_FILE
    cat docs/style-guide.md >> $PROMPT_FILE
    echo "" >> $PROMPT_FILE
fi

if [ $WIREFRAMES_EXIST -eq 0 ]; then
    echo "## Wireframes" >> $PROMPT_FILE
    echo "I have uploaded wireframes that show the exact UI design:" >> $PROMPT_FILE
    ls docs/wireframes/*.{png,jpg,jpeg,pdf} 2>/dev/null | sed 's/^/- /' >> $PROMPT_FILE
    echo "" >> $PROMPT_FILE
fi

# Add project context
cat >> $PROMPT_FILE << 'PROMPT_EOF'
## Project Context
This project uses the existing React + Vite + FastAPI structure:
- Frontend in  directory with React + TypeScript + Vite
- Backend in  directory with FastAPI + Python
- Modular component architecture
- Project-specific CLAUDE.md configuration available

## Implementation Instructions
Based on all the documentation above:

1. **Use the TodoWrite tool** to create an implementation plan
2. **Review existing structure** in frontend/ and backend/ directories
3. **Implement frontend** according to wireframes and user stories
4. **Build backend API** to support all requirements
5. **Follow style guide** for consistent design
6. **Implement all user flows** with proper error handling
7. **Test thoroughly** against all acceptance criteria
8. **Ensure responsive design** works on desktop and mobile

## Key Requirements
- Follow the requirements document exactly
- Implement all user stories with acceptance criteria
- Use wireframes for exact UI layout (if provided)
- Follow the style guide for colors and components
- Create a professional, polished application
- Include proper error handling and loading states
- Make it responsive for different screen sizes

Please start by creating your implementation plan with TodoWrite, then build the complete application systematically.
PROMPT_EOF

echo "✅ Generated comprehensive prompt: $PROMPT_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Review the generated prompt: cat $PROMPT_FILE"
echo "2. Upload any wireframes to Claude"
echo "3. Copy and paste the prompt content to Claude"
echo "4. Claude will build your complete application!"
echo ""
echo "💡 Pro tip: Make sure to upload wireframe images before sending the prompt"
