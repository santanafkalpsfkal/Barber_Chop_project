const { initializeDatabase } = require('./app');

initializeDatabase()
  .then(() => {
    console.log('Schema and default users ready');
  })
  .catch((error) => {
  console.error(error);
  process.exit(1);
  });