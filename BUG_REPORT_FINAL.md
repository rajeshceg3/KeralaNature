# Comprehensive Bug Report & Vulnerability Assessment

## Executive Summary
The application is generally stable but suffers from a critical interaction blocker on mobile devices and a significant UX omission in the "Memories" feature. Security is handled via strict sanitization, though basic. Accessibility is largely good but has minor gaps.

## 1. Critical Vulnerabilities & Bugs

### 1.1. Loading Screen Intercepts User Interaction (Severity: Critical)
- **Issue**: The `.loading-screen` element, even when hidden (opacity: 0), retains pointer events in some states or race conditions, preventing users from interacting with the map or markers. This was confirmed via automated testing on mobile viewports.
- **Impact**: renders the application unusable on affected devices.
- **Location**: `index.html` (CSS).
- **Fix**: Apply `pointer-events: none` to `.loading-screen.hidden`.

## 2. User Experience (UX) Issues

### 2.1. Missing Notes in Photo Gallery (Severity: High)
- **Issue**: When viewing memories, the user's note is stored as `alt` text but never displayed on screen. Users cannot read their own memories.
- **Impact**: Degrades the core value of the "Memories" feature.
- **Location**: `ui.js`, `showPhotoGallery` function.
- **Fix**: Update gallery rendering to use `<figure>` and `<figcaption>`.

### 2.2. Offline Font Loading (Severity: Medium)
- **Issue**: The Service Worker caches the Google Fonts CSS but not the font files themselves (served from `fonts.gstatic.com`). The default "cache first" strategy explicitly excludes cross-origin requests unless they are pre-cached.
- **Impact**: Fonts break when offline.
- **Location**: `sw.js`.
- **Fix**: Allow caching of `fonts.gstatic.com` resources.

## 3. Accessibility

### 3.1. Map Tiles Missing Alt Text (Severity: Low)
- **Issue**: Leaflet tile images lack `alt` attributes.
- **Impact**: Screen reader clutter.
- **Fix**: (Limitation of library, acceptable for background tiles).

## 4. Security & Architecture

### 4.1. LocalStorage Quota (Severity: Medium)
- **Issue**: Storing Base64 images in LocalStorage is fragile and hits limits (5MB) quickly.
- **Mitigation**: Current implementation resizes images, which is a good stopgap.
- **Recommendation**: Move to IndexedDB for robust storage (out of scope for quick fix, but noted).

### 4.2. XSS Protection (Severity: Low)
- **Status**: `sanitizeHTML` is present and strict. No immediate vulnerability found.

## Remediation Plan
1.  **Fix Loading Screen**: Add `pointer-events: none` to CSS.
2.  **Fix Gallery**: Rewrite `showPhotoGallery` to display notes and add necessary CSS.
3.  **Fix Service Worker**: Update `fetch` listener to cache font files.
