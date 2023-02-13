<div align="center">
	<h2>2Based2Wait</h2>
	<p>Lightweight & (theoretically) extensible 2b2t proxy.</p>
	<strong>
	<a href="https://github.com/Enchoseon/2based2wait/wiki">Wiki</a>
	<span> · </span>
	<a href="https://github.com/Enchoseon/2based2wait/issues/new">Report a Bug</a>
	<span> · </span>
	<a href="https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md">Configuration Guide</a>
	<span> · </span>
	<a href="https://github.com/Enchoseon/2based2wait/discussions">Discussions</a>
	</strong>
	<br><br>
	<img src="https://img.shields.io/github/last-commit/Enchoseon/2based2wait?color=2A0944&labelColor=525E75&style=flat" alt="Last Commit">
	<img src="https://img.shields.io/github/languages/code-size/Enchoseon/2based2wait?color=3FA796&labelColor=525E75&style=flat" alt="Code Size">
	<img src="https://img.shields.io/github/package-json/v/Enchoseon/2based2wait?color=FEC260&labelColor=525E75&style=flat" alt="Current Version">
	<img src="https://img.shields.io/github/license/Enchoseon/2based2wait?color=A10035&labelColor=525E75&style=flat" alt="License">
</div>

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Images](#images)
- [For Developers](#for-developers)

## Installation

### Prerequisites

- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/)
- [pnpm](https://pnpm.io/): `npm install -g pnpm`

### Quick Start

1. Clone the latest release: `git clone https://github.com/Enchoseon/2based2wait --branch v1.0.4 --depth 1 && cd 2based2wait`
2. Install dependencies: `pnpm install --prod`
3. Configure your proxy: 
	- Duplicate the `default-config.json` template file and rename it to `config.json`
	- Use the [configuration guide](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md) to configure your proxy
		- At the minimum you _must_ configure [`acccount.username`](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md#user-content-account-username) and [`proxy.whitelist`](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md#user-content-proxy-whitelist)
4. Start the proxy: `pnpm start`

### RTFM

We'll never phone home or enable something you didn't. In other words, you are responsible for enabling and configuring features such as:
- [Reconnecting to the server](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor)
- [Ngrok tunnelling to share the proxy with others](https://github.com/Enchoseon/2based2wait/wiki/How-to-Share-Accounts-With-A-Reverse-Proxy)
- [Coordinating multiple accounts at once](https://github.com/Enchoseon/2based2wait/wiki/How-to-Proxy-Multiple-Accounts)
- [And much more](https://github.com/Enchoseon/2based2wait/wiki)

<div align="center">
	<img src="docs/images/RTFM.png" alt="Read the Fun Manual">
	<p><em>"Read it and you'll understand everything", RMS</em></p>
</div>


## Features

- Extremely low RAM and CPU usage
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
		- Anti drowning
- Extensive logging
- Share proxies with plug-and-play Ngrok tunnels
	- Your machine's IP is never shared with players connecting to your proxy
	- Your players' IPs are never shared with your machine

## Images

<div align="center">
	<img src="docs/images/cliGui.png" title="What else would you need?" alt="Cli Gui" width="92.5%">
	<p><em>No-Frills Cli Gui</em></p>
	<img src="docs/images/webhooks.png" title="EZ elasticsearch integration :sunglasses:" alt="Webhooks" width="92.5%">
	<p><em>Convenient Discord Webhooks</em></p>
	<img src="docs/images/grep.png" title="grep -rih 'Popbob Sex' *" alt="Grep" width="92.5%">
	<p><em>Extensive Logs</em></p>
</div>

## For Developers

Dev dependencies can be installed with `pnpm i`. You must do this if you want to contribute to the project's source.
