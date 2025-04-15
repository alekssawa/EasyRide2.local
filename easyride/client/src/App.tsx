import { useState, useEffect } from "react";
import "./styles/App.css";

import axios from "axios";

import Header from "./components/Header/Header"; // Относительный путь

function App() {
  const [count, setCount] = useState(0);
  const [array, setArray] = useState([]);

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api");
    setArray(response.data.fruits);
    console.log(response.data.fruits);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <Header />
      <main>
        <h1>Vite + React + Express</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>

          {array.map((fruit, index) => {
            return (
              <div key={index}>
                <p>{fruit}</p>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default App;
