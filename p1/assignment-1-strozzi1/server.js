const express = require('express');
const paginate = require('express-paginate');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());

const businessData = require('./businesses.json');
console.log("== Businesses data:", businessData);

/*
* Middleware functions
*/


/************* Test: Hello World!  **************/
app.get('/', function (req, res, next) {
    console.log("== Got a request");
    res.status(200).send("Hello world!");
});


/****************** Get all businesses ******************/
app.get('/businesses', function (req, res, next) {
    res.status(200).send({
      businesses: businessData.businesses
    });
});

/****************** Get all reviews ******************/
app.get('/reviews', function (req, res, next) {
    res.status(200).send({
      reviews: businessData.reviews
    });
});

/****************** Get all photos ******************/
app.get('/photos', function (req, res, next) {
    res.status(200).send({
      photos: businessData.photos
    });
});

/****************** Get all users ******************/
app.get('/users', function (req, res, next) {
    res.status(200).send({
      users: businessData.users
    });
});


/****************** Get a specific photo ******************/
app.get('/photos/:photoID', function (req, res, next) {
    console.log("== Find specific photo:, ", req.params);
    let photos= businessData.photos;
    var result = photos.find(pho => pho!=null && pho.photo_id == req.params.photoID)
    if(results){
        res.status(200).send({
            photo: result
        });
    }
    else{
        next();
    }
});

/****************** Add a business to list of all businesses ******************/
app.post('/businesses', function (req, res, next) {
    console.log(req.body);
    //here's where we'd grab handle business and owner ids
    if (req.body && req.body.name && req.body.address && req.body.city && req.body.state && req.body.zipcode && req.body.phone && req.body.category) {
        if(!req.body.email){req.body.email="";}
        if(!req.body.website){req.body.website="";}
        businessData.businesses.push(req.body);
      res.status(201).send({
        id: businessData.businesses.length - 1
      });
    } else {
      res.status(400).send({
        err: "Request doesn't have required fields"
      })
    }
});


/************************ Add a review to a business ****************/
app.post('/businesses/:id/reviews', function (req, res, next) {
    console.log("== req.params:", req.params);
    const id = req.params.id;
    
    let business = businessData.businesses.find(business => business!=null && business.business_id == req.params.id);
    console.log("== Add review - valid business: ", business);
    if (business && req.body && req.body.stars && req.body.pricing && req.body.review_id && req.body.business_id && req.body.user_id) {
      businessData.reviews.push(req.body);
      res.status(201).send({
        id: businessData.reviews.length - 1
      });
    } else {
      res.status(400).send({
        err: "Add review request doesn't have required fields"
      })
    }
});



/************************ Add a photo to a business ****************/
app.post('/businesses/:id/photos', function (req, res, next) {
    console.log("== add photo - req.params:", req.params);
    const id = req.params.id;
    
    let business = businessData.businesses.find(business => business!=null && business.business_id == req.params.id);
    console.log("== Add photo - valid business: ", business);
    if (business && req.body && req.body.image_url) {
        if(!req.body.caption){req.body.caption = "";}    
        businessData.photos.push(req.body);
        res.status(201).send({
            id: businessData.photos.length - 1
        });
        } else {
        res.status(400).send({
            err: "Add photo request doesn't have required fields"
        })
    }
});

/*
 * /businesses/{id}
 */
/****************** Get business of specified id ******************/
app.get('/businesses/:id', function (req, res, next) {
    console.log("== req.params:", req.params);
    const id = req.params.id;
    
    let business = businessData.businesses.find(business => business!=null && business.business_id == req.params.id);
    if (!business){ next();}
    let reviews= businessData.reviews;
    if(reviews)
        var reviewList = reviews.filter(reviews => reviews!=null && reviews.business_id == id);
    console.log("== Reviews: ", reviewList);
    let photos = businessData.photos;
    if(photos)
        var photoList = photos.filter(photos => photos!=null && photos.business_id == business.business_id);
    
    console.log("== Photos: ", photos);
    if(business){    
        if(reviews){
            if (photoList.length >0){
                
                res.status(200).send({
                    business: business,
                    reviews: reviewList,
                    photos: photoList
                })
            }else{
                
                res.status(200).send({
                    business: business,
                    reviews: reviewList
                })
            }
        }else{
            res.status(200).send(business)
        }
    } else {
      next();
    }
});


