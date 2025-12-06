import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// History entry for undo/redo system
export interface HistoryEntry {
  id: string;
  label: string; // "Original", "Cleaned", "Styled", "Export"
  imageUrl: string;
  timestamp: number;
  tool: 'upload' | 'clean' | 'style' | 'export';
  metadata?: any; // Settings used to create this state
}

// Tool types
export type Tool = 'upload' | 'clean' | 'style' | 'export';

// Clean settings interface
export interface CleanSettings {
  refinement: number; // 0-100, controls AI post-processing intensity
}

// Style settings interface
export interface StyleSettings {
  preset: string | null;
  intensity: number; // 0-1
}

interface ImageState {
  // Current state
  currentImageUrl: string | null;
  currentHistoryIndex: number;

  // History stack for undo/redo
  history: HistoryEntry[];

  // Active tool
  activeTool: Tool;

  // Tool-specific settings
  cleanSettings: CleanSettings;
  styleSettings: StyleSettings;

  // Processing state
  isProcessing: boolean;
  processingMessage: string | null;

  // Original image (never changes after upload)
  originalImageUrl: string | null;
  rotation: number;

  // Artwork metadata
  artworkDetails: {
    originalSize: { width: number; height: number } | null;
    fileFormat: string | null;
    colorSpace: string;
    dpi: number;
  };

  // UI state
  error: string | null;
}

const initialState: ImageState = {
  currentImageUrl: null,
  currentHistoryIndex: -1,
  history: [],
  activeTool: 'upload',
  cleanSettings: {
    refinement: 65, // Default: balanced refinement
  },
  styleSettings: {
    preset: null,
    intensity: 1.0,
  },
  isProcessing: false,
  processingMessage: null,
  originalImageUrl: null,
  rotation: 0,
  artworkDetails: {
    originalSize: null,
    fileFormat: null,
    colorSpace: 'sRGB',
    dpi: 300,
  },
  error: null,
};

export const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    // Set active tool
    setActiveTool: (state, action: PayloadAction<Tool>) => {
      state.activeTool = action.payload;
    },

    // Upload original image
    setOriginalImage: (state, action: PayloadAction<{
      url: string;
      width: number;
      height: number;
      format: string
    }>) => {
      state.originalImageUrl = action.payload.url;
      state.currentImageUrl = action.payload.url;
      state.rotation = 0;
      state.artworkDetails.originalSize = {
        width: action.payload.width,
        height: action.payload.height,
      };
      state.artworkDetails.fileFormat = action.payload.format;

      // Add to history as "Original"
      const entry: HistoryEntry = {
        id: `original-${Date.now()}`,
        label: 'Original',
        imageUrl: action.payload.url,
        timestamp: Date.now(),
        tool: 'upload',
        metadata: { rotation: 0 },
      };
      state.history = [entry];
      state.currentHistoryIndex = 0;

      // Automatically switch to Clean tool after upload
      state.activeTool = 'clean';
    },

    // Rotate image
    rotateImage: (state, action: PayloadAction<'cw' | 'ccw'>) => {
      if (action.payload === 'cw') {
        state.rotation = (state.rotation + 90) % 360;
      } else {
        state.rotation = (state.rotation - 90 + 360) % 360;
      }
    },

    // Reset rotation (used after baking rotation into processed image)
    resetRotation: (state) => {
      state.rotation = 0;
    },

    // Push new history entry
    pushHistory: (state, action: PayloadAction<Omit<HistoryEntry, 'id' | 'timestamp'>>) => {
      const entry: HistoryEntry = {
        ...action.payload,
        id: `history-${Date.now()}`,
        timestamp: Date.now(),
      };

      // If we're not at the end of history, remove all future entries
      if (state.currentHistoryIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.currentHistoryIndex + 1);
      }

      state.history.push(entry);
      state.currentHistoryIndex = state.history.length - 1;
      state.currentImageUrl = entry.imageUrl;
    },

    // Jump to specific history entry
    jumpToHistory: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= 0 && index < state.history.length) {
        state.currentHistoryIndex = index;
        state.currentImageUrl = state.history[index].imageUrl;
        state.activeTool = state.history[index].tool;
      }
    },

    // Undo
    undo: (state) => {
      if (state.currentHistoryIndex > 0) {
        state.currentHistoryIndex--;
        state.currentImageUrl = state.history[state.currentHistoryIndex].imageUrl;
        state.activeTool = state.history[state.currentHistoryIndex].tool;
      }
    },

    // Redo
    redo: (state) => {
      if (state.currentHistoryIndex < state.history.length - 1) {
        state.currentHistoryIndex++;
        state.currentImageUrl = state.history[state.currentHistoryIndex].imageUrl;
        state.activeTool = state.history[state.currentHistoryIndex].tool;
      }
    },

    // Update clean settings
    updateCleanSettings: (state, action: PayloadAction<Partial<CleanSettings>>) => {
      state.cleanSettings = { ...state.cleanSettings, ...action.payload };
    },

    // Reset clean settings
    resetCleanSettings: (state) => {
      state.cleanSettings = {
        refinement: 65,
      };
    },

    // Update style settings
    updateStyleSettings: (state, action: PayloadAction<Partial<StyleSettings>>) => {
      state.styleSettings = { ...state.styleSettings, ...action.payload };
    },

    // Set processing state
    setProcessing: (state, action: PayloadAction<{ isProcessing: boolean; message?: string }>) => {
      state.isProcessing = action.payload.isProcessing;
      state.processingMessage = action.payload.message || null;
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
    },

    // Reset pipeline
    resetPipeline: () => initialState,
  },
});

export const {
  setActiveTool,
  setOriginalImage,
  rotateImage,
  resetRotation,
  pushHistory,
  jumpToHistory,
  undo,
  redo,
  updateCleanSettings,
  resetCleanSettings,
  updateStyleSettings,
  setProcessing,
  setError,
  resetPipeline,
} = imageSlice.actions;

export default imageSlice.reducer;