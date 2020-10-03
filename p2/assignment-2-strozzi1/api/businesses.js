const router = require('express').Router();
const validation = require('../lib/validation');

const businesses = require('../data/businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');

const { getBusinessPage, insertNewBusiness, deleteBusinessByID, getBusinessByID, updateBusinessByID } = require('../models/business');

exports.router = router;
exports.businesses = businesses;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
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

/*
 * Route to return a list of businesses. DONE!
 */
router.get('/', async (req, res) =>{

  try {
    const businessPage = await getBusinessPage(
      parseInt(req.query.page) || 1
    );
    console.log("businessPage: ", businessPage);
    res.status(200).send(businessPage);
  } catch (err) {
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching business page."
    });
  }

});


/*
 * Route to create a new business.  DONE?
 */
router.post('/', async (req, res, next) => {

  if (validation.validateAgainstSchema(req.body, businessSchema)) {
    
    try{
      const id = await insertNewBusiness(req.body)
      res.status(201).json({
        id: id,
        links: {
          business: `/businesses/${id}`
        }
      });
    }catch(err) {
      
      res.status(500).send({
        error: "Error inserting business"
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }

});



/*
 * Route to fetch info about a specific business. WORKS, needs photos and reviews
 */
router.get('/:businessid', async (req, res, next) => {
  const businessid = req.params.businessid;
  
  try {
    const business = await getBusinessByID(businessid)
    if (business) {
      
      res.status(200).json(business);
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to find business."
    });
  }
});

// router.get('/:businessid', function (req, res, next) {
//   const businessid = req.params.businessid;
//   if (businesses[businessid]) {
//     /*
//      * Find all reviews and photos for the specified business and create a
//      * new object containing all of the business data, including reviews and
//      * photos.
//      */
//     const business = {
//       reviews: reviews.filter(review => review && review.businessid === businessid),
//       photos: photos.filter(photo => photo && photo.businessid === businessid)
//     };
//     Object.assign(business, businesses[businessid]);
//     res.status(200).json(business);
//   } else {
//     next();
//   }
// });

/*
 * Route to replace data for a business.    DONE
 */
router.put('/:businessid', async (req, res, next) => {
  const businessid = req.params.businessid;
  if (validation.validateAgainstSchema(req.body, businessSchema)) {
    try {
      const updateSuccessful = await
        updateBusinessByID(businessid, req.body);
      if (updateSuccessful) {
        res.status(200).send({
          _id: businessid,
          body: req.body
        });
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send({
        error: "Unable to update business."
      });
    }
  } else {
    res.status(400).send({
      err: "Request body does not contain a valid Business."
    });
  }
});


/*
 * Route to delete a business. DONE
 */


router.delete('/:businessid', async (req, res, next) => {
  const businessid = req.params.businessid;
  
  try {
    const deleteSuccessful = await deleteBusinessByID(businessid)
    if (deleteSuccessful) {
       res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to delete business."
    });
  }
});
