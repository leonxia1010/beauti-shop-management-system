#!/bin/bash

# Merge sharded architecture documents into a single file
# Usage: ./scripts/merge-architecture.sh

OUTPUT_FILE="docs/architecture.md"
ARCH_DIR="docs/architecture"

echo "# beauty-shop-management-system Fullstack Architecture Document" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "> **Note**: This is an auto-generated merged version of the sharded architecture documents." >> "$OUTPUT_FILE"
echo "> For the latest version, see the individual files in \`$ARCH_DIR/\`" >> "$OUTPUT_FILE"
echo "> Generated on: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to append file content without the first heading
append_content() {
    local file=$1
    local title=$2

    if [ -f "$ARCH_DIR/$file" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "## $title" >> "$OUTPUT_FILE"
        # Skip the first line if it's a heading (starts with #)
        tail -n +2 "$ARCH_DIR/$file" >> "$OUTPUT_FILE"
    fi
}

# Merge files in logical order
append_content "introduction.md" "Introduction"
append_content "high-level-architecture.md" "High Level Architecture"
append_content "tech-stack.md" "Technology Stack"
append_content "source-tree.md" "Source Tree Structure"
append_content "functional-architecture.md" "Functional Architecture"
append_content "frontend-architecture.md" "Frontend Architecture"
append_content "backend-architecture.md" "Backend Architecture"
append_content "data-architecture.md" "Data Architecture"
append_content "security-architecture.md" "Security Architecture"
append_content "deployment-devops.md" "Deployment & DevOps"
append_content "observability.md" "Observability"
append_content "scalability-performance.md" "Scalability & Performance"
append_content "testing-quality-strategy.md" "Testing & Quality Strategy"
append_content "coding-standards.md" "Coding Standards"
append_content "coding-standards-critical.md" "Coding Standards (Critical)"
append_content "error-handling-strategy.md" "Error Handling Strategy"
append_content "monitoring-observability.md" "Monitoring & Observability"

echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "*This document was automatically generated from sharded architecture files.*" >> "$OUTPUT_FILE"

echo "✅ Architecture document merged successfully to $OUTPUT_FILE"
echo "📊 File size: $(wc -c < "$OUTPUT_FILE" | xargs) bytes"