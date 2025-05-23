// import { configureStore } from "@reduxjs/toolkit";
// import movieReducer from "./movieSlice";
// import createSagaMiddleware from 'redux-saga';
// import rootSaga from "./saga";

// const sagaMiddleware = createSagaMiddleware();

// const store = configureStore({
//     reducer: {
//         movie: movieReducer,
//     },
//     middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
// });
// sagaMiddleware.run(rootSaga);
// export default store;

// store.js
import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './movieSlice';

const store = configureStore({
  reducer: {
    movie: movieReducer, // ✅ Must match selector: state.movie
  }
});

export default store;
