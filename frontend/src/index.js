import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Todos from "./Todos";
import "react-datepicker/dist/react-datepicker.css";
import "./style.css";
ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <Todos />
  </React.StrictMode>,
  document.getElementById("root")
);
