/*
 * User schema and data accessor methods.
 */
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema for a User.
 */
const UserSchema = {
 name: { required: true },
 email: { required: true },
 password: { required: true },
 role: { required: true }
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(user, UserSchema);
  console.log("  -- userToInsert:", userToInsert);
  userToInsert.password = await bcrypt.hash(
    userToInsert.password,
    8
  );
  console.log("  -- userToInsert after hash:", userToInsert);
  // insert into db
  const db = getDBReference();
  const collection = db.collection('users');
  const result = await collection.insertOne(userToInsert);
  return result.insertedId;
};

/*
 * Fetch a user from the DB based on user ID.
 */
exports.getUserById = async function (id, includePassword) {
  const db = getDBReference();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const projection = includePassword ? {} : { password: 0};
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray();
    return results[0];
  }
};

/*
 * Fetch a user from the DB based on user email.
 */
exports.getUserByEmail = async function (email, includePassword) {
  const db = getDBReference();
  const collection = db.collection('users');
  const projection = includePassword ? {} : { password: 0};
  const results = await collection
    .find({ email: email })
    .project(projection)
    .toArray();
  return results[0];
};

/*
 * Fetch a user priveleges from the DB based on user email.
 */
exports.getUserPriveleges = async function (email) {
  const db = getDBReference();
  const collection = db.collection('users');
  const results = await collection
    .find({ email: email })
    .project({ role: 1 })
    .toArray();
  return results[0];
};

/*
 * Validate User log in info.
 */
exports.validateUser = async function (email, password) {
  const user = await exports.getUserByEmail(email, true);
  return user &&
    await bcrypt.compare(password, user.password);
};

exports.getCoursesByInstructorId = async function (id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ instructorId: new ObjectId(id) })
      .project({ _id: 1 })
      .map(course => course._id)
      .toArray();
    return results;
  }
};

exports.getEnrolledCoursesByStudentId = async function (id) {
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ students: new ObjectId(id) })
      .project({ _id: 1 })
      .map(course => course._id)
      .toArray();
    return results;
  }
};
