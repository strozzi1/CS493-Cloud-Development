db.courses.insertMany([
    {
        "_id" : ObjectId("5eded521344e906698ea2479"),//"1",
        "subject" : "CS",
        "number" : "493",
        "title" : "Cloud Application Development",
        "term" : "sp20",
        "instructorId": ObjectId("5eded4851ab5b6af90d7b3a0"), //8
        "students": [
            ObjectId("5eded46dbcfa3cf46c28a759"),
            ObjectId("5eded40cdd189430a3ee6086")
        ]
    },
    {
        "_id": ObjectId("5eded531aafc8d44fa9f109d"),//"2",
        "subject" : "MTH",
        "number" : "251",
        "name" : "Differential Calculus",
        "term" : "f20",
        "instructorId" : ObjectId("5eded460d68e2f3ae830cee1"),//"2"
        "students": [
            ObjectId("5eded40cdd189430a3ee6086"),
            ObjectId("5eded42b540176a5f62490ae"),
            ObjectId("5eded4510b590af3bb5684db")
        ]
    },
    {
        "_id": ObjectId("5eded53ec08bbc0f1415f26f"), //"3",
        "subject" : "CS",
        "number" : "492",
        "name" : "Mobile Application Development",
        "term" : "w20",
        "instructorId" : ObjectId("5eded4851ab5b6af90d7b3a0"),//"8"
        "students": []
    },
    {
        "_id": ObjectId("5eded54ccc745ac94ae00a6d"), //"4",
        "subject" : "CS",
        "number" : "261",
        "name" : "Data Structures",
        "term" : "f18",
        "instructorId" : ObjectId("5eded4851ab5b6af90d7b3a0"),//"8"
        "students":  [
            ObjectId("5eded40cdd189430a3ee6086"),
            ObjectId("5eded42b540176a5f62490ae"),
            ObjectId("5eded4510b590af3bb5684db")
        ]
    }
]);