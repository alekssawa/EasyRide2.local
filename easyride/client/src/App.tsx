// import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./styles/App.css";

import Header from "./components/Header/Header";
import { AuthProvider } from "./context/authContext";

// Импортируем страницы
import Profile from "./pages/Profile"; // Страница профиля
import MyOrder from "./pages/MyOrder"; // Страница с заказом
import MyOrderHistory from "./pages/MyOrderHistory"; // История заказов
import Settings from "./pages/Settings"; // Страница настроек
import HomePage from "./pages/HomePage"; // Главная страница (новая)

function App() {
  

  return (
    <>
      <AuthProvider>
        <Header />
        <main className="">
          {/* Маршруты для страниц */}
          <Routes>
            {/* Главная страница */}
            <Route path="/" element={<HomePage />} />
            {/* Страница с заказом */}
            <Route path="/my-order" element={<MyOrder />} />
            {/* История заказов */}
            <Route path="/my-order-history" element={<MyOrderHistory />} />
            {/* Страница настроек */}
            <Route path="/settings" element={<Settings />} />
            {/* Страница профиля */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </AuthProvider>
    </>
  );
}

export default App;
