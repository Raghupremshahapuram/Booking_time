import { createSlice } from '@reduxjs/toolkit';


const initialState ={
    latestMovies: [], 
            upcomingMovies: [], 
            events:[],
            loading: false, 
            error: null 
};
const movieSlice = createSlice({
    name:'movie',
    initialState,
    reducers:{
        fetchMovieRequest:(state)=>{
            state.loading=true;
        },
        fetchMovieSucess:(state, action)=>{
            state.latestMovies=action.payload;
            state.loading=false;
        },
        fetchUpcomingSuccess: (state, action) => {
            state.upcomingMovies = action.payload;
            state.loading = false;
          },
          fetcheventSuccess: (state, action) => {
            state.events = action.payload;
            state.loading = false;
          },
        fetchMoviefailure:(state, action)=>{
            state.error=action.payload;
            state.loading=false;
        }
    }
});
export const {fetchMovieRequest,fetchMovieSucess,fetchMoviefailure,fetchUpcomingSuccess,fetcheventSuccess}=movieSlice.actions;
export default movieSlice.reducer;