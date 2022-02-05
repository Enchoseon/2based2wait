# 2Based2Wait

Lightweight & (theoretically) extensible 2b2t proxy.

# Quick Start

Go to config.json and configure the following values:
- `account.username`: Your Minecraft username
- `account.password`: Your Minecraft password (Not needed if you're using a Microsoft account. Log-in instructions will appear in the console.)
- `account.auth`: Your Minecraft account type ("mojang"/"microsoft")
- `discord.webhookURL`: The URL of the Discord webhook to send update messages to.
- `discord.id`: The ID of the Discord user to ping for important stuff.

Then run `npm start` & connect to `localhost:25565` in Minecraft.

# Important Notes

This proxy is just *barely* stable enough for actual use. There is also no auto-reconnect anymore because it's annoying, doesn't work, and would be better handled on your end with a robust keep-alive library like [Forever](https://github.com/foreversd/forever) or [Nodemon](https://github.com/remy/nodemon).

This also hasn't been tested on a VPS yet. It also probably won't work due to the notifier library and the fact that pertinent info like the Microsoft verification code is only briefly visible in the console, which is annoying.

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
- Queue time estimator.
- Automatic screenshotter.
