//It is a kind of a handler (for errors) so we included this file inside controllers
module.exports = ((err,req,res,next) => {

    err.statusCode = err.statusCode || 500;//500 for internal sever error
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status : err.status,
        message: err.message
    });
});