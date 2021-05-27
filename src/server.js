require('dotenv').config();
const knex = require('knex');
const mqtt = require('mqtt');

const { TOPICS } = require('./constants');
const { parseTemp } = require('./parsers');

(async () => {
  const db = knex({
    client: 'postgres',
    connection: process.env.DB_CONNECTIONSTRING,
    searchPath: ['public'],
  });

  await db.raw('SELECT 1+1 AS result');
  console.log("DB connected 👷‍♂️");

  const client = mqtt.connect(process.env.MQTT_BROKER, {
    // clientId: "mqttjs01",
    // username: "steve",
    // password: "password",
    // clean: true,
  });

  client.on('connect', () => {
    console.log("MQTT connected 🦟");
    client.subscribe(TOPICS.HARPHULT, () => {
      console.log('* Subscribing to ' + TOPICS.HARPHULT);
    });
    client.subscribe(TOPICS.HIVE_WEIGHT, (err) => {
      console.log('* Subscribing to ' + TOPICS.HIVE_WEIGHT);
      if (err) {
        console.error('MQTT Subscribe', err);
        return;
      }
      // client.publish(TOPICS.HIVE_WEIGHT, '2344');
    });
  });

  client.on('error', function(error) {
    console.error('Can\'t connect: ' + error);
    process.exit(1);
  });

  client.on('message', async (topic, message) => {
    if (topic === TOPICS.HARPHULT) {
      const parsedData = parseTemp(message.toString());
      console.log(parsedData);
      const timestamp = new Date();
      const d = await db('sensorValues').insert({
        unit: 'C',
        value: parsedData.temp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (topic === TOPICS.HIVE_WEIGHT) {
      const parsedData = parseTemp(message.toString());
      // TODO: Store in DB
      console.log(parsedData);
    } else {
      console.info('Unknown topic: ', topic);
    }
  });

})();
