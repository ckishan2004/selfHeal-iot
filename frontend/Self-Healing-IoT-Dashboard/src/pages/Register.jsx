// import React, { useState } from "react";
// import "../styles/Login.css";

// const Register = ({ onBackToLogin }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     try {
//      const API_BASE =
//   import.meta.env.VITE_API_BASE_URL ||
//   "https://selfheal-iot.onrender.com";

// const res = await fetch(`${API_BASE}/auth/register`, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({ name, email, password })
// });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.detail || "Registration failed");
//         return;
//       }

//       alert("Registration successful. Please login.");
//       onBackToLogin();
//     } catch (err) {
//       console.error("Register error:", err);
//       alert("Server error");
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <div className="login-header">
//           <h1>Register</h1>
//           <p>Create your account</p>
//         </div>

//         <form className="login-form" onSubmit={handleRegister}>
//           <div className="form-group">
//             <label>Name</label>
//             <input
//               type="text"
//               name="name"
//               className="form-control"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               className="form-control"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               className="form-control"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <button type="submit" className="submit-btn">
//             Register
//           </button>

//           <div className="register-link">
//             <button
//               type="button"
//               onClick={onBackToLogin}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: "#667eea",
//                 cursor: "pointer",
//                 fontWeight: 500
//               }}
//             >
//               Back to Login
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from "react";
import "../styles/Login.css";

const Register = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL ||
        "https://selfheal-iot.onrender.com";

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Registration failed");
        return;
      }

      alert("Registration successful. Please login.");
      onBackToLogin();
    } catch (err) {
      console.error("Register error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Register</h1>
          <p>Create your account</p>
        </div>

        <form className="login-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>

          <div className="register-link">
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                background: "none",
                border: "none",
                color: "#667eea",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
