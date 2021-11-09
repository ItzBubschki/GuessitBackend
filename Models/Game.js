const User = require('../Models/User');
const {cryptPassword, comparePassword} = require('../Controller/PasswordController');
const {GameType} = require('./GameType');

class Game {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.participants = [];
        this.finished = false;
        this.winner = 'No one';
        this.password = '';
        this.gameType = GameType.Distance;
        this.question = 0;
    }

    setPassword(password) {
        this.password = cryptPassword(password);
    }

    addParticipant(user, password) {
        if (this.password) {
            try {
                password = password ? password : '';
                const isMatch = comparePassword(password, this.password);
                if (isMatch) {
                    return this.tryAddUser(user);
                }
                return [401, 'Password mismatch!'];
            } catch (e) {
                console.error(e);
                return [500, 'Internal error while hashing password'];
            }

        } else {
            return this.tryAddUser(user);
        }

    }

    tryAddUser(user) {
        if (this.participants.length < 3) {
            this.participants.push(user);
            return ['200', this];
        } else {
            return [400, 'Too many participants'];
        }
    }

    removeParticipant(userName) {
        for (let user in this.participants) {
            if (user.name === userName) {
                this.participants.remove(user);
                if (this.participants.length <= 1) {
                    this.finished = true;
                    this.winner = (this.participants[0])?.name;
                }
            }
        }
        throw 'User not found.';
    }

    answerQuestionForUser(userName, userId, answers) {
        let user;
        this.participants.forEach(parti => {
            if (parti.name === userName) {
                user = parti;
            }
        });
        if (user) {
            if (user.id === userId) {
                user.answerQuestion(answers.first, answers.second);
                return [200, this];
            } else {
                return [401, 'User id mismatch.'];
            }
        } else {
            return [404, 'User not found.'];
        }
    }
}

module.exports = Game;
