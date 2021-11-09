# Disclaimer:
The code for this website was written only in a very few days as Part of a Project for University and is currently not completly finished. Due to the short amount of time that was available for this project the code may not be too beautiful, but I think it servers as a demonstration of my NodeJs and Express knowledge.
# How to test
* Create a `.env` file
* Add the following lines to the file:

```
API_KEYS_DISTANCE={API_KEY}
API_KEYS_TEMPERATURE={API_KEY}
```

## Get Api keys:
### Weather app:
* Go to [Open weathermap](https://home.openweathermap.org/)
* Create an account
* Confirm your email
* Check you emails for the API_KEY

### Distance Controller
* Got to [Developer.here](https://developer.here.com)
* Create an account
* Confirm your email
* create a new Project on the website (under Account -> Projects)
* In the new Project generate a new REST-Service
* Api key is shown on Page

## Install and Run
* run the command `npm install`
* run the comand `node start` <br>
 -> this will start the server and listens for incoming requests
 + Testing is possible through a small python script under `test/test.py` and can be executed using python version 3
