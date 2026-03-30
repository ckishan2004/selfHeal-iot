import React, { useState } from "react";
import IoTDashboard from "./pages/IoTDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {user ? (
        <IoTDashboard user={user} onLogout={handleLogout} />
      ) : showRegister ? (
        <Register onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => setShowRegister(true)}
        />
      )}
    </>
  );
}

export default App;