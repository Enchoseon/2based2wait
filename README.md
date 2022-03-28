# 2Based2Wait

Lightweight & (theoretically) extensible 2b2t proxy.

# Quick Start

Go to `config.json` and configure the following values (see [configuration guide](https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide) for a more thorough explanation):

- `account.username`: Your Minecraft account username.
- `discord.webhook.position`: The URL of the Discord webhook to send updates on your position in queue.
- `discord.webhook.livechat`: The URL of the Discord webhook to relay livechat.
- `discord.webhook.sensitive`: The URL of the Discord webhook to relay sensitive information like who connects or the Ngrok tunnel URL.
- `discord.id`: The ID of the Discord user to ping for important stuff. (This can also be a role!)
- `proxy.whitelist`: Playernames of accounts that are allowed to connect to the proxy.

Then run `npm install` and `npm start`. Instructions will appear in the console to enter an auth code into microsoft.com/link if this is your first time using this account. Finally, connect to `127.0.0.1` in Minecraft.

# Features

- Proxy
- Livechat relay
- Queue position relay
- Toast notifications on restarts/position
- Extensive logging
- Ngrok tunneling

# Things to Keep in Mind

There is no auto-reconnect by default. See [this guide](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor) for a very simple way to have a proxy auto-reconnect.

Also, running this on a VPS probably won't go well due to the notifier library and the fact that pertinent info like the Microsoft auth code is only briefly visible in the console. Luckily, most use cases involving sharing accounts is handled by TCP forwarding with [Ngrok](https://ngrok.com/).

Additionally, since disconnecting from the proxy won't disconnect the actual account on 2B2T, most auto-disconnect hacks won't work. Forcing a disconnect by sending incorrect packets works, but I don't know any clients that do that for their auto-disconnects.

You can disconnect from the local server, swap out your clients, & change your mods without disconnecting the proxy client (as long as you do it in a timely manner)—which is very useful if you don't have priority queue and/or you have a mod stack with fatal memory leaks. Not to mention the fact that you can sit in queue spending orders of magnitude less RAM and CPU. You can even play on other servers while queueing with the same account!

# Planned Features

- Queue time estimator.
- Automatic screenshotter.
- Mineflayer bot (probably just kill aura and auto-eat).
- Auto `/queue main`.
- Make Microsoft auth less painful.
- Scalability with multiple accounts.
