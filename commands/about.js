const Discord = require('discord.js');

exports.run = async(client, message, args) => {
    const aboutEmbed = new Discord.RichEmbed()
        .setColor('#ffa100')
        .setTitle('Bot Allu')
        .setDescription('Some description...');

    message.channel.send(aboutEmbed);
}