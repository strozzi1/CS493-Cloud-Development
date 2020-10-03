const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');

const { generateAuthToken, requireAuthentication, checkAuthentication } = require('../lib/auth');

const fileTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/zip': 'zip',
    'application/pdf': 'pdf'         //probably how we will require assignments to be turned in
  };


const {
    assignmentSchema,
    submissionSchema,
    getAssignmentById,
    insertNewAssignment,
    deleteAssignmentById,
    patchAssignment,
    getSubmissionsPage,
    saveSubmissionFile,
    updateAssignmentSchema
} = require('../models/assignment');

const {
  getCourseById,
  validateAssignInstructorCombo
} = require('../models/course');




const { validateAgainstSchema } = require('../lib/validation');

const upload = multer({
    // dest: `${__dirname}/uploads`
    storage: multer.diskStorage({
      destination: `${__dirname}/uploads`,
      filename: (req, file, callback) => {       
        const filename = crypto.pseudoRandomBytes(16).toString('hex');
        const extension = fileTypes[file.mimetype];
        console.log("==file extention: ", extension);
        callback(null, `${filename}.${extension}`);
      }
    }),
    fileFilter: (req, file, callback) => {
      callback(null, !!fileTypes[file.mimetype]);
    }
  });

/****************
 * CREATE NEW ASSIGNMENT          DONE
 * Allow instructor to create a new assignment
 */

router.post('/', requireAuthentication, async (req, res) => {
  console.log("==req.body: ",req.body);
    if(validateAgainstSchema(req.body, assignmentSchema ) && 
    (req.role == 'admin' || req.role == 'instructor')){
    try{
      const id = await insertNewAssignment(req.body);
      res.status(201).send({
          id: id,
          links:{
              assignment: `/assignments/${id}`
          }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
          error: "Error inserting assignment into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Invalid body for post request. Check assignment fields and try again."
    });
  }
});


/****************
 * GET ASSIGNMENT INFO      DONE
*********/
router.get('/:id', async (req, res, next) => {
  try {
    let assignment = await getAssignmentById(req.params.id, false);
    console.log("== Assignment searched: ", assignment);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      console.log("-- No assignment found");
      next();
    }
  } catch (err) {
    console.error("  -- Error:", err);
    res.status(500).send({
      error: "Error fetching assignment. Try again later."
    });
  }
});




/****************
 * DELETE ASSIGNMENT BY ID   DONE
*********/


router.delete('/:id', requireAuthentication, async(req, res, next) =>{
  try{
    let assignment = await getAssignmentById(req.params.id, false);
    console.log("== Assignment to be deleted: ", assignment);
    console.log("== User: ", req.userId);
    if(assignment){
      try {
        const authorizedToDelete = await validateAssignInstructorCombo(assignment.courseId, req.userId);
        if(!authorizedToDelete && !(req.role == 'admin')){
          res.status(403).send({
            error: "The delete course request was not made by an authenticated User satisfying the authorization criteria."
          });
        } else {
          try {
            const deleteSuccessful = await deleteAssignmentById(req.params.id);
            if (deleteSuccessful) {
              res.status(204).end();
            } else {
              next();
            }
          } catch (err) {
            console.error(err);
            res.status(500).send({
              error: "Unable to delete assignment.  Please try again later."
            });
          }          
        }
      } catch (err){
        res.status(500).send({
          error: "Failure to validate userid of assignments courseId to logged in user, try again later."
        });
      }
    } else {
      res.status(404).send({
        error: "Assignment specified by courseId not found."
      });
    }    
  } catch (err) {
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    });
  }
});



/****************
 * UPDATE ASSIGNMENT     DONE
 * Allow instructor to update an existing assignment
 */

router.patch('/:id', requireAuthentication, async (req, res) => {
  console.log("==req.body: ",req.body);
  if(validateAgainstSchema(req.body, updateAssignmentSchema )){
    try {
      let assignment = await getAssignmentById(req.params.id, false);
      console.log("== Assignment to be deleted: ", assignment);
      console.log("== User: ", req.userId);
      if (assignment) {
        try {
          const authorizedToUpdate = await validateAssignInstructorCombo(assignment.courseId, req.userId);
          if(!authorizedToUpdate && !(req.role == 'admin')){
            res.status(403).send({
              error: "The delete course request was not made by an authenticated User satisfying the authorization criteria."
            });
          } else {
            
            try{
              const patchSuccess = await patchAssignment(req.params.id, req.body);
              if (patchSuccess){
                res.status(200).send({
                  updatedInfo: req.body,
                  links:{
                      assignment: `/assignments/${assignment._id}`
                  }
                });
              } else {
                next();
              }
            } catch (err) {
              console.error(err);
              res.status(500).send({
                  error: "Error inserting assignment into DB.  Please try again later."
              });
            }
            
          }
        } catch (err) {
          res.status(500).send({
            error: "Failure to validate userid of assignments courseId to logged in user, try again later."
          });
        }
      } else {
        res.status(404).send({
          error: "Assignment specified by courseId not found."
        });
      }
    } catch (err) {
      res.status(500).send({
        error: "Unable to fetch assignment.  Please try again later."
      });
    }
    
  } else {
    res.status(400).send({
      error: "Invalid body for post request. Check assignment fields and try again."
    });
  }
});



/****************
 * SUBMIT ASSIGNMENT SUBMISSION      DONE
 * Allow students to input a submission
 */

router.post('/:id/submissions', requireAuthentication, upload.single('submission'), async (req, res) => {
  var d = new Date();
  var timestamp = d.toISOString();
  console.log("== req.file:", req.file);
  console.log("==req.body: ", JSON.parse(JSON.stringify(req.body)));
  console.log("== user and time: ", req.userId, timestamp);
  req.body.timestamp = timestamp;
  if (validateAgainstSchema(JSON.parse(JSON.stringify(req.body)), submissionSchema) && req.file && (req.role == 'student')){
    const submission = {
      contentType: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      studentId: req.body.studentId,
      assignmentId: req.body.assignmentId,
      timestamp: timestamp
    }
    try {
      const id = await saveSubmissionFile(submission);
      res.status(200).send({
        id: id
      });
    }catch (err) {
      res.status(500).send({
        error: "Error inserting submission into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body needs 'file' submission from a student and required fields filled"
    });
  }
});





/****************
 * LIST ALL SUBMISSIONS FOR SPECIFIED ASSIGNMENT  need to add authorization  need to test 
 * Allow instructor to get a list of all student's submissions for an assignment
 */


router.get('/:id/submissions', requireAuthentication, async (req, res) => {
  
  let query = {}
  query['metadata.assignmentId'] = req.params.id
  if(req.query.studentId){
    query['metadata.studentId'] = req.query.studentId
  }
  try {
    /*
     * Fetch page info, generate HATEOAS links for surrounding pages and then
     * send response.
     */
    console.log("== query: ", query);
    const submissionsPage = await getSubmissionsPage(parseInt(req.query.page) || 1, query);
    submissionsPage.links = {};
    if (submissionsPage.page < submissionsPage.totalPages) {
      submissionsPage.links.nextPage = `${req.params.id}/submissions?page=${submissionsPage.page + 1}`;
      submissionsPage.links.lastPage = `${req.params.id}/submissions?page=${submissionsPage.totalPages}`;
    }
    if (submissionsPage.page > 1) {
      submissionsPage.links.prevPage = `${req.params.id}/submissions?page=${submissionsPage.page - 1}`;
      submissionsPage.links.firstPage = `${req.params.id}/submissions?page=1`;
    }
    res.status(200).send(submissionsPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching submissions list.  Please try again later."
    });
  }
});


module.exports = router;