/*********************Get all businesses of a user **************/
app.get('/users/:id/businesses', function (req, res, next) {
    console.log("== req.params:", req.params);
    const id = req.params.id;
    
    let user = businessData.users.find(user => user!= null && user.user_id == req.params.id);
    if(!user){ next();   }
    console.log("== Owner: ", user)
    let businesses= businessData.businesses;
    var businessList = businesses.filter(bus => bus!=null && bus.owner_id == id)
    console.log("== Businesses: ", businesses);
    console.log("businesslist: ", businessList )
    if(user){    
        res.status(200).send({businesses: businessList})
    }else {
      next();
    }
});


/*********************Get all reviews of a user **************/
app.get('/users/:id/reviews', function (req, res, next) {
    console.log("== req.params:", req.params);
    const id = req.params.id;
    
    let user = businessData.users.find(user => user!= null && user.user_id == req.params.id);
    if(!user){ next();   }
    console.log("== Owner: ", user)
    let reviews= businessData.reviews;
    var reviewsList = reviews.filter(rev => rev!=null && rev.user_id == id)
    
    if(user){    
        res.status(200).send({reviews: reviewsList})
    }else {
      next();
    }
});


/*********************Get all photos of a user **************/
app.get('/users/:id/photos', function (req, res, next) {
    console.log("== req.params:", req.params);
    const id = req.params.id;
    
    let user = businessData.users.find(user => user!= null && user.user_id == req.params.id);
    if(!user){ next(); }
    console.log("== Owner: ", user)
    let photos= businessData.photos;
    var photosList = photos.filter(pho => pho!=null && pho.user_id == id)
    
    if(user){    
        res.status(200).send({photos: photosList})
    }else {
      next();
    }
});


/****************** Modify information of business with specified ID ******************/
app.put('/businesses/:id', function (req, res, next) {
    console.log("== Modify Business req.params:", req.params);
    const id = req.params.id;
    
    let business = businessData.businesses.find(business => business.business_id == req.params.id);
    //console.log("== Business info: ", business);
    let index = businessData.businesses.findIndex(business => business.business_id == req.params.id);
    console.log("== Modify business index: ", index);
    if(business){
        console.log("== Modify business: index and business exist");    
        if (req.body && req.body.name && req.body.address && req.body.city && req.body.state && req.body.zipcode && req.body.phone && req.body.category) {
            console.log("== Modify business has required data");
            businessData.businesses[index] = req.body
            
            res.status(200).json({
                links: {
                    business: '/businesses/' + business.business_id
                }
            })
        } else {
            res.status(400).json({
                err: "Request needs a JSON body with a name field"
            });
        }
        
    } else {
        next();
    }
});


/****************** Modify Review ******************/
app.put('/users/:userID/reviews/:reviewID', function (req, res, next) {
    console.log("== Modify Business req.params:", req.params);
    let user = businessData.users.find(user => user!=null && user.user_id == req.params.userID);
    if(!user){next();}
    console.log("== User info: ", user);
    
    let reviews = businessData.reviews;
    if(reviews){
        var review = reviews.find(rev => rev!=null && rev.user_id == req.params.userID && rev.review_id == req.params.reviewID);
        console.log("== if review found: ", review)
    } else { next(); }
        
    if(review){
        let index = businessData.reviews.findIndex(rev => rev!=null && rev.review_id == review.review_id);
        if(req.body && req.body.stars && req.body.pricing && req.body.review){
            console.log("== Modify review has required data");
            businessData.reviews[index] = req.body
            
            res.status(200).json({
                links: {
                    review: '/reviews/' + review.review_id
                }
            })

        }else{
            res.status(400).json({
                err: "Request needs a JSON body with all fields"
            });
        }
    } else {
        next();
    }
});



