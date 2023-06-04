import { Route, Routes, Navigate, HashRouter } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import NotFound from "./pages/notFound";
import Exam from "./pages/exam";

export default function App() {
  return (<>
    <HashRouter>
      <Routes>
        {/* <Route path="/" exact element={<Navigate to="/home" />} /> */}
        <Route path="/" exact element={<Home />} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/exam/:exam" exact element={<Exam />} />
        <Route path="/*" exact element={<NotFound />} />
      </Routes>
    </HashRouter>
  </>);
}