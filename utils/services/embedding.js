const fetch = require('node-fetch');

const getEmbedding = async (text) => {
  const response = await fetch('https://c9adca5ec8d2.ngrok-free.app/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) throw new Error('Failed to get embedding');
  const data = await response.json();
  return data.embedding;
};

module.exports = getEmbedding;