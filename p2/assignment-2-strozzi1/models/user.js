const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');


var ObjectID = require('mongodb').ObjectID;


exports.getUsersBusinessPage = async function (page, uid) {
    const pageSize = 10;
  
    const db = getDBReference();
    const collection = db.collection('businesses');
  
    const count = await collection.countDocuments();
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
  
    const results = await collection.find({ 
        ownerid: uid
     })
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



exports.getUsersReviewPage = async function (page, uid) {
    const pageSize = 10;
  
    const db = getDBReference();
    const collection = db.collection('reviews');
  
    const count = await collection.countDocuments();
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
  
    const results = await collection.find({ 
        userid: uid
     })
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

exports.getUsersPhotoPage = async function (page, uid) {
    const pageSize = 10;
  
    const db = getDBReference();
    const collection = db.collection('photos');
  
    const count = await collection.countDocuments();
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;
  
    const results = await collection.find({ 
        userid: uid
     })
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



