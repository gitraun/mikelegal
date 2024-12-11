import axios from "axios";

export default async function handler(req, res) {
  const { searchTerm, page } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }

  const API_KEY = process.env.OMDB_API_KEY;
  const API_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}&page=${page}`;

  try {
    const response = await axios.get(API_URL);
    const data = response.data;

    if (data.Response === "True") {
      return res.status(200).json(data.Search);
    } else {
      return res.status(404).json({ error: data.Error || "No movies found" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch movies" });
  }
}
