const bcrypt = require('bcryptjs');

/*
 * Business schema and data accessor methods;
 */
const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');


/*
 * Schema describing required/optional fields of a user object.
 */
const UserSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    admin: { required: false}
};
  exports.UserSchema = UserSchema;


async function insertNewUser(user) {
    user = extractValidFields(user, UserSchema);
    
    const passwordHash = await bcrypt.hash(user.password, 8);
    user.password = passwordHash;

    const [ result ] = await mysqlPool.query(
        'INSERT INTO users SET ?',
        user
    );

return result.insertId;
}
exports.insertNewUser = insertNewUser;


async function getUserById(id, includePassword){
    //const projection = includePassword ? {} : { password: 0 };
    /*if(includePassword){
        const [ results ] = await mysqlPool.query(
            'SELECT * FROM users WHERE id = ?',
            [ id ]
        );
    }
    else{
        const [ results ] = await mysqlPool.query(
            'SELECT name, email FROM users WHERE id = ?',
            [ id ]
        );
    }*/
    const [results] = includePassword ? await mysqlPool.query(
        'SELECT * FROM users WHERE id = ?',
        [ id ]
    ) : await mysqlPool.query(
        'SELECT name, email FROM users WHERE id = ?',
        [ id ]
    );
    return results[0];
} 
exports.getUserById=getUserById;


async function getUserByEmail(email){
    const [ results ] = await mysqlPool.query(
        'SELECT * FROM users WHERE email = ?',
        [ email ]
    );
    
    return results[0];
}
exports.getUserByEmail = getUserByEmail;


exports.validateUser = async function(id, password){
    const user = await exports.getUserById(id, true);
    return user && await bcrypt.compare(password, user.password);
};

exports.validateUserEmail = async function(email, password){
    const user = await exports.getUserByEmail(email);
    return user && await bcrypt.compare(password, user.password);
};

exports.validateUserIdCombo = async function(email, id){
    const user = await exports.getUserById(id);
    return (user.email == email);
};


exports.isAdmin = async function(email){
    const user = await exports.getUserByEmail(email);
    return user.admin;
}


