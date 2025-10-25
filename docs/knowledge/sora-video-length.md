# Sora 2 API: Extended Video Length Implementation Guide

## Overview

This guide provides comprehensive instructions for extending OpenAI Sora 2 video generation beyond the default 4-second limitation. It covers immediate solutions, advanced techniques, and best practices for creating longer video content.

---

## Table of Contents

- [Current Limitations](#current-limitations)
- [Immediate Solution](#immediate-solution)
- [Advanced Solutions](#advanced-solutions)
- [API Reference](#api-reference)
- [Pricing Guide](#pricing-guide)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Current Limitations

### Supported Duration Values

The Sora 2 API supports three specific duration values via the `seconds` parameter:

- **"4"** - Default value (4 seconds)
- **"8"** - Medium duration (8 seconds)
- **"12"** - Maximum standard duration (12 seconds)

### Model-Specific Resolutions

**Sora-2 (Standard)**
- 1280x720 (landscape)
- 720x1280 (portrait)

**Sora-2-Pro (Premium)**
- 1280x720 (landscape)
- 720x1280 (portrait)
- 1024x1792 (high portrait)
- 1792x1024 (high landscape)

---

## Immediate Solution

### Setting the `seconds` Parameter

The most common issue is not explicitly setting the `seconds` parameter, which defaults to 4 seconds. Here's how to fix it:

#### Python Implementation

```python
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

response = client.videos.create(
    model="sora-2",  # or "sora-2-pro"
    prompt="A golden retriever playing in the snow, chasing snowflakes",
    size="1280x720",  # Landscape format
    seconds="12"  # ← Change this to extend duration
)

# Poll for completion
job_id = response.id
while True:
    status = client.videos.retrieve(job_id)
    if status.status == "completed":
        video_url = status.url
        break
    time.sleep(5)

print(f"Video ready: {video_url}")
```

#### JavaScript Implementation

```javascript
const response = await fetch("https://api.openai.com/v1/videos", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "sora-2",
    prompt: "A golden retriever playing in the snow, chasing snowflakes",
    size: "1280x720",
    seconds: "12"  // ← Set to "8" or "12" for longer videos
  })
});

const data = await response.json();
console.log("Generation job created:", data.id);
```

#### cURL Example

```bash
curl https://api.openai.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A golden retriever playing in the snow, chasing snowflakes",
    "size": "1280x720",
    "seconds": "12"
  }'
```

---

## Advanced Solutions

### 1. Sequential Generation with Frame Continuity

For videos longer than 12 seconds, use a frame-to-frame chaining approach:

#### Methodology

1. Generate initial 12-second clip
2. Extract the final frame from the generated video
3. Use the final frame as `input_reference` for the next generation
4. Break your narrative prompt into coherent segments
5. Concatenate clips in post-production

#### Implementation Example

```python
import cv2
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

def extract_final_frame(video_path):
    """Extract the last frame from a video file"""
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_AVI_RATIO, 1)  # Go to end
    ret, frame = cap.read()
    cap.release()
    
    # Save frame as image
    cv2.imwrite("final_frame.jpg", frame)
    return "final_frame.jpg"

def generate_segment(prompt, reference_image=None):
    """Generate a video segment with optional image reference"""
    params = {
        "model": "sora-2",
        "prompt": prompt,
        "size": "1280x720",
        "seconds": "12"
    }
    
    if reference_image:
        # Upload image as multipart/form-data
        with open(reference_image, 'rb') as img:
            params["input_reference"] = img
    
    response = client.videos.create(**params)
    # Wait for completion and return video path
    return response.url

# Generate extended video sequence
prompts = [
    "A car drives down a winding mountain road at sunset, camera following from behind",
    "The car continues along the road, approaching a scenic overlook",
    "The car pulls into the overlook and parks as the sun touches the horizon"
]

clips = []
reference = None

for i, prompt in enumerate(prompts):
    print(f"Generating segment {i+1}/3...")
    video_url = generate_segment(prompt, reference)
    clips.append(video_url)
    
    # Download video and extract final frame for next segment
    if i < len(prompts) - 1:
        # Download video_url to local file
        video_path = f"segment_{i}.mp4"
        reference = extract_final_frame(video_path)

print(f"Generated {len(clips)} segments. Concatenate in video editor.")
```

#### Automated Tool

The `sora-extend` project (available on GitHub) automates this process:
- Intelligent prompt decomposition
- Automatic frame extraction and chaining
- Seamless video concatenation

### 2. Azure AI Foundry Preview (Up to 20 Seconds)

Azure's implementation supports longer durations through preview access:

```python
from azure.ai.ml import MLClient
from azure.identity import DefaultAzureCredential

# Initialize Azure client
credential = DefaultAzureCredential()
ml_client = MLClient(credential, subscription_id, resource_group, workspace_name)

# Create video generation job
response = ml_client.video.create_job(
    model="sora-2",
    width=1920,
    height=1080,
    n_seconds=20,  # Azure supports up to 20 seconds
    prompt="Your detailed video prompt here"
)

# Poll for completion
job = ml_client.video.get_job(response.id)
while job.status != "Completed":
    time.sleep(10)
    job = ml_client.video.get_job(response.id)

video_url = job.output.url
```

**Requirements:**
- Azure subscription with AI Foundry access
- Regional availability (verify in Azure documentation)
- Preview program enrollment

### 3. Cost-Effective Stitching Strategy

Generate multiple shorter clips and combine them for better quality and cost efficiency:

#### Why Stitching Works Better

- **Better instruction adherence**: Model follows prompts more reliably on shorter clips
- **Higher quality output**: Less temporal drift and physics errors
- **More control**: Fine-tune each segment independently
- **Cost optimization**: Mix sora-2 and sora-2-pro strategically

#### Example: 60-Second Video Production

```python
# Strategy: Use 5x 12-second clips instead of attempting 60 seconds
segments = [
    {"duration": "12", "prompt": "Opening scene: Wide shot of city skyline at dawn", "model": "sora-2-pro"},
    {"duration": "12", "prompt": "Camera pans down to street level, people beginning morning routines", "model": "sora-2"},
    {"duration": "12", "prompt": "Focus on cafe exterior, customers entering and exiting", "model": "sora-2"},
    {"duration": "12", "prompt": "Interior shot: barista preparing coffee, steam rising", "model": "sora-2"},
    {"duration": "12", "prompt": "Close-up: hands receiving coffee cup, final shot of satisfied customer", "model": "sora-2-pro"}
]

# Cost comparison:
# Approach 1 (stitching): 2 Pro clips (24s × $0.30) + 3 Standard clips (36s × $0.10) = $10.80
# Approach 2 (if 60s was supported): 60s × $0.30 = $18.00
# Savings: 40%
```

---

## API Reference

### Core Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | "sora-2" or "sora-2-pro" |
| `prompt` | string | Yes | Text description of desired video |
| `size` | string | Yes | Resolution (e.g., "1280x720") |
| `seconds` | string | No | Duration: "4", "8", or "12" (default: "4") |
| `input_reference` | file | No | Reference image for first frame |

### Request Example

```json
{
  "model": "sora-2",
  "prompt": "A cat wearing sunglasses skateboarding through a park on a sunny day",
  "size": "1280x720",
  "seconds": "12"
}
```

### Response Structure

```json
{
  "id": "video_abc123",
  "status": "queued",
  "created_at": 1698765432,
  "model": "sora-2"
}
```

### Status Polling

```json
{
  "id": "video_abc123",
  "status": "completed",
  "url": "https://cdn.openai.com/videos/abc123.mp4",
  "created_at": 1698765432,
  "completed_at": 1698765612
}
```

---

## Pricing Guide

### Per-Second Billing (As of October 2025)

| Model | Resolution | Price per Second |
|-------|------------|------------------|
| sora-2 | 720p (1280×720 or 720×1280) | $0.10 |
| sora-2-pro | 720p (1280×720 or 720×1280) | $0.30 |
| sora-2-pro | High-res (1792×1024 or 1024×1792) | $0.50 |

### Cost Calculations

#### Single Video Costs

```
4-second video (sora-2, 720p):   4 × $0.10 = $0.40
8-second video (sora-2, 720p):   8 × $0.10 = $0.80
12-second video (sora-2, 720p): 12 × $0.10 = $1.20

12-second video (sora-2-pro, 720p):     12 × $0.30 = $3.60
12-second video (sora-2-pro, high-res): 12 × $0.50 = $6.00
```

#### Extended Video via Stitching (60 seconds total)

**Option A: All Standard Quality**
- 5 clips × 12 seconds × $0.10 = $6.00

**Option B: Mixed Quality (First/Last Pro, Middle Standard)**
- 2 Pro clips: 24 seconds × $0.30 = $7.20
- 3 Standard clips: 36 seconds × $0.10 = $3.60
- **Total: $10.80**

**Option C: All Premium Quality**
- 5 clips × 12 seconds × $0.30 = $18.00

### Cost Optimization Strategies

1. **Use sora-2 for drafts and iteration**
2. **Use sora-2-pro only for final production shots**
3. **Generate shorter clips and stitch** (typically 40-70% cost savings)
4. **Batch process during off-peak hours** (if provider offers discounts)
5. **Test prompts at 4 seconds before committing to 12 seconds**

---

## Best Practices

### Duration Selection

**4 Seconds: Best For**
- Quick actions or single gestures
- Testing prompts and visual concepts
- Social media teasers
- Reaction shots

**8 Seconds: Best For**
- Short dialogues (1-2 lines)
- Single continuous camera movements
- Product demonstrations
- Transitions between scenes

**12 Seconds: Best For**
- Brief narratives with 2-3 action beats
- Multi-character interactions
- Complex camera work
- Establishing shots with detail

### Quality Optimization Tips

1. **Keep It Simple**: Shorter clips follow instructions more reliably
   ```
   ❌ BAD:  "A person walks through a city, enters a cafe, orders coffee, 
            sits down, drinks it, leaves, and walks to a park" (12 seconds)
   
   ✅ GOOD: "A person walks up to a cafe entrance, pulls open the glass door, 
            and steps inside" (12 seconds)
   ```

2. **Specify Timing in Prompts**
   ```
   "Actor takes four steps to the window (0-3s), pauses (3-4s), 
   pulls curtain in final second (4-5s)"
   ```

3. **Use Image References for Consistency**
   - Generate a key frame with DALL-E
   - Use it as `input_reference` to anchor the visual style
   - Maintain character/object consistency across segments

4. **Progressive Detail Approach**
   - Start with minimal prompt at 4 seconds
   - Add detail incrementally
   - Scale to 12 seconds once prompt is optimized

### Prompt Structure for Extended Videos

```markdown
Style: [Overall aesthetic - e.g., "Cinematic 35mm film, warm tones"]

Scene Description:
[Detailed visual description of environment, subjects, and atmosphere]

Cinematography:
- Camera: [Framing and movement]
- Lighting: [Key light sources and mood]
- Palette: [3-5 color anchors]

Actions:
1. [0-4s]: [Specific action with timing]
2. [4-8s]: [Next action beat]
3. [8-12s]: [Final action or resolution]

Dialogue (if applicable):
- Character A: "Line of dialogue"
- Character B: "Response"

Audio/Sound:
[Background ambience and specific sound effects]
```

### Common Pitfalls to Avoid

| Issue | Problem | Solution |
|-------|---------|----------|
| Physics errors | Asking for impossible motions | Describe realistic physics explicitly |
| Temporal drift | Character appearance changes mid-clip | Use fewer cuts, add distinctive details |
| Audio desync | Complex dialogue in short timeframe | Limit to 1-2 short lines per 12 seconds |
| Unclear framing | Vague camera descriptions | Specify exact shot type and angle |
| Over-complexity | Too many actions in one clip | Break into multiple sequential clips |

---

## Troubleshooting

### Issue: Videos Still Generating at 4 Seconds

**Diagnosis:**
- Check if `seconds` parameter is being sent
- Verify parameter is string type ("12" not 12)
- Confirm API key has access to duration control

**Solution:**
```python
# Explicit parameter setting
response = client.videos.create(
    model="sora-2",
    prompt="Your prompt",
    size="1280x720",
    seconds="12"  # Must be string type
)
```

### Issue: Poor Quality at Longer Durations

**Diagnosis:**
- Complex prompts harder to execute at 12 seconds
- Multiple scene changes cause inconsistency

**Solution:**
1. Simplify the prompt - one clear action
2. Use 2×6-second clips instead of 1×12-second
3. Add explicit timing to action beats

### Issue: High Costs for Long Videos

**Diagnosis:**
- Using sora-2-pro for all segments
- Generating at maximum duration unnecessarily

**Solution:**
1. Use sora-2 for middle segments
2. Reserve sora-2-pro for hero shots
3. Generate at minimum viable duration
4. Test at 4 seconds before scaling up

### Issue: Inconsistent Continuity Between Clips

**Diagnosis:**
- Not using final frame as reference
- Prompts don't maintain consistent style/lighting

**Solution:**
1. Extract and use final frame as `input_reference`
2. Maintain identical style descriptions across prompts
3. Specify lighting/camera setups consistently
4. Use detailed character descriptions in each segment

### Issue: API Rejections or "Refused" Status

**Diagnosis:**
- Prompt violates content policy
- Attempting to generate real people without consent

**Solution:**
1. Review OpenAI's content policies
2. Avoid specific public figure names
3. Remove any explicit/violent content
4. Don't use photorealistic people in image references

---

## Quick Reference Checklist

### Before Generating
- [ ] Set `seconds` parameter explicitly ("4", "8", or "12")
- [ ] Choose appropriate model (sora-2 vs sora-2-pro)
- [ ] Select correct resolution for aspect ratio
- [ ] Review prompt for policy compliance
- [ ] Test complex prompts at 4 seconds first

### For Extended Videos (>12 seconds)
- [ ] Break narrative into 12-second segments
- [ ] Plan continuity between segments
- [ ] Prepare frame extraction workflow
- [ ] Set up video concatenation pipeline
- [ ] Budget for multiple API calls

### Cost Optimization
- [ ] Use sora-2 for drafts
- [ ] Use sora-2-pro selectively for finals
- [ ] Generate shorter clips when possible
- [ ] Batch similar requests
- [ ] Monitor usage in dashboard

---

## Additional Resources

### Official Documentation
- OpenAI Sora 2 Announcement: https://openai.com/index/sora-2/
- API Reference: https://platform.openai.com/docs/models/sora-2
- Prompting Guide: https://cookbook.openai.com/examples/sora/sora2_prompting_guide

### Third-Party Tools
- sora-extend (GitHub): Automated long-form video generation
- Azure AI Foundry: Preview access to 20-second generations
- Video editing tools: FFmpeg, Adobe Premiere, DaVinci Resolve

### Community
- OpenAI Developer Forum: Discussion and troubleshooting
- Discord: Real-time community support
- GitHub Issues: Bug reports and feature requests

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-24 | 1.0 | Initial guide creation |

---

**Note:** Sora 2 API is actively evolving. Check official OpenAI documentation for the latest capabilities, pricing, and limitations.