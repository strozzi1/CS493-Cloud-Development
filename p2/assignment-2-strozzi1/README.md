# Assignment 2

**Assignment due at 11:59pm on Monday 5/4/2020**

**Demo due by 11:59pm on Monday 5/18/2020**

The goals of this assignment are to start to use a database to store application data and to use Docker Compose to define a multi-container specification for our API application.  There are a few parts to this assignment, as described below.

You are provided some starter code in this repository that implements a solution to assignment 1.  The starter code's API server is implemented in `server.js`, and individual routes are modularized within the `api/` directory.  Postman tests for the API are included in the `tests/` directory.  The starter code also includes an `openapi.yaml` file in the `public/` directory.  You can import this file into the OpenAPI editor at https://editor.swagger.io/ to generate documentation for the server to see how its endpoints are set up.  Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 1 as your starting point if you like.

## 1. Use a database to power your API

Next modify the API server to use a database to store the following resources:
  * Businesses
  * Reviews
  * Photos

You may choose either MySQL or MongoDB for this purpose.  Whichever database you choose, it should completely replace the starter code's existing JSON/in-memory storage for these resources.  In other words, all API endpoints in the original starter code should use your database.

You should use the [official MySQL Docker image](https://hub.docker.com/_/mysql/) or the [official MongoDB Docker image](https://hub.docker.com/_/mongo) from Docker Hub to power your database.  Whichever database you choose, your implementation should satisfy the criteria described below.

### Database initialization

You should use the mechanisms described below to automatically initialize your database when starting your application from scratch.

#### MySQL

If you're using MySQL, you should make sure to set the following environment variables when launching your database container:
  * `MYSQL_ROOT_PASSWORD` - This specifies the password that is set for the MySQL `root` user.
  * `MYSQL_DATABASE` - This specifies the name of a MySQL database to be created when your container first starts.
  * `MYSQL_USER` and `MYSQL_PASSWORD` - These are used to create a new user, in addition to the `root` user, who will have permissions only for the database named in `MYSQL_DATABASE`.  This is the user you should use to connect to your database from your API server.

In addition, you should also write a script (i.e. a `.sql` file) to initialize your MySQL database the first time you launch your container.  See the [MySQL Docker Image Docs](https://docs.docker.com/samples/library/mysql/#initializing-a-fresh-instance) for a description of how this works.  Your database initialization should, at a minimum, create all of the tables you'll need for your API.  If you like, you can also put some initial data into your database.  One easy way to create this file is to manually initialize a database with the tables (and, optionally, initial data) you need and then [create a dump of that database](https://docs.docker.com/samples/library/mysql/#creating-database-dumps).  Once the script is created, put it into a host-machine directory that you bind mount to the directory `/docker-entrypoint-initdb.d/` in your container.

#### MongoDB

If you're using MongoDB, you should make sure to set the following environment variables when launching your database container:
  * `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_USERNAME` - These are used to create the MongoDB `root` user.
  * `MONGO_INITDB_DATABASE` - This specifies the name of a MongoDB database to be created when your container first starts.

In addition, you should also write a script (i.e. a `.js` file) to initialize your MongoDB database the first time you launch your container.  Your database initialization script should, at a minimum, create a new, low-privileged user to use to connect to your database from your API server.  If you like, you can also put some initial data into your database.  Your initialization script will use the same syntax as is used to run commands in the MongoDB shell (e.g. `db.createUser(...)`, `db.collection.insert(...)`, etc.).  Once the script is created, put it into a host-machine directory that you bind mount to the directory `/docker-entrypoint-initdb.d/` in your container.

### Database organization

Your database should store all resource data (i.e. businesses, photos, and reviews) for the API.  Because the resources you're working with are closely tied (e.g. each review is tied to both a specific business and a specific user), you'll have to think carefully about how you organize and access them in your database.  Some suggestions are included below for each database.

#### MySQL

If you're using MySQL, you will likely want to use [foreign keys](https://dev.mysql.com/doc/refman/8.0/en/example-foreign-keys.html) to link reviews and photos to their corresponding business, and when gathering data for a specific business (i.e. for the `GET /businesses/{id}` endpoint), you can either use [`JOIN` operations](http://www.mysqltutorial.org/mysql-join/) or run multiple queries to fetch the corresponding reviews and photos.

#### MongoDB

If you're using MongoDB, there are many valid ways to organize data in your database.  For example, you could use three separate collections to store businesses, reviews, and photos.  In this case, you can either use [`$lookup` aggregation](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) or multiple queries to gather data for a specific business (i.e. for the `GET /businesses/{id}` endpoint).

Alternatively, you could store all photos and reviews as subdocuments of their corresponding business document.  In this case, you'll likely want to use [a projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/) to omit the photo and review data from businesses when returning a list of all businesses (i.e. from the `GET /businesses` endpoint).  You'll also have to think carefully about how you find data for a specific user, e.g. a specific user's photos or reviews.  Do do this, you can use [subdocument array queries](https://docs.mongodb.com/manual/tutorial/query-array-of-documents/) to select businesses with reviews/photos by the specified user, and then you can use some custom JS to select only matching reviews/photos from those businesses.  Alternatively, you can use MongoDB's [aggregation pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/) to structure a single query to fetch exactly the reviews/photos you're interested in.

### Data persistence

Whichever database you use, the data backing it should be persisted in a Docker volume.  By default, MySQL stores data in the directory `/var/lib/mysql`, and MongoDB stores data in the directory `/data/db`.  To persist data, it should be sufficient to create a Docker volume and mount it at the appropriate one of these locations in your database container.

### API server setup

Your API server should read the location (i.e. hostname, port, and database name) and credentials (i.e. username and password) of your database server from environment variables.  Using this setup, you should be able to launch an API server container and a MySQL/MongoDB container on the same Docker network and specify the correct environment variables to have your API server use the database in the MySQL/MongoDB container.

## 3. Use Docker Compose to specify your two-container application

Finally, write a Docker Compose specification in `docker-compose.yml` that defines your two-container (API server and database) application.  Your specification should define everything needed to run the application, e.g. a Docker network, a Docker volume, environment variables, published ports, etc.  In other words, you should be able to launch and run your complete application from scratch (e.g. on a different machine) using Docker Compose.

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the master branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the master branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp20/assignment-2-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

* 80 points: API server is modified to use MySQL or MongoDB to store businesses, reviews, and photos, as described above (supporting all API endpoints originally included in the starter code)
  * 10 points: database container is correctly initialized from scratch using appropriate environment variables and an initialization script
  * 40 points: API correctly stores and fetches individual businesses, photos, and reviews, without consideration for links between these resources
  * 20 points: API correctly deals with linked resources, for example, correctly returning photos and reviews when fetching data for a specific business and correctly supporting fetching a specific user's photos/reviews
  * 5 points: database data is correctly persisted to a Docker volume
  * 5 points: database location information and credentials are correctly provided to API server via environment variables

* 20 points: API application (API server and MySQL/MongoDB) is completely specified in `docker-compose.yml` and can be run from scratch using Docker Compose, as described above
