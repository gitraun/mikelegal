import { useState, useEffect } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const API_URL = "http://www.omdbapi.com/";
  const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

  const fetchMovies = async (newSearch = false) => {
    if (!searchTerm) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${searchTerm}&page=${page}`);
      const data = await response.json();

      if (data.Response === "True") {
        setMovies((prevMovies) => (newSearch ? data.Search : [...prevMovies, ...data.Search]));
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
    setMovies([]); // Reset movie list on new search
    setPage(1); // Reset to page 1 on new search
    fetchMovies(true); // Fetch movies for the first page
  };

  useEffect(() => {
    if (page > 1) {
      fetchMovies(); // Fetch next page of movies
    }
  }, [page]); // Trigger when page changes

  useEffect(() => {
    // Handle infinite scrolling when user reaches the bottom of the page
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading) {
        setPage((prevPage) => prevPage + 1); // Load next page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Clean up event listener
  }, [loading]); // Add loading as dependency to avoid multiple triggers

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
        {loading && page === 1 && <p className="text-center text-gray-500">Loading...</p>}{" "}
        {/* Show loading initially */}
        {error && <p className="text-center text-red-500">{error}</p>}
        {movies.map((movie) => (
          <MovieItem key={movie.imdbID} movie={movie} />
        ))}
        {loading && (
          <div className="flex items-center justify-center w-full h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const MovieItem = ({ movie }) => {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const API_URL = "https://www.omdbapi.com/";
  const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

  const fetchMovieDetails = async () => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`);
      const data = await response.json();
      if (data.Response === "True") {
        setDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch movie details");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (details) return;
    fetchMovieDetails();
  }, [movie.imdbID]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-300 bg-white shadow-sm rounded-md p-4">
      <h3 className="text-lg font-semibold text-black cursor-pointer" onClick={toggleDetails}>
        {movie.Title}
      </h3>
      {isOpen && (
        <div className="mt-2">
          <p className="text-sm text-black">
            <strong>Year:</strong> {movie.Year}
          </p>
          {details ? (
            <>
              <p className="text-sm text-black">
                <strong>Genre:</strong> {details.Genre || "N/A"}
              </p>
              <p className="text-sm text-black">
                <strong>Director:</strong> {details.Director || "N/A"}
              </p>
              <p className="text-sm text-black">
                <strong>Plot:</strong> {details.Plot || "N/A"}
              </p>
            </>
          ) : loadingDetails ? (
            <p className="text-sm text-gray-500">Loading details...</p>
          ) : (
            <p className="text-sm text-gray-500">No additional details available</p>
          )}
          {movie.Poster !== "N/A" ? (
            <>
              {imageLoading && (
                <div className="w-full max-w-xs h-48 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
                </div>
              )}
              <img
                src={movie.Poster}
                alt={movie.Title}
                className={`w-full max-w-xs rounded-md ${imageLoading ? "hidden" : ""}`}
                onLoad={handleImageLoad}
              />
            </>
          ) : (
            <p className="text-sm text-gray-500">No image available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieList;
