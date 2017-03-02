/*
*   Haruna bot created by Jordan
*   node.js version of Haruna bot created in C#
*/

//Get access to Discord.js libraries here
const Discord = require('discord.js'); //load discord


//Initialise bot here
var haruna_js = new Discord.Client( {
    'autoReconnect': true
});


//Logging function
function log(level, msg) {
    console.log('[' + level + '] ' + msg);
}


//string arrays of files 
var pouts = [
    './images/pouts/pout1.png', './images/pouts/pout2.png',
    './images/pouts/pout3.png', './images/pouts/pout4.png',
    './images/pouts/pout5.png', './images/pouts/pout6.png',
    './images/pouts/pout7.png', './images/pouts/pout8.png',
    './images/pouts/pout9.png', './images/pouts/pout10.gif',
    './images/pouts/pout11.gif', './images/pouts/pout12.png',
    './images/pouts/pout13.png'
];

//store of smug paths
var smugs = [
    './images/smugs/smug1.png', './images/smugs/smug2.png',
    './images/smugs/smug3.png', './images/smugs/smug4.png',
    './images/smugs/smug5.png', './images/smugs/smug6.png',
    './images/smugs/smug7.png', './images/smugs/smug8.png',
    './images/smugs/smug9.png', './images/smugs/smug10.png',
    './images/smugs/smug11.png', './images/smugs/smug12.png',
    './images/smugs/smug13.png'
];

