const fs = require("fs");
const { absPath } = require("../../botconfig.json");
const { MessageEmbed } = require("discord.js");
const {
  bubbleSort,
  getServerList,
  runShellCommand,
} = require("../../functions");

module.exports = {
  config: {
    name: "stopserver",
    aliases: ["stops"],
    usage: "<server name>",
    category: "moderator",
    description: "Start a server testing server",
    accessableby: "Moderators",
  },
  run: async (client, message, args) => {
    let authRoles = message.member.roles.cache;

    if (
      authRoles.some((r) => r.name === "Admin") ||
      authRoles.some((r) => r.name === "Moderator") ||
      authRoles.some((r) => r.name === "dev")
    ) {
      if (!args[0]) {
        // no argument at all
        let choiceEmbed = new MessageEmbed()
          .setTitle("Server Stop Choices")
          .setDescription(
            "Choices of a Factorio Server Stop. This shows **all** folders in the `servers` directory, some may not be Factorio server folders"
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
        let dirData = getServerList();
        dirData = bubbleSort(dirData);
        dirData.forEach((dir) => {
          if (fs.statSync("../servers/" + dir).isDirectory())
            choiceEmbed.addField(`\`${dir}\``, "\u200B"); //check if it is a directory and if yes add it to the embed
        });
        return message.channel.send(choiceEmbed);
      } else {
        runShellCommand(
          `${absPath}/${args[0]}/factorio-init/factorio stop`
        ).catch((e) => {
          return message.channel.send(`Error stopping: \`${e}\``);
        });

        setTimeout(() => {
          runShellCommand(`${absPath}/${args[0]}/factorio-init/factorio status`)
            .catch((e) => {
              return message.channel.send(`Error statusing: \`${e}\``);
            })
            .then((out) => {
              return message.channel.send(`Server status: \`${out}\``);
            });
        }, 5000);
      }
    }
  },
};
