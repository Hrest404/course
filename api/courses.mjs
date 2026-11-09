import { getCourses } from './_data.mjs';

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(await getCourses());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message ?? e) });
  }
}
