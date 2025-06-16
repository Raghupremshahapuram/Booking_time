import React from 'react';
import { BrowserRouter, Route,Routes} from 'react-router-dom';

import Home from './Components/Home';
import MovieDetails from './Components/Moviedetails';
import Upcoming from './Components/Upcomingmovie';
import Event from './Components/Events';
import BookingPage from './Components/Booking';
import TicketPage from './Components/TicketPage';
import LoginPage from './Components/Login';
import RegisterPage from './Components/RegisterPage';
import UpcomingDetails from './Components/Upcomingdetails';
import EventDetails from './Components/Eventdetails';
import EventBookingPage from './Components/Eventbooking.js';
import'./App.css';
import AppHeader from './Components/Appheader';
import Profile from './Components/Profile.js';
import PaymentPage from './Components/Paymentpage.js';


const Routing = () => {
  return (

              <BrowserRouter>
              <AppHeader/>
                <Routes>

                  <Route path="/" element={<Home />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/Upcoming" element={<Upcoming />}></Route>

                  <Route path="/event" element={<Event />} />

                  <Route path="/book/:id" element={<BookingPage />} />
                  <Route path="/ticket" element={<TicketPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route path="/upcoming/:id" element={<UpcomingDetails />} />
                  <Route path="/event/:id" element={<EventDetails />} />
                  <Route path="/event-book/:id" element={<EventBookingPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/payment" element={<PaymentPage/>} />


                </Routes>
              </BrowserRouter>
        
        
      

        );
    };


export default Routing;