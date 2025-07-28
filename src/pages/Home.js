import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Home() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/polls`)
      .then(res => res.json())
      .then(data => {
        setPolls(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des sondages...</p>;

  return (
    <div>
      <h1>Liste des sondages</h1>
      <ul>
        {polls.map(poll => (
          <li key={poll.id}>
            <Link to={`/poll/${poll.id}`}>{poll.title}</Link>
            <p>{poll.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
