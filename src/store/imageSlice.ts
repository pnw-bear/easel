import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CleanedVariant {
  id: string;
  name: string;
  type: 'raw' | 'bold-poster' | 'minimal-line-art';
  thumbnail: string;
}

interface ImageState {
  // Upload stage
  originalImageUrl: string | null;

  // Cleaning stage
  cleaningProgress: {
    step: string;
    progress: number;
  } | null;
  cleanedVariants: CleanedVariant[];
  selectedVariant: string | null; // variant ID

  // Styling stage
  selectedStyle: string | null; // preset ID
  styleIntensity: number;
  styledImageUrl: string | null;

  // Export stage
  finalImageUrl: string | null;
  mockups: Record<string, string>; // product type -> image URL

  // UI state
  currentStage: 'upload' | 'cleaning' | 'styling' | 'export';
  isProcessing: boolean;
  error: string | null;
}

const initialState: ImageState = {
  originalImageUrl: null,
  cleaningProgress: null,
  cleanedVariants: [],
  selectedVariant: null,
  selectedStyle: null,
  styleIntensity: 1.0,
  styledImageUrl: null,
  finalImageUrl: null,
  mockups: {},
  currentStage: 'upload',
  isProcessing: false,
  error: null
};

export const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setOriginalImage: (state, action: PayloadAction<{ url: string }>) => {
      state.originalImageUrl = action.payload.url;
      state.currentStage = 'cleaning';
    },

    setCleaningProgress: (state, action: PayloadAction<{ step: string; progress: number }>) => {
      state.cleaningProgress = action.payload;
      state.isProcessing = true;
    },

    setCleanedVariants: (state, action: PayloadAction<CleanedVariant[]>) => {
      state.cleanedVariants = action.payload;
      state.isProcessing = false;
      state.cleaningProgress = null;
    },

    selectVariant: (state, action: PayloadAction<string>) => {
      state.selectedVariant = action.payload;
      state.currentStage = 'styling';
    },

    selectStyle: (state, action: PayloadAction<string>) => {
      state.selectedStyle = action.payload;
    },

    setStyleIntensity: (state, action: PayloadAction<number>) => {
      state.styleIntensity = action.payload;
    },

    setStyledImage: (state, action: PayloadAction<string>) => {
      state.styledImageUrl = action.payload;
    },

    setFinalImage: (state, action: PayloadAction<string>) => {
      state.finalImageUrl = action.payload;
      state.currentStage = 'export';
    },

    setMockup: (state, action: PayloadAction<{ product: string; url: string }>) => {
      state.mockups[action.payload.product] = action.payload.url;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
    },

    resetPipeline: () => initialState
  }
});

export const {
  setOriginalImage,
  setCleaningProgress,
  setCleanedVariants,
  selectVariant,
  selectStyle,
  setStyleIntensity,
  setStyledImage,
  setFinalImage,
  setMockup,
  setError,
  resetPipeline
} = imageSlice.actions;

export default imageSlice.reducer;
