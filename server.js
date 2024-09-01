const express = require('express');
const app = express();
const path = require('path');
const userExpr = require('./routes/user');
const adminExpr = require('./routes/admin');
const connectDB = require('./db/connectDB');
const session = require('express-session');
const nocache = require('nocache');

// Apply nocache middleware
app.use(nocache());

// Configure session management
app.use(session({
  secret: 'cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming requests with URL-encoded payloads and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up routes
app.use('/admin', adminExpr);
app.use('/user', userExpr);

// Set up view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to the database
connectDB();

// Default route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
app.listen(8080, () => {
  console.log('Server started at port 8080');
});
