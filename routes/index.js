const {pool}   = require('./../js/db-connect');

module.exports = function (app) {

    require('./get-routes')(app, pool);
    require('./post-routes')(app, pool);

};