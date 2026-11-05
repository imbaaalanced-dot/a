# fal.ai asset pipeline (development only)

This tool generates **review assets**, not runtime sprites. It is not imported by the browser game and must never expose `FAL_KEY` in client code.

## Requirements
Node.js 20+ and a fal.ai account with credits. Set `FAL_KEY` as a private environment variable on your own development machine. Do not commit the key or paste it into an issue.

## Usage
```sh
FAL_KEY="YOUR_PRIVATE_KEY" node tools/fal-assets.mjs --generate --prompt "Dark fantasy isometric weathered German stone monument, isolated asset, transparent-looking plain background"
```

For reference-image variations:
```sh
node tools/fal-assets.mjs --generate --model fal-ai/flux-kontext/dev --image-url https://example.com/reference.png --prompt "Preserve silhouette; change material to mossy dark stone"
```

The tool makes **one billable submission** only when `--generate` is explicitly supplied. It stores the request ID immediately in `generated/fal-review` and does not resubmit after an interruption. Check the existing request ID in the fal dashboard before trying again. Output files require manual inspection, cropping, atlas assembly, optimization, and game integration. Animation frames are not generated automatically.

For security, keep `generated/fal-review` out of Git until assets have been reviewed and rights checked. Never embed API keys in GitHub Pages.
