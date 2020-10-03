const { ObjectId, GridFSBucket } = require('mongodb');
const fs = require('fs');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const { asyncForEach } = require('../lib/util');

const courseSchema = {
    subject: {required:true},
    number: {required: true},
    title: {required: true},
    term: {required: true},
    instructorId: {required: true}
  };
exports.courseSchema = courseSchema;



async function getCourseById(id){
    const db = getDBReference();
    const collection = db.collection('courses');
    const course =  await collection.find({
        _id: new ObjectId(id)
    }).project({students: 0}).toArray();

    return course[0];
}
exports.getCourseById = getCourseById;


async function patchCourse(courseId, newDetails) {
    const validatedCourse = extractValidFields(newDetails, exports.courseSchema);
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.replaceOne(
        {_id: new ObjectId(courseId)},
        validatedCourse
    );
    return result.matchedCount > 0;
}
exports.patchCourse = patchCourse;

async function validateAssignInstructorCombo(assignmentCourseId, userId) {
    const course = await exports.getCourseById(assignmentCourseId);
    return (course.instructorId == userId);
}
exports.validateAssignInstructorCombo = validateAssignInstructorCombo;



exports.getCoursesPage = async function (page, queries) {
    const pageSize = 10;


    const db = getDBReference();
    const collection = db.collection('courses');

    const count = await collection.countDocuments();
    const lastPage = Math.ceil(count / pageSize);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;
    const offset = (page - 1) * pageSize;

    const results = await collection.find(queries)
        .project({students: 0})
        .sort({ _id: 1 })
        .skip(offset)
        .limit(pageSize)
        .toArray();

    return {
        courses: results,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: pageSize,
        totalCount: results.length
    };
};



async function insertNewCourse(course) {
    newCourse = extractValidFields(course, courseSchema);
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.insertOne(newCourse);
    return result.insertedId;
}
exports.insertNewCourse = insertNewCourse;



async function deleteCourseById(id) {
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = await collection.deleteOne({
        _id: new ObjectId(id)
    });

    return result.deletedCount >0;
}
exports.deleteCourseById = deleteCourseById;


async function getCourseById(courseid) {
    const db = getDBReference();
    const collection = db.collection('courses');
    const result = collection.findOne({
        _id: new ObjectId(courseid)
    });
    return result;
}

async function removeStudents(courseId, remove) {
    const db = getDBReference();
    const collection = db.collection('courses');
    
    console.log(remove);

    await collection.updateOne(
        { _id: new ObjectId(courseId) },
        { $pullAll: { students: remove } }
    );
}

async function addStudents(courseId, add) {
    const db = getDBReference();
    const collection = db.collection('courses');

    await collection.updateOne(
        { _id: new ObjectId(courseId) },
        { $push: { students: { $each: add.map(elem => new ObjectId(elem)) } } }
    );
}

async function getAssignmentsByCourseId(courseId) {
    const db = getDBReference();
    const collection = db.collection('assignments');

    const results = await collection.find({
        courseId: new ObjectId(courseId)
    }).toArray();

    return results.map(elem => elem._id.valueOf());
}

exports.getStudents = async (courseId, userId, userRole) => {
    const course = await getCourseById(courseId);

    if (course) {
        if (userRole == "admin" || course.instructorId.valueOf() == userId) {
            return {
                status: 200,
                students: course.students.map(elem => elem.valueOf())
            };
        } else {
            return {
                status: 403,
                error: "You are not authorized to access this resource"
            };
        }
    } 

    return {
        status: 404,
        error: `course ${courseId} not found`
    };
};

exports.updateEnrollment = async (courseId, userId, userRole, delta) => {
    const course = await getCourseById(courseId);

    if (course) {
        if (userRole == "admin" || course.instructorId.valueOf() == userId) {
            console.log(delta);
            await removeStudents(courseId, delta.remove);
            await addStudents(courseId, delta.add);
            
            return {
                status: 200
            };
        } else {
            return {
                status: 403,
                error: "You are not authorized to access this resource"
            };
        }
    } 

    return {
        status: 404,
        error: `course ${courseId} not found`
    };
};

exports.getRoster = async (courseId, userId, userRole) => {
    const course = await getCourseById(courseId);

    if (course) {

        if (userRole == 'admin' || userId == course.instructorId) {
            const db = getDBReference();
            const collection = db.collection('users');

            let roster = [];

            await (async () => {
                await asyncForEach(course.students, async studentId => {
                    const student = await collection.findOne({
                        _id: studentId
                    });
                    roster.push({
                        id: studentId,
                        name: student.name,
                        email: student.email
                    });
                })
            })();

            return {
                roster: roster
            };
        } else {
            return {
                status: 403,
                error: 'you are not authorized to access this resource'
            };
        }
    } else {
        return {
            status: 404,
            error: `course ${courseId} not found`
        };
    }
};

exports.getAssignments = async (courseId) => {

    if (!ObjectId.isValid(courseId)) {
        return {
            status: 403,
            error: 'invalid id'
        };
    }

    const results = await getAssignmentsByCourseId(courseId);
    
    if (results) {
        return {
            status: 200,
            assignments: results
        };
    } else {
        return {
           status: 404,
           error: 'resource not found' 
        };
    }
};

