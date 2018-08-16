const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    
    // since we need this route to be called only after the actual request handler done.
    // We use this trick to await till next (representing handler here) is completed
    await next();

    clearHash(req.user.id);
}