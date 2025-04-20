// pages/HomePage.tsx

import React, { useState } from "react"; // Импортируем useState

const HomePage = () => {
  const [count, setCount] = useState(0); // Используем useState для подсчета

  return (
    <div>
      <h1>Vite + React + Express</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
