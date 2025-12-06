import { useSelector } from 'react-redux';
import { RootState } from './store';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import CanvasWorkspace from './components/layout/CanvasWorkspace';
import UploadZone from './components/upload/UploadZone';
import { Toaster } from 'react-hot-toast';

function App() {
  const activeTool = useSelector((state: RootState) => state.image.activeTool);
  const currentImageUrl = useSelector((state: RootState) => state.image.currentImageUrl);

  const renderContent = () => {
    // If no image uploaded, show upload zone
    if (!currentImageUrl && activeTool === 'upload') {
      return <UploadZone />;
    }

    // Otherwise show canvas workspace
    return <CanvasWorkspace />;
  };

  return (
    <>
      <WorkspaceLayout>
        {renderContent()}
      </WorkspaceLayout>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
