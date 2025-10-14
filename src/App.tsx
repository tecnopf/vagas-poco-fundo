import Home from "./pages/home/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/main.scss";
import './App.css'
import Admin from "./pages/admin/Admin";
import Profile from "./pages/profile/Profile";
import MagicLogin from "./pages/magic-login/MagicLogin";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={<Admin />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />
        <Route 
          path="/auth/magic-login" 
          element={<MagicLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
