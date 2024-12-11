import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";

const MovieList = () => {
  const [movies, setMovies] = useState([]); // Store movie data with additional details
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // To track if there are more movies to load
  const API_URL = "http://www.omdbapi.com/";
  const API_KEY = "69b7ec79"; // Use environment variable for security

  // Reference for scroll container
  const scrollContainerRef = useRef(null);

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

        // Fetch details for each movie
        const detailedMovies = await Promise.all(
          newMovies.map(async (movie) => {
            const movieDetailsResponse = await fetch(
              `${API_URL}?apikey=${API_KEY}&i=${movie.imdbID}`
            );
            const movieDetails = await movieDetailsResponse.json();
            return {
              ...movie,
              genre: movieDetails.Genre || "N/A",
              director: movieDetails.Director || "N/A",
              plot: movieDetails.Plot || "No plot available.",
            };
          })
        );

        setMovies((prevMovies) => {
          const updatedMovies = newSearch ? detailedMovies : [...prevMovies, ...detailedMovies];
          return updatedMovies;
        });

        setHasMore(newMovies.length > 0); // If no new movies, stop infinite scroll
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

  // Handle infinite scroll
  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const bottom =
        scrollContainer.scrollHeight === scrollContainer.scrollTop + scrollContainer.clientHeight;
      if (bottom && !loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  // Fetch movies on page change or search term update
  useEffect(() => {
    if (searchTerm) {
      fetchMovies(true);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) fetchMovies();
  }, [page]);

  return (
    <div
      className="min-h-screen bg-gray-100 p-4 flex flex-col items-center"
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">Movie Search</h1>
      <div className="flex justify-center mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
        <button
          onClick={handleSearchSubmit}
          className="ml-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <Accordion type="single" collapsible>
          {movies.map((movie) => (
            <AccordionItem key={movie.imdbID} value={movie.imdbID}>
              <AccordionTrigger className="text-black">{movie.Title}</AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-black">
                    <strong>Year:</strong> {movie.Year}
                  </p>
                  <p className="text-sm text-black">
                    <strong>Type:</strong> {movie.Type}
                  </p>
                  <p className="text-sm text-black">
                    <strong>Director:</strong> {movie.director}
                  </p>
                  <p className="text-sm text-black">
                    <strong>Genre:</strong> {movie.genre}
                  </p>
                  <p className="text-sm text-black">
                    <strong>Plot:</strong> {movie.plot}
                  </p>
                  {movie.Poster !== "N/A" && (
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      className="w-full max-w-xs rounded-md"
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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

export default MovieList;
