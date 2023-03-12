<div align="center">
	<h2>2Based2Wait</h2>
	<p>Lightweight & (theoretically) extensible 2b2t proxy.</p>
	<img src="https://img.shields.io/github/last-commit/donbendito/2based2wait?color=2A0944&labelColor=525E75&style=flat" alt="Last Commit">
	<img src="https://img.shields.io/github/languages/code-size/donbendito/2based2wait?color=3FA796&labelColor=525E75&style=flat" alt="Code Size">
	<img src="https://img.shields.io/github/package-json/v/donbendito/2based2wait?color=FEC260&labelColor=525E75&style=flat" alt="Current Version">
	<img src="https://img.shields.io/github/license/donbendito/2based2wait?color=A10035&labelColor=525E75&style=flat" alt="License">
</div>

# Quick Start

1. In `default-config.json`, configure the following values:
    - `YOUR USERNAME`: The name of the Minecraft account that will be functioning as a proxy.
    - `YOUR WHITELISTED PLAYERNAMES`: Playernames of accounts that are allowed to connect to the proxy.
2. Run `pnpm install`
3. Run `pnpm start`
4. Enter the auth code that appears in the console into microsoft.com/link
5. Connect to `localhost:25565` in Minecraft or whatever you set your port to.
6. Connect to `localhost:3000` in your web browser or whatever you set your port to.

*(See [configuration guide](https://github.com/Enchoseon/2based2wait/wiki/Configuration-Guide) to see how to enable features like Ngrok tunneling or Discord webhooks.)*
# Bendito's Notes
I've been working on adding a web interface to go along with the project. Not a whole lot has been changed just added and improved a few things.

Change log:
- 
- Added web interface
- Added auto armor and auto totem
- Removed anti drown (interferes with pathfinder)
- Added whisper commands to mineflayer bot (Only works with whitelisted player)

I want to incorporate all features currently present and maybe merge this fork with the main project. All help is appreciated.

# Features

- Robust auto-reconnection
  - Battle-tested to be online 24/7/365
- High configurability
  - Easily configure small-to-medium-sized networks
- Convenient Discord webhooks for:
  - Livechat
  - Queue position
  - Tunnels & connections
- Toast notifications
- Auto `/queue main`
- Mineflayer support and extensibility *(see: `./utils/mineflayer.js`)*
  - Already comes with:
    - Kill aura
    - Auto eat
    - Anti afk
    - Auto armor
    - Auto totem
- Extensive logging
- Share proxies with plug-and-play Ngrok tunnels
  - Your machine's IP is never shared with players connecting to your proxy
  - Your players' IPs are never shared with your machine

# Images

<div align="center">
  <img src="docs/images/webui-1.png" title="good stuff?" alt="Cli Gui" width="92.5%"><br><emIts a work in progress</em><br>
  <img src="docs/images/cliGui.png" title="What else would you need?" alt="Cli Gui" width="92.5%"><br><em>No-Frills Cli Gui</em><br>
  <img src="docs/images/Screenshot 2023-03-11 at 10.30.50 PM.png" title="EZ elasticsearch integration :sunglasses:" alt="Webhooks" width="92.5%"><br><em>Convenient Discord Webhooks</em><br>
  <img src="docs/images/grep.png" title="grep -rih 'Popbob Sex' *" alt="Grep" width="92.5%"><br><em>Extensive Logs</em><br>
</div>
# For Developers

If you have a local copy of 2based2wait with a personal config.json that's being tracked by git despite the .gitignore rule, run the following command:

`git update-index --assume-unchanged config.json`

# Keep in Mind

2based2wait ships with as many options __disabled by default__ as possible; including [auto-reconnect](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor), [ngrok tunneling](https://github.com/Enchoseon/2based2wait/wiki/How-to-Share-Accounts-With-A-Reverse-Proxy) (for sharing accounts), [coordination](https://github.com/Enchoseon/2based2wait/wiki/How-to-Proxy-Multiple-Accounts) (for multiple proxies), Discord webhooks, and much more.

<div align="center">
  <img src="docs/images/RTFM.png" alt="Read the Fun Manual">
  <p><strong>If you want to utilize all the proxy's features you'll need to <a href="https://en.wikipedia.org/wiki/RTFM">RTFM</a>, <em>especially</em> the <a href="https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md">configuration guide</a>.</strong></p>
</div>
