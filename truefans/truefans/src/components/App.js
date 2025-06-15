import React from 'react';
import Homepage from './Homepage';
import Dashboard from './Dashboard/Dashboard';
import BrandManager from './Brand/BrandManager';
import SignIn from './Auth/SignIn';
import SignUp from './Auth/SignUp';
import PassView from './PassView';

function App() {
  return (
    <div className="App">
      <h1>TrueFans</h1>
      <Homepage />
      <Dashboard />
      <BrandManager />
      <SignIn />
      <SignUp />
      <PassView />
    </div>
  );
}

export default App; 