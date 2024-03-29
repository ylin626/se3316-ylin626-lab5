var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express = require("express");
var ObjectID = require('mongodb').ObjectID;
var jwt = require('jsonwebtoken');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString() // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}
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
        dbo.collection("schedule").find({}).sort({ reviseTime: -1 }).limit(10).toArray(function(err, result) {
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
 * register The first one will be Admin
 */
app.post("/visitor/register", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("user").find({ type: 1 }).toArray(function(err, result) {
            if (err) throw err;
            if (result.length == 0) {
                req.body.type = 1;
            } else {
                req.body.type = 0;
            }
            dbo.collection("user").insertOne(req.body, function(err, result) {
                if (err) throw err;

                db.close();
                res.send({
                    status: 200,
                    text: "Register Successful！",
                    data: req.body.type

                })

            });
        })
    })
});


/**
 * login
 */
app.post("/visitor/login", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("user").find({ user_id: req.body.id }).toArray(function(err, reslt) {
            if (err) throw err;
            dbo.collection("user").find({ type: 0 }).toArray(function(err, result) {
                if (err) throw err;
                db.close();
                res.send({
                    status: 200,
                    text: "Login Successful！",
                    data: {
                        type: reslt[0].type,
                        userList: result
                    }
                });
            })
        })
    })
});



/**
 * addAdmin
 * @param email
 */
app.post("/admin/addAdmin", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("user").updateOne({ email: req.body.email }, { $set: { type: 1 } }, function(err, result) {
            if (err) throw err;
            db.close();
            res.send({
                status: 200,
                text: "Add Successful！"
            });

        })
    })
});



/**
 * send DMCA
 * @param dmca
 */
app.post("/visitor/sendDmca", function(req, res) {
    req.body.sendTime = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("dmca").insertOne(req.body, function(err, result) {
            if (err) throw err;
            db.close();
            res.send({
                status: 200,
                text: "Send Successful！"
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
        key.catalog_nbr = new RegExp(`${req.body.designation}$`);
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
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find(key).sort({ reviseTime: -1 }).toArray(function(err, result) {
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
 * @param keyword
 */
app.post("/visitor/findbykeyword", function(req, res) {
    var kw = "";
    for (var i = 0; i < req.body.keyword.length; i++) {
        kw += req.body.keyword[i] + ".*";
    }
    var key = {
        $or: [
            { catalog_nbr: new RegExp(`${kw}`, "i") },
            { className: new RegExp(`${kw}`, "i") }
        ]
    }
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find(key).sort({ reviseTime: -1 }).toArray(function(err, result) {
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
 * get my catalog
 * @param user
 */
app.post("/user/myCatalog", function(req, res) {
    var key = {
        createUser: { $eq: req.body.user }
    }
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find(key).sort({ reviseTime: -1 }).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            console.log(result.length)
            res.send({
                status: 200,
                text: "get successful！",
                data: result
            });
        })
    })
});


/**
 * send review
 * @param user
 * @param id
 * @param text
 */
app.post("/user/sendView", function(req, res) {
    var user = jwt.decode(req.body.user);
    var key = {
        time: dateFormat("YYYY-mm-dd HH:MM:SS", new Date()),
        name: user.name,
        email: user.email,
        text: req.body.text,
        display: "1"
    }
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find({ _id: ObjectID(req.body.id) }).toArray(function(err, result) {
            if (err) throw err;
            result[0].review.push(key);
            dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { review: result[0].review } }, function(err, result) {
                if (err) throw err;
                db.close();
                res.send({
                    status: 200,
                    text: "SendReview Successful！"
                });
            });
        })

    })
});



/**
 * update review display 0/1
 * @param id
 * @param data
 */
app.post("/user/changeViewDisplay", function(req, res) {
    console.log(req.body.data)
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { review: req.body.data } }, function(err, result) {
            if (err) throw err;
            db.close();
            res.send({
                status: 200,
                text: "UpdateReviewDisplay Successful！"
            });
        });

    })
});


/**
 * Create a new schedule 
 * @param catalogNbr
 * @param subject
 * @param className
 * @param catalog_description
 */
