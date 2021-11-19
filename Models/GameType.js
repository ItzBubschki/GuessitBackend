GameType = {
    Distance: 'Distance',
    Temperature: 'Temperature',
};

GameRanges = {
    Distance: [10, 1000],
    Temperature: [1, 20],
};

Apis = {
    Distance: {
        LookUp: 'https://geocode.search.hereapi.com/v1/geocode?apiKey={API_KEY}&qq=city=',
        Distance: 'https://router.hereapi.com/v8/routes?apiKey={API_KEY}&transportMode=car&origin={Origin}&destination={Destination}&return=summary',
    },
    Temperature: 'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_key}&units=metric',
    Lights: {
        bodies: {
            off: {on: false},
            green: {on: true, bri: 254, sat: 254, hue: 25500},
            yellow: {on: true, sat: 254, bri: 254, hue: 10000},
            red: {on: true, sat: 254, bri: 254, hue: 0},
            redBlink: {on: true, sat: 254, bri: 254, hue: 0, alert: "lselect"},
        },
        url: '/lights/{NUMBER}/state'
    },
};

module.exports = {
    GameType,
    GameRanges,
    Apis,
};
