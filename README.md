# 🔗 Discord Link Fixer Bot

A Discord bot that automatically replaces social media links with embed-friendly alternatives so previews actually work.

| Platform | Original | Fixed |
|----------|----------|-------|
| Instagram | `instagram.com/...` | `kkinstagram.com/...` |
| Twitter / X | `twitter.com/...` / `x.com/...` | `fixupx.com/...` |
| TikTok | `tiktok.com/...` | `vt.tnktok.com/...` |

When someone sends a link, the bot deletes the original message and reposts it under their name and avatar with the fixed link — so it looks completely native. If a post no longer exists, it deletes the message and notifies the channel.

---

## Features

- Fixes Instagram, Twitter/X, and TikTok links automatically
- Reposts as the original user via webhook (looks native, no "bot replied" banner)
- Detects deleted/unavailable posts and removes them with a notification
- `!fixed` command shows how many links have been fixed since the bot started
- Falls back to a reply if it doesn't have webhook permissions

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/discord-link-fixer
cd discord-link-fixer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** and give it a name
3. Go to the **Bot** tab → click **Add Bot**
4. Under **Privileged Gateway Intents**, enable all three:
   - Presence Intent
   - Server Members Intent
   - **Message Content Intent** ← required
5. Copy your **Token** — you'll need it in the next step

### 4. Add your token

Open `index.js` and find the very last line at the bottom of the file:

```js
client.login("YOUR_TOKEN_HERE");
```

Replace `YOUR_TOKEN_HERE` with your actual bot token:

```js
client.login("MTQ5OTgy...");  // paste your token between the quotes
```

### 5. Invite the bot to your server

1. Go to your app → **OAuth2** → **URL Generator**
2. Under **Scopes**, check `bot`
3. Under **Bot Permissions**, check `Administrator` (or at minimum: Read Messages, Send Messages, Manage Messages, Manage Webhooks)
4. Copy the generated URL at the bottom and open it in your browser to add the bot to your server

### 6. Run the bot

```bash
node index.js
```

You should see:
```
✅ Logged in as YourBot#1234
Watching for TikTok, Instagram and Twitter/X links…
```

---

## Commands

| Command | Description |
|---------|-------------|
| `!fixed` | Shows how many links the bot has fixed since it started |

---

## Adding more link rules

Open `index.js` and add to the `REPLACEMENTS` array near the top:

```js
const REPLACEMENTS = [
  // existing rules...
  {
    name: "Your Platform",
    pattern: /https?:\/\/(www\.)?yourplatform\.com/gi,
    replacement: "https://fixedversion.com",
  },
];
```

---

## Permissions the bot needs

For the best experience (webhook mode), the bot needs:

- **Read Messages / View Channels**
- **Send Messages**
- **Manage Messages** — to delete the original
- **Manage Webhooks** — to repost as the original user

Without Manage Webhooks or Manage Messages it will fall back to replying to the message instead.

---

## Requirements

- Node.js 18 or higher
- A Discord bot token
