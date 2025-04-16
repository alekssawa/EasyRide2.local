import { useState } from "react";
import "./styles/App.css";


import Header from "./components/Header/Header";
import AuthSignIn from "./components/Modal/AuthStatus"; // Относительный путь

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <AuthSignIn />
      <main>
        <h1>Vite + React + Express</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
