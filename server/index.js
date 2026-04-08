const dotenv = require('dotenv');
const { app, initializeDatabase } = require('./app');

dotenv.config();

const { PORT = 4000 } = process.env;

async function start() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`API auth running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});