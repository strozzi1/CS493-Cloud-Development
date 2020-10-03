/*
 * API sub-router for businesses collection endpoints.
 */

const router = require('express').Router();

const multer = require('multer');
const crypto = require('crypto');

const { connectToRabbitMQ, getChannel } = require('../lib/rabbitmq');


const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

const { validateAgainstSchema } = require('../lib/validation');
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  saveImageInfo,
  saveImageFile,
  getImageInfoById
} = require('../models/photo');



const upload = multer({
  // dest: `${__dirname}/uploads`
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      
      const filename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = imageTypes[file.mimetype];
      callback(null, `${filename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype]);
  }
});

/*
 * Route to create a new photo.
 */
router.post('/', upload.single('image'), async (req, res) => {
  
  if (validateAgainstSchema(req.body, PhotoSchema) && req.file) {
    const image = {
      contentType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      businessid: req.body.businessid,
      caption: req.body.caption
    }
    try {
      //const id = await insertNewPhoto(req.body);
      const id = await saveImageFile(image);
      const channel = getChannel();
      //console.log("== Channel: ", channel);
      channel.sendToQueue('photos', Buffer.from(id.toString()));
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          filename: image.filename,
          business: `/businesses/${req.body.businessid}`
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body needs 'image' file and business id"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    //const photo = await getPhotoById(req.params.id);
    const photo = await getImageInfoById(req.params.id);
    console.log("== PHOTO:", photo);
    if (photo) {
      //delete photo.path;
      const responseBody = {
        _id: photo._id,
        url: `/media/photos/${photo.filename}`,
        contentType: photo.metadata.contentType,
        business: photo.metadata.businessid,
        urls: photo.urls
      };
      //res.status(200).send(photo);
      res.status(200).send(responseBody);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    });
  }
});

module.exports = router;
