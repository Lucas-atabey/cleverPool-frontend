import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import Login from './pages/Login';  // à créer
import EditPoll from './pages/EditPoll'; // ✅ import de la nouvelle page

function Header({ isAdminLoggedIn, setIsAdminLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token'); // on supprime le token
    setIsAdminLoggedIn(false); // on met à jour l'état
    window.location.replace('/');
  };

  return (
    <header className="container py-3 d-flex justify-content-between align-items-center">
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() => navigate('/')}
      >
        🏠 Accueil
      </button>

      {isAdminLoggedIn ? (
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => navigate('/login')}
        >
          Connexion Admin
        </button>
      )}
    </header>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" replace />;
}


export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsAdminLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <Header isAdminLoggedIn={isAdminLoggedIn} setIsAdminLoggedIn={setIsAdminLoggedIn} />
      <Routes>
        <Route path="/" element={<Home setIsAdminLoggedIn={setIsAdminLoggedIn} />} />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreatePoll setIsAdminLoggedIn={setIsAdminLoggedIn} />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:pollId"
          element={
            <PrivateRoute>
              <EditPoll setIsAdminLoggedIn={setIsAdminLoggedIn} />
            </PrivateRoute>
          }
        />
        <Route path="/poll/:pollId" element={<PollDetails />} />
        <Route path="/login" element={<Login setIsAdminLoggedIn={setIsAdminLoggedIn} />} />
      </Routes>
    </Router>
  );
}
