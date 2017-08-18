var path = require('path');
const passwordHandler = require('./../js/password_handler');
const checkMonth = require('./../js/checkMonth');
module.exports = function(app, pool) {

    app.get('/', function(req, res) {
        res.redirect('/home');
    });

    app.get('/home', function(req, res) {
        res.render('home', {
            user: req.session.username
        })
    });
    app.get('/get-data', function(req, res, next) {
        pool.query('SELECT * FROM projects', function(err, rows) {
            if (err) {console.log("Error displaying data")};
            res.send(rows);
        });
    });
    app.get('/print', function(req, res, next) {
        pool.query('SELECT * FROM projects WHERE category=?', 'print', function(err, rows) {
            if (err) {console.log("Error displaying data")};
            res.send(rows);
        });
    });
    app.get('/photo', function(req, res, next) {
        pool.query('SELECT * FROM projects WHERE category=?', 'photography', function(err, rows) {
            if (err) {console.log("Error displaying data")};
            res.send(rows);
        });
    });
    app.get('/web', function(req, res, next) {
        pool.query('SELECT * FROM projects WHERE category=?', 'web', function(err, rows) {
            if (err) {console.log("Error displaying data")};
            res.send(rows);
        });
    });
    app.get('/app', function(req, res, next) {
        pool.query('SELECT * FROM projects WHERE category=?', 'applications', function(err, rows) {
            if (err) {console.log("Error displaying data")};
            res.send(rows);
        });
    });
    //view-показать информацию о проекте
    app.get('/view/:id', function(req, res, next) {
        var sql = 'SELECT * FROM projects WHERE id=?';
        var values = [req.params.id];

        pool.query(sql, values, function(err, rows) {
            if (err) {
                console.log('Error to show project');
            }
            //date приводит к необходимому формату
            rows[0].date = rows[0].date.getDate() + ' ' + checkMonth.check(rows[0].date.getMonth() + 1) + ', ' + rows[0].date.getFullYear();
            res.render('view', {
                title: rows[0].title,
                author: rows[0].author,
                id: req.params.id,
                description: rows[0].description,
                category: rows[0].category,
                src: rows[0].src,
                date: rows[0].date
            })
        });

    })
    //редактирование
    app.get('/edit/:id', function(req, res, next) {
        var sql = 'SELECT * FROM projects WHERE id=?';
        var values = [req.params.id];
        //Если залогинен, то редактируем, если нет, то редирект на регистрацию
        if (req.session.username) {
            pool.query(sql, values, function(err, rows) {
                if (err) {
                    console.log('Error to show project');
                }
                res.render('edit', {
                    title: rows[0].title,
                    author: rows[0].author,
                    id: req.params.id,
                    description: rows[0].description,
                    category: rows[0].category,
                    src: rows[0].src,
                    date: rows[0].date
                })
            });
        } else {
            res.redirect('/register');
        }
    })
    //удаление проекта
    app.delete('/delete/:id', function(req, res, next) {
        var  sql = 'DELETE FROM projects WHERE id=?';
        var values = [req.params.id];
        //Если залогинен, то удаляем, если нет, то редирект на регистрацию
         if (req.session.username) {
            pool.query(sql, values, function(err, result) {
                if (err) {
                    console.log('Can not delete project');
                }
                res.status(200).send(result.affectedRows.toString());


            });
        } else {
            res.redirect('/register');
        }
    })
    //апдейтим проект после редактирования
    app.put('/update/:id', function(req, res, next) {

   var sql = 'UPDATE projects SET title=?, author=?,category=?,description=? WHERE id=?';
        var  values = [req.body.title, req.body.author, req.body.category, req.body.description, req.body.id];
        pool.query(sql, values, function(err, result) {
            if (err) {
                console.log('Error during update');
            }
            res.status(200).send();
        })

    })
    app.get ('/checkId/:id', function (req, res, next) {

        var sql = 'SELECT * FROM users WHERE username=?';
        var values = [req.params.id];
        console.log(req.params.id);
        pool.query (sql, values, function (err, rows) {
             if (err ) { console.log('Error');}
             console.log(rows.length.toString ());
            res.status (200).send (rows.length.toString ());
        });
    });
    app.get('/new', function(req, res, next) {
        res.sendFile(path.join(__dirname, './../views/add.html'));

    })
    app.get('/register', function(req, res) {
        res.sendFile(path.join(__dirname, './../views/register.html'));
    });
    app.get('/reset', function(req, res) {
        res.render('forgotpass', {
            info: ""
        })
    });
    app.get('/contact', function(req, res) {
        res.sendFile(path.join(__dirname, './../views/contacts.html'));
    });
    //Когда с сообщения на почте переходим по ссылке для восстановления пароля
    app.get('/resetpass/:token', function(req, res) {
        var sql = 'SELECT * FROM resetpassword WHERE hash=?';
        var values = [req.params.token];
        pool.query(sql, values, function(err, rows) {
            if (err) console.log("Error during reset password");
            //если с данным хешем нашли пользователя
            if (rows.length > 0) {
                //если дата валидности ссылки больше чем текущая, то выполняем действия
                if (rows[0].expire > Date.now()) {
                    res.render('passwordRecovery', {
                        username: rows[0].username
                    })
                } else {
                    console.log("Link is invalid");
                    res.render('forgotpass', {
                        info: "Link is invalid"
                    })
                }
            } else {
                console.log("Error.We can not find any user with this hash");
                res.render('forgotpass', {
                    info: "We can not find any user with this hash. Check your link from email."
                })
            }
        });

    });

    app.get('/logout', function(req, res) {
        req.session.username = '';
        res.redirect('/home');
    })
};