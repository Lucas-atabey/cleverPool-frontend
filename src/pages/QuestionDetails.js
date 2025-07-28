import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function QuestionDetails() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteDone, setVoteDone] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/questions/${questionId}`).then(res => res.json()),
      fetch(`${API_URL}/questions/${questionId}/options`).then(res => res.json())
    ])
      .then(([questionData, optionsData]) => {
        setQuestion(questionData);
        setOptions(optionsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [questionId]);

  const vote = (optionId) => {
    fetch(`${API_URL}/options/${optionId}/vote`, { method: 'POST' })
      .then(res => {
        if (res.ok) {
          setVoteDone(true);
          fetchResults();
        }
      });
  };

  const fetchResults = () => {
    fetch(`${API_URL}/questions/${questionId}/results`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(() => {});
  };

  if (loading) return <p>Chargement...</p>;
  if (!question) return <p>Question non trouvée</p>;

  if (voteDone && results) {
    return (
      <div>
        <h3>Résultats</h3>
        <ul>
          {results.map(r => (
            <li key={r.option_id}>{r.text} : {r.votes} votes</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h3>{question.text}</h3>
      <ul>
        {options.map(opt => (
          <li key={opt.id}>
            {opt.text} <button onClick={() => vote(opt.id)}>Voter</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
