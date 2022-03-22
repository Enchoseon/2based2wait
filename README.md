# 2Based2Wait

Lightweight & (theoretically) extensible 2b2t proxy.

# Quick Start

Go to config.json and configure the following values (see [the wiki](https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide) for a more thorough explanation):
- `account.username`: Your Minecraft username
- `account.password`: Your Minecraft password (Not needed if you're using a Microsoft account, just leave it blank and log-in instructions will appear in the console.)
- `account.auth`: Your Minecraft account type ("mojang"/"microsoft")
- `discord.webhook.position`: The URL of the Discord webhook to send updates on your position in queue.
- `discord.webhook.livechat`: The URL of the Discord webhook to relay livechat.
- `discord.webhook.sensitive`: The URL of the Discord webhook to relay sensitive information.
- `discord.id`: The ID of the Discord user to ping for important stuff. (This can also be a role!)
- `proxy.whitelist`: Playernames of accounts that are allowed to connect to the proxy.

Then run `npm install`, `npm start`, & connect to `localhost:25565` in Minecraft.

# Important Notes

This proxy is just *barely* stable enough for actual use. There is also no auto-reconnect anymore because it's annoying, doesn't work, and would be better handled on your end with a robust keep-alive library like [Forever](https://github.com/foreversd/forever) or [Nodemon](https://github.com/remy/nodemon).

This does probably doesn't work on a VPS due to the notifier library and the fact that pertinent info like the Microsoft code being only briefly visible in the console. For most use cases involving sharing accounts, TCP forwarders like [Ngrok](https://ngrok.com/) or [Sish](https://github.com/antoniomika/sish) will be enough.

# Features

- Proxy
- Livechat relay
- Queue position relay
- Toast notifications on restarts/position
- Extensive logging

# How it Works

Normally: `You` <=> `2B2T`

2Based2Wait: `You` <=> `Local Server` & `Bridge Client` <=> `Proxy Client` <=> `2B2T`

1. The proxy client connects to 2B2T like a normal player.
2. The local server & bridge client connect you to the proxy client.
3. ???
4. Profit.

# Pros & Cons

**Pros:**
- You can disconnect from the local server, swap out your clients, & change your mods without disconnecting the proxy client (as long as you do it in a timely manner).
  - If you don't have priority queue, this is especially useful.
  - If you use a mod stack that has fatal memory leaks, they'll be less fatal now.
- (Theoretically) extensible & developer-friendly!
  - ~~Mineflayer-ready.~~
- You can now sit in queue while spending orders of magnitude less RAM & CPU.
- You can play on other servers while queueing—with the same account!

**Cons:**
- None of your client's or mods' auto-disconnect hacks will work.

# Planned Features

- Better storage of logs.
  - Human-readable chat logs.
  - Chat coordinate logs.
- Queue time estimator.
- Automatic screenshotter.
- Mineflayer bot (probably just kill aura and auto-eat)
- Auto `/queue main`
- Make Microsoft auth less painful.
- Scalability with multiple accounts.
