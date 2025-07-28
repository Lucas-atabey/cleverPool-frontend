import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PollDetails() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le sondage complet : title/description/questions/options/votes
  useEffect(() => {
    fetch(`${API_URL}/polls/${pollId}/questions`)
      .then((res) => res.json())
      .then((data) => {
        setPoll(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pollId]);

  const handleVote = async (optionId) => {
    setError(null);

    const res = await fetch(`${API_URL}/options/${optionId}/vote`, {
      method: 'POST',
    });

    if (res.status === 429) {
      setError("Trop de votes récents. Veuillez patienter avant de revoter.");
      return;
    }

    if (!res.ok) {
      setError("Erreur lors de l'enregistrement du vote.");
      return;
    }

    const data = await res.json();

    if (data.message === "Vote enregistré") {
      // Mise à jour locale des votes
      setPoll(prevPoll => {
        // Cloner l’objet poll pour éviter mutation directe
        const newPoll = { ...prevPoll };
        newPoll.questions = newPoll.questions.map(q => {
          return {
            ...q,
            options: q.options.map(o => {
              if (o.id === optionId) {
                return { ...o, votes_count: o.votes_count + 1 };
              }
              return o;
            }),
          };
        });
        return newPoll;
      });
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!poll) return <p>Sondage non trouvé</p>;

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      <h1 className="mb-4">{poll.title}</h1>
      <p className="mb-4">{poll.description}</p>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      {poll.questions.map((q) => (
        <div key={q.id} className="mb-4">
          <h5>{q.text}</h5>
          <ul className="list-group">
            {[...q.options]
              .sort((a, b) => b.votes_count - a.votes_count)
              .map((o) => (
                <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {o.text}
                  <div>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleVote(o.id)}
                    >
                      Voter
                    </button>
                    <span className="badge bg-secondary">{o.votes_count} vote(s)</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
