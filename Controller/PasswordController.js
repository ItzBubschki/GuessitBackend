const bcrypt = require('bcrypt');

exports.cryptPassword = function(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

exports.comparePassword = function(plainPass, hashed) {
    return bcrypt.compareSync(plainPass, hashed);
};
