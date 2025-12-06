import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setCleaningProgress, setCleanedVariants } from './store/imageSlice';
import MainLayout from './components/layout/MainLayout';
import UploadZone from './components/upload/UploadZone';
import ImagePreview, { CropBox } from './components/upload/ImagePreview';
import CleaningPanel from './components/cleaning/CleaningPanel';
import { Toaster } from 'react-hot-toast';
import { ImageProcessor } from './services/imageProcessing/ImageProcessor';
import toast from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const currentStage = useSelector((state: RootState) => state.image.currentStage);
  const originalImageUrl = useSelector((state: RootState) => state.image.originalImageUrl);
  const rotation = useSelector((state: RootState) => state.image.rotation);

  const handleStartCleaning = async (sensitivity: number, cropBox?: CropBox, displayedSize?: { width: number; height: number }) => {
    if (!originalImageUrl) return;

    try {
      dispatch(setCleaningProgress({ step: 'Starting...', progress: 0 }));

      const processor = new ImageProcessor((progress) => {
        dispatch(setCleaningProgress(progress));
      });

      const variants = await processor.processImage(originalImageUrl, rotation, { sensitivity, cropBox, displayedImageSize: displayedSize });

      // Convert to Redux format
      const reduxVariants = variants.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        thumbnail: v.dataUrl
      }));

      dispatch(setCleanedVariants(reduxVariants));
      toast.success('Image cleaned! Choose your favorite variant.');
    } catch (error) {
      console.error('Cleaning failed:', error);
      toast.error('Failed to clean image. Please try again.');
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'upload':
        // Show preview with rotation controls if image is uploaded
        if (originalImageUrl) {
          return <ImagePreview onConfirm={handleStartCleaning} />;
        }
        return <UploadZone />;
      case 'cleaning':
        return <CleaningPanel />;
      case 'styling':
        return (
          <div className="text-center py-12">
            <p className="text-lg text-stone-600">Styling stage - Coming soon</p>
          </div>
        );
      case 'export':
        return (
          <div className="text-center py-12">
            <p className="text-lg text-stone-600">Export stage - Coming soon</p>
          </div>
        );
      default:
        return <UploadZone />;
    }
  };

  return (
    <>
      <MainLayout>
        {renderStageContent()}
      </MainLayout>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
