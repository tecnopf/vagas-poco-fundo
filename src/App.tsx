import Home from "./pages/home/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/main.scss";
import './App.css'
import Admin from "./pages/admin/Admin";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={<Admin />}
        />
      </Routes>
    </Router>
  );
};

export default App;
