// pages/HomePage.tsx

// import React, { useState } from "react"; // Импортируем useState
import TaxiOrder from "../components/OrderMenu/OrderMenu";
import MapView from '../components/MapView';
// import "../styles/index.css"; // или App.css, где лежит .left-align-override

const HomePage = () => {

  return (
    <div className="flex justify-start items-center min-h-screen">
      <div className="ml-8">
        <TaxiOrder />
      </div>
    </div>
  );
};

export default HomePage;
