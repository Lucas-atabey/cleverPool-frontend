import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditPoll({ setIsAdminLoggedIn }) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const { pollId } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await fetch(`${API_URL}/polls/${pollId}`);
        if (!res.ok) throw new Error('Impossible de charger le sondage');
        const data = await res.json();

        setTitle(data.title || '');
        setDescription(data.description || '');
        setQuestions(
          (data.questions || []).map(q => ({
            id: q.id,
            text: q.text,
            options: (q.options || []).map(o => ({ id: o.id, text: o.text }))
          }))
        );
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [API_URL, pollId]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [''] }]);
  };

  const deleteQuestion = (qi) => {
    const updated = questions.filter((_, index) => index !== qi);
    setQuestions(updated);
  };

  const updateQuestionText = (i, text) => {
    const updated = [...questions];
    updated[i].text = text;
    setQuestions(updated);
  };

  const addOption = (qi) => {
    const updated = [...questions];
    updated[qi].options.push('');
    setQuestions(updated);
  };

  const deleteOption = (qi, oi) => {
    const updated = [...questions];
    updated[qi].options = updated[qi].options.filter((_, index) => index !== oi);
    setQuestions(updated);
  };

  const updateOptionText = (qi, oi, text) => {
    const updated = [...questions];
    updated[qi].options[oi] = text;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Vous devez être connecté en tant qu’admin.' });
        return;
      }

      // Normalisation des données
      const formattedQuestions = questions.map(q => ({
        id: q.id, // peut être undefined pour les nouvelles questions
        text: q.text,
        options: q.options.map(opt => 
          typeof opt === 'string' ? opt : { id: opt.id, text: opt.text }
        )
      }));

      const res = await fetch(`${API_URL}/polls/full/${pollId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, questions: formattedQuestions })
      });

      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        setIsAdminLoggedIn(false);
        alert('Session expirée, veuillez vous reconnecter.');
        window.location.replace('/');
        return;
      }
      if (res.ok) {
        setMessage({ type: 'success', text: 'Sondage modifié avec succès !' });
        navigate('/');
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Erreur inconnue' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau : ' + err.message });
    }
  };

  if (loading) {
    return <div className="container my-5">Chargement...</div>;
  }

  return (
    <div className="container my-5" style={{ maxWidth: '800px' }}>
      <h1 className="mb-4">Modifier le sondage</h1>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Titre :</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Description :</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <hr />

        <h3>Questions</h3>
        {questions.map((q, qi) => (
          <div key={qi} className="mb-4 border rounded p-3 position-relative">
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-2"
              aria-label="Supprimer la question"
              onClick={() => deleteQuestion(qi)}
            ></button>

            <div className="mb-2">
              <label>Question {qi + 1}</label>
              <input
                className="form-control"
                value={q.text}
                onChange={(e) => updateQuestionText(qi, e.target.value)}
                required
              />
            </div>
            <div>
              <label>Options :</label>
              {q.options.map((opt, oi) => {
                const optValue = typeof opt === 'string' ? opt : opt.text;
                return (
                  <div key={oi} className="d-flex align-items-center my-1">
                    <input
                      className="form-control"
                      value={optValue}
                      onChange={(e) => updateOptionText(qi, oi, e.target.value)}
                      required
                    />
                    <button type="button" className="btn btn-sm btn-danger ms-2" onClick={() => deleteOption(qi, oi)}>
                      ✕
                    </button>
                  </div>
                );
              })}
              <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={() => addOption(qi)}>
                + Ajouter une option
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mb-3" onClick={addQuestion}>
          + Ajouter une question
        </button>

        <button type="submit" className="btn btn-success w-100">Enregistrer les modifications</button>
      </form>
    </div>
  );
}
