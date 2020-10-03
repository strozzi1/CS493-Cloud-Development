const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');
const collectionName = "businesses";

var ObjectID = require('mongodb').ObjectID;


/*
 * Schema for a lodging.
 */
exports.businessSchema = {
    ownerid: { required: true },
    name: { required: true },
    address: { required: true },
    city: { required: true },
    state: { required: true },
    zip: { required: true },
    phone: { required: true },
    category: { required: true },
    subcategory: { required: true },
    website: { required: false },
    email: { required: false }
};

exports.getBusinessPage = async function (page) {
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
    businesses: results,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: pageSize,
    totalCount: results.length
  };
};

exports.insertNewBusiness = async function (business) {
  const validatedBusiness = extractValidFields(
    business,
    exports.businessSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.insertOne(validatedBusiness);

  return result.insertedId;
};


exports.getBusinessByID = async function (id) {
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const business = await collection.find({
    _id: new ObjectID(id) 
  }).toArray();

  const reviews = await db.collection('reviews').find({
    businessid: id
  }).toArray();
  const photos =  await db.collection('photos').find({
    businessid: id
  }).toArray();
  business[0].reviews = reviews;
  business[0].photos = photos;
  
  return business[0];
};

exports.deleteBusinessByID = async function (id){
  
  const db = getDBReference();
  const collection = db.collection('businesses');
  const result = await collection.deleteOne({
    _id: new ObjectID(id)
  });
  
  return result.deletedCount > 0;
};


exports.updateBusinessByID = async function (id, newInfo) {
  const validatedBusiness = extractValidFields(
    newInfo,
    exports.businessSchema
  );
  
  
  const db = getDBReference();
  const collection = db.collection(collectionName);
  const result = await collection.replaceOne(
    {_id: new ObjectID(id)},
    validatedBusiness
  );

  return result.matchedCount > 0;
};