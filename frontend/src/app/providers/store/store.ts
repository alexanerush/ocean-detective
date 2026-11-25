import { configureStore } from '@reduxjs/toolkit';
import analysisReducer from '../../../entities/analysis/model/analysisSlice';

import historyReducer from '../../../entities/analysis/model/historySlice';
import authReducer from '../../../entities/user/authSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    history: historyReducer,
    auth: authReducer,
  },

  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
