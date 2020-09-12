# Telegram 1090
An airplane tracking bot that supplies users with data from a dump1090 datasource.

Read more about my setup on my blog: https://tyler.nien.house/2019/06/whats-that-plane-i-hear-telegram1090/

## 1. Setup/Installation
### RaspberryPi/Raspbian
1. Install `dump1090` - FlightAware's fork of it is available through their official Raspbian repo. You can follow [the instructions on their site](https://flightaware.com/adsb/piaware/install), skipping the PiAware installation and going straight to the dump1090-fa installation. The great thing about the FlightAware fork is it automatically runs at boot and provides a nice web UI to check your data.
1. Install Node.js 10 or newer - If the required version isn't included in Raspbian's default repos, you many need to either get it directly from the [Node.js website](https://nodejs.org/en/), from [NodeSource's binary packages](https://github.com/nodesource/distributions), or using [nvm](https://github.com/nvm-sh/nvm).
1. Clone this repo to a convenient location - `git clone https://github.com/flakeparadigm/telegram1090.git`
1. Prepare the configuration - copy `config.json.example` to `config.json` and updated the values where necessary. Primarily the home lat/lon and telegram token.
1. Run the bot in the foreground - `npm start` in the repo directory.

#### Running as a service
1. Build the TypeScript code for direct use with Node - `npm run build` in the repo directory.
1. Prepare the systemd service unit file by copying `telegram1090.service.example` and updating the `User`, `Environment=PATH` and `WorkingDirectory` lines.
1. Copy or symlink this updated file - `sudo ln -s telegram1090.service /lib/systemd/system/telegram1090.service`
1. Test the service to make sure it's working:
    - Trigger a systemd reload of services for new/changed service files - `sudo systemctl daemon-reload`
    - Try to start the service - `sudo systemctl start telegram1090`
    - Check the status of the service - `sudo systemctl status telegram1090`
    - Check the logs - `journalctl -fn 20`
1. Enable the service `sudo systemctl enable telegram1090`
1. Reboot and check check the status of the service to ensure it started up properly

#### Removing the service
1. Disable the service - `sudo systemctl disable telegram1090`
1. Remove the service unit file - `sudo rm /lib/systemd/system/telegram1090.service`

#### Updating
If updates are availble, simply `git pull origin` to update your local repo, run `npm run build`, and restart the service `sudo systemctl restart telegram1090` or reboot.

## 2. Bot notifications
After you have the service running, you'll need to start a Telegram chat with the bot and subscribe to the notifications using the `subscribe` command.

### Commands
#### subscribe
Subscribes you to the notification messages and must be done before the bot is able to send you any messages. The service saves any subscribed chats to a file perioditcally, so it should be able to maintain the chats between restarts.

#### unsubscribe
Removes your subscription to the notification messages. After running this command you should no longer receive any messages from this bot.

#### status
Respons to you with your current subscription status without changing it.

## Extra reading
- How Flightradar24 (and other similar sites) works. https://habr.com/en/post/440596/
- Introduction to ADS-B. `https://www.icao.int/APAC/Meetings/2012_SEA_BOB_ADSB_WG8/SP01_AUS - ADS-B Basics.pdf` (Copy and paste this including the spaces. Their site has some struggles with escape characters in URLs)
- Telegram Bots. https://core.telegram.org/bots
- Creating systemd services. https://www.linode.com/docs/quick-answers/linux/start-service-at-boot/
