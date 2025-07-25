const fetch = require('node-fetch');

const getEmbedding = async (text) => {
  const response = await fetch('http://0.0.0.0:8000/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) throw new Error('Failed to get embedding');
  const data = await response.json();
  return data.embedding;
};

module.exports = getEmbedding;