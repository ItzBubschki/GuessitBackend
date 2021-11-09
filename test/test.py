import json
import requests

PORT = 3000
BASE_URL = f"http://localhost:{PORT}"


def join_game(username):
    body = {"name": username}
    requests.post(f"{BASE_URL}/game/{GAME_ID}/join", json=body)


def start_game():
    requests.post(f"{BASE_URL}/game/{GAME_ID}/start")


def take_guess(answer, username):
    body = {
        "username": username,
        "answers": answer
    }
    requests.post(f"{BASE_URL}/game/{GAME_ID}/guess", json=body)


creation_body = {"name": "test"}

game = requests.post(f"{BASE_URL}/game/create", json=creation_body)
GAME_ID = json.loads(game.text)['id']

print(GAME_ID)

join_game("Laurin")
join_game("Enemy")
start_game()
take_guess({"first": "Munich", "second": "Augsburg"}, "Laurin")
take_guess({"first": "Berlin", "second": "Augsburg"}, "Enemy")