app.post("/user/addCatalog", function(req, res) {
    req.body.reviseTime = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
    req.body.course_info = [];
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find({
            createUser: { $eq: req.body.createUser }
        }).toArray(function(err, rst) {
            if (err) throw err;
            if (rst.length == 20) {
                db.close();
                res.send({
                    status: 400,
                    text: "Add Faild！You can only have up to 20 catalogues."
                });
            } else {
                dbo.collection("schedule").find({
                    catalog_nbr: { $eq: req.body.catalog_nbr }
                }).toArray(function(e, rst) {
                    if (e) throw e;
                    if (rst.length > 0) {
                        db.close();
                        res.send({
                            status: 400,
                            text: "Add Faild！Nbr already used."
                        });

                    } else {
                        dbo.collection("schedule").insertOne(req.body, function(err, result) {
                            if (err) throw err;
                            db.close();
                            res.send({
                                status: 200,
                                text: "Add Successful！"
                            });
                        });
                    }


                })
            }
        })


    })
})

/**
 * revise schedule
 * @param id
 * @param catalog_nbr
 * @param subject
 * @param className
 * @param catalog_description
 */
app.post("/user/reviseCatalog", function(req, res) {
    var key = {
        reviseTime: dateFormat("YYYY-mm-dd HH:MM:SS", new Date()),
        catalog_nbr: req.body.catalog_nbr,
        subject: req.body.subject,
        className: req.body.className,
        catalog_description: req.body.catalog_description,
        power: req.body.power
    };
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable")
        dbo.collection("schedule").find({
            _id: { $eq: ObjectID(req.body._id) }
        }).toArray(function(e, rst) {
            if (e) throw e;
            if (rst[0].catalog_nbr != req.body.catalog_nbr) {
                dbo.collection("schedule").find({
                    catalog_nbr: { $eq: req.body.catalog_nbr }
                }).toArray(function(er, ret) {
                    if (er) throw er;
                    if (ret.length > 0) {
                        db.close();
                        res.send({
                            status: 400,
                            text: "Revise Faild！Nbr already used."
                        });
                    } else {
                        dbo.collection("schedule").updateOne({ _id: ObjectID(req.body._id) }, { $set: key }, function(err, result) {
                            if (err) throw err;
                            db.close();
                            res.send({
                                status: 200,
                                text: "Revise Successful！"
                            });
                        });
                    }
                })
            } else {
                dbo.collection("schedule").updateOne({ _id: ObjectID(req.body._id) }, { $set: key }, function(err, result) {
                    if (err) throw err;
                    db.close();
                    res.send({
                        status: 200,
                        text: "Revise Successful！"
                    });
                });
            }


        })

    })
})

/**
 * add Class to Catalog
 * @param id
 * @param data
 */
app.post("/user/addClass", function(req, res) {

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
                if (result[0].course_info[i].class_nbr == req.body.data.class_nbr) {
                    judge = false;
                    res.send({
                        status: 400,
                        text: "Add Faild！Nbr already used."
                    });
                    db.close();
                    break;
                }
            }
            if (judge) {
                result[0].course_info.push(req.body.data);
                dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { course_info: result[0].course_info, reviseTime: dateFormat("YYYY-mm-dd HH:MM:SS", new Date()) } }, function(err, result1) {
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
 * revise Class from Catalog
 * @param id
 * @param data
 * @param key
 */
app.post("/user/reviseClass", function(req, res) {
    console.log(req.body)
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
            for (var i = 0; i < result[0].course_info.length; i++) {
                if (i != req.body.key && result[0].course_info[i].class_nbr == req.body.data.class_nbr) {
                    db.close();
                    res.send({
                        status: 200,
                        text: "Revise Faild！Nbr already used."
                    });
                    break;
                }
            }
            result[0].course_info[req.body.key] = req.body.data;
            dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { course_info: result[0].course_info, reviseTime: dateFormat("YYYY-mm-dd HH:MM:SS", new Date()) } }, function(err, result1) {
                if (err) throw err;
                res.send({
                    status: 200,
                    text: "Revise Successful！"
                });
                db.close();
            });

        })

    })
})








/**
 * delete Catalog
 * @param id
 * @param user
 */
app.post("/user/delCatalog", function(req, res) {
    var whereStr = {
        _id: { $eq: ObjectID(req.body.id) },
        createUser: { $eq: req.body.user }
    }; // 查询条件
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").deleteOne(whereStr, function(err, obj) {
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
 * @param user
 * @param key
 */
app.post("/user/delClass", function(req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("timeTable");
        dbo.collection("schedule").find({
            _id: {
                $eq: ObjectID(req.body.id)
            },
            createUser: { $eq: req.body.user }
        }).project({
            course_info: 1,
        }).toArray(function(err, result) {
            if (err) throw err;
            result[0].course_info.splice(req.body.key, 1);
            dbo.collection("schedule").updateOne({ _id: ObjectID(req.body.id) }, { $set: { course_info: result[0].course_info, reviseTime: dateFormat("YYYY-mm-dd HH:MM:SS", new Date()) } }, function(err, result1) {
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