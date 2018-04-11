// Configure environment variables
require('dotenv').config();

// Configure database
require('./db');

const express = require('express');
const auth = require('../controllers/auth').default;
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

export = () => {
  let app = express();

  app.use(bodyParser.json());
  app.use(expressValidator({
    customValidators: {
      isArray: function (value) {
        return Array.isArray(value);
      }
    }
  }));

  // Enable proxy so we can get the client's IP address
  app.enable('trust proxy');

  // Configure authentication
  app.use(auth.initialize());

  // Configure middleware to require authentication for all routes
  app.all(process.env.API_BASE + '*', (req, res, next) => {
    if (req.path.includes(process.env.API_BASE + 'login')) return next();

    return auth.authenticate((err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        if (info.name === 'TokenExpiredError') {
          return res.status(401).json({message: 'Your token has expired. Please generate a new one'});
        } else {
          return res.status(401).json({message: info.message});
        }
      }
      app.set('user', user);
      return next();
    })(req, res, next);
  });

  // Set up routes
  require('../routes')(app);

  return app;
};