/****************** Modify Specific Users Specific Business ******************/
app.put('/users/:userID/businesses/:businessID', function (req, res, next) {
    console.log("== Modify Business req.params:", req.params);
    let user = businessData.users.find(user => user!=null && user.user_id == req.params.userID);
    if(!user){next();}
    console.log("== User info: ", user);
    
    let businesses = businessData.businesses;
    if(businesses){
        var business = businesses.find(bus => bus!=null && bus.owner_id == req.params.userID && bus.business_id == req.params.businessID);
        console.log("== if business found: ", business)
    } else { next(); }
        
    if(business){
        let index = businessData.businesses.findIndex(bus => bus!=null && bus.business_id == business.business_id);
        if (req.body && req.body.name && req.body.address && req.body.city && req.body.state && req.body.zipcode && req.body.phone && req.body.category) {
            if(!req.body.email){req.body.email="";}
            if(!req.body.website){req.body.website="";}
            console.log("== Modify business has required data");
            businessData.businesses[index] = req.body
            
            res.status(200).json({
                links: {
                    business: '/businesses/' + business.business_id
                }
            })

        }else{
            res.status(400).json({
                err: "Request needs a JSON body with all fields"
            });
        }
    } else {
        next();
    }
});

/****************** Modify photo ******************/
app.put('/users/:userID/photos/:photoID', function (req, res, next) {
    console.log("== Modify Business req.params:", req.params);
    let user = businessData.users.find(user => user!=null && user.user_id == req.params.userID);
    if(!user){next();}
    console.log("== User info: ", user);
    
    let photos = businessData.photos;
    if(photos){
        var photo = photos.find(pho => pho!=null && pho.user_id == req.params.userID && pho.photo_id == req.params.photoID);
        console.log("== if photo found: ", photo)
    } else { next(); }
        
    if(photo){
        let index = businessData.photos.findIndex(pho => pho!=null && pho.photo_id == photo.photo_id);
        if(!index && req.body && req.body.image_url && req.body.caption){
            console.log("== Modify photo has required data");
            businessData.photos[index] = req.body
            
            res.status(200).json({
                links: {
                    photo: '/photos/' + photo.photo_id
                }
            })

        }else{
            res.status(400).json({
                err: "Request needs a JSON body with all fields"
            });
        }
    } else {
        next();
    }
});

/****************** Delete a business ******************/
app.delete('/businesses/:id', function (req, res, next) {
    console.log("== delete business req.params:", req.params);
    let business = businessData.businesses.find(business =>business!=null && business.business_id == req.params.id);
    if(!business){next();}
    console.log("== Business info: ", business);
    let index = businessData.businesses.findIndex(business => business.business_id == req.params.id);
    console.log("== index to delete = ", index)
    if(businessData.businesses[index]){   
        businessData.businesses[index]=null; 
        res.status(204).end();
    } else {
      next();
    }
});

/*********Delete Review *********/
app.delete('/reviews/:id', function (req, res, next) {
    console.log("== req.params:", req.params);
    let review = businessData.reviews.find(review => review!=null && review.review_id == req.params.id);
    if(!review){next();}
    console.log("== Business info: ", review);
    let index = businessData.reviews.findIndex(review => review.review_id == req.params.id);
    console.log("== review index to delete = ", index)
    if(businessData.reviews[index]){   
        businessData.reviews[index]=null; 
        res.status(204).end();
    } else {
      next();
    }
});


/*********Delete a specific users specific photo *********/
app.delete('/users/:userID/photos/:photoID', function (req, res, next) {
    console.log("== req.params:", req.params);
    let user = businessData.users.find(user => user!=null && user.user_id == req.params.userID);
    if(!user){next();}
    console.log("== User info: ", user);
    
    let photos = businessData.photos;
    if(photos)
        var photo = photos.find(photos => photos!=null && photos.user_id == req.params.userID && photos.photo_id == req.params.photoID);
    if(photo){
        let index = businessData.photos.findIndex(pho => pho.photo_id == photo.photo_id);       
        businessData.photos[index]=null; 
        res.status(204).end();
    } else {
      next();
    }
});


/******************  ******************/
app.use(function (req, res, next) {
    console.log("== Inside this middle middleware function");
    next();
});

/****************** Failed ******************/
app.use('*', function (req, res, next) {
    res.status(404).send({
        err: `${req.originalUrl} doesn't exist`
    });
});

app.listen(8000, function () {
    console.log("== Server is listening on port 8000");
});