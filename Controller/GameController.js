const {v4: uuidv4} = require('uuid');
const loki = require('lokijs');
const Game = require('../Models/Game');
const User = require('../Models/User');
const lodash = require('lodash');
const GuessItController = require('./GuessItController');

const db = new loki('guess_it.db');
const games = db.addCollection('games');

function createGame(data) {
    const gameName = data.name;
    const password = data.password;
    if (!gameName) {
        return [400, 'No name given'];
    }

    const newGame = new Game(uuidv4(), gameName);
    if (password) {
        try {
            newGame.setPassword(password);
        } catch (e) {
            console.error(e);
            return [500, "Error while hashing password!"];
        }
    }
    games.insert(newGame);
    delete newGame.password;
    return [200, newGame];
}

function joinGame(gameId, data) {
    const userName = data.name;
    if (!userName) {
        return [400, 'No username given'];
    }

    const gameData = games.findOne({'id': gameId});
    if (gameData) {
        const game = Object.assign(new Game(), gameData);
        const host = game.participants.length === 0;
        const newUser = new User(data.id, data.name, host);
        const updatedData = game.addParticipant(newUser, data.password);
        if (updatedData[0] === 200) {
            const newData = lodash.merge(gameData, lodash.pick(updatedData[1], lodash.identity));
            games.update(newData);
            delete newData.password;
            return [200, newData];
        }
        return updatedData;
    }
    return [404, 'Couldn\'t find game with given id.'];
}

function startGame(gameId) {
    const game = games.findOne({'id': gameId});
    if (game.participants < 2) {
        return [400, 'Not enough players!'];
    }
    game.question = GuessItController.generateNewQuestion(game.gameType);
    game.participants.forEach((parti) => {
        Object.assign(new User(), parti).resetAnswers();
    })
    games.update(game);
    delete game.password;
    return game;
}

function getGame(gameId) {
    return games.findOne({'id': gameId});
}

function getAll() {
    return games.find({'finished': false});
}

async function answerQuestion(gameId, data) {
    if (!data.username) {
        return [400, 'No username given'];
    }
    const gameData = games.findOne({'id': gameId});
    if (!gameData) {
        return [404, 'Game not found'];
    }
    const game = Object.assign(new Game(), gameData);
    const response = game.answerQuestionForUser(data.username, data.userId, data.answers);
    if (response[0] === 200) {
        const validatedAnswers = await GuessItController.checkAndTrigger(response[1]);
        const newData = lodash.merge(gameData, lodash.pick(validatedAnswers, lodash.identity));
        games.update(newData);
        delete newData.password;
        response[1] = newData;
    }
    return response;
}



module.exports = {
    createGame,
    joinGame,
    getGame,
    getAll,
    answerQuestion,
    startGame
};
