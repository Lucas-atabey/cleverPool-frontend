import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePoll({setIsAdminLoggedIn }) {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

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

      const res = await fetch(`${API_URL}/polls/full`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, questions })
      });

      const data = await res.json();
      if (res.status === 401) {
        // Token invalide ou expiré : on supprime token et redirige
        localStorage.removeItem('admin_token');
        setIsAdminLoggedIn(false);
        alert('Session expirée, veuillez vous reconnecter.');
        window.location.replace('/');
        return;
      }
      if (res.ok) {
        setMessage({ type: 'success', text: 'Sondage créé avec succès !' });
        navigate('/');
      } else {
        setMessage({ type: 'error', text: data.error || data.message || 'Erreur inconnue' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau : ' + err.message });
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: '800px' }}>
      <h1 className="mb-4">Créer un sondage</h1>

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
            {/* bouton supprimer la question */}
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
              {q.options.map((opt, oi) => (
                <div key={oi} className="d-flex align-items-center my-1">
                  <input
                    className="form-control"
                    value={opt}
                    onChange={(e) => updateOptionText(qi, oi, e.target.value)}
                    required
                  />
                  <button type="button" className="btn btn-sm btn-danger ms-2" onClick={() => deleteOption(qi, oi)}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={() => addOption(qi)}>
                + Ajouter une option
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mb-3" onClick={addQuestion}>
          + Ajouter une question
        </button>

        <button type="submit" className="btn btn-success w-100">Créer le sondage</button>
      </form>
    </div>
  );
}
