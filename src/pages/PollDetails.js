import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function PollDetails() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/polls/${pollId}`).then(res => res.json()),
      fetch(`${API_URL}/polls/${pollId}/questions`).then(res => res.json())
    ])
      .then(([pollData, questionsData]) => {
        setPoll(pollData);
        setQuestions(questionsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pollId]);

  if (loading) return <p>Chargement...</p>;
  if (!poll) return <p>Sondage non trouvé</p>;

  return (
    <div>
      <h1>{poll.title}</h1>
      <p>{poll.description}</p>
      <h2>Questions</h2>
      <ul>
        {questions.map(q => (
          <li key={q.id}>
            <Link to={`/question/${q.id}`}>{q.text}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
