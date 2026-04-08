const { app, initializeDatabase } = require('../server/app');

module.exports = async (req, res) => {
  await initializeDatabase();
  return app(req, res);
};