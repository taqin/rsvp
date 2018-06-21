const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PROXY = 'http://';
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/rsvp';
} 