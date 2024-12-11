import { useState, useEffect } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const API_URL = "http://www.omdbapi.com/";
  const API_KEY = "69b7ec79"; // Use an environment variable in production.

  const fetchMovies = async (newSearch = false) => {
    if (!searchTerm) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${searchTerm}&page=${page}`);
      const data = await response.json();

      if (data.Response === "True") {
        const movieDetailsPromises = data.Search.map(async (movie) => {
          const movieResponse = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
          const movieData = await movieResponse.json();
          return movieData;
        });

        const movieDetails = await Promise.all(movieDetailsPromises);

        setMovies((prevMovies) => (newSearch ? movieDetails : [...prevMovies, ...movieDetails]));
      } else {
        setError(data.Error || "No movies found.");
      }
    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setMovies([]);
    setPage(1);
    fetchMovies(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (page > 1) fetchMovies();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">Movie Search</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
        <button
          onClick={handleSearchSubmit}
          className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {movies.map((movie) => (
          <MovieItem key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </div>
  );
};

const MovieItem = ({ movie }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-300 bg-white shadow-sm rounded-md p-4">
      <h3
        onClick={() => setExpanded(!expanded)}
        className="text-lg font-semibold cursor-pointer hover:text-blue-500 text-black"
      >
        {movie.Title}
      </h3>
      {expanded && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-black">
            <strong>Year:</strong> {movie.Year}
          </p>
          <p className="text-sm text-black">
            <strong>Genre:</strong> {movie.Genre}
          </p>
          <p className="text-sm text-black">
            <strong>Director:</strong> {movie.Director}
          </p>
          <p className="text-sm text-black">
            <strong>Plot:</strong> {movie.Plot}
          </p>
          {movie.Poster !== "N/A" && (
            <img src={movie.Poster} alt={movie.Title} className="w-full max-w-xs rounded-md" />
          )}
        </div>
      )}
    </div>
  );
};

export default MovieList;
