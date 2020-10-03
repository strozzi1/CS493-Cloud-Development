const router = require('express').Router();
const validation = require('../lib/validation');

const reviews = require('../data/reviews');

const { getReviewPage, insertNewReview, deleteReviewByID, getReviewByID, updateReviewByID, checkForDupes } = require('../models/review');

exports.router = router;
exports.reviews = reviews;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};



router.get('/', async (req, res) =>{

  try {
    const reviewPage = await getReviewPage(
      parseInt(req.query.page) || 1
    );
    console.log("reviewPage: ", reviewPage);
    res.status(200).send(reviewPage);
  } catch (err) {
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching review page."
    });
  }

});

/*
 * Route to create a new review. DONE
 */
router.post('/', async (req, res, next) => {
  if (validation.validateAgainstSchema(req.body, reviewSchema)) {

    const review = validation.extractValidFields(req.body, reviewSchema);

    /*
     * Make sure the user is not trying to review the same business twice.
     */

    try{
      const dupCheck = await checkForDupes(review.userid, review.businessid)
      if (dupCheck){
        res.status(400).json({
          error: "Duplicate review"
        });
        
      }else{
        try{
       
          const id = await insertNewReview(req.body)
          res.status(201).json({
            id: id,
            links: {
              Review: `/reviews/${id}`
            }
          });
        }catch(err) {
          console.error(" -- error:", err);
          res.status(500).send({
            error: "Error inserting review"
          });
        }
      }
    }catch(err){
      res.status(500).json({
        error: "bad code"
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review. WORKS
 */
router.get('/:reviewID', async (req, res, next) => {
  const id = req.params.reviewID;
  
  try {
    const review = await getReviewByID(id)
    if (review) {
      
      res.status(200).json(review);
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to find review."
    });
  }
});

/*
 * Route to update a review.    DONE!
 */
router.put('/:reviewID', async (req, res, next) => {
  const id = req.params.reviewID;
  
  try {
    const review = await getReviewByID(id)
    if (review) {
      /////////////////////
      console.log("== Found Review: ", review);
      if (validation.validateAgainstSchema(req.body, reviewSchema) && (req.body.userid === review.userid) && (req.body.businessid === review.businessid)) {
        try {
          const updateSuccessful = await 
            updateReviewByID(id, req.body);
          if (updateSuccessful) {
            res.status(200).send({
              _id: id,
              body: req.body
            });
          } else {
            next();
          }
        } catch (err) {
          res.status(500).send({
            error: "Unable to update review."
          });
        }
      } else {
        res.status(400).send({
          err: "Request body does not contain a valid review."
        });
      }

      /////////////////////
      
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to find review."
    });
  }



  
});

/*
 * Route to delete a review. DONE!
 */
router.delete('/:reviewID', async (req, res, next) => {
  const id = req.params.reviewID;
  
  try {
    const deleteSuccessful = await deleteReviewByID(id)
    if (deleteSuccessful) {
       res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to delete review."
    });
  }
});
