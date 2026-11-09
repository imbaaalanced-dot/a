# TD2 V5 Hero Menu Assets

This folder is reserved for two independently cut out, optimized, alpha-transparent WebP files:

- `marcel-guardian-v5.webp` – Marcel with black cap, **blue hoodie**, sword and lion shield, **no sunglasses or backpack**.
- `kim-marksman-v5.webp` – Kim with black sunglasses, raised hair/pony tail, dark outdoor gear, ornate **bow**, **no backpack**.

The character portraits were generated and supplied in the ChatGPT conversation. Their final binary source files have **not yet been committed to this branch**.

## Direct GitHub upload (no fal credits required)

Upload the chat PNG sources under the following **exact names** on this feature branch:

- Marcel / blue Adidas hoodie: `marcel-source.png`
- Kim / black sunglasses and bow: `kim-source.png`

Once both sources are present, `.github/workflows/td2-v5-avatar-optimize.yml` will crop transparent margins, compress them into the two WebP names below, and commit **only those WebP images** to the feature branch. It never merges to `main`.

## Delivery and acceptance

1. Use the corresponding full-body alpha PNG sources from the conversation. Do not include the chroma-green backgrounds.
2. Trim transparent margins, preserve the facial likeness, and export each image to its exact filename above.
3. Keep each image within about 400–700px wide and **under 150KB** to protect 4GB mobile memory and fast startup. Quality should be evaluated at the actual display size.
4. Validate alpha edges, shadows, swords, quiver and bow string at 128px and 256px.
5. Upload **both files** to this folder on this feature branch. When either file is missing or invalid, the new decorator automatically keeps the existing working main menu.
6. Verify portrait and landscape, touch buttons, reduced motion, reload and image failures on Android Chrome.

**No gameplay / save logic is changed by this delivery.**
