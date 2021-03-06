# 2Based2Wait

Lightweight & (theoretically) extensible 2b2t proxy.

# Quick Start

Go to `config.json` and configure the following values (see [configuration guide](https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide) for a more thorough explanation):

- `account.username`: Your Minecraft account username.
- `discord.webhook.spam`: The URL of the Discord webhook to relay position in queue, new tunnels, connect/disconnects, and other spam.
- `discord.webhook.livechat`: The URL of the Discord webhook to relay livechat.
- `discord.webhook.status`: The URL of the Discord webhook to relay pertinent info for connecting and nothing else (e.g. joining server).
- `discord.id`: The ID of the Discord user or role to ping for important stuff.
- `proxy.whitelist`: Playernames of accounts that are allowed to connect to the proxy.

Then run `npm install` and `npm start`. Instructions will appear in the console to enter an auth code into microsoft.com/link if this is your first time using this account. Finally, connect to `127.0.0.1` in Minecraft.

# Features

- Easily scalable
  - Low resource overhead
  - Robust auto-reconnection & coordination
- Very configurable
- Livechat relay
- Queue position relay
- Toast notifications
- Auto `/queue main`
- Mineflayer support
  - Kill aura
  - Auto eat
  - Anti afk
  - Anti drowning
- Extensive logging
- Ngrok tunneling
  - Share accounts without sharing email access or getting blocked by Microsoft!

# Images

![cli gui](https://files.catbox.moe/osgsqc.png "cli gui")
![livechat relay](https://files.catbox.moe/b3fl8s.png "livechat relay")
![queue relay](https://files.catbox.moe/dgepgx.png "queue gui")

# Things to Keep in Mind

Auto-reconnect is not enabled by default. See [this guide](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor) for a very simple way to have a proxy auto-reconnect.

Also, running this on a VPS probably won't go well due to the notifier library and the fact that pertinent info like the Microsoft auth code is only briefly visible in the console. Luckily, most use cases involving sharing accounts is handled by TCP forwarding with [Ngrok](https://ngrok.com/).

Additionally, since disconnecting from the proxy won't disconnect the actual account on 2B2T, most auto-disconnect hacks won't work. Forcing a disconnect by sending incorrect packets works, but I don't know any clients that do that for their auto-disconnects.

You can disconnect from the proxy, swap out your clients, & change your mods without disconnecting the proxy client (as long as you do it in a timely manner)???which is very useful if you don't have priority queue and/or you have a mod stack with fatal memory leaks. Not to mention the fact that you can sit in queue spending orders of magnitude less RAM and CPU. You can even play on other servers while queueing with the same account!

# Planned Features

- Queue time estimator.
- Automatic screenshotter.
- Make Microsoft auth less painful.
- Scalability with multiple accounts.
- Error handling lol.
