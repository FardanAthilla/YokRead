export default async function handler(req, res) {
  const { param } = req.query;
  try {
    const response = await fetch(`https://weeb-scraper.onrender.com/api/komiku/${param}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat detail komik" });
  }
}
