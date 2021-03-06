const Discord = require("discord.js");
const { searchOneDB } = require("../../functions");

module.exports = {
  config: {
    name: "fstatsserver",
    aliases: ["fstatss", "statss"],
    usage: '<server name> <"server"/"death"> [player]',
    category: "factorio",
    description: "View some statistics of the server",
    accessableby: "Members",
  },
  run: async (client, message, args) => {
    if (args[0]) {
      var server;
      if (message.mentions.channels.first())
        server = message.mentions.channels.first().name;
      else server = args[0];
    }
    if (!args[0]) {
      // no argument at all
      return message.channel.send(
        `Please add a server name or ping a server channel (\`#core\`)`
      );
    }
    if (!args[1]) {
      // if the server name is provided but no 2nd argument, searches for generic server data
      let statsEmbed = new Discord.MessageEmbed()
        .setTitle(`Server Statistics of \`${server}\``)
        .setDescription(
          `Some statistics of the ${server} Factorio server. Please check use to see other statistics. Server also may not exist, this message is however being sent`
        )
        .setColor("GREEN")
        .setAuthor(
          `${message.guild.me.displayName} Help`,
          message.guild.iconURL
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(
          `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
          client.user.displayAvatarURL()
        );
      let rockets = await searchOneDB(server, "stats", {
        rocketLaunches: { $exists: true },
      });
      if (rockets == null) rockets = 0;
      else rockets = rockets.rocketLaunches;
      statsEmbed.addField("Rockets launched", rockets);
      let research = await searchOneDB(server, "stats", {
        research: "researchData",
      });
      if (research == null) research = {};
      else research = research.completedResearch;
      let maxLevelResearch = ["none", 0];
      Object.keys(research).forEach(function (key) {
        if (parseInt(research[key]) > maxLevelResearch[1]) {
          maxLevelResearch[0] = key;
          maxLevelResearch[1] = parseInt(research[key]);
        }
      });
      statsEmbed.addField(
        "Highest level research",
        `\`${maxLevelResearch[0]}\` at level \`${maxLevelResearch[1]}\``
      );
      return message.channel.send(statsEmbed);
    }
    if (!args[3]) {
      // if supplied with both the username of player & deaths
      if (args[1] != "deaths")
        return message.channel.send("invalid parameter. please see help");
      if (!args[2])
        return message.channel.send(
          "Please supply with player name to view deaths!"
        );
      let statsEmbed = new Discord.MessageEmbed()
        .setTitle(`Death Statistics of \`${args[2]}\` on server \`${server}\``)
        .setDescription(
          `The death statistics of player \`${args[2]}\` from server  \`${server}\``
        )
        .setColor("GREEN")
        .setAuthor(
          `${message.guild.me.displayName} Help`,
          message.guild.iconURL
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(
          `© ${message.guild.me.displayName} | Developed by DistroByte & oof2win2 | Total Commands: ${client.commands.size}`,
          client.user.displayAvatarURL()
        );
      let player = await searchOneDB(server, "deaths", {
        player: `${args[2]}`,
      });
      if (player == null)
        return message.channel.send(
          `Player \`${args[2]}\` not found on server \`${server}\``
        );
      let maxDeaths = ["str", 0];
      Object.keys(player.deaths).forEach(function (key) {
        if (parseInt(player.deaths[key]) > maxDeaths[1]) {
          maxDeaths[0] = key;
          maxDeaths[1] = parseInt(player.deaths[key]);
        }
      });
      statsEmbed.addField(
        "Highest amount of deaths",
        `\`${maxDeaths[1]}\` due to cause \`${maxDeaths[0]}\``
      );
      delete player.deaths[maxDeaths[0]]; //delete the already added maxDeaths from the rest of the deaths to prevent it being there twice

      // to sort deaths by most deaths
      var sortable = [];
      for (var death in player.deaths) {
        sortable.push([death, player.deaths[death]]);
      }
      sortable.sort(function (a, b) {
        return b[1] - a[1];
      });
      player.deaths = undefined;
      player.deaths = {};
      sortable.forEach(function (item) {
        player.deaths[item[0]] = item[1];
      });

      let i = 1;
      for (var key of Object.keys(player.deaths)) {
        if (i == 24) break; // discord embed limit of max fields, we already added one
        statsEmbed.addField(
          `Death cause: \`${key}\``,
          `Number of deaths from cause: ${player.deaths[key]}`
        );
        i++;
      }

      return message.channel.send(statsEmbed);
    }
  },
};
