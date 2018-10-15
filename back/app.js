
const createError = require('http-errors');
const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');
const mongoose = require('mongoose');
const keys = require('./config/keys')
const app = express();

const usersRouter = require('./routes/users');

mongoose.connect(keys.database, { useNewUrlParser: true });
// // On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Database');
});
// // On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error '+ err);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public/')));
app.use(express.static(path.join(__dirname, 'user-images/')));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors())

require('./config/passport')(passport);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.get('/', (req, res) => {
  res.send('invaild endpoint');

});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

module.exports = app;