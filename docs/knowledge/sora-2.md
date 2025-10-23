# Sora 2

## Overview

Sora 2 is OpenAI's flagship video and audio generation model, launched on September 30, 2025. It represents a significant advancement over the original Sora model from February 2024. Sora 2 is more physically accurate, realistic, and more controllable than prior systems, featuring synchronized dialogue and sound effects.

## Key Features

### Video and Audio Generation
- Video and audio are created together in a single generation process
- Users can guide the generated sound in prompts by providing dialogue or describing the audio
- Synchronized soundtracks, dialogue, and ambient sound are produced directly from text prompts
- Eliminates the need for separate audio synthesis (unlike Sora V1's video-only output)

### Cameo Feature
- Users can insert themselves or others into any Sora-generated environment
- Provides accurate portrayal of appearance and voice
- Works for any human, animal, or object
- Requires a short one-time video-and-audio recording in the app

### Image-to-Video
- Can start generation from an image
- At launch, image-to-video that depicts real people is not supported

### Multi-Shot Consistency
- Able to follow intricate instructions spanning multiple shots
- Accurately persists world state across shots
- Big leap forward in controllability

## Model Variants

### Sora 2 (Standard)
- **Resolution**: 720p
- **Speed**: Tuned for speed and everyday creation
- **Video Length**: 10 seconds (default)
- **Pricing**: $3 for a 10-second video at 720p
- Watermark-free

### Sora 2 HD
- **Resolution**: 1080p
- **Video Length**: 10 seconds
- Watermark-free

### Sora 2 Pro
- **Resolution**: 1024p - 1080p
- **Speed**: May take longer to generate
- **Video Length**: 15 seconds (can support up to 90 seconds)
- **Pricing**: $5 for a 10-second video at 1024p ($30 per minute)
- **Target**: Higher fidelity and tougher shots
- Watermark-free

## Technical Specifications

### Video Specifications
- **Maximum Duration**: 90 seconds (V2) vs 60 seconds (V1)
- **Resolution Options**: 720p, 1080p, 1024p depending on model variant
- **Generation Time**: 3-5 minutes for a 20-second clip
- **Maximum Resolution**: 4K video generation capability

### Audio Specifications
- **Synchronized Spatial Audio**: Audio generated simultaneously with video
- **Dialogue Generation**: Speech with timing that matches visible lip movements
- **Sound Effects**: Physics-aware effects syncing perfectly with motion
- **Ambient Soundscapes**: Contextual environmental audio

### Supported Styles
- Realistic
- Cinematic
- Anime
- Expanded stylistic range compared to V1

## Capabilities & Improvements

### Audio Generation & Synchronization
- **Dialogue**: Mouth movements align with generated dialogue with high precision
- **Sound Effects**: Physics-aware synchronization (footsteps, door slams, engine revs)
- **Ambient Sound**: Contextual environmental audio
- **Integration**: Audio and video generated together from a single prompt

### Physics & Realism
- Better obeys the laws of physics compared to prior systems
- Improved momentum, collisions, buoyancy, and other physical properties
- If a basketball player misses a shot, it will realistically rebound off the backboard
- "Mistakes" the model makes often appear to be mistakes of an internal agent being modeled
- Actions like jumps, throws, or water interactions look believable

### Enhanced Control
- More accurate physics simulation
- Sharper realism
- Enhanced steerability
- Ability to follow complex, multi-step instructions

## API Pricing

### Official OpenAI Pricing
- **Sora 2 (Standard)**: $3 for 10 seconds at 720p
- **Sora 2 Pro**: $5 for 10 seconds at 1024p
- **Per-minute pricing**: $30/minute for Sora 2 Pro (high-res)
- Uses a per-second pricing model

### Alternative Providers
- Third-party providers (e.g., muapi) offer pricing starting at $0.25 per 10-second video
- Various resellers provide access at different price points

## Limitations

### Current Known Issues
- Difficulty generating readable text within videos
- Potential inconsistencies in character details over longer videos
- Generation time can be significant (3-5 minutes for 20-second clips)
- Image-to-video with real people not supported at launch

### Platform Restrictions
- At launch, primarily available through ChatGPT app
- API access rolling out progressively to ChatGPT Pro and API users

## API Availability

### Access
- **Platform URL**: https://platform.openai.com/docs/models/sora-2
- **Documentation**:
  - Sora 2: https://platform.openai.com/docs/models/sora-2
  - Sora 2 Pro: https://platform.openai.com/docs/models/sora-2-pro
  - Video Generation Guide: https://platform.openai.com/docs/guides/video-generation

### Status
- API is in progressive rollout
- ChatGPT Pro and API users will gain access to Sora 2 Pro as rollout progresses
- Official announcement states "API coming soon" without specific release date

## System Resources

- **System Card**: https://openai.com/index/sora-2-system-card/
- **PDF Documentation**: https://cdn.openai.com/pdf/50d5973c-c4ff-4c2d-986f-c72b5d0ff069/sora_2_system_card.pdf
- **Main Announcement**: https://openai.com/index/sora-2/

## Comparison: Sora 1 vs Sora 2

| Feature | Sora 1 | Sora 2 |
|---------|--------|--------|
| Max Duration | 60 seconds | 90 seconds |
| Audio | None (video only) | Synchronized audio, dialogue, effects |
| Physics | Basic | Significantly improved |
| Resolution | Up to 1080p | Up to 4K |
| Controllability | Limited | Enhanced multi-shot consistency |
| Dialogue | Not supported | Lip-synced dialogue generation |
| Cameo Feature | Not available | Available |
| API Availability | Limited access | Progressive rollout |

---

*Last Updated: October 2025*
*Source: OpenAI Platform Documentation and official announcements*
