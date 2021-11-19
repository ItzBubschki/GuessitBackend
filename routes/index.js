const express = require('express');
const gameController = require('../Controller/GameController');
const router = express.Router();

//Check if server is alive
router.get('/', (req, res) => {
    res.send('Hello world!');
});

router.get('/game/:gameId', (req, res) => {
    const game = gameController.getGame(req.params.gameId);
    if (game) {
        delete game.password;
        res.send(game);
    } else {
        res.status(404).send('Game doesn\'t exist!');
    }
});

router.get('/games', (req, res) => {
    const games = gameController.getAll();
    games.map(game => {
        delete game.password;
    });
    res.send(games);
});

router.post('/game/create', (req, res) => {
    const response = gameController.createGame(req.body);
    res.status(response[0]).send(response[1]);
});

router.get('/game/:gameId/overview', (req, res) => {
    const response = gameController.getRoundOverView(req.params.gameId);
    res.status(response[0]).send(response[1]);
});

router.post('/game/:gameId/join', (req, res) => {
    const data = req.body;
    data.id = req.socket.remoteAddress;
    const response = gameController.joinGame(req.params.gameId, req.body);
    res.status(response[0]).send(response[1]);
});

router.post('/game/:gameId/start', (req, res) => {
    res.send(gameController.startGame(req.params.gameId));
});

router.post('/game/:gameId/guess', async(req, res) => {
    const data = req.body;
    data.userId = req.socket.remoteAddress;
    const response = await gameController.answerQuestion(req.params.gameId, data);
    res.status(response[0]).send(response[1]);
});

router.post('/game/:gameId/next-round', (req, res) => {
    const response = gameController.startNextRound(req.params.gameId, req.body.username, req.socket.remoteAddress);
    res.status(response[0]).send(response[1]);
});

router.post('/game/:gameId/leave', (req, res) => {
    const data = req.body;
    data.userId = req.socket.remoteAddress;
    const response = gameController.leaveGame(req.params.gameId, data);
    res.status(response[0]).send(response[1]);
});

module.exports = router;
