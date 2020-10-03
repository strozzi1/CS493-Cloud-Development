const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const collectionName = "reviews";

var ObjectID = require('mongodb').ObjectID;
/*
 * Schema for a lodging.
 */
exports.reviewSchema = {
    userid: { required: true },
    businessid: { required: true },
    dollars: { required: true },
    stars: { required: true },
    review: { required: false }
  };

exports.getReviewPage = async function (page) {
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
    reviews: results,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: pageSize,
    totalCount: results.length
  };
};

exports.insertNewReview = async function (review) {
  const validatedReview = extractValidFields(
    review,
    exports.reviewSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(validatedReview);

  return result.insertedId;
};


exports.getReviewByID = async function (id) {
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.find({
    _id: new ObjectID(id)
  }).toArray();

  return result[0];
};

exports.deleteReviewByID = async function (id){
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  
  return result.deletedCount > 0;
};


exports.checkForDupes = async function (uid, bid){
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.find({
    userid: uid,
    businessid: bid
  }).toArray();

  return result[0];
}

exports.updateReviewByID = async function (id, newInfo) {
  const validatedReview = extractValidFields(
    newInfo,
    exports.reviewSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.replaceOne(
    {_id: new ObjectID(id)},
    validatedReview
  );

  return result.matchedCount > 0;
};