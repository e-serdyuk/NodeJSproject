var fs = require('fs');

// multer - middleware для обработки данных формы в кодировке multipart/form-data 
var multer = require('multer');
// dest - директория для сохранения файлов, загружаемых на сервер 
var upload = multer({
    dest: 'views/uploads'
});
var hbs = require("nodemailer-express-handlebars")
// указать, что будет загружен один файл с именем recfile. 
// имя файла может быть любым, но оно должно совпадать со значением атрибута name элемента формы input с типом file
// например, <input type="file" name="recfile" />
var type = upload.single('recfile');
var path = require('path');
const nodemailer = require("nodemailer")
const crypto = require('crypto');
const xoauth2 = require("xoauth2")
const passwordHandler = require('./../js/password_handler');

module.exports = function(app, pool) {

    app.post('/upload', type, function(req, res) {

        // загруженный файл доступен через свойство req.file

        console.log(req.body);

        // файл временного хранения данных
        var tmp_path = req.file.path;

        // место, куда файл будет загружен 
        var target_path = path.join(req.file.destination, req.file.originalname);

        // загрузка файла 
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        // обработка результатов загрузки 
        src.on('end', function() {

            // удалить файл временного хранения данных
            fs.unlink(tmp_path);
            //  res.send(); 
            res.redirect('/home');
        });
        src.on('error', function(err) {

            // удалить файл временного хранения данных
            fs.unlink(tmp_path);
            res.send('error');
        });
        var now = new Date();
        var dat = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
        console.log(dat)
        var file_image = target_path.split("views")[1];
        var path1 = file_image.split("uploads")[0] + 'uploads/';
        var path2 = file_image.split("uploads")[1];
        file_image = path1 + path2;
        var sql = 'INSERT INTO projects (title,author,description,category,src,date) VALUES(?,?,?,?,?,?)';
        var values = [req.body.title, req.body.author,req.body.Description,req.body.Category,file_image,dat];
        pool.query(sql, values, function(err, result) {
            if (err) {
                console.log('Error');
            }

        })

    })

    app.post('/registerUser', function(req, res) {

        var hashedPass = passwordHandler.encryptPassword(req.body.pass);

        var sql = 'INSERT INTO users (username, passwordHash) VALUES(?,?)';
        var values = [req.body.userName, hashedPass];

        pool.query(sql, values, function(err, result) {

            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    var obj = '{"status":2}';
                    res.status(200).send(obj);
                } else {
                    console.log('err on post /registerUser= ', err);
                }
            } else {
                if (result && result.affectedRows > 0) {
                    res.setHeader('Content-type', 'application/json');
                    var obj = '{"status":1}';
                    res.status(200).send(obj);
                }
            }
        });


    });
    //после того как мы прошли по ссылке для восстановления пароля, после ввода 2 паролей, мы попадаем сюда, где меняем старый пароль на новый
    app.post('/passchange', function(req, res, next) {
        console.log("passchange")
        var hp = passwordHandler.encryptPassword(req.body.pass);

        var sql = 'UPDATE users SET passwordHash=? WHERE username=? ';
        var values = [hp, req.body.userName];
        console.log(req.body.userName)
        console.log(hp)
        pool.query(sql, values, function(err, result) {
            if (err) {
                console.log('Error during update');
            }
            var sql2 = 'DEvarE FROM resetpassword WHERE username=?';
            var values2 = [req.body.userName];

            pool.query(sql2, values2)

        })
        res.redirect('/home');
    })
    app.post('/userLogin', function(req, res) {
        if (req.session.username) {
            res.status(200).send('{"message":1,"sessionUserName":"' + req.session.username + '","sessionId":"' + req.session.id + '"}');
        } else {
            var query = passwordHandler.checkPassword(req.body.pass);
            var data = [];
            query.on('result', function(row) {
                data.push(row);
            });
            query.on('end', function() {
                if (data.length > 0 && data[0].username === req.body.userName) {
                    req.session.username = data[0].username;
                    res.status(200).send('{"message":1,"sessionUserName":"' + req.session.username + '","sessionId":"' + req.session.id + '"}');
                } else {
                    res.status(200).send('{"message":0}');
                }
            });
        }
    })
    app.post('/email', function(req, res) {

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                clientId: "608499600659-0hemkeqbucjn83opir08n87hpg4t0edi.apps.googleusercontent.com",
                clientSecret: "o_mOfTctxDBEEHV98qnWZz8N"
            }
        });
        //использование шаблонов
        transporter.use('compile', hbs({
            viewPath: './views/email',
            extName: '.hbs'
        }))

        //отправка 1 сообщения пользователю
        transporter.sendMail({
            from: 'nabazochku555@gmail.com',
            to: 'b.druzhynin@dinamicka.com',
            subject: 'To customer from Evgeniy Serdyuk',
            template: "mail1",
            context: {},
            auth: {
                user: 'nabazochku555@gmail.com',
                refreshToken: "1/-r_wkHxNhDhmxVhnjwAcYXBFBjOXJuPd5D0GFEvFGU2Ft1F07dKMIZWYF9_MhGjL",
                accessToken: 'ya29.GluoBFsCaDsC_g978UeEAXjAF9igrZFsMo8mMztOBPiCHbuDfYnXju_ktdOvA5P95DTIXBBQR86IEj4rW0ZSTL3lEXAQgeuLJqFX5_BP0yQePnJRTRNn5lUyYur',
                expires: 1484314697598
            }
        }, function(err, res) {
            if (err) {
                console.log("Error sending mail")
            } else {
                console.log("Message sent");
            }

        });


        //отправка 2 сообщения администратору
        transporter.sendMail({
            from: 'nabazochku555@gmail.com',
            to: 'info@dinamicka.com',
            subject: 'To administator from Evgeniy Serdyuk',
            template: "mail2",
            context: {
                'name': req.body.name,
                'email': req.body.email,
                'subject': req.body.subject,
                'textarea': req.body.textarea
            },
            auth: {
                user: 'nabazochku555@gmail.com',
                refreshToken: "1/-r_wkHxNhDhmxVhnjwAcYXBFBjOXJuPd5D0GFEvFGU2Ft1F07dKMIZWYF9_MhGjL",
                accessToken: 'ya29.GluoBFsCaDsC_g978UeEAXjAF9igrZFsMo8mMztOBPiCHbuDfYnXju_ktdOvA5P95DTIXBBQR86IEj4rW0ZSTL3lEXAQgeuLJqFX5_BP0yQePnJRTRNn5lUyYur',
                expires: 1484314697598
            }
        }, function(err, res) {
            if (err) {
                console.log("Error sending mail")
            } else {
                console.log("Message sent");
            }

        });
        res.redirect('/home');
    })

    //отправка сообщения на почту для восстановления пароля
    /*Описание алгоритма
    1) идет проверка пользователя, если такой есть переходит на /resetpass, где сначала создается 
    24 битный рандомный хэш
    2) Я создал в базе данных еще одну таблицу для хранения временных хэшей, пользователей 
    и expire времяя(10 минут)
    3) Сохраняю в базе и отправляю сообщение на эмейл с сгенерированным хэшем
    http://127.0.0.1:1337/resetpass/04bf4d20846f6683eba1bfbbcad706ad47c847c36b40fb5c
    4) После нажатия н ассылку я попадаю на  app.get('/resetpass/:token')
    5) Там я делаю проверки на присутвие хэша в таблице resetpassword, потом проверяю, чтобы expire
    миллисекунды были больше чем текущие миллисекунды
    6)Если все проходит, то переходим на страницу с вводом 2 паролей, если равны, то перехожу к /passchange
    7) Делаю апдейт хэша нового пароля в таблице users и удаляю запись из таблицы resetpassword
    8) Проверяю,логинюсь,новый пароль работает.


    */
    app.post('/resetpass', function(req, res) {
        var token = passwordHandler.crypt();
        exp = Date.now() + 10 * 60000;
        var sql = 'INSERT INTO resetpassword (username, hash,expire) VALUES(?,?,?)';
        var values = [req.body.userName, token, exp];
        pool.query(sql, values);
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                clientId: "608499600659-0hemkeqbucjn83opir08n87hpg4t0edi.apps.googleusercontent.com",
                clientSecret: "o_mOfTctxDBEEHV98qnWZz8N"
            }
        });

        transporter.sendMail({
            from: 'nabazochku555@gmail.com',
            to: 'info@dinamicka.com',
            subject: 'Message from Evgeniy Serdyuk',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to compvare the process:\n\n' +
                'http://' + req.headers.host + '/resetpass/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n',
            auth: {
                user: 'nabazochku555@gmail.com',
                refreshToken: "1/-r_wkHxNhDhmxVhnjwAcYXBFBjOXJuPd5D0GFEvFGU2Ft1F07dKMIZWYF9_MhGjL",
                accessToken: 'ya29.GluoBFsCaDsC_g978UeEAXjAF9igrZFsMo8mMztOBPiCHbuDfYnXju_ktdOvA5P95DTIXBBQR86IEj4rW0ZSTL3lEXAQgeuLJqFX5_BP0yQePnJRTRNn5lUyYur',
                expires: 1484314697598
            }
        }, function(err, res) {
            if (err) {
                console.log("Error sending mail")
            } else {
                console.log("Message sent");
            }
        });

        res.send()
        res.redirect('/home');

    })

};