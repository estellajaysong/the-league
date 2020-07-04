const { USERS_TABLE } = require('../constants');
const { createError, generateRandomInt } = require('../utils');
const bcrypt = require('bcrypt');

class User {
    constructor(db) {
        this.DB = db;
    }

    async signUp(name, email, password) {
        if (!name || !email || !password) {
            throw new Error(
                `Must provide name, email and password to register. Received: name: ${name}, email: ${email}, password: ${password}`
            );
        }

        try {
            password = await this.hashPassword(password);

            if (password.error) throw Error('Could not hash password');

            const user = { name, email, password };

            await this.DB(USERS_TABLE).insert({
                ...user,
                reset_password_token: 'NULL',
            });

            return user;
        } catch (e) {
            const log = `There was an error when adding a new user to db: ${e}`;
            return createError(500, 'Could not add user to DB', log);
        }
    }

    async hashPassword(plainTextPass) {
        try {
            const saltRounds = generateRandomInt(5, 20);

            const hash = await bcrypt.hash(String(plainTextPass), saltRounds);

            return hash;
        } catch (e) {
            return createError(500, '', e);
        }
    }
}

module.exports = (db) => new User(db);
