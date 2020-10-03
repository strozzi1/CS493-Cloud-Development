db.createUser({
    user: "tarpaulin",
    pwd: "hunter2",
    roles: [
        {
            role: "readWrite",
            db: "tarpaulin"
        }
    ]
});


