const { mysqlConfig } = require("../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  mysqlConfig.DB,
  mysqlConfig.USER,
  mysqlConfig.PASSWORD,
  {
    host: mysqlConfig.HOST,
    dialect: mysqlConfig.dialect,
    operatorsAliases: false,

    pool: {
      max: mysqlConfig.pool.max,
      min: mysqlConfig.pool.min,
      acquire: mysqlConfig.pool.acquire,
      idle: mysqlConfig.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.octousers = require("./octouser_model")(sequelize, Sequelize);
// db.octousersTopNfts = require("./octouser-top-nfts.model")(
//   sequelize,
//   Sequelize
// );
db.marketItems = require("./market.item.model")(sequelize, Sequelize);
// db.collection = require("./collection.model")(sequelize, Sequelize);
// db.collectionSettings = require("./collection-settings.model")(
//   sequelize,
//   Sequelize
// );
// db.nft = require("./nft.model")(sequelize, Sequelize);
// db.nftDiscussions = require("./nft.disscussion.model")(sequelize, Sequelize);
// db.collectionDiscussion = require("./collection.discussion.model")(
//   sequelize,
//   Sequelize
// );

module.exports = db;
