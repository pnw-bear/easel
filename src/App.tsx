import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { setCleaningProgress } from './store/imageSlice';
import MainLayout from './components/layout/MainLayout';
import UploadZone from './components/upload/UploadZone';
import ImagePreview from './components/upload/ImagePreview';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const currentStage = useSelector((state: RootState) => state.image.currentStage);
  const originalImageUrl = useSelector((state: RootState) => state.image.originalImageUrl);

  const handleStartCleaning = () => {
    // TODO: Start the cleaning process
    dispatch(setCleaningProgress({ step: 'Starting...', progress: 0 }));
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
        return (
          <div className="text-center py-12">
            <p className="text-lg text-stone-600">Cleaning stage - Coming soon</p>
          </div>
        );
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
