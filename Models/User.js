class User {
    constructor(id, name, host) {
        this.id = id;
        this.name = name;
        this.host = host;
        this.lives = 3;
        this.resetAnswers();
    }

    answerQuestion(first, second) {
        this.answer.first = first;
        this.answer.second = second;
        this.answered = true;
    }

    resetAnswers() {
        this.answered = false;
        this.answer = {first: null, second: null};
    }
}

module.exports = User;
