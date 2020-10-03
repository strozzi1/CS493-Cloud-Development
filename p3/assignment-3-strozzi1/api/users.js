const router = require('express').Router();

const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');

const { validateAgainstSchema } = require('../lib/validation');
const {
  UserSchema,
  insertNewUser,
  getUserById,
  validateUserEmail,
  validateUserIdCombo,
  isAdmin,
  validateUser
} = require('../models/user');

const { generateAuthToken, requireAuthentication, adminTestAuthentication } = require('../lib/auth');

/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
  
  try {
    const authorizedSearch = await validateUserIdCombo(req.user, parseInt(req.params.id) );
    if(!authorizedSearch && !req.admin){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {
      try {
        const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
        if (businesses) {
          res.status(200).send({ businesses: businesses });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to fetch businesses.  Please try again later."
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to validate user id for logged in user. Try again later."
    });
  }


});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
 
  try {
    const authorizedSearch = await validateUserIdCombo(req.user, parseInt(req.params.id) );
    if(!authorizedSearch && !req.admin){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {
      try {
        const reviews = await getReviewsByUserId(parseInt(req.params.id));
        if (reviews) {
          res.status(200).send({ reviews: reviews });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to fetch reviews.  Please try again later."
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to validate user id for logged in user. Try again later."
    });
  }


});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
 
  try {
    const authorizedSearch = await validateUserIdCombo(req.user, parseInt(req.params.id) );
    if(!authorizedSearch && !req.admin){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {
      try {
        const photos = await getPhotosByUserId(parseInt(req.params.id));
        if (photos) {
          res.status(200).send({ photos: photos });
        } else {
          next();
        }
      } catch (err) {
        console.error(err);
        res.status(500).send({
          error: "Unable to fetch photos.  Please try again later."
        });
      }
    }

  } catch (err){
    res.status(500).send({
      error: "Unable to validate user id for logged in user. Try again later."
    });
  }
});

/*
 * Route to add a new user.
 */

router.post('/', adminTestAuthentication, async (req, res, next) =>{
  if (validateAgainstSchema(req.body, UserSchema)) {
    if(!req.body.admin){req.body.admin = 0;}
    if(!req.admin){req.body.admin=0;}

    try {
      const id = await insertNewUser(req.body);
      res.status(201).send({
        id: id,
        links: {
          user: `/users/${id}`,
          admin: req.body.admin
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting user into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid user object."
    });
  }
});

/*
 * Route to get a user by ID.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {

  try {
    const authorizedSearch = await validateUserIdCombo(req.user, parseInt(req.params.id) );
    if(!authorizedSearch && !req.admin){
      res.status(403).send({
        error: "Unauthorized to access the specific resource"
      })
    } else {
      try {
        const user = await getUserById(parseInt(req.params.id), 0);
        if (user) {
          res.status(200).send(user);
        } else {
          next();
        }
      } catch (err) {
        console.error("-- Error:", err);
        res.status(500).send({
          error: "Unable to fetch user.  Please try again later."
        });
      }
    }
  } catch (err){
    res.status(500).send({
      error: "Unable to validate user id for logged in user. Try again later."
    });
  }
  
 
});



/*
 * Route to allow JWT-based user logins
 */

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUserEmail(
        req.body.email, 
        req.body.password
      );
      if (authenticated) {
        try {
          const admin = await isAdmin(req.body.email);
          console.log("is admin: ", admin);
          console.log("== LOGGED IN");
          const token = generateAuthToken(req.body.email, admin);
          res.status(200).send({
            token: token
          });
        } catch (err){
          res.status(500).send({
            error: "Could not perform admin validation."
          });
        }
        /*console.log("== LOGGED IN");
        const token = generateAuthToken(req.body.email);
        res.status(200).send({
          token: token
        });*/
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials"
        });
      }
      

    } catch (err) {
      res.status(500).send({
        error: "Error logging in.  Try again later."
      });
    }
  } else {
    res.status(400).json({
      error: "Request body needs user ID and password."
    });
  }
  
});


module.exports = router;
