const { Client, Collection } = require("discord.js");
var Tail = require("tail").Tail;
const chatFormat = require("./chatFormat");
const { token, prefix } = require("./botconfig.json");
const servers = require("./servers.json"); // tails, fifo, discord IDs etc.
const { discordLog, awfLogging, datastoreInput } = require("./functions");

let serverTails = [];
let discordLoggingTails = [];
let awfLoggingTails = [];
let datastoreTails = [];
Object.keys(servers).forEach((element) => {
  awfLoggingTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/awflogging.out`
    ),
    servers[element],
  ]);
  discordLoggingTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/discord.out`
    ),
    servers[element],
  ]);
  serverTails.push([new Tail(servers[element].serverOut), servers[element]]);
  datastoreTails.push([
    new Tail(
      `../servers/${servers[element].serverFolderName}/script-output/ext/datastore.out`
    ),
    servers[element],
  ]);
});

const client = new Client();

client.prefix = prefix;

["commands", "aliases"].forEach((x) => (client[x] = new Collection()));
["command", "event"].forEach((x) => require(`./handlers/${x}`)(client));

client.login(token);

serverTails.forEach((element) => {
  element[0].on("line", function (line) {
    chatFormat(line, element[1].discordChannelID, client, element[1].name);
    console.log(`[${element[1].name}] ${line}`);
  });
});
discordLoggingTails.forEach((element) => {
  element[0].on("line", function (line) {
    discordLog(
      line,
      element[1].discordChannelID,
      client,
      element[1].discordChannelName
    );
  });
});
awfLoggingTails.forEach((element) => {
  element[0].on("line", function (line) {
    awfLogging(
      line,
      element[1].discordChannelID,
      client,
      element[1].discordChannelName
    );
  });
});
datastoreTails.forEach((element) => {
  element[0].on("line", function (line) {
    datastoreInput(
      line,
      element[1].discordChannelID,
      client,
      element[1].discordChannelName,
      element[1]
    );
  });
});
