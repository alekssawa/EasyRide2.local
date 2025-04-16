import { useEffect, useState } from "react";

interface UserData {
  authenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

const AuthStatus = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/user", {
      credentials: "include", // важно для передачи cookie
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser({ authenticated: false }));
  }, []);

  const handleLogout = () => {
    fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setUser({ authenticated: false }));
  };

  if (user === null) return <p>Загрузка...</p>;

  return user.authenticated ? (
    <div>
      <p>{user.authenticated}</p>
      <img
            loading="lazy"
            height="60"
            width="60"
            src={user.picture}
            alt="Google Icon"
          />
      <p>{user.name}</p>
      <p>{user.email}</p>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  ) : (
    <p>Вы не авторизованы</p>
  );
};

export default AuthStatus;
