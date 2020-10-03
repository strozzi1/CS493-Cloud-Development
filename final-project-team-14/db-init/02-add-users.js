db.users.createIndex(
  { "email": 1 },
  { unique: true }
);
db.users.insertMany([
    {
        "_id" : ObjectId("5eded3ed6a323c2bc9e5c9c9"), //"4",
        "name" : "Joshua Strozzi",
        "email" : "strozzij@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "student"
    },
    {
        "_id" : ObjectId("5eded40cdd189430a3ee6086"),//"5",
        "name" : "Dakota Alton",
        "email" : "dalton@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "student"
    },
    {
        "_id" : ObjectId("5eded42b540176a5f62490ae"),//"1",
        "name" : "Martin Nguyen",
        "email" : "mnguyen@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "student"
    },
    {
        "_id" : ObjectId("5eded43f1ad4cdd1c4317082"), // "3",
        "name" : "Jennifer Schultz",
        "email" : "jschultze@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "instructor"
    },
    {
        "_id" : ObjectId("5eded4510b590af3bb5684db"), //"6",
        "name" : "Amber Johnson",
        "email" : "jamber@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "student"
    },
    {
        "_id" : ObjectId("5eded460d68e2f3ae830cee1"), //"2",
        "name" : "Timothy Daniels",
        "email" : "tdaniels@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "instructor"
    },
    {
        "_id" : ObjectId("5eded46dbcfa3cf46c28a759"), //"7",
        "name" : "Rachel Valentino",
        "email" : "rvalent@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "student"
    },
    {
        "_id" : ObjectId("5eded479bbda9ee2edfc8895"), //"10",
        "name" : "Hussein Jamal",
        "email" : "husseinj@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role" : "admin"
    },
    {
        "_id" : ObjectId("5eded4851ab5b6af90d7b3a0"), //"8",
        "name" : "Rob Hess",
        "email" : "hessro@oregonstate.edu",
        "password" : "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        "role": "instructor"
    }

]);
