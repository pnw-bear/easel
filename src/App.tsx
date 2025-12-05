import { useSelector } from 'react-redux';
import { RootState } from './store';
import MainLayout from './components/layout/MainLayout';
import UploadZone from './components/upload/UploadZone';
import { Toaster } from 'react-hot-toast';

function App() {
  const currentStage = useSelector((state: RootState) => state.image.currentStage);

  const renderStageContent = () => {
    switch (currentStage) {
      case 'upload':
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
