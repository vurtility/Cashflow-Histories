# Thumbnail study: what the audited competitors' hits have in common

Sampled Nov 2026: the 12 audited outliers (`audit-log.md`), Modern MBA's 10 most-viewed videos and its 5 least-viewed (channel median ~620K).

## What the hits do
1. **The brand is the hero.** A giant, instantly recognisable logo, mascot or storefront: the KFC Colonel (3.9M), the WhatsApp icon (5.3M), the Airbnb logo (3.4M, 4.0M), Chuck E. Cheese (6.4M), Sprint's sign on its building (2.2M). The topic reads in under a second.
2. **2–4 words, and they're a verdict or a question,** not a description: "What Happened??", "Betrayal", "We give up", "airbnbust", "$12.7B FRAUD", "Why hotels don't fear Airbnb".
3. **One dominant subject.** A hero product shot fills the frame (Modern MBA's steak 3.5M, cookies 2.3M, bubble tea 1.6M) or one storefront or building does.
4. **A simple decline symbol** where the story is about decline: a red falling arrow (DTC startups, 1.6M), fire (Sprint), a "What Happened??" in red.
5. **Faces help for founder stories** (Nike 3.9M, Luckin's CEO 1.6M), shown big and in emotion, not as small figures.

## What the flops do (Modern MBA's bottom five, 91–150K)
- Collages of many small objects (Insta360, Abercrombie), maps with many labels (Iraq/Ukraine), niche subjects.
- No single focal point, small text, a brand nobody recognises at a glance.

## Rules for this channel
- Big real logo or storefront, readable on a phone; one subject; at most four words.
- The words pose the video's central question or verdict, and must be true to what the video shows.
- Keep Ink Misprint (pink/blue/yellow, slab type, registration marks) as the frame, but let the real photo and logo dominate.
- Make three variants for YouTube's Test & Compare: one paradox, one question, one face or product hero.
- Implementation: `studio/src/episode/Thumbs.tsx` (composition `Thumb-<episode>`, prop `v`).
