import { answerQuestion } from '../server/chat.mjs';
import { getIndex } from './_data.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const question = req.body?.question;
    if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' });
    res.status(200).json(await answerQuestion(await getIndex(), question));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message ?? e) });
  }
}
