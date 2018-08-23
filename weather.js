const fetch = require('node-fetch');

const { OPENWEATHER_API_KEY } = process.env;

const getWeatherInfo = city =>
  fetch(
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`
  )
    .then(response => response.json())
    .then(data => {
      const kelvin = data.main.temp;
      const celsius = Math.round(kelvin - 273.15);
      return celsius;
    })
    .catch(error => console.log(error));

module.exports = getWeatherInfo;
