/*
 * This is a heavily trimmed-down configuration file that you can use as a starting point!
 * 
 * It's HIGHLY recommended you read the wiki if you want to:
 * - Learn every single feature this proxy has (https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide)
 *   - ^ A LOT of useful features aren't shown in this file and aren't enabled by default, such as ngrok tunneling
 *   - ^ Change values away from their defaults (e.g. log cutoff)
 * - Enable robust autoreconnecting (https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor)
 * - Coordinate multiple accounts (https://github.com/Enchoseon/2based2wait/wiki/How-to-Proxy-Multiple-Accounts)
 * - Learn the ideal setup for accounts with priority queue (https://github.com/Enchoseon/2based2wait/wiki/How-to-Configure-Accounts-With-Priority-Queue)
 */
{
	"account": {
		"username": "YOUR USERNAME"
	},

	"proxy": {
		"whitelist": [ "YOUR WHITELISTED PLAYERNAMES" ],
		"port": 25565
	},

	"discord": {
		"active": false,
		"webhook": {
			"spam": "YOUR DISCORD WEBHOOK",
			"livechat": "YOUR DISCORD WEBHOOK",
			"status": "YOUR DISCORD WEBHOOK"
		},
		"id": "424701879151230977"
	},

	"queueThreshold": 21,

	"server": {
		"host": "connect.2b2t.org",
		"port": 25565,
		"version": "1.12.2"
	},

	"mineflayer": {
		"active": true,
		"autoQueueMainInterval": 690,
		"killAura": {
			"interval": 0.69,
			"blacklist": [ "zombie_pigman", "enderman" ]
		},
		"autoEat": {
			"priority": "saturation",
			"startAt": 19,
			"bannedFood": [ "rotten_flesh", "pufferfish", "chorus_fruit", "poisonous_potato", "spider_eye" ]
		},
		"antiAfk": {
			"actions": [ "rotate", "swingArm" ],
			"fishing": false,
			"chatting": false,
			"chatMessages": [ "!pt", "!queue" ],
			"chatInterval": 690420
		}
	},

	"coordination": {
		"active": false,
		"path":  "./../"
	},
	"noCliGui": false,
	"webinterface": {
		"enabled": true,
		"port": 3000,
	}
}
