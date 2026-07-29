const server = require('./server');
const bot = require('./bot');

async function start() {
  await server.start();
  await bot.start(server.io, server.app);
}

start().catch(err => {
  console.error('Fatal error starting app', err);
  process.exit(1);
});
