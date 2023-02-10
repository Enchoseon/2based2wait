<div align="center">
	<h2>2Based2Wait</h1>
	<p>Lightweight & (theoretically) extensible 2b2t proxy.</p>
</div>

<div align="center">
  <a href="https://github.com/Enchoseon/2based2wait/wiki">Wiki</a>
  <span> · </span>
  <a href="https://github.com/Enchoseon/2based2wait/issues/new">Report a bug</a>
  <span> · </span>
  <a href="https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md">Configuration guide</a>
  <span> · </span>
  <a href="https://github.com/Enchoseon/2based2wait/discussions">Discussions</a>
  <br>
	<img src="https://img.shields.io/github/last-commit/Enchoseon/2based2wait?color=2A0944&labelColor=525E75&style=flat" alt="Last Commit">
	<img src="https://img.shields.io/github/languages/code-size/Enchoseon/2based2wait?color=3FA796&labelColor=525E75&style=flat" alt="Code Size">
	<img src="https://img.shields.io/github/package-json/v/Enchoseon/2based2wait?color=FEC260&labelColor=525E75&style=flat" alt="Current Version">
	<img src="https://img.shields.io/github/license/Enchoseon/2based2wait?color=A10035&labelColor=525E75&style=flat" alt="License">
</div>

<br>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Updating](#updating)
- [Features](#features)
- [Images](#images)
- [For developers](#for-developers)
- [Tips and Tricks](#Tips-and-Tricks)
- [RTFM](#RTFM)

## Prerequisites
- [Git](https://git-scm.com/)
- [NodeJS](https://nodejs.org/)
- [pnpm](https://pnpm.io/): `npm i -g pnpm`

## Installation

1. Clone the repository: `git clone https://github.com/Enchoseon/2bored2wait` and `cd 2bored2wait`
2. Install dependencies: `pnpm i --prod`
3. Modify settings: 
    - Copy and paste the `default-config.json`, and remove the `default-` from the file name
    - Modify the settings according to the [configuration guide](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md). For a minimal configuration, only set the [`acccount.username`](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md#user-content-account-username) and [`proxy.whitelist`](https://github.com/Enchoseon/2based2wait/blob/main/docs/configuration-guide.md#user-content-proxy-whitelist) values
4. Run the proxy: `pnpm start`

## Updating

1. Pull changes: `git pull`
2. Reinstall dependencies in case any have changed: `pnpm i`

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
  <img src="docs/images/cliGui.png" title="What else would you need?" alt="Cli Gui" width="92.5%"><br><em>No-Frills Cli Gui</em><br>
  <img src="docs/images/webhooks.png" title="EZ elasticsearch integration :sunglasses:" alt="Webhooks" width="92.5%"><br><em>Convenient Discord Webhooks</em><br>
  <img src="docs/images/grep.png" title="grep -rih 'Popbob Sex' *" alt="Grep" width="92.5%"><br><em>Extensive Logs</em><br>
</div>

## For Developers

### Install dev dependencies
Dev dependencies can be installed with `pnpm i`. You should only do this in case you want to contribute to the project's source

## Tips and Tricks

There are many other things you can do to customize your 2bored2wait install. You can:
- [Enable automatic reconnections](https://github.com/Enchoseon/2based2wait/wiki/How-to-Auto-Reconnect-with-Supervisor) to the server in case of any interruptions
- [ngrok tunnels](https://github.com/Enchoseon/2based2wait/wiki/How-to-Share-Accounts-With-A-Reverse-Proxy) if you want to share the proxy with other people
- [Enabling coordination](https://github.com/Enchoseon/2based2wait/wiki/How-to-Proxy-Multiple-Accounts) to be able to proxy multiple accounts at once
- [And much more](https://github.com/Enchoseon/2based2wait/wiki)

## RTFM

<div align="center">
  <p><strong>And as always, <a href="https://en.wikipedia.org/wiki/RTFM">RTFM</a>, <em>especially</em> before asking questions.</strong></p>
  <img src="docs/images/RTFM.png" alt="Read the Fun Manual">
</div>
