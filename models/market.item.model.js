const sql = require("sequelize");
const DataTypes = sql.DataTypes;

module.exports = (sequelize, Sequelize) => {
  const MarketItem = sequelize.define("market_items", {
    Id: {
      type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false
    },
    MarketId: {
      type: DataTypes.INTEGER, unique: true, allowNull: false
    },
    NFTContractAddress: {
      type: DataTypes.STRING, allowNull: false
    },
    TokenId: {
      type: DataTypes.INTEGER, allowNull: false,
    },
    SellerAddress: {
        type: DataTypes.STRING, allowNull: true
    },
    OwnerAddress: {
        type: DataTypes.STRING, allowNull: true
    },
    HighestOffer:{
        type: DataTypes.STRING, allowNull: true
    },
    BidderAddress:{
        type: DataTypes.STRING, allowNull: true
    },
    Category:{
        type: DataTypes.STRING, allowNull: true
    },
    Price:{
        type: DataTypes.STRING, allowNull: true
    },
    IsSold:{
        type: DataTypes.BOOLEAN, default: false
    },
    CollectionName:{
        type: DataTypes.STRING, allowNull: true
    },
    TokenName:{
        type: DataTypes.STRING, allowNull: true
    },
    Network:{
      type: DataTypes.STRING, allowNull: true
    }
  });

  return MarketItem;
};
