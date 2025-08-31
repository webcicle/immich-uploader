# Code Issues Found in immich-share

## Critical Issues

### 1. **Page Router vs App Router Confusion** 
- `src/app/page.tsx` uses Pages Router syntax (`Head` from `next/head`) but the project is configured for App Router
- The file structure is App Router (`src/app/`) but code patterns are Pages Router
- **Location**: `src/app/page.tsx:2,8-21`
- **Fix Required**: Convert to App Router metadata API

### 2. **API Route Structure Mismatch**
- API route files contain Pages Router syntax (`export default function handler`) 
- App Router requires named exports (`export async function POST`, `export async function GET`)
- **Locations**: 
  - `src/app/api/upload/route.ts:104,219`
  - `src/app/api/albums/route.ts:4`
  - `src/app/api/icon/route.ts:2`

### 3. **Invalid API Configuration**
- `export const config` in API routes is Pages Router syntax, not supported in App Router
- **Location**: `src/app/api/upload/route.ts:8-12`

### 4. **TypeScript Type Issues**
- Missing proper type definitions for file objects in Uploader component
- `fileInputRef` uses `null` type but should use proper HTMLInputElement type
- Results array lacks proper typing
- **Location**: `src/app/components/Uploader.tsx:9,12`

### 5. **Mixed File Structure**
- Upload route contains two separate handler functions (upload and health) which should be separate files
- **Location**: `src/app/api/upload/route.ts:216-229`

## Minor Issues

### 6. **Metadata Configuration**
- Layout has generic metadata instead of app-specific
- **Location**: `src/app/layout.tsx:15-18`

### 7. **Import Path Issues**
- Potential issues with relative imports that may not resolve correctly
- **Location**: `src/app/page.tsx:3`

## Recommendations

1. Convert all API routes to proper App Router format with named exports
2. Update page component to use App Router metadata API  
3. Fix TypeScript type definitions throughout
4. Separate mixed API handlers into individual route files
5. Update metadata to be app-specific
6. Ensure all imports use correct paths for App Router structure

## Files Requiring Changes

- `src/app/page.tsx` - Convert to App Router format
- `src/app/layout.tsx` - Update metadata
- `src/app/api/upload/route.ts` - Convert to App Router API format, split handlers
- `src/app/api/albums/route.ts` - Convert to App Router API format  
- `src/app/api/icon/route.ts` - Convert to App Router API format
- `src/app/components/Uploader.tsx` - Fix TypeScript types