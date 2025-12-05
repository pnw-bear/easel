import { useSelector } from 'react-redux';
import { RootState } from './store';
import MainLayout from './components/layout/MainLayout';
import { Toaster } from 'react-hot-toast';

function App() {
  const currentStage = useSelector((state: RootState) => state.image.currentStage);

  return (
    <>
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-purple-900 mb-4">
            Welcome to Easel
          </h1>
          <p className="text-lg text-gray-600">
            Transform your child's drawings into beautiful, print-ready artwork
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Current stage: {currentStage}
          </p>
        </div>
      </MainLayout>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
