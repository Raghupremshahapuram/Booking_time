import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './movieSlice';

const store = configureStore({
  reducer: {
    movie: movieReducer, // ✅ Must match selector: state.movie
  }
});

export default store;
