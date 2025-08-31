# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js application that provides a web interface for uploading photos to Immich and creating shared albums. The app is designed specifically for mobile use (iPhone) and integrates with Immich's API for photo management.

## Common Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture

### Core Structure
- **Next.js 15.5** with App Router and TypeScript
- **Tailwind CSS 4.0** for styling
- **React 19.1** with modern components
- Configured for **subpath deployment** at `/share` with standalone output for Docker

### Key Components
- `src/app/page.tsx` - Main uploader page with PWA meta tags
- `src/app/components/Uploader.tsx` - Core upload interface with drag/drop and mobile optimization
- `src/app/layout.tsx` - Root layout with Geist fonts
- `src/app/globals.css` - Global styles

### API Routes
- `src/app/api/upload/route.ts` - Main upload handler with Immich integration
- `src/app/api/albums/route.ts` - Album management
- `src/app/api/icon/route.ts` - PWA icon generation

### Immich Integration
The app integrates with Immich via REST API using:
- **ImmichAPI class** for album creation, asset upload, and album management
- **formidable** for multipart form handling
- **axios** with form-data for HTTP requests
- Environment variables: `IMMICH_SERVER_URL`, `IMMICH_API_KEY`

### Mobile Optimization
- PWA-ready with iPhone-specific meta tags
- Touch-friendly interface optimized for mobile photo selection
- Subpath configuration for reverse proxy deployment
- File upload limits: 100MB per file, 50 files max

### Error Handling
- Comprehensive error handling in upload pipeline
- Graceful file cleanup on upload failures
- User feedback for upload progress and results

## Environment Configuration

Required environment variables:
- `IMMICH_SERVER_URL` - Immich server URL (default: http://immich-server:2283)
- `IMMICH_API_KEY` - API key for Immich authentication

## Development Notes

- Uses `pnpm` as package manager
- TypeScript strict mode enabled
- Path aliases configured with `@/*` pointing to `src/*`
- ESLint configured with Next.js and TypeScript rules
- No test framework currently configured