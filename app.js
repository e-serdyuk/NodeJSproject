const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.port || 1337;
const ejs = require('ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json());
require('./js/sessions-init')(app);
app.set('views','./views');
app.set('view engine','ejs');
app.use('/views', express.static(__dirname + '/views'));
require('./routes')(app);

app.use(function (req, res) {
    res.statusMessage = "404 Error";
    res.status(404).render('error');
});

server.listen(port, function () {
    console.log('Server running on port- '+port);
});
