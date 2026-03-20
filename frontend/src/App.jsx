import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ResumeBuilder from "./pages/ResumeBuilder";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        
        {/* Navbar */}
        <nav className="bg-blue-600 text-white p-4 flex justify-between">
          <h1 className="font-bold text-lg">Resume Builder</h1>
          <div className="space-x-4">
            <Link to="/">Home</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ResumeBuilder />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
