const { Sequelize } = require('sequelize');

// For SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  dialectOptions: { timeout: 60000 } // wait up to 60s if locked
});


// For MySQL, use this instead:
// const sequelize = new Sequelize('DB_NAME', 'DB_USER', 'DB_PASS', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

module.exports = sequelize;
