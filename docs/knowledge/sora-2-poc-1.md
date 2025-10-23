 Analysis Summary

  Based on the codebase, I discovered:

  1. Test Script (run-sora-2-test.sh:14-20) - A simple curl command that calls the Sora 2 API:
    - Endpoint: POST https://api.openai.com/v1/videos
    - Headers: Authorization with Bearer token
    - Body: Model and prompt
  2. Implementation (src/clients/SoraV1Client.ts) - A robust TypeScript client with:
    - Job creation (createVideo method)
    - Status polling (getVideoStatus method)
    - Video download (downloadVideo method)
    - Automatic retry logic with exponential backoff
    - Comprehensive error handling
  3. Type Definitions (src/types/sora.ts) - Complete type safety with:
    - Request/response interfaces
    - Status tracking
    - Resolution and duration mappings

  Created Guide

  I've created SORA-2-API-GUIDE.md which includes:

  Complete Workflow

  1. Create Video Job - Submit a prompt to generate a video
  2. Poll Status - Check progress until completion
  3. Download Video - Retrieve the final MP4 file

  Key Features

  - Quick Start - Get up and running in minutes
  - Step-by-Step Tutorial - Detailed explanation of each API call
  - Complete Examples - Working code in Bash, Python, and TypeScript
  - API Reference - Full parameter documentation
  - Error Handling - Common errors and solutions
  - Best Practices - Prompt engineering, optimization tips

  Example Workflow

  # 1. Create job
  curl -X POST https://api.openai.com/v1/videos \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{"model":"sora-2","prompt":"A cat playing piano"}'

  # 2. Check status (poll every 5-10 seconds)
  curl https://api.openai.com/v1/videos/{job_id} \
    -H "Authorization: Bearer $OPENAI_API_KEY"

  # 3. Download when completed
  curl https://api.openai.com/v1/videos/{job_id}/content \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -o video.mp4

  The guide is ready to use and includes production-ready code examples that you can copy and run directly!