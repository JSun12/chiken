const Discord = require('discord.js');
const fs = require('fs');
const mongodb = require('mongodb').MongoClient;
const config = require('./config.json');

const client = new Discord.Client(); 

client.once('ready', () => {
    console.log('RUSH B');
});

require('dotenv').config();
client.login(process.env.DISCORD_TOKEN);

// resolve available command modules and map it to command name
client.availableCommands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (var fileName of commandFiles) {
    const commandModule = require(`./commands/${fileName}`);

    // removes the last 3 characters in the file name (file extension)
    let commandName = fileName.slice(0, -3);

    client.availableCommands.set(commandName, commandModule);
}

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) {
        return;
    }

    mongodb.connect(process.env.MONGODB_URL, (err, dbClient) => {
        if (err) {
            message.channel.send('Error fetching server info.');
            console.log(err);
            return;
        }

        let db = dbClient.db("botdb");
        let found = db.collection('config').find({'_id': message.guild.id}).count();
        found.then((numItems) => {
            if (numItems == 0) {
                let newServerConfig = {_id: message.guild.id, 'teamChannels': []};
                db.collection('config').insertOne(newServerConfig, (err, res) => {
                    if (err) {
                        message.channel.send('Error storing server info.');
                    }
                    console.log('New server config saved...');
                    dbClient.close();
                });
            }
        })
        
    });

    let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    let cmd = args.shift();

    try {
        let cmdModule = client.availableCommands.get(cmd);
        cmdModule.run(client, message, args);
    } catch (err) {
        console.error(err);
    }
});
