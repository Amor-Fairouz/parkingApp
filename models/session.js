'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    AccountId: DataTypes.INTEGER,
    email: DataTypes.STRING,
    attempt: DataTypes.INTEGER,
    token: DataTypes.TEXT,
    ip: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
  }, {});
  Session.associate = function(models) {
    Session.belongsTo(models.Account);
  };

  return Session;
};
