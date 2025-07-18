import React, { useEffect,  useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import {getTrendingMovies, updateSearchCount} from './appwrite.js'

//API - Application Programming Interface - A set of rules that 
//allows one software application to talk to other.

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method : 'GET',
  headers : {
    accept : 'application/json' , 
    Authorization : `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  
  const [movieList, setMovieList] = useState([]);
   
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [trendingMovies, setTrendingMovies] = useState([]);
  

  //Debounce the search Term to prevent making too many API requests
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
  //here the 500 is the millisecond, time upto which it will wait before actually searching and making the api call

  const fetchMovies = async (query = '') => {
    setIsLoading(true);  //Initially there will be a loading state
    setErrorMessage('');
    setMovieList([]);

    try {
      const endpoint = query ?
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`  
        // this encodeURIComponent makes sure that in whichever wierd way you write the searchTerm , it will identify the movie;
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch movies.');
      }

      const data = await response.json();

      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
      
    } catch (error) {

      console.error(`Error fetching movies : ${error}`);
      setErrorMessage('Error fetching movies , please try again later.')

    } finally {

      setIsLoading(false); 

    }
  } 

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error Fetching Trending Movies : ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src='./hero-img.png' alt='Hero Banner'/>
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without The Hassle</h1>
          <Search searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key = {movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <div className='text-white'>
              <Spinner/>
            </div>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul> 
              {movieList.map((movie) => (
                <MovieCard key = {movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  ) 
}

export default App
