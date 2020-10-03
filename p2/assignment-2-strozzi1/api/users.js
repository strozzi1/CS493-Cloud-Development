const router = require('express').Router();

exports.router = router;

const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
const { photos } = require('./photos');

const { getUsersBusinessPage, getUsersReviewPage, getUsersPhotoPage } = require('../models/user');

/*
 * Route to list all of a user's businesses. WORKS
 */
router.get('/:userid/businesses', async (req, res) => {
  const userid = parseInt(req.params.userid);
  try {
    const businessPage = await getUsersBusinessPage(
      parseInt(req.query.page) || 1, 
      userid
    );
    console.log("businessPage: ", businessPage);
    res.status(200).send(businessPage);
  } catch(err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching business page."
    });
  }

});

/*
 * Route to list all of a user's reviews. DONE
 */
router.get('/:userid/reviews', async (req, res) =>{
  const userid = parseInt(req.params.userid);
  try {
    const reviewPage = await getUsersReviewPage(
      parseInt(req.query.page) || 1, 
      userid
    );
    console.log("ReviewPage: ", reviewPage);
    res.status(200).send(reviewPage);
  } catch(err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching user's review page."
    });
  }
});

/*
 * Route to list all of a user's photos. DONE
 */
router.get('/:userid/photos', async (req, res) =>{
  const userid = parseInt(req.params.userid);
  try {
    const photoPage = await getUsersPhotoPage(
      parseInt(req.query.page) || 1, 
      userid
    );
    console.log("PhotoPage: ", photoPage);
    res.status(200).send(photoPage);
  } catch(err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching user's photo page."
    });
  }
});
