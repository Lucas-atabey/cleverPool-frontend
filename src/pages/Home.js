import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Home({ setIsAdminLoggedIn }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPolls();
    const token = localStorage.getItem('admin_token');
    setIsAdmin(!!token);
  }, []);

  const fetchPolls = () => {
    fetch(`${API_URL}/polls`)
      .then(res => res.json())
      .then(data => {
        setPolls(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const deletePoll = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce sondage ?")) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Vous devez être connecté en tant qu’admin.' });
        return;
      }

      const res = await fetch(`${API_URL}/polls/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        setIsAdminLoggedIn(false);
        setIsAdmin(false);
        alert('Session expirée, veuillez vous reconnecter.');
        window.location.replace('/');
        return;
      }

      if (res.ok) {
        setPolls(polls.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Sondage supprimé avec succès !' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || data.message || 'Erreur inconnue lors de la suppression' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau : ' + err.message });
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement des sondages...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Liste des sondages</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            Créer un sondage
          </button>
        )}
      </div>

      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`} role="alert">
          {message.text}
        </div>
      )}

      <ul className="list-group">
        {polls.map(poll => (
          <li key={poll.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5><Link to={`/poll/${poll.id}`}>{poll.title}</Link></h5>
              <p className="mb-0">{poll.description}</p>
            </div>

            {isAdmin && (
              <div className="d-flex gap-2">
                <button
                  onClick={() => window.location.replace(`/edit/${poll.id}`)}
                  className="btn btn-sm btn-warning"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deletePoll(poll.id)}
                  className="btn btn-sm btn-danger"
                >
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
