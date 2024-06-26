import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import HomePage from './HomePage';
import RouteOptimization from './RouteOptimization';
import Mapping from './Mapping';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
       <Route path="/home" element={<HomePage />} />
       <Route path="/RouteOptimization" element={<RouteOptimization />} />
        <Route path="/Mapping" element={<Mapping />} />


        <Route path="/" element={<LoginForm />} />
      </Routes>
    </Router>
  );
};
export default App;
