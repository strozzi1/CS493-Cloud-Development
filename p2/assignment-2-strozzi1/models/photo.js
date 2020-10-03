const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const collectionName = "photos";

var ObjectID = require('mongodb').ObjectID;
/*
 * Schema for a lodging.
 */
exports.photoSchema = {
    userid: { required: true },
    businessid: { required: true },
    caption: { required: false }
  };

exports.getPhotoPage = async function (page) {
  const pageSize = 10;

  const db = getDBReference();
  const collection = db.collection(collectionName);

  const count = await collection.countDocuments();
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    photos: results,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: pageSize,
    totalCount: results.length
  };
};

exports.insertNewPhoto = async function (photo) {
  const validatedPhoto = extractValidFields(
    photo,
    exports.photoSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(validatedPhoto);

  return result.insertedId;
};


exports.getPhotoByID = async function (id) {
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.find({
    _id: new ObjectID(id)
  }).toArray();

  return result[0];
};

exports.deletePhotoByID = async function (id){
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  
  return result.deletedCount > 0;
};

exports.updatePhotoByID = async function (id, newInfo) {
  const validatedPhoto = extractValidFields(
    newInfo,
    exports.photoSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.replaceOne(
    {_id: new ObjectID(id)},
    validatedPhoto
  );

  return result.matchedCount > 0;
};