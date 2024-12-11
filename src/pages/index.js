import Head from "next/head";
import MovieList from "@/components/MoviesList";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Movie Search</title>
        <meta name="description" content="Search for movies using OMDb API" />
      </Head>
      <MovieList />
    </div>
  );
}