//store of selfie paths
var selfies = [
    './images/selfies/selfie1.png', './images/selfies/selfie2.png', './images/selfies/selfie3.png', './images/selfies/selfie4.png',
    './images/selfies/selfie5.png', './images/selfies/selfie6.png', './images/selfies/selfie7.png', './images/selfies/selfie8.png',
    './images/selfies/selfie9.png', './images/selfies/selfie10.png', './images/selfies/selfie11.png', './images/selfies/selfie12.png',
    './images/selfies/selfie13.png', './images/selfies/selfie14.png', './images/selfies/selfie15.png', './images/selfies/selfie16.png',
    './images/selfies/selfie17.png', './images/selfies/selfie18.png', './images/selfies/selfie19.png', './images/selfies/selfie20.png',
    './images/selfies/selfie21.png', './images/selfies/selfie22.png', './images/selfies/selfie23.png', './images/selfies/selfie24.png',
    './images/selfies/selfie25.png', './images/selfies/selfie26.png', './images/selfies/selfie27.png', './images/selfies/selfie28.png',
    './images/selfies/selfie29.png', './images/selfies/selfie30.png', './images/selfies/selfie31.png', './images/selfies/selfie32.png',
    './images/selfies/selfie33.png', './images/selfies/selfie34.png', './images/selfies/selfie35.png', './images/selfies/selfie36.png',
    './images/selfies/selfie37.png', './images/selfies/selfie38.png', './images/selfies/selfie39.png', './images/selfies/selfie40.png',
    './images/selfies/selfie41.gif', './images/selfies/selfie42.png', './images/selfies/selfie43.png', './images/selfies/selfie44.png',
    './images/selfies/selfie45.png', './images/selfies/selfie46.png', './images/selfies/selfie47.png', './images/selfies/selfie48.png',
    './images/selfies/selfie49.png', './images/selfies/selfie50.png', './images/selfies/selfie51.png', './images/selfies/selfie52.png',
    './images/selfies/selfie53.png', './images/selfies/selfie54.png', './images/selfies/selfie55.png', './images/selfies/selfie56.gif',
    './images/selfies/selfie57.png', './images/selfies/selfie58.png', './images/selfies/selfie59.png', './images/selfies/selfie60.png',
    './images/selfies/selfie61.png', './images/selfies/selfie62.png', './images/selfies/selfie63.png', './images/selfies/selfie64.png',
    './images/selfies/selfie65.png', './images/selfies/selfie66.png', './images/selfies/selfie67.png', './images/selfies/selfie68.png',
    './images/selfies/selfie69.png', './images/selfies/selfie70.png', './images/selfies/selfie71.png', './images/selfies/selfie72.png',
    './images/selfies/selfie73.png', './images/selfies/selfie74.png', './images/selfies/selfie75.png', './images/selfies/selfie76.png',
    './images/selfies/selfie77.png', './images/selfies/selfie78.png', './images/selfies/selfie79.png', './images/selfies/selfie80.png',
    './images/selfies/selfie81.png', './images/selfies/selfie82.png', './images/selfies/selfie83.png', './images/selfies/selfie84.png',
    './images/selfies/selfie85.png', './images/selfies/selfie86.png', './images/selfies/selfie87.png', './images/selfies/selfie88.png',
    './images/selfies/selfie89.png', './images/selfies/selfie90.png', './images/selfies/selfie91.png', './images/selfies/selfie92.png',
    './images/selfies/selfie93.png', './images/selfies/selfie94.png', './images/selfies/selfie95.png', './images/selfies/selfie96.png',
    './images/selfies/selfie97.png', './images/selfies/selfie98.png', './images/selfies/selfie99.png', './images/selfies/selfie100.png',
    './images/selfies/selfie101.png', './images/selfies/selfie102.png', './images/selfies/selfie103.png', './images/selfies/selfie104.png',
    './images/selfies/selfie105.png', './images/selfies/selfie106.png', './images/selfies/selfie107.png', './images/selfies/selfie108.png',
    './images/selfies/selfie109.png', './images/selfies/selfie110.png', './images/selfies/selfie111.png', './images/selfies/selfie112.png',
    './images/selfies/selfie113.png', './images/selfies/selfie114.png', './images/selfies/selfie115.png', './images/selfies/selfie116.png',
    './images/selfies/selfie117.png', './images/selfies/selfie118.png', './images/selfies/selfie119.png', './images/selfies/selfie120.png',
    './images/selfies/selfie121.png', './images/selfies/selfie122.png', './images/selfies/selfie123.png', './images/selfies/selfie124.png',
    './images/selfies/selfie125.png', './images/selfies/selfie126.png', './images/selfies/selfie127.png', './images/selfies/selfie128.png',
    './images/selfies/selfie129.png', './images/selfies/selfie130.png', './images/selfies/selfie131.png', './images/selfies/selfie132.png',
    './images/selfies/selfie133.png', './images/selfies/selfie134.png', './images/selfies/selfie135.png', './images/selfies/selfie136.png',
    './images/selfies/selfie137.png', './images/selfies/selfie138.png', './images/selfies/selfie139.png', './images/selfies/selfie140.png',
    './images/selfies/selfie141.png', './images/selfies/selfie142.png', './images/selfies/selfie143.png', './images/selfies/selfie144.png',
    './images/selfies/selfie145.png', './images/selfies/selfie146.png', './images/selfies/selfie147.png', './images/selfies/selfie148.png',
    './images/selfies/selfie149.png', './images/selfies/selfie150.png', './images/selfies/selfie151.png', './images/selfies/selfie152.png',
    './images/selfies/selfie153.png', './images/selfies/selfie154.png', './images/selfies/selfie155.png', './images/selfies/selfie156.png',
    './images/selfies/selfie157.png', './images/selfies/selfie158.png', './images/selfies/selfie159.png', './images/selfies/selfie160.png',
    './images/selfies/selfie161.png', './images/selfies/selfie162.png', './images/selfies/selfie163.png', './images/selfies/selfie164.png',
    './images/selfies/selfie165.png', './images/selfies/selfie166.png', './images/selfies/selfie167.png', './images/selfies/selfie168.png',
    './images/selfies/selfie169.png', './images/selfies/selfie170.png', './images/selfies/selfie171.png', './images/selfies/selfie172.png',
    './images/selfies/selfie173.png', './images/selfies/selfie174.png', './images/selfies/selfie175.png', './images/selfies/selfie176.png',
    './images/selfies/selfie177.png'
];

