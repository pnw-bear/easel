# Easel 🎨

Transform your child's drawings into beautiful, print-ready artwork - all in your browser!

## Features

- 📸 **Upload** photos of children's drawings
- ✨ **Automatic cleaning** - remove paper texture, extract strokes
- 🎨 **Apply artistic styles** - minimal, neon, watercolor, bold poster
- 📦 **Generate product mockups** - t-shirt, mug, hoodie, cushion
- 💾 **Export** high-quality images (PNG/JPG/WebP)
- 🔒 **100% client-side processing** - no cloud, no servers, your data stays private

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Redux Toolkit + Redux Persist
- **AI/ML**: TensorFlow.js (style transfer) + OpenCV.js (image processing)
- **UI Components**: Lucide Icons, React Dropzone, React Hot Toast

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

### 1. Upload
Drag & drop a photo of your child's drawing. The app accepts JPG, PNG, and HEIC formats up to 10MB.

### 2. Clean
AI automatically:
- Detects and straightens the paper
- Removes paper texture and background
- Extracts colored strokes
- Generates 3 variants: Clean Original, Bold Poster, Minimal Line Art

### 3. Style
Apply artistic filters using TensorFlow.js style transfer:
- Minimal Line Art
- Neon Strokes
- Watercolor Dreams
- Bold Poster
- Crayon Texture
- Ink Splash

Adjust intensity from 0-100% to blend with the original.

### 4. Export
- Download final images in PNG, JPEG, or WebP format
- See artwork on product mockups (t-shirt, hoodie, mug, cushion)
- Optimize quality and dimensions for web or print

## Privacy & Security

**All processing happens in your browser.** Images are never uploaded to external servers. This is possible thanks to:

- **TensorFlow.js**: Runs AI models directly in the browser using WebGL
- **OpenCV.js**: Performs image processing via WebAssembly
- **Web Workers**: Handles heavy computation without blocking the UI

Your child's artwork stays on your device!

## Browser Support

Requires a modern browser with:
- WebGL (GPU acceleration)
- Web Workers (background processing)
- WebAssembly (OpenCV.js)
- Canvas API

**Supported browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Project Structure

```
easel/
├── public/                  # Static assets
│   ├── models/             # TensorFlow.js models
│   ├── styles/             # Style preset images
│   └── mockups/            # Product templates
├── src/
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   ├── upload/         # Upload UI
│   │   ├── cleaning/       # Cleaning stage UI
│   │   ├── styling/        # Style transfer UI
│   │   ├── export/         # Export UI
│   │   └── shared/         # Reusable components
│   ├── services/           # Core business logic
│   │   ├── imageProcessing/  # OpenCV.js operations
│   │   ├── styleTransfer/    # TensorFlow.js operations
│   │   ├── mockup/           # Product mockup generation
│   │   └── export/           # Image export utilities
│   ├── hooks/              # Custom React hooks
│   ├── workers/            # Web Workers
│   ├── store/              # Redux state management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Utility functions
│   ├── constants/          # App constants
│   └── styles/             # Global CSS
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Development Roadmap

### Phase 1: Setup ✅
- [x] Project initialization
- [x] Redux store setup
- [x] Layout components
- [ ] Install dependencies

### Phase 2: Upload & Preview (In Progress)
- [ ] Drag-drop upload zone
- [ ] Image preview
- [ ] File validation

### Phase 3: Image Cleaning (Next)
- [ ] Paper detection & perspective correction
- [ ] Background removal
- [ ] Stroke extraction
- [ ] Generate 3 variants

### Phase 4: Style Transfer
- [ ] TensorFlow.js integration
- [ ] Style preset gallery
- [ ] Real-time preview
- [ ] Intensity slider

### Phase 5: Product Mockups
- [ ] Mockup templates
- [ ] Perspective transformation
- [ ] Mockup gallery

### Phase 6: Export
- [ ] Format selection (PNG/JPG/WebP)
- [ ] Quality controls
- [ ] Download functionality

### Phase 7: Polish & Deploy
- [ ] Performance optimization
- [ ] Error handling
- [ ] Accessibility
- [ ] Deploy to Vercel

## Performance Targets

- **Cleaning**: 5-10 seconds for 2048x2048 image
- **Style transfer**: 2-3 seconds for 512x512 image
- **Mockup generation**: < 1 second per product
- **Bundle size**: < 5MB (excluding models)
- **Model download**: ~10MB (one-time, cached)

## Contributing

Contributions are welcome! This is a personal project to help parents preserve and enhance their children's artwork.

## License

MIT

## Acknowledgments

Built with love for creative kids and proud parents everywhere.

---

**Made with ❤️ using React, TensorFlow.js, and OpenCV.js**
