import "./index.css";
import "./App.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";

import Home from "./pages/Home";
import Projects from "./pages/Projects"; 
import Profile from "./pages/Profile";
import RegisterRequest from "./pages/RegisterRequest";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Services from "./pages/admin/ServicesPage";
import Quotes from "./pages/admin/QuotesPage";

import AlliedQuotesPage from "./pages/AlliedQuotes";

import MyPreQuotes from "./pages/MyPreQuotes";
import AdminSolicitudes from "./pages/admin/AdminSolicitudes.tsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} /> {/* 👈 YA BIEN */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* Auth */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Mis Cotizaciones */}
            <Route path="my-prequotes" element={<MyPreQuotes />} />

            <Route path="profile" element={<Profile />} />
            <Route path="/register-request" element={<RegisterRequest />} />

            {/*Ruta para CONSTRUCTORA / FERRETERÍA / BANCO */}
            <Route path="/allied-quotes" element={<AlliedQuotesPage />} />

            {/* Admin */}
            <Route path="admin">
              <Route path="services" element={<Services />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
