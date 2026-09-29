# kolaru

Render web service deployment setup for the Discord voice bot host.

## Render configuration

Use these values in Render:

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables:
  - `HOST=0.0.0.0`
  - `PORT=10000`
  - `MAX_BOTS=5`
  - `BOT_TOKENS=your-token-here`
  - `VOICE_CHANNEL_IDS=your-channel-id-here`

## Notes

The app starts the bot monitor and health endpoint from [kolaru.js](kolaru.js).

Use the Token Manager's `Load Tokens from TXT` control to import multiple tokens. Put one token per line (or separate tokens with commas); duplicates are skipped. Imported tokens are saved to the server's ignored `.env` file and are returned to the page only in masked form. Do not commit token files or share them.
