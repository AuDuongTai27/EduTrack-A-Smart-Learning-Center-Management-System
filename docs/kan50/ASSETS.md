# KAN-50 illustrative assets

The separately referenced subject assets and `02-hero-style-reference.png` were not available. The supplied full-page reference informed the art direction. These are newly generated illustrations, not verified photos of the center or its staff.

Generated using the built-in `image_gen` tool, then resized/encoded as WebP using Chrome canvas. Final project assets are in `Capstone2/frontend/public/assets/landing/`. Source PNGs remain in the tool's generated-images directory, outside the repository; only optimized WebP files are shipped. No database image fields were added. Teacher avatars are never sourced from these illustrations.

## Hero prompt (final)

Use case: photorealistic-natural. Asset type: EduTrack learning center landing page hero illustration, landscape 3:2. Four Vietnamese teenage students in white polo shirts with forest green collars collaborating around a laptop at a bright airy study table, books and notebooks, natural candid happy concentration. Modern classroom, soft sunlight, indoor plants, mint and white palette, premium academy editorial photography. Tight group composition fitting entire image, no text, no watermark, no logos. This is an illustrative scene, no real teacher identities.

Outputs: `hero.webp` (1200px wide, 107,098 bytes), `hero-mobile.webp` (700px wide, 50,104 bytes).

## Subject prompts (final)

Each was a separate built-in generation with this exact template, substituting the subject line below:

Use case: stylized-concept. Website subject banner illustration, landscape 3:2, soft polished 3D academic objects on pastel backdrop. **SUBJECT LINE**. A small tasteful arrangement centered in wide composition, generous negative space. Modern academy style, soft natural shadows, premium studio render. No text, no lettering, no logos, no people, no watermark.

| Subject line | Final output (640px wide) |
| --- | --- |
| Mathematics: mint green books, compass, set square and geometric shapes | `mathematics.webp`, 12,246 bytes |
| Physics: blue books and a beautiful blue atomic orbital model with small orange nucleus | `physics.webp`, 12,990 bytes |
| English: lavender books and purple over-ear headphones | `english.webp`, 11,600 bytes |

Chemistry and subjects without raster art use local SVG icons and CSS gradients. These are decorative subject illustrations, not photos of actual classes.
