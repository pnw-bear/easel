import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setOriginalImage } from '../../store/imageSlice';
import toast from 'react-hot-toast';

function UploadZone() {
  const dispatch = useDispatch();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 10MB.');
      return;
    }

    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);

      dispatch(setOriginalImage({ url }));
      toast.success('Image uploaded! Processing...', {
        icon: '🎨',
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#27272A',
          border: '2px solid #D33A2C',
        },
      });
    } catch (error) {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic']
    },
    multiple: false
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
      {/* Upload Zone with UXmagic Design */}
      <div
        {...getRootProps()}
        className={`
          ink-dashed-border rounded-2xl p-10 md:p-16 text-center relative group cursor-pointer
          transition-all duration-500 hover:shadow-paper-lift hover-bloom paper-texture
          ${isDragActive ? 'shadow-watercolor-orange' : ''}
        `}
      >
        {/* Watercolor Bloom Background */}
        <div className={`
          absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700
          bg-gradient-to-br from-warm-orange/5 via-transparent to-cerulean/5
          ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `} />

        <input {...getInputProps()} />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Upload Icon with Watercolor Shadow */}
          <div className="w-24 h-24 mb-6 rounded-full bg-white shadow-paper flex items-center justify-center group-hover:shadow-watercolor-orange transition-all duration-300 group-hover:scale-110">
            <CloudArrowUp className="w-12 h-12 text-ink-charcoal" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h3 className="font-serif text-3xl text-ink-charcoal mb-3">
            {isDragActive ? 'Drop your artwork here!' : 'Drop your artwork here'}
          </h3>

          <p className="font-sans text-stone-500 text-lg mb-8">
            or click to browse your files
          </p>

          {/* File Type Indicators */}
          <div className="flex items-center gap-4 text-xs font-mono text-stone-400 uppercase tracking-widest">
            <span className="px-3 py-1 bg-white rounded-full shadow-sm">JPG</span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm">PNG</span>
            <span className="px-3 py-1 bg-white rounded-full shadow-sm">HEIC</span>
          </div>

          {/* Decorative Icons */}
          <div className="mt-8 flex items-center gap-3 text-stone-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 text-center">
        <p className="text-sm font-hand text-stone-500 mb-4">
          All processing happens in your browser - no data leaves your device!
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-stone-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cerulean"></span>
            Client-side Only
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warm-orange"></span>
            100% Private
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ink-red"></span>
            No Cloud AI
          </span>
        </div>
      </div>
    </div>
  );
}

export default UploadZone;