//store of idle texts 
var idleTexts = [
    'Yes, if you\'re fine with Haruna, I\'ll be your partner any time!',
    'Yes, Haruna is daijoubou desu!',
    'The admiral is very kind. Haruna appreciates your consideration.',
    'Haruna, accepting orders to standby..',
    'Daijoubou Desu!'
];


//**COMMANDS**
var commands = {
    //help command
    'help': {
        'function': function(args, content, author, channel, guild) {
            //TODO: things to make it cool
        },
        'description': 'sends this message'
    },

    //hello command
    'hello': {
        'function': function(args, content, author, channel, guild) {
            var response = 'Hello ' + author.username + '!';
            
            if(guild.owner.user.username === author.username)
                response += ' <3';

            channel.sendMessage(response)
            .then(message => console.log(`Sent message: ${message.content}`))
            .catch(console.error);
        },
        'description': 'does it work?'
    },

    'smug': {
        'function': function(args, content, author, channel, guild) {
            var pos = Math.floor(Math.random() * smugs.length); //TODO: change smugs.size -> length??

            var fileLocation = smugs[pos]; //TODO: figure out how to reference item in javascript array
            channel.sendMessage('', {
                 file: fileLocation
             })
            .then(message => console.log(`Sent message: ${message.content}${message.attachments.first().filename}`))
            .catch(console.error);
        },
        'description': 'sends a smug'
    },

    'pout': {
        'function': function(args, content, author, channel, guild) {
            var pos = Math.floor(Math.random() * pouts.length);

            channel.sendMessage('', {
                file: pouts[pos]
            })
            .then(message => console.log(`Sent message: ${message.content}${message.attachments.first().filename}`))
            .catch(console.error);
        },
        'description': 'sends a pout'
    },

    'selfie': {
        'function': function(args, content, author, channel, guild) {
            var pos = Math.floor(Math.random() * selfies.length);

            channel.sendMessage('', {
                file: selfies[pos]
            })
            .then(message => console.log(`Sent message: ${message.content}${message.attachments.first().filename}`))
            .catch(console.error);
        },
        'description': 'sends a haruna selfie'
    },

    'sleep': {
        'function': function(args, content, author, channel, guild) {
            channel.sendMessage('Goodnight ' + guild.owner.username + ' <3')
            .then(message => console.log(`Sent message: ${message.content}`))
            .catch(console.error);

            haruna_js.destroy();
        },
        'description': 'makes bot go offline'
    }
};


//**EVENTS**
//ready
haruna_js.on('ready', function() {
    log('INFO', 'Haruna is standing by in ' + haruna_js.guilds.size + ' guilds!')
});

//message
haruna_js.on('message', function(message) {
    //Set up variables from message
    var content = message.content;
    var author = message.author;
    var channel = message.channel;
    var guild = message.guild; //if channel is private, this will be null

    //possible character setup
    if(content.indexOf(']') === 0) { //check to see if message is a command
        var args = content.slice(1).split(' ');
        var command = args.shift().toLowerCase();
       
        if(commands[command] != null) { //check to see if the command exists
            //log command before execution
            if(channel.type === 'text') { //check if channel is in guild, get guild if private message
                log('CMD', '[' + guild.name + '' + '] ' 
                    + '[' + author.username + '#' + author.discriminator + '] ' + message.cleanContent);
            } else { //this accounts for private messages
                  log('CMD', '[' + author.username + '#' + author.discriminator + ']: ' + message.cleanContent); //don't include guild as it is null 
            }

            commands[command].function(args, content, author, channel, guild); //pass all relevant info - reduce code repetition
        }
    }
});

//server join
haruna_js.on('guildCreate', function(guild) {
    //TODO: update status message with correct number of guilds
    guild.size++;
});

//server leave
haruna_js.on('guildDelete', function(guild) {
     //TODO: update status message with correct number of guilds
     guild.size--;
});


//replace with token
haruna_js.login(require('./auth.json').token);