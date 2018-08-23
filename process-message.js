const Dialogflow = require('dialogflow');
const Pusher = require('pusher');
const getWeatherInfo = require('./weather');

// You can find your project ID in your Dialogflow agent settings
const projectId = 'weather-app-1480541571609'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true,
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const processMessage = message => {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;

      // If the intent matches 'detect-city'
      if (result.intent.displayName === 'detect-city') {
        const city = result.parameters.fields['geo-city'].stringValue;

        // fetch the temperature from openweather map
        return getWeatherInfo(city).then(temperature => {
          return pusher.trigger('bot', 'bot-response', {
            message: `The weather is ${city} is ${temperature}°C`,
          });
        });
      }

      return pusher.trigger('bot', 'bot-response', {
        message: result.fulfillmentText,
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

module.exports = processMessage;
