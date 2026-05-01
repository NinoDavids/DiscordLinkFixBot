const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

// ─── Link replacement rules ───────────────────────────────────────────────────
const REPLACEMENTS = [
  {
    name: "Instagram",
    pattern: /https?:\/\/(www\.)?instagram\.com/gi,
    replacement: "https://www.kkinstagram.com",
  },
  {
    name: "Twitter / X",
    pattern: /https?:\/\/(www\.)?(twitter|x)\.com/gi,
    replacement: "https://fixupx.com",
  },
  {
    name: "TikTok",
    pattern: /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com/gi,
    replacement: "https://vt.tnktok.com",
  },
];

// Strings in the page HTML that indicate the post is dead
const DEAD_POST_SIGNALS = [
  "Sorry, that post doesn't exist",
  "This post is unavailable",
  "Page not found",
];

// ─── Counter ──────────────────────────────────────────────────────────────────
let fixedCount = 0;

/**
 * Returns the message content with all known links fixed,
 * or null if nothing changed.
 */
function fixLinks(content) {
  let fixed = content;
  for (const rule of REPLACEMENTS) {
    fixed = fixed.replace(rule.pattern, rule.replacement);
  }
  return fixed !== content ? fixed : null;
}

/**
 * Extracts all fixupx URLs from a string.
 */
function extractFixupxLinks(content) {
  const matches = content.match(/https:\/\/fixupx\.com\/\S+/g);
  return matches ?? [];
}

/**
 * Returns true if the URL points to a post that no longer exists.
 */
async function isDeadLink(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DiscordBot)" },
    });
    const html = await res.text();
    return DEAD_POST_SIGNALS.some((signal) => html.includes(signal));
  } catch {
    return false; // If we can't check, assume it's fine
  }
}

// ─── Message handler ──────────────────────────────────────────────────────────
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // !fixed command
  if (message.content === "!fixed") {
    await message.reply(`🔗 I've fixed **${fixedCount}** link${fixedCount !== 1 ? "s" : ""} so far!`);
    return;
  }

  const fixedContent = fixLinks(message.content);
  if (!fixedContent) return;

  const { channel, member, author } = message;

  const canManageWebhooks = channel
    .permissionsFor(message.guild?.members?.me)
    ?.has("ManageWebhooks");
  const canDeleteMessages = channel
    .permissionsFor(message.guild?.members?.me)
    ?.has("ManageMessages");

  // Check if any fixupx links are dead before posting
  const fixupxLinks = extractFixupxLinks(fixedContent);
  for (const link of fixupxLinks) {
    const dead = await isDeadLink(link);
    if (dead) {
      if (canDeleteMessages) {
        try { await message.delete(); } catch {}
      }
      await channel.send({
        content: `🗑️ ${author} posted a link to a post that no longer exists — it has been removed.`,
        allowedMentions: { parse: [] },
      });
      return;
    }
  }

  if (canManageWebhooks && canDeleteMessages) {
    try {
      const webhooks = await channel.fetchWebhooks();
      let webhook = webhooks.find((wh) => wh.name === "LinkFixer");

      if (!webhook) {
        webhook = await channel.createWebhook({ name: "LinkFixer" });
      }

      await message.delete();

      await webhook.send({
        content: fixedContent,
        username: member?.displayName ?? author.username,
        avatarURL: author.displayAvatarURL({ extension: "webp", forceStatic: false }),
        files: [...message.attachments.values()],
        allowedMentions: { parse: ["users", "roles"] },
      });

      fixedCount++;
      return;
    } catch (err) {
      console.warn("Webhook approach failed, falling back to reply:", err.message);
    }
  }

  // Fallback: reply with fixed links
  try {
    await message.reply({
      content: `🔗 **Fixed links:**\n${fixedContent}`,
      allowedMentions: { repliedUser: false },
    });
    fixedCount++;
  } catch (err) {
    console.error("Could not send reply:", err.message);
  }
});

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log("Watching for TikTok, Instagram and Twitter/X links…");
});

client.login("YOUR_TOKEN_HERE");
