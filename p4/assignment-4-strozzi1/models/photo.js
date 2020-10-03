/*
 * Photo schema and data accessor methods.
 */

const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessid: { required: true },
  caption: { required: false }
};
exports.PhotoSchema = PhotoSchema;

/*
 * Executes a DB query to insert a new photo into the database.  Returns
 * a Promise that resolves to the ID of the newly-created photo entry.
 */
async function insertNewPhoto(photo) {
  photo = extractValidFields(photo, PhotoSchema);
  photo.businessid = ObjectId(photo.businessid);
  const db = getDBReference();
  const collection = db.collection('photos');
  const result = await collection.insertOne(photo);
  return result.insertedId;
}
exports.insertNewPhoto = insertNewPhoto;

/*
 * Executes a DB query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPhotoById(id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await bucket
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getPhotoById = getPhotoById;

/*
 * Executes a DB query to fetch all photos for a specified business, based
 * on the business's ID.  Returns a Promise that resolves to an array
 * containing the requested photos.  This array could be empty if the
 * specified business does not have any photos.  This function does not verify
 * that the specified business ID corresponds to a valid business.
 */
async function getPhotosByBusinessId(id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    //const results = await collection
    //  .find({ businessid: new ObjectId(id) })
    //  .toArray();
    const results = await bucket
      .find({ "metadata.businessid": id })
      .toArray();
    return results;
  }
}
exports.getPhotosByBusinessId = getPhotosByBusinessId;



async function saveImageInfo(image) {
  const db = getDBReference();
  const collection = db.collection('photos');
  const result = await collection.insertOne(image);
  return result.insertedId;
}
exports.saveImageInfo = saveImageInfo;





async function getImageInfoById(id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  //const collection = db.collection('photos');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    //const results = await collection
    const results = await bucket
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getImageInfoById = getImageInfoById;




async function getImageInfoByIdAndSize(id, size) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  //const collection = db.collection('photos');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    //const results = await collection
    const results = await bucket
      .find({ _id: new ObjectId(id) },
       {"metadata.size": size})
      .toArray();
    return results[0];
  }
}
exports.getImageInfoByIdAndSize = getImageInfoByIdAndSize;


async function getImageNameByIdAndSize(id, size) {
  const db = getDBReference();
  
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  //const collection = db.collection('photos');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    //const results = await collection
    const results = await bucket
      .find({ _id: new ObjectId(id) })
      .toArray();

    var filename = results[0].filenames[size];
    return results[0].filenames[size];
  }
}
exports.getImageNameByIdAndSize = getImageNameByIdAndSize;







exports.saveImageFile = async function (image) {
  return new Promise((resolve, reject) => {
    const db = getDBReference();
    const bucket = new GridFSBucket(db, {
      bucketName: 'photos'
    });
    const metadata = {
      contentType: image.contentType,
      businessid: image.businessid,
      filename: image.filename,
      caption: image.caption
    };

    const uploadStream = bucket.openUploadStream(
      image.filename,
      { metadata: metadata }
    );
    fs.createReadStream(image.path).pipe(uploadStream)
      .on('error', (err) => {
        reject(err);
      })
      .on('finish', (result) => {
        resolve(result._id);
      });
  });
};








exports.getImageDownloadStreamByFilename = function (filename) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, {
    bucketName: 'photos'
  });
  return bucket.openDownloadStreamByName(filename);

};



exports.getDownloadStreamById = function (id) {
  const db = getDBReference();
  const bucket = new GridFSBucket(db, { bucketName: 'photos' });
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    return bucket.openDownloadStream(new ObjectId(id));
  }
};




exports.updateImageSizeById = async function (id, size) {
  const db = getDBReference();
  const collection = db.collection('photos.files');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { "metadata.size": size }}
    );
    return result.matchedCount > 0;
  }
};




exports.linkPhoto =  async function (ogId, NewPhotoSize, newPhotoFilename){
  const db = getDBReference();
  const collection = db.collection('photos.files');
  const url = `/media/photos/${ogId}-${NewPhotoSize}.jpg`;
  //const urlMeta = `metadata.urls.${NewPhotoSize}`;
  var update = {$set:{}};    
  update.$set["urls." + NewPhotoSize ] = url;
  update.$set["filenames." + NewPhotoSize] = newPhotoFilename;
  if (!ObjectId.isValid(ogId)) {
    return null;
  } else {
    const result = await collection.updateOne(
      { _id: new ObjectId(ogId) },
      update
    );
    return result.matchedCount > 0;
  }

}




