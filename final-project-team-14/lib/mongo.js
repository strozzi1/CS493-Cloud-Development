/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient, ObjectId } = require('mongodb');

const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER || 'tarpaulin';
const mongoPassword = process.env.MONGO_PASSWORD || 'hunter2';
const mongoDBName = process.env.MONGO_DATABASE || 'tarpaulin';

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;

let db = null;

exports.connectToDB = function (callback) {
  MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      throw err;
    }
    db = client.db(mongoDBName);
    callback();
  });
};

exports.getDBReference = function () {
  return db;
};

exports.checkValidId = (requestSection, idKey) => {
  return (req, res, next) => {
    if (ObjectId.isValid(req[requestSection][idKey])) {
      next();
    } else {
      try {
        throw new Error("Invalid mongo id");
      } catch (err) {
        next(err);
      }
    }
  };
};