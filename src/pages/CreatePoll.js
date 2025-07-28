import React, { useState } from 'react';

export default function CreatePoll() {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title, description })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Sondage créé avec succès !' });
        setTitle('');
        setDescription('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Erreur inconnue' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur réseau : ' + err.message });
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Créer un sondage</h1>
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Titre :</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description :</label>
          <textarea
            className="w-full px-4 py-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
