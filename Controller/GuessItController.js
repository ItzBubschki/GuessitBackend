const {GameType, GameRanges, Apis} = require('../Models/GameType');
const fetch = require('node-fetch');
const User = require('../Models/User');

function generateNewQuestion(gameType) {
    let low, high;
    switch(gameType) {
        case GameType.Distance:
            [low, high] = GameRanges.Distance;
            break;
        case GameType.Temperature:
            [low, high] = GameRanges.Temperature;
            break;
    }
    return Math.floor(Math.random() * (high - low)) + low;
}

async function checkAndTrigger(updatedData) {
    let answered = 0;
    let dead = 0;
    const aliveUsers = [];
    updatedData.participants.forEach((parti) => {
        if (parti.answered) {
            answered++;
            aliveUsers.push(Object.assign(new User(), parti));
        }
        if (parti.lives <= 0) {
            dead++;
        }
    });
    if (updatedData.participants.length === answered + dead) {
        const [loser, allResults] = await controlAllResults(updatedData, aliveUsers);
        const updatedLoser = subLiveFromUser(updatedData.participants, loser);
        if (updatedLoser.lives <= 0) {
            dead++;
            if (aliveUsers - 1 <= 1) {
                updatedData.finished = true;
            }
        }
        return allResults;
    }
    return updatedData;
}

async function controlAllResults(game, alivePlayer) {
    const promises = alivePlayer.map(async(parti) => {
        const score = await checkResultForUser(parti, game.gameType);
        return {'user': parti.name, 'score': score};
    });
    const results = await Promise.all(promises);

    let currDist = 0;
    let currLoser = '';
    results.forEach((result) => {
        if (Math.abs(game.question - result.score) > currDist) {
            currLoser = result.user;
        }
    });

    return [currLoser, results];
}

async function checkResultForUser(user, gameType) {
    let base_url, first_url, second_url, first_response, second_response;
    switch(gameType) {
        case GameType.Distance:
            base_url = Apis.Distance.LookUp.replace('{API_KEY}', process.env.API_KEYS_DISTANCE);
            first_url = base_url + user.answer.first;
            second_url = base_url + user.answer.second;
            first_response = await (await fetch(first_url)).json();
            second_response = await (await fetch(second_url)).json();
            const coordinates = [first_response.items[0].position, second_response.items[0].position];
            let distance_url = Apis.Distance.Distance.replace('{API_KEY}', process.env.API_KEYS_DISTANCE);
            distance_url = distance_url.replace('{Origin}', `${coordinates[0].lat},${coordinates[0].lng}`);
            distance_url = distance_url.replace('{Destination}', `${coordinates[1].lat},${coordinates[1].lng}`);
            const distance_response = await (await fetch(distance_url)).json();
            return distance_response.routes[0]?.sections[0].summary.length / 1000;
        case GameType.Temperature:
            base_url = Apis.Temperature.replace('{API_KEY}', process.env.API_KEYS_TEMPERATURE);
            first_url = base_url.replace('{city_name}', user.answers.first);
            second_url = base_url.replace('{city_name}', user.answers.second);
            first_response = await (await fetch(first_url)).text();
            second_response = await (await fetch(second_url)).text();
            const temperatures = [first_response.main.temp, second_response.main.temp];
            return Math.abs(temperatures[0] - temperatures[1]);
    }
}

function subLiveFromUser(users, loser) {
    let updatedLoser;
    users.forEach((user) => {
        if (user.name === loser) {
            user.lives--;
            updatedLoser = user;
        }
    });
    return updatedLoser;
}

module.exports = {
    checkAndTrigger,
    generateNewQuestion,
};
