const {v4: uuidv4} = require('uuid');
const loki = require('lokijs');
const Game = require('../Models/Game');
const User = require('../Models/User');
const lodash = require('lodash');
const GuessItController = require('./GuessItController');
const {GameType} = require('../Models/GameType');

const db = new loki('guess_it.db');
const games = db.addCollection('games');

function createGame(data) {
    const gameName = data.name;
    const lampUrl = data.lamp;
    const lampStartIndex = data.lampIndex;
    const password = data.password;
    if (!gameName) {
        return [400, 'No name given'];
    }

    const newGame = new Game(uuidv4(), gameName, lampUrl, lampStartIndex);
    if (password) {
        try {
            newGame.setPassword(password);
        } catch (e) {
            console.error(e);
            return [500, 'Error while hashing password!'];
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
            const newData = lodash.merge(gameData, updatedData[1]);
            games.update(newData);
            delete newData.password;
            return [200, newData];
        }
        return updatedData;
    }
    return [404, 'Couldn\'t find game with given id.'];
}

function leaveGame(gameId, data) {
    const userName = data.name;
    if (!userName) {
        return [400, 'No username given'];
    }

    const gameData = games.findOne({'id': gameId});
    if (gameData) {
        const user = gameData.participants.find(user => user.name === userName);
        if (!user) {
            return [404, 'Couldn\'t find user.'];
        }
        if (user.id === data.userId) {
            gameData.removeParticipant(userName);
            return [200, 'Ok'];
        }
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
    });
    games.update(game);
    if (game.lampUrl) {
        for (let i = 0; i < 3; i++) {
            const newLives = i < game.participants.length ? 3 : -1;
            GuessItController.updateLightForUser(game.lampUrl, i + game.lampIndex, newLives);
        }
    }
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
        const newData = lodash.merge(gameData, validatedAnswers);
        games.update(newData);
        delete newData.password;
        response[1] = newData;
    }
    return response;
}

function getRoundOverView(gameId) {
    const gameData = games.findOne({'id': gameId});
    if (!gameData) {
        return [404, 'Game not found'];
    }
    const responseBody = {'roundNumber': gameData.roundNumber, 'result': gameData.lastResults};
    return [200, responseBody];
}

function startNextRound(gameId, username, userId) {
    const gameData = games.findOne({'id': gameId});
    if (!gameData) {
        return [404, 'Game not found'];
    }

    const user = gameData.participants.find(user => user.name === username);
    if (user?.host && user?.id === userId) {
        if (!gameData.roundOver) {
            return [400, 'Round is not over!'];
        }
        const nextType = gameData.gameType === GameType.Distance ? GameType.Temperature : GameType.Distance;
        gameData.question = GuessItController.generateNewQuestion(nextType);
        gameData.roundOver = false;
        gameData.roundNumber++;
        gameData.participants.forEach((user) => {
            user.resetAnswers();
        });
        games.update(gameData);
        delete gameData.password;
        return [200, gameData];
    }

    return [401, 'Unauthorized!'];

}

module.exports = {
    createGame,
    joinGame,
    leaveGame,
    getGame,
    getAll,
    answerQuestion,
    startGame,
    getRoundOverView,
    startNextRound,
};
