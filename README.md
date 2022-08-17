<div align="center">
	<h1>2Based2Wait</h1>
	<p>Lightweight & (theoretically) extensible 2b2t proxy.</p>
	<h4>
		<a href="https://github.com/Enchoseon/2based2wait/wiki">Wiki</a>
		<span> · </span>
		<a href="https://github.com/Enchoseon/2based2wait/issues">Report Bug</a>
	</h4>
</div>

<br />

# Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Images](#images)
- [Things to Keep in Mind](#things-to-keep-in-mind)
- [Planned Features](#planned-features)

# Quick Start

1. In `config.json`, configure the following values:
    - `account.username`: Your Minecraft account playername.
    - `proxy.whitelist`: Playernames of accounts that are allowed to connect to the proxy.
2. Run `npm install`
3. Run `npm start`
4. Enter the auth code that appears in the console into microsoft.com/link
5. Connect to `127.0.0.1` in Minecraft

*(See [configuration guide](https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide) to see how to enable features like Ngrok tunneling or Discord webhooks.)*

# Features

- Low resource overhead
- Robust auto-reconnection & coordination
- High configurability
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

# Images

![cli gui](https://files.catbox.moe/osgsqc.png "cli gui")
![livechat relay](https://files.catbox.moe/b3fl8s.png "livechat relay")
![queue relay](https://files.catbox.moe/dgepgx.png "queue gui")

# Things to Keep in Mind

Many important features are __disabled by default__, such as [auto-reconnect](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor), ngrok tunneling, Discord webhooks, and much more.

If you want to enable these features or configure a proxy (or multiple) for your use case, you will need to read the Wiki.

You can disconnect from the proxy, swap out your clients, & change your mods without disconnecting the proxy client (as long as you do it in a timely manner)—which is very useful if you don't have priority queue and/or you have a mod stack with fatal memory leaks. Not to mention the fact that you can sit in queue spending orders of magnitude less RAM and CPU. You can even play on other servers while queueing with the same account!
