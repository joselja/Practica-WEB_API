var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



//conectamos la BBDD
require('./lib/mongoConnection');

//Carga el modelo de anuncios
require('./models/Anuncio');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.title = 'Nodeapi';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Middleware de estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    next();
});

//middlewares aplicación Web
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use ('/images', express.static (__dirname + '/public/images'));

//middlewares del API
app.use('/apiv1/anuncios', require('./routes/apiv1/anuncios'));
app.use('/apiv1/tags', require ('./routes/apiv1/tags'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res) {

    if (err.array) { // validation error
        err.status = 422;
        const errInfo = err.array({ onlyFirstError: true })[0];
        err.message = `Not valid - ${errInfo.param} ${errInfo.msg}`;
    }

    res.status(err.status || 500);

    // si es una petición de API, respondemos con JSON
    if (isAPI(req)) {
        res.json({ success: false, error: err.message });
        return;
    }

    // Respondo con una página de error

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.render('error');
});


function isAPI(req) {
    return req.originalUrl.indexOf('/apiv') === 0;
}

module.exports = app;