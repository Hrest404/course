import { getIndex } from './_data.mjs';

// На Vercel нет постоянного диска, поэтому доступен только локальный источник (rag/ из репозитория).
export default async function handler(req, res) {
  const index = await getIndex();
  res.status(200).json([{ id: 'local', name: 'База знаний (rag/ из репозитория)', configured: true, connected: true, fragments: index.docs.length }]);
}
