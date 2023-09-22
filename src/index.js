import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { createRoot } from "react-dom/client";
import { UsuarioContextProvider } from "./context/usuarioContext";
import Login from "./pages/Login/Login";
const root = ReactDOM.createRoot(document.getElementById("root"));
const jwt = window.localStorage.getItem("jwt");

root.render(
  <BrowserRouter>
    {/* <App/> */}
    <UsuarioContextProvider>
      <Routes>
        <Route
          path="/"
          element={
            Boolean(jwt) ? (
              <Navigate to="/Dashboard/Usuario" />
            ) : (
              <Navigate to="/Login" />
            )
          }
        ></Route>
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard/*" element={<App />} />
        {/* <Route path="/Dashboard/*" element={<App/>} />
         <Route path="/PreviewPdf/:nombrePdf" element={<PdfViewer/>} /> */}
      </Routes>
    </UsuarioContextProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
