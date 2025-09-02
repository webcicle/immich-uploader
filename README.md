# Immich Upload

A secure, mobile-optimized web interface for uploading photos to [Immich](https://immich.app) and creating shared albums. Designed specifically for family and friends to easily contribute photos to shared collections.

## Features

### 🔐 Authentication & Security
- **Invitation-based access** - Users authenticate with a shared invitation code and name
- **JWT session management** - Secure 7-day sessions with HttpOnly cookies
- **CSRF protection** - Cross-site request forgery protection on all uploads
- **Rate limiting** - Prevents brute force attacks (5 auth attempts per 15 minutes, upload rate limits)
- **Session tracking** - Tracks which albums users have contributed to

### 📱 Mobile-First UX
- **PWA-ready** - Can be added to home screen for app-like experience
- **Touch-optimized** - Large touch targets, swipe gestures, native feel
- **Responsive design** - Works seamlessly on phones, tablets, and desktop
- **Progress feedback** - Real-time upload progress with visual indicators
- **Error handling** - User-friendly error messages with retry options
- **Drag & drop** - Desktop drag-and-drop support with visual feedback

### 🗣️ Internationalization
- **Multi-language support** - Currently English and Swedish
- **Dynamic language switching** - Users can change language without reload
- **Persistent preferences** - Language choice saved in cookies
- **Browser language detection** - Automatically detects user's preferred language
- **Comprehensive translations** - All UI text, error messages, and instructions

### 📷 Image Processing
- **Automatic compression** - Images over 2MB are automatically compressed
- **Quality optimization** - Maintains visual quality while reducing file size
- **Format preservation** - Maintains original file format and metadata
- **Web worker compression** - Non-blocking compression using browser threads
- **Configurable limits** - Customizable compression settings via environment variables

### 🚀 Deployment Flexibility
- **Docker-ready** - Standalone mode for containerized deployment
- **Subpath support** - Can be deployed at custom paths (e.g., `/share-photos/`)
- **Reverse proxy friendly** - Works behind nginx, Apache, Cloudflare, etc.
- **Environment validation** - Validates configuration at startup with helpful errors

## Getting Started

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your environment variables:

#### Required Variables
```bash
# Immich server configuration
IMMICH_SERVER_URL=http://your-immich-server:2283
IMMICH_API_KEY=your-immich-api-key

# Authentication
JWT_SECRET=your-secure-random-secret-key
INVITATION_CODE=your-family-code-2024
```

#### Optional Variables
```bash
# Deployment configuration
BASE_PATH=                           # Empty for root, or "/share-photos" for subpath
BODY_SIZE_LIMIT=                     # Max request body size (default: 500MB)
NEXT_MODE=                           # "standalone" or "export" (default: undefined)

# Image processing
IMAGE_COMPRESSION_MAX_SIZE=          # Max size before compression (default: 2MB)

# Internationalization
LANGUAGE_COOKIE_NAME=               # Language cookie name (default: immich-share-language)
```

### Development Server

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Authentication Flow

1. **Guest Access** - Users visit the app and see an authentication gate
2. **Invitation Code** - Users enter their name and the shared invitation code
3. **Session Creation** - Server validates code and creates JWT session (7-day expiry)
4. **Persistent Login** - HttpOnly cookie maintains session across browser sessions
5. **Album Tracking** - Session tracks which albums the user has contributed to

### Security Model

- **No permanent accounts** - Users don't create persistent accounts
- **Shared invitation codes** - Simple family-friendly authentication
- **Session-based** - Secure JWT tokens with automatic expiry
- **CSRF protection** - Prevents unauthorized form submissions
- **Rate limiting** - Protects against abuse and brute force attacks
- **Secure cookies** - HttpOnly, Secure (in production), SameSite protection

### Image Processing Pipeline

1. **Client-side compression** - Browser compresses large images before upload
2. **Format preservation** - Original filename, type, and metadata maintained
3. **Configurable limits** - Size thresholds configurable via environment
4. **Fallback handling** - If compression fails, original file is uploaded
5. **Progress tracking** - Real-time feedback during compression and upload

### Internationalization System

- **Type-safe translations** - TypeScript interfaces ensure translation completeness
- **Context-aware** - React Context provides translations to all components
- **Cookie persistence** - User language preference saved across sessions
- **Server-side detection** - Initial language detected from browser headers
- **Dynamic switching** - Language can be changed without page reload

## API Endpoints

- `POST /api/auth` - Authenticate with invitation code
- `GET /api/auth` - Check authentication status
- `GET /api/csrf` - Get CSRF token for uploads
- `POST /api/upload` - Upload photos and create albums
- `GET /api/albums` - List user's albums
- `POST /api/albums` - Add/remove assets from albums

## Tech Stack

- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **React 19.1** - Latest React with modern features
- **jose** - JWT creation and verification
- **browser-image-compression** - Client-side image compression
- **formidable** - Multipart form parsing
- **axios** - HTTP client for Immich API integration

## Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `IMMICH_SERVER_URL` | Yes | - | URL of your Immich server |
| `IMMICH_API_KEY` | Yes | - | Immich API key for authentication |
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing |
| `INVITATION_CODE` | Yes | - | Shared code for user authentication |
| `BASE_PATH` | No | `""` | Base path for deployment |
| `BODY_SIZE_LIMIT` | No | `500MB` | Maximum request body size |
| `IMAGE_COMPRESSION_MAX_SIZE` | No | `2MB` | Size threshold for compression |
| `NEXT_MODE` | No | - | Next.js output mode |
| `LANGUAGE_COOKIE_NAME` | No | `immich-share-language` | Name of language cookie |

### Immich API Integration

The app uses Immich's REST API to:
- Create shared albums with user-provided names
- Upload photos as assets to Immich
- Add uploaded assets to the created album
- Manage album sharing and permissions

For the latest Immich API documentation: https://immich.app/docs/api/
