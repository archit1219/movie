// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const { engine } = require('express-handlebars');

// Initialize the Express app
const app = express();
const port = 3000;

// Load JSON data from the movieData folder
let movieData = [];
fs.readFile(path.join(__dirname, '../movieData/movieData.json'), 'utf8', (err, data) => {
  if (!err) {
    movieData = JSON.parse(data);
    console.log('JSON data loaded successfully.');
  } else {
    console.error('Error loading JSON data:', err);
  }
});

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Set up Handlebars template engine with custom helpers
app.engine('.hbs', engine({
  extname: '.hbs',
  helpers: {
    notEqualsto: function (a, b) {
      return a != b;
    },
    highlightnullNoMetascore: function (metascore) {
      // Ensuring that any undefined, null, empty string, or 'N/A' value triggers the 'highlighted_row' class
      return (!metascore || metascore === 'N/A') ? 'highlighted_row' : '';
    }
  },
  partialsDir: path.join(__dirname, '../views/partials') // Register partials directory
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Route: Home
app.get('/', (req, res) => res.render('index'));

// Route: About
app.get('/about', (req, res) => res.render('about'));

// Route: users
app.get('/users', function(req, res) {
  res.send('respond with a resource');
});

// Route: Data Loaded confirmation
app.get('/data', (req, res) => res.render('data'));

// Route: Search by ID Form
app.get('/data/search/id', (req, res) => res.render('searchByIdForm'));

// Route: Handle Search by ID
app.post('/data/search/id', (req, res) => {
  const movieId = parseInt(req.body.movieId);
  const movie = movieData.find(m => m.Movie_ID === movieId);
  if (movie) res.render('movieInfo', { movie });
  else res.render('error', { message: 'Movie ID not found!' });
});

// Route: Search by Title Form
app.get('/data/search/title', (req, res) => res.render('searchByTitleForm'));

// Route: Handle Search by Title
app.post('/data/search/title', (req, res) => {
  const movieTitle = req.body.movieTitle.toLowerCase();
  const matchingMovies = movieData.filter(m => m.Title.toLowerCase().includes(movieTitle));
  res.render('movieList', { movies: matchingMovies });
});

// Route to display all movie data in an HTML table without highlighting or filtering
app.get('/allData', (req, res) => {
  res.render('allData', { movies: movieData });
});

// Route to display filtered movie data, excluding those with blank or "N/A" metascores
app.get('/filteredData', (req, res) => {
  const filteredMovies = movieData.filter(movie => movie.Metascore && movie.Metascore !== 'N/A');
  res.render('filteredData', { movies: filteredMovies });
});

// Route to display all data, highlighting rows with missing or "N/A" metascores
app.get('/highlightedData', (req, res) => {
  const moviesWithHighlighting = movieData.map(movie => ({
    ...movie,
    highlight: !movie.Metascore || movie.Metascore === 'N/A'
  }));
  res.render('highlightedData', { movies: moviesWithHighlighting });
});

// Route: wrong Route
app.get('*', function(req, res) {
  res.render('error', { title: 'Error', message: 'Wrong Route' });
});

// Export the app as a serverless function for Vercel
module.exports = app;
