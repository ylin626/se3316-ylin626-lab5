var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express = require("express");
var ObjectID = require('mongodb').ObjectID;
var app = express();
var us = {};
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    next();

});

/**
 * get 20 subject
 */
app.get("/visitor/all", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find({}).limit(20).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            res.send({
                status: 200,
                text: "find successful！",
                data: result
            });
        })
    })
});



/**
 * get by Subject, Course Suffix, Component, Starting Time, Ending Time, Day of Class, Campus
 * @param subject
 * @param designation
 * @param component
 * @param s_time
 * @param e_time
 * @param days
 * @param locationCode
 */
app.post("/visitor/findinfo", function(req, res) {
    var elem = {};
    var key = {}
    if (req.body.subject != "") {
        key.subject = req.body.subject;
    }
    if (req.body.designation != "") {
        key.className = new RegExp(`${req.body.designation}$`);
    }
    if (req.body.component != "") {
        elem.ssr_component = req.body.component;
    }
    if (req.body.s_time != "") {
        elem.start_time = req.body.s_time.toUpperCase();
    }
    if (req.body.e_time != "") {
        elem.end_time = req.body.e_time.toUpperCase();
    }
    if (req.body.locationCode != "") {
        elem.campus = req.body.locationCode;
    }
    elem.days = {
        $elemMatch: { $in: req.body.days }
    }
    key.course_info = {
        $elemMatch: elem
    }
    console.log(key);
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find(key).project({}).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            console.log(result.length)
            res.send({
                status: 200,
                text: "find successful！",
                data: result
            });
        })
    })
});



/**
 * Create a new schedule with a given schedule name. Return an error if name exists.
 * @param catalogNbr
 * @param subject
 * @param className
 * @param catalog_description
 */
app.post("/add/schedule", function(req, res) {
    var key = {
        catalog_nbr: req.body.catalogNbr,
        subject: req.body.subject,
        className: req.body.className,
        course_info: [],
        catalog_description: req.body.catalog_description
    }

    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").insertOne(key, function(err, result) {
            if (err) throw err;
            db.close();
            res.send({
                status: 200,
                text: "Add Successful！"
            });
        });
    })
})

/**
 * .Save a list of subject code, course code pairs under a given schedule name. 
 * Return an error if the schedule name does not exist. 
 * Replace existing subject-code + course-code pairs with new values and create new pairs if it doesn’t exist.
 * @param id
 * @param class_nbr
 * @param campus
 * @param facility_ID
 * @param class_section
 * @param ssr_component
 * @param descr
 * @param enrl_stat
 * @param start_time
 * @param end_time
 * @param days
 */
app.post("/add/course", function(req, res) {
    var course_info;
    var key = {
        class_nbr: req.body.class_nbr,
        start_time: req.body.start_time,
        descrlong: "",
        end_time: req.body.end_time,
        campus: req.body.campus,
        facility_ID: req.body.facility_ID,
        days: req.body.days,
        instructors: [],
        class_section: req.body.class_section,
        ssr_component: req.body.ssr_component,
        enrl_stat: req.body.enrl_stat,
        descr: req.body.descr
    }

    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find({
            _id: { $eq: ObjectID(req.body.id) }
        }).project({
            course_info: 1,
        }).toArray(function(err, result) {
            if (err) throw err;
            var judge = true;
            for (var i = 0; i < result[0].course_info.length; i++) {
                if (result[0].course_info[i].classNbr == req.body.class_nbr) {
                    judge = false;
                    res.send({
                        status: 400,
                        text: "Add Faild！Name already used."
                    });
                    db.close();
                    break;
                }
            }
            if (judge) {
                result[0].course_info.push(key);
                dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { course_info: result[0].course_info } }, function(err, result1) {
                    if (err) throw err;
                    res.send({
                        status: 200,
                        text: "Add Successful！"
                    });
                    db.close();
                });
            }

        })

    })
})



/**
 * delete by subjectName
 * @param subject
 */
app.post("/delete/subject", function(req, res) {
    var whereStr = {
        subject: req.body.subject
    }; // 查询条件
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").deleteMany(whereStr, function(err, obj) {
            if (err) {
                db.close();
                console.log("error")
                res.send({
                    status: 400,
                    text: "delete failed!"
                });
            } else {
                if (obj.result.n == 0) {
                    res.send({
                        status: 400,
                        text: "delete failed!"
                    });
                } else {
                    res.send({
                        status: 200,
                        text: "delete successful！"
                    });
                }
                db.close();
            }
        });
    });
})



/**
 * delete all
 */
app.post("/delete/all", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").deleteMany({}, function(err, obj) {
            if (err) {
                db.close();
                res.send({
                    status: 400,
                    text: "delete failed!"
                });
            } else {
                db.close();
                res.send({
                    status: 200,
                    text: "delete successful！"
                });
            }
        });
    });
})




/**
 * delete by id
 * @param id
 */
app.post("/delete/id", function(req, res) {
    var whereStr = {
        _id: { $eq: ObjectID(req.body.id) }
    }; // 查询条件
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").deleteMany(whereStr, function(err, obj) {
            if (err) {
                db.close();
                console.log("error")
                res.send({
                    status: 400,
                    text: "delete failed!"
                });
            } else {
                if (obj.result.n == 0) {
                    res.send({
                        status: 400,
                        text: "delete failed!"
                    });
                } else {
                    res.send({
                        status: 200,
                        text: "delete successful！"
                    });
                }
                db.close();
            }
        });
    });
})



/**
 * delete class
 * @param id
 * @param key
 */
app.post("/delete/course", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").find({
            _id: { $eq: ObjectID(req.body.id) }
        }).project({
            course_info: 1,
        }).toArray(function(err, result) {
            if (err) throw err;
            result[0].course_info.splice(req.body.key, 1);
            dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { course_info: result[0].course_info } }, function(err, result1) {
                if (err) throw err;
                res.send({
                    status: 200,
                    text: "Delete Successful！"
                });
                db.close();
            });

        })

    });
})
var server = app.listen(3000, '127.0.0.1', function() {
    var host = server.address().address
    var port = server.address().port
    console.log(host, port)
})