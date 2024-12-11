import { useState, useEffect } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const API_URL = "http://www.omdbapi.com/";
  const API_KEY = "69b7ec79"; // Use an environment variable in production.

  // Fetch movies from the API
  const fetchMovies = async (newSearch = false) => {
    if (!searchTerm) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${searchTerm}&page=${page}`);
      const data = await response.json();

      if (data.Response === "True") {
        const newMovies = data.Search;
        setMovies((prevMovies) => {
          const updatedMovies = newSearch ? newMovies : [...prevMovies, ...newMovies];
          return updatedMovies.slice(-10); // Keep only the last 10 movies
        });
      } else {
        setError(data.Error || "No movies found.");
      }
    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    setMovies([]);
    setPage(1);
    fetchMovies(true);
  };

  // Infinite scrolling logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch movies on page change
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
        {movies.map((movie) => (
          <MovieItem key={movie.imdbID} movie={movie} />
        ))}
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-black mt-2">Loading...</p>
          </div>
        )}
        {error && <p className="text-center text-black">{error}</p>}
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
            <strong>Type:</strong> {movie.Type}
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
