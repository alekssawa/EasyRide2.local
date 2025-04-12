import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container">
      <h1>Welcome to EasyRide</h1>
      <div className="button-container">
        <Link href="/login">
          <button className="auth-button login-button">Login</button>
        </Link>
        <Link href="/register">
          <button className="auth-button register-button">Register</button>
        </Link>
      </div>
    </div>
  );
}