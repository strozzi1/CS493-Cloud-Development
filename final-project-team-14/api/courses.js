const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const { checkValidId } = require('../lib/mongo');
const stringify = require('csv-stringify');
const multer = require('multer');

const { generateAuthToken, requireAuthentication, checkAuthentication } = require('../lib/auth');


const {
    courseSchema,
    getStudents,
    updateEnrollment,
    getAssignments,
    getRoster,
    getCourseById,
    validateAssignInstructorCombo,
    deleteCourseById,
    patchCourse,
    insertNewCourse,
    getCoursesPage
} = require('../models/course');


/**
 * FETCH COURSE LIST        DONE
 * Fetch list of courses using different url params
 * 
 */


router.get('/', async (req, res) => {
    //console.log("==req.query:", req.query)
    const {subject, number, term} = req.query;
    let query = {};
    if(subject) {query.subject = subject;}
    if(number) {query.number = number;}
    if(term) {query.term = term;}
    console.log("==query: ", query);
    
    try {
      /*
       * Fetch page info, generate HATEOAS links for surrounding pages and then
       * send response.
       */
      const coursesPage = await getCoursesPage(parseInt(req.query.page) || 1, query);
      coursesPage.links = {};
      if (coursesPage.page < coursesPage.totalPages) {
        coursesPage.links.nextPage = `/courses?page=${coursesPage.page + 1}`;
        coursesPage.links.lastPage = `/courses?page=${coursesPage.totalPages}`;
      }
      if (coursesPage.page > 1) {
        coursesPage.links.prevPage = `/courses?page=${coursesPage.page - 1}`;
        coursesPage.links.firstPage = '/courses?page=1';
      }
      res.status(200).send(coursesPage);
    } catch (err) {
        console.error("  -- Error:", err);
        res.status(500).send({
            error: "Error fetching courses list.  Please try again later."
        });
    }
  });



/**
 * INSERT NEW COURSE        DONE
 */
router.post('/', requireAuthentication, async (req, res) => {
    console.log("==req.body: ",req.body);
    if(validateAgainstSchema(req.body, courseSchema ) && (req.role == 'admin')){
        try{
            const id = await insertNewCourse(req.body);
            res.status(201).send({
                id: id,
                links:{
                    course: `/courses/${id}`
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).send({
                error: "Error inserting course into DB.  Please try again later."
            });
        }
    } else {
        res.status(400).send({
            error: "Invalid body for post request. Check course fields and try again."
        });
    }
});




/****************
 * GET COURSE INFO   DONE
*********/
router.get('/:id', async (req, res, next) => {
    try {
        let course = await getCourseById(req.params.id, false);
        console.log("== Course searched: ", course);
        if (course) {
            res.status(200).send(course);
        } else {
            res.status(404).send({
                error: "Course not found, check course id and try again."
            });
        }
    } catch (err) {
        console.error("  -- Error:", err);
        res.status(500).send({
            error: "Error fetching course. Try again later."
        });
    }
});




router.get('/:id/students', [requireAuthentication, checkValidId("params", "id")], async (req, res) => {
    const result = await getStudents(req.params.id, req.userId, req.role);
    
    if (result.error) {
        res.status(result.status).send({
            error: result.error
        });
    } else {
        res.status(result.status).send({
            students: result.students

        });
    }
});




/****************
 * PATCH COURSE INFO   DONE
*********/
router.patch('/:id', requireAuthentication, async (req, res) => {
    console.log("==req.body: ",req.body);
    if(validateAgainstSchema(req.body, courseSchema )){
        try{
            const course = await getCourseById(req.params.id)//check if instructor id matches course instructorId
            console.log("== Course being patched: ", course);
            if (course){
                if(req.userId == course.instructorId || req.role == 'admin'){
                    try{
                        const patchSuccess = patchCourse(req.params.id, req.body);
                        if (patchSuccess){
                            res.status(200).send({
                              updatedInfo: req.body,
                              links:{
                                  course: `/courses/${course._id}`
                              }
                            });
                          } else {
                            next();
                          }
                    } catch (err){
                        console.error("  -- Error:", err);
                        res.status(500).send({
                            error: "Error patching course. Try again later."
                        });
                    }
                } else {
                    res.status(403).send({
                        error: "The request was not made by an authenticated User satisfying the authorization criteria."
                    });
                }
            }else{
                res.status(404).send({
                    error: "Course of specified id not found"
                });
            }
        
        }catch (err){
            console.error("  -- Error:", err);
            res.status(500).send({
                error: "Error fetching course. Try again later."
            });
        }
    } else {
        res.status(400).send({
            error: "The request body was either not present or did not contain any fields related to Course objects."
        });
    }
});



router.post('/:id/students', [requireAuthentication, checkValidId("params", "id")], async (req, res) => {
    const delta = {
        add: req.body.add || [],
        remove: req.body.remove || []
    };

    if (delta.add || delta.remove) {
        const result = await updateEnrollment(req.params.id, req.userId, req.role, delta);
        
        if (result.error) {
            res.status(result.status).send({
                error: result.error
            });
        } else {
            res.status(200).send({});
        }

    } else {
        res.status(400).send({
            error: "Body requires lists of students to add and/or remove"

        });
    }
});



/**
 * DELETE COURSE BY ID   need to test
 */

router.delete('/:id', requireAuthentication, async(req, res, next) =>{
    if(req.role == 'admin'){
        try{
            const course = await getCourseById(req.params.id);
            if(course){
                try{    
                    const deleteSuccess = await deleteCourseById(req.params.id);
                    if(deleteSuccess){
                        res.status(204).end();
                    } else { 
                        next(); 
                    }
                }catch(err){
                    console.error("  -- Error:", err);
                    res.status(500).send({
                        error: "Error deleting course. Try again later."
                    });
                }
            } else {
                res.status(404).send({
                    error: "Course with specified id not found"
                });
            }
        } catch(err){
            console.error("  -- Error:", err);
            res.status(500).send({
                error: "Error finding course. Try again later."
            });
        }
    } else {
        res.status(403).send({
            error: "Delete course request was made by an unauthorized user."
        });
    }
});



router.get('/:id/roster', [requireAuthentication, checkValidId("params", "id")], async (req, res) => {
    const result = await getRoster(req.params.id, req.userId, req.role);

    if (result.error) {
        res.status(result.status).send({
            error: result.error
        });
    } else {
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');

        stringify(
            result.roster, 
            { header: false }
        )
        .pipe(res);
    }
});

router.get('/:id/assignments', async (req, res) => {
    const result = await getAssignments(req.params.id);
    // console.log(result);
    // console.log("asdf");
    if (result.error) {
        res.status(result.status).send({
            error: result.error
        });
    } else {
        res.status(200).send({
            assignments: result.assignments
        });
    }
});

module.exports = router;