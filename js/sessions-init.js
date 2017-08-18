const session = require('express-session');
const expressMysqlSession = require('express-mysql-session')(session);

const sessionStoreOptions = {
    host:'localhost',
    port:'3306',
    user:'root',
    password:'',
    database:'data',
    checkExpirationInterval: 90000,
    expiration: 60000
};

const mySessionStore = new expressMysqlSession(sessionStoreOptions);
module.exports = function (app) {
    app.use(session({
        secret:'secret',
        store:mySessionStore,
        saveUninitialized:true,
        resave:true,
        secure: false
    }));
};

