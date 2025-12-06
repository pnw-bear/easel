import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import imageReducer from './imageSlice';

const rootReducer = combineReducers({
  image: imageReducer,
});

const persistConfig = {
  key: 'root',
  version: 2, // Incremented version to clear old state
  storage,
  migrate: (state: any) => {
    // Clear old state structure when version changes
    if (state && state._persist && state._persist.version !== 2) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
