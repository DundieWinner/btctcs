#!/bin/bash
# Setup script for GitHub Actions scheduled analysis workflow

set -e

echo "🚀 Setting up GitHub Actions for Scheduled Company Analysis"
echo "=========================================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Check current repository
REPO_INFO=$(gh repo view --json nameWithOwner,defaultBranch 2>/dev/null || echo "")
if [ -z "$REPO_INFO" ]; then
    echo "❌ Not in a GitHub repository or repository not found."
    echo "Please make sure you're in the repository directory and it's pushed to GitHub."
    exit 1
fi

REPO_NAME=$(echo "$REPO_INFO" | jq -r '.nameWithOwner')
echo "📁 Repository: $REPO_NAME"

# Discover companies
echo ""
echo "🔍 Discovering companies with analysis scripts..."
COMPANIES=()
for dir in companies/*/; do
    if [ -d "$dir" ] && [ -f "${dir}analysis_with_upload.py" ]; then
        company_name=$(basename "$dir")
        COMPANIES+=("$company_name")
        echo "  ✅ Found: $company_name"
    fi
done

if [ ${#COMPANIES[@]} -eq 0 ]; then
    echo "❌ No companies found with analysis_with_upload.py scripts"
    echo "Please ensure your companies are in the companies/ directory with analysis_with_upload.py files"
    exit 1
fi

echo ""
echo "📋 Found ${#COMPANIES[@]} companies: ${COMPANIES[*]}"

# Function to set secret if not empty
set_secret_if_provided() {
    local secret_name=$1
    local secret_value=$2
    local is_required=${3:-false}
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo "  ✅ Set $secret_name"
    elif [ "$is_required" = true ]; then
        echo "  ❌ $secret_name is required but not provided"
        return 1
    else
        echo "  ⏭️  Skipped $secret_name (optional)"
    fi
}

# Collect secrets
echo ""
echo "🔐 Setting up GitHub Secrets"
echo "Enter your configuration (press Enter to skip optional secrets):"

read -p "S3_BUCKET_NAME (required): " S3_BUCKET_NAME
read -p "AWS_ACCESS_KEY_ID (required): " AWS_ACCESS_KEY_ID
read -s -p "AWS_SECRET_ACCESS_KEY (required): " AWS_SECRET_ACCESS_KEY
echo ""
read -p "AWS_REGION (optional, default: us-east-1): " AWS_REGION
read -p "AWS_ENDPOINT_URL (optional, for S3-compatible services): " AWS_ENDPOINT_URL
read -p "S3_KEY_PREFIX (optional, default: charts): " S3_KEY_PREFIX
read -p "DATA_URL (optional, for live API data): " DATA_URL

echo ""
echo "Setting GitHub secrets..."

# Set required secrets
set_secret_if_provided "S3_BUCKET_NAME" "$S3_BUCKET_NAME" true || exit 1
set_secret_if_provided "AWS_ACCESS_KEY_ID" "$AWS_ACCESS_KEY_ID" true || exit 1
set_secret_if_provided "AWS_SECRET_ACCESS_KEY" "$AWS_SECRET_ACCESS_KEY" true || exit 1

# Set optional secrets
set_secret_if_provided "AWS_REGION" "$AWS_REGION"
set_secret_if_provided "AWS_ENDPOINT_URL" "$AWS_ENDPOINT_URL"
set_secret_if_provided "S3_KEY_PREFIX" "$S3_KEY_PREFIX"
set_secret_if_provided "DATA_URL" "$DATA_URL"

echo ""
echo "🎯 Testing workflow discovery..."

# Test the discovery logic locally
echo "Companies that will be discovered by the workflow:"
for dir in companies/*/; do
    if [ -d "$dir" ] && [ -f "${dir}analysis_with_upload.py" ]; then
        company_name=$(basename "$dir")
        echo "  ✅ $company_name"
    fi
done

echo ""
echo "✅ Setup complete!"
echo ""
echo "📅 The workflow is scheduled to run daily at 9:00 AM UTC"
echo "🔧 You can manually trigger it from: https://github.com/$REPO_NAME/actions"
echo ""
echo "Next steps:"
echo "1. Commit and push the .github/workflows/ directory to your repository"
echo "2. Go to the Actions tab to see the workflow"
echo "3. Manually trigger a test run to verify everything works"
echo ""
echo "To add new companies:"
echo "1. Create a new directory in companies/"
echo "2. Add an analysis_with_upload.py script"
echo "3. The workflow will automatically discover it on the next run"
