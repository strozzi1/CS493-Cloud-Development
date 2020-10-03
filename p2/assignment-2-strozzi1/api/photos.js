const router = require('express').Router();
const validation = require('../lib/validation');

const photos = require('../data/photos');

const { getPhotoPage, insertNewPhoto, deletePhotoByID, getPhotoByID, updatePhotoByID } = require('../models/photo');

exports.router = router;
exports.photos = photos;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};

router.get('/', async (req, res) =>{

  try {
    const photoPage = await getPhotoPage(
      parseInt(req.query.page) || 1
    );
    console.log("photoPage: ", photoPage);
    res.status(200).send(photoPage);
  } catch (err) {
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching photo Page."
    });
  }

});



/*
 * Route to create a new photo. DONE
 */
router.post('/', async (req, res, next) => {

  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    
    try{
      const id = await insertNewPhoto(req.body)
      res.status(201).json({
        id: id,
        links: {
          photo: `/photos/${id}`
        }
      });
    }catch(err) {
      console.error(" -- error:", err);
      res.status(500).send({
        error: "Error inserting photo"
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }

});


/*
 * Route to fetch info about a specific photo.   WORKS
 */
router.get('/:photoID', async (req, res, next) => {
  const id = req.params.photoID;
  
  try {
    const photo = await getPhotoByID(id)
    if (photo) {
      
      res.status(200).json(photo);
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to find photo."
    });
  }
});

/*
 * Route to update a photo. DONE
 */

router.put('/:photoid', async (req, res, next) => {
  const photoid = req.params.photoid;
  if (validation.validateAgainstSchema(req.body, photoSchema)) {
    try {
      const updateSuccessful = await 
        updatePhotoByID(photoid, req.body);
      if (updateSuccessful) {
        res.status(200).send({
          _id: photoid,
          body: req.body
        });
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send({
        error: "Unable to update photo."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid photo."
    });
  }
}); 


/*
 * Route to delete a photo. DONE!
 */
router.delete('/:photoID', async (req, res, next) => {
  const photoID = req.params.photoID
  
  try {
    const deleteSuccessful = await deletePhotoByID(photoID)
    if (deleteSuccessful) {
       res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to delete photo."
    });
  }

});
