---
name: business-doc-script
description: Pick topics for, research, structure, write and fact-check retention-driven scripts for faceless business-documentary YouTube videos (company or industry breakdowns like "How X makes money", "Why Y is failing", "The business of Z"). Scores topic ideas, chooses between a single-company paradox ladder and an industry tournament format, digs out per-store unit economics (annual reports, investor decks, franchise disclosure documents), and writes with open loops, cliffhangers, a midpoint reveal, a loop ledger, a scorecard and a sourced fact-check log. Use this skill whenever the user asks for a YouTube script, video script, episode, documentary script or voiceover script, a rewrite or audit of one, or ideas for what video to make next about a company, industry or business model, even if they just say "do one on Costco", "next episode is Nvidia" or "what should we cover next" without saying "script".
---

# Business documentary scripts

This skill writes scripts for a faceless, narrated business-documentary channel: animated charts, maps and B-roll over a voiceover. **The script is the product.** Viewers stay because they always have a question they need answered, keep learning something they didn't expect, and every question the video raises gets a satisfying payoff.

Work through the stages below in order. Don't write narration until Stages 1 and 2 are done. Weak research and a weak structure can't be rescued by good lines.

Reference files, and when to read them:
- `references/framework.md`: the full craft rules, the 16-point scorecard and the device toolkit. Read it before Stage 2 on every script.
- `references/formats.md`: the three structures (single-company paradox ladder, industry tournament, power story). Read it in Stage 2.
- `references/audit-lessons.md`: what twelve high-performing videos from seven channels did well and badly, condensed. Read it in Stage 0, and when auditing someone else's script. `references/audit-log.md` has the full audit of each video, for when you need detail.
- `assets/script-template.md`: the output skeleton.

---

## Stage 0 — Topic check

Skip this if the user has already committed to a topic and only wants the script. Do it when they're choosing between ideas or ask what to cover next. Even with a fixed topic, run the check quickly, because it tells you which angle to lead with.

What drives views in this genre is mostly the topic and the title, not the script. Audits of a leading channel found that its biggest outliers were the *least* tightly structured scripts, while the best-structured one got fewer views. Structure keeps the people who click; the topic decides how many click. Score each idea from 1 to 5 on:

| Factor | Question | Why it matters |
|---|---|---|
| **Reach** | Has most of the audience personally paid this company or category? | Hotels, steakhouses and airlines beat a single trendy brand, because everyone has a receipt from them. |
| **Hidden-economics gap** | Is there a big difference between what people assume and how the money actually works? | This becomes the reveal, e.g. "Hilton owns under 2% of its hotels". |
| **Contrarian thesis** | Can the title overturn an assumption ("Why X Fails to…", "Can't Survive", "The Rigged…", "How X *Really* Makes Money")? | The title is the first open loop. Its promise is what gets the click. |
| **Comparison potential** | Are there 3–5 recognisable brands at different price points or eras? | This allows the tournament format, which gives viewers a "which one is mine?" reason to keep watching. |
| **Data availability** | Are there public per-store or per-customer numbers (10-K, investor decks, franchise disclosure documents)? | Per-unit economics are the payoff viewers come back for. No data means no reveal. |
| **Nostalgia** | Is it a brand from viewers' childhoods that faded or changed ("what happened to X?")? | Childhood brands produced the biggest multipliers seen (Chuck E. Cheese's ~40×, Kmart ~33×, KFC ~24×). |
| **Timeliness** | Is the company in the news right now (a bankruptcy, scandal, merger, earnings shock)? | A video released just after a bankruptcy filing rides peak search demand. Keep evergreen scripts ready to adapt when news breaks. |
| **Story material** | Is there a character, a conflict, a scene or a twist (a founder fight, a fraud exposed, a boardroom showdown)? | The best-crafted scripts all run on story as well as numbers. A topic with numbers but no story caps the script's quality. |

Prefer topics scoring 4+ on reach and on the hidden-economics gap, with nostalgia or timeliness as multipliers. The best-crafted script audited (Compaq, 49/60) had a niche topic and got 1.6M views, while weaker scripts on universal topics got 3–6M. Craft keeps viewers; the topic decides how many arrive. Present ideas as working title + thesis + scores, and recommend one.

## Stage 1 — Research dossier

Research before deciding the angle. The angle should come out of the facts, not be forced onto them.

**Where to look, in this order:**
1. **The company's own latest results.** Look for the results release (RNS or press release), the annual report, and the **investor presentation**. Presentations often hold the best comparison tables, such as cost per customer against rivals. Many are image-based PDFs: if a fetch returns no text, download the PDF and extract the text locally (e.g. `pypdf`), or extract the slide images and read them.
2. **Franchise disclosure documents (FDDs)**, for any franchised brand (restaurants, gyms, hotels, retail). In the US, franchisors must give these to prospective franchisees, and they're often public through state registries (e.g. California, Wisconsin, Minnesota) and FDD aggregator sites. **Item 19** gives store-level sales and sometimes costs and profit. **Items 5–7** give franchise fees and opening costs. **Item 6 and Item 8** show royalties, required suppliers and rebates the franchisor collects. **Item 20** gives store openings, closures and transfers by year, which shows whether franchisees are quitting. **Item 21** has the franchisor's own financial statements. This is how you uncover "the franchisor wins while franchisees lose" stories.
3. **Segment and unit data in filings:** restaurant-level margin, revenue per available room, average check, store counts by year. Build a **per-unit table** (per store, room, customer or flight) across several years and brands. It's the backbone of the script.
4. **The company's newsroom and statements** for quotes. A quote must be traced to the date and statement it came from. Press coverage often attributes a line to the wrong release.
5. **Quality press** (FT, Reuters, Bloomberg, WSJ, Irish Times, etc.) for history, controversies, context, and the company's response to criticism.
6. Wikipedia only as a map to primary sources. Never let it be the sole source for a number that will be shown on screen.
7. **Primary quotes and scenes:** founder memoirs and autobiographies, oral histories (e.g. the Computer History Museum), HBR or press interviews from the time, court rulings and filings, regulator decisions, and long-form reporting (WSJ, Bloomberg). These give you real quotes for irony punches ("You can charge a premium price if you build the best machines", followed by the executive leaving months later) and scenes for the climax.
8. **Anecdote bank:** alongside the shock bank, collect 10+ memorable human moments: quotes, stunts, absurd details, rumours that turned out false. Aim for one every 60–90 seconds of runtime. Examples: the founder calling his own gravy "wallpaper paste"; a coyote costume that arrived as a rat.
9. **What happened next:** for any story more than a year old, check the latest outcome. It's often the best ending (e.g. the coffee chain that faked its sales later overtook Starbucks in China).
10. **Optional, and hard to copy:** original reporting. A short interview with an operator, franchisee or independent rival adds emotion and material nobody else has. If the user can film or record one, plan where it goes in Stage 2.

**Fill in the dossier** (template in `assets/script-template.md`):
- **The assumption:** what a typical viewer believes about the company.
- **The truth:** the surprising reality that overturns or deepens it.
- **Central question:** one paradox the whole video answers.
- **Final payoff:** the answer as an *insight*, better than what a viewer would guess. "Chuck E. Cheese's had a bad pandemic" is a fact; "a private-equity debt load turned a temporary pay cut into foreclosure" is an insight.
- **Shock bank:** 10+ ranked facts that make someone say "wait, what?", each with a source.
- **Derived numbers:** this is where the best material usually comes from. Divide annual-report totals into per-unit numbers a viewer can feel: per customer, per day, per second, per employee, versus a rival. These are surprising precisely because nobody else has done the division. Show the working, and note any caveat (e.g. "averages; some costs relate to extras").
- **Stakes / antagonist**, **turning points** (3–5), **the human** (founder or CEO), and the **unresolved future**, which becomes the ending tension.

If the shock bank is thin or the final payoff is just a list of reasons, research more before moving on.

## Stage 2 — Format and loop map

**First, choose the format** (details in `references/formats.md`):
- **Single-company paradox ladder:** one company, one paradox ("How does a free app with no ads end up worth $19 billion?"). Use it when one company has a strong hidden-economics gap.
- **Industry tournament:** 3–5 brands at different price points or eras, each solving the previous one's problem, ending in a verdict ("which strategy wins?"). Use it for categories (steakhouses, hotels, cookie shops). It's the genre's most reliable format; the job is to give it the cliffhangers and reveal it usually lacks.
- **Power story:** a company whose story is about control, scandal, succession or a deal: who holds power, how, and what they did to keep it (Samsung and South Korea, a hostile takeover, a family feud). The climax is a story twist, often a heist-like sequence, rather than a number. Use it when the best material is people and decisions rather than unit economics. **Fraud exposés** are a variant with a fixed six-beat arc.
- **Twin/foil:** two companies facing the same problem with opposite outcomes ("Sprint had more customers, more money and a bigger brand, so how did it die while T-Mobile came back?"). The comparison holds the question to the end and answers itself.
- **Stakeholder squeeze:** every party in a market (customers, suppliers or hosts, the public or regulators, the platform), each with its own new problem. Good for marketplaces and platforms.
- **Founder origin:** the early years of a mega-brand, built around an audacity moment and a planted escape route. Never skip the conflict scene, and never end on "and then they grew".
- **Tragedy:** "the strength that made them became the weakness that killed them", named explicitly early and paid off late, often as a double fall (rise → fall → turnaround → hubris → fall). The best-crafted script audited (Compaq) used this.

Most strong scripts mix two engines: **numbers** (per-unit economics that make the viewer feel clever) and **story** (characters and decisions that make the viewer need to know what happens next). Whatever the format, make sure both are present. `references/formats.md` has the beat structure for each format.

**The title's question is the spine.** The viewer clicked on its promise, so ask it out loud in the cold open and don't fully answer it until the final act. Smaller reveals can land earlier, but the title question itself should still be open in the last third. Audited scripts lost momentum by settling the title question a third of the way in, then running 15+ minutes of other material.

Then plan the loop map. Each act answers the question the previous act opened, then opens a bigger one. Plan this as a table before writing. The single-company ladder looks like this:

```
COLD OPEN  paradox + stakes + promise; opens L1 (central question); plants a detail
ACT 1      the setup; a mini-loop opened and closed; ends on a cliffhanger
ACT 2      "the obvious answer", told as stories, not a list; ends with "but the maths still doesn't work"
ACT 3      MIDPOINT REVEAL: the strongest fact closes L1; opens "so why…?"
ACT 4      the threat: stakes rise; a twist; ends on a cliffhanger
ACT 5      the verdict: callback to the cold open with new meaning; the future question
```

Join beats with **"but" or "therefore", never "and then"**. If two beats can only be joined with "and then", there's no tension: find it or cut the beat.

Also plan **plants**: details set up early that pay off later (an image, a number, a line like "when everyone else panics, they buy"). A plant that pays off twice turns a sequence of facts into a story.

## Stage 3 — Write the script

Follow `references/framework.md` for line-level craft. The rules that matter most:

- **The first line is a specific, surprising fact or image.** No "In 1985…", no "Today we're looking at…", and no industry primer ("The restaurant industry is ruthless…", "Hotels seem like a simple business…"). Put the strongest per-unit number or comparison in the first 30 seconds. Every audited script buried its best number mid-video, behind minutes of context.
- **Don't read out a table of contents** ("first we'll cover X, then Y, then Z"). A list of sections is a promise of coverage; a question is a promise of an answer. Promise the answer.
- **The cold open poses the paradox and promises an answer, but never gives it.** If the cold open explains why, the viewer has no reason to stay.
- **Every act ends on a cliffhanger:** an unanswered question, a reversal, a teased number, or a jump in stakes.
- **Re-hook every 60–90 seconds** with a new shock, a loop opening or closing, a "you" moment ("When you buy a smartphone in South Korea, you buy it from Samsung. When you need life insurance…"), or a pattern interrupt.
- **The answer arrives as a reveal, not a list.** Turn "4 reasons" into: obvious reasons → "but that's still not enough" → the hidden reason.
- **Teach mechanisms with a worked hypothetical.** When the point depends on how something works (cross-shareholdings, franchise fees, debt and interest, inheritance tax, a merger ratio), build a tiny made-up example with round numbers and walk through it step by step: "Say there are just two companies, each worth $50 million, and the family owns half of one…". Then apply it to the real case. The viewer genuinely learns something and can follow the real numbers that come next. Label it on screen as a simplified example.
- **Use chain reveals for hidden power.** When influence runs through several layers, reveal it one link at a time: "The largest outside shareholder was the national pension fund. Which was run by the health ministry. Which was run by the government. Which was run by President Park." Each link is a small surprise, and the last one lands the point.
- **Interrupt to cliffhang.** Set up a hypothetical risk ("these structures are tenuous, especially when someone dies"), then cut to the real event that makes it concrete ("in May 2014, this happened"), shown on screen before it's explained.
- **Use the device toolkit.** `references/framework.md` lists the techniques that worked across the audited channels, grouped by job: openings, holding tension, reveals, voice and endings. Pick deliberately for each script. Ones worth reaching for often: a staccato number ladder or paradox as the first line; "a simple question that led somewhere darker"; withholding the real cause ("those don't explain it… here's the real issue"); chapter titles that work as cliffhangers; irony punches from the company's own confident quotes; and explicitly returning to the title question before the end.
- **Close every story thread, not just every question.** If the script says something "would be a death blow", the viewer needs to know what actually happened (e.g. the family paid a record inheritance tax in instalments and kept control). A missing "what happened next" feels like a loose end even when the main question is answered, and it's often the best final twist.
- **Be fair.** Where you criticise a company practice, give the company's stated reason first, then the point. It's more credible, and it creates push and pull. Don't assign motives ("this suggests leadership knows the boom won't last") unless a source supports it; present it as your reading of the numbers.
- **Name your sources on screen.** "Never-before-seen financials" with no source loses credibility. "From Crumbl's own franchise disclosure documents" gains it, and it makes the reveal feel earned.
- **Use financial terms precisely:** revenue (or sales) is the money in; profit (or earnings) is what's left. Say which kind of margin (store-level vs company, gross vs operating) and which period.
- **Write for the ear.** Spell numbers out the way they're spoken in the voiceover script ("nine point six billion") and use figures in the on-screen cues (`$9.6bn`).
- **Use real voices where they hit harder than narration.** When a real person said the line on camera (an interview, a keynote, an earnings call, a hearing, a TV ad, a local-news segment), cut to them saying it: a sound-up clip. The AI narrator sets it up in one line and reacts after. Aim for **3–6 per episode, 3–12s each, about 5–10% of runtime**. Use them for the moments that need conviction, emotion or authority: a founder's own words, an executive's denial, an angry customer. Write them as their own line in the script, `[SOT 8s: Speaker, role — "exact words" | source, date]`. The narration is not voiced during them, and the timeline leaves the gap. Only quote words you have verified from the source, and keep each clip as short as the point allows.
- **Quotes can come from any source; show them as that source.** A quote looks like where it came from, so it reads as a citation rather than a claim:
  - a newspaper or online-article clipping with the line highlighted
  - an interview or podcast transcript snippet
  - a book page
  - a filing or court-document excerpt
  - an earnings-call line
  - a press release
  - a post card (X, LinkedIn, Reddit, Instagram, Glassdoor, reviews) with the handle, date and engagement visible.
  Write them as `[QUOTE: Speaker or outlet, date — "exact words" | source url]`, or `[POST: platform @handle, date — "text" | url]` for social posts. Use them for public reaction, insider claims, expert takes and the company's own words. Verify the exact wording, and attribute it exactly. If a clip of the person saying it exists, prefer the real-voice clip.
- **Use real brand logos and brand assets.** Real logos, products, packaging, stores and ads make the story credible and recognisable, so use them on screen, in charts (logo next to its bar) and in thumbnails. Use them to identify the company, never to suggest the company endorses or sponsors the video, and don't distort a logo in a way that mocks or misrepresents it.
- Put a visual cue before each line: `[GFX: …]` for animated graphics, `[BROLL: …]` for footage, `[VISUAL: …]` for title cards and staging, `[DOC: …]` for a document or headline with the highlighted line, `[QUOTE: …]` for a quote from any source, `[POST: …]` for a social post, `[LOGO: …]` where a brand's logo should appear, `[SOT …]` for a real-voice clip. Mark loops in the margin: `◆ L2 OPENED`, `◆ L2 CLOSED — payoff: …`, `◆ P1 PLANTED`, `◆ CLIFFHANGER #2`.
- **Footage and photos first, graphics second** (owner, Nov 2026). Write `[BROLL: …]` or a photo cue by default; use `[GFX: …]` only where the viewer has to *see* a number or a comparison to follow the argument (the core reveal, a key ratio, a two-bar contrast). A line that merely mentions a number is usually better as footage of the thing, with the number in a small caption. Aim for graphics to be well under a third of the runtime. A picture can hold for 5–8 seconds; don't cut away early just to switch to a chart.
- **People are shown by their face.** When a line names a person, cue a photo or clip where their face is clearly visible (not an initials card, not a cropped body). Prefer a real-voice clip of them over a photo.
- **No invented quotes.** Quote only what you can trace to a dated source; otherwise paraphrase and label it as a paraphrase on screen.
- Model the *format* of channels the user admires, never their identity: no names, branding, catchphrases or intros copied from them.
- **No sponsor segments, ad reads or mid-roll plugs.** The channel doesn't run them, so never write one.
- **End with one earned subscribe line.** After the final reframe and future question, close with a single line that ties subscribing to the value the viewer just received. Name the specific thing they learned in this episode, then make subscribing the logical way to keep getting it. Example: "If you'll never look at a bucket of KFC the same way again, that's what this channel does: the economics nobody explains, one company at a time. Subscribe and you'll get the next one." Don't beg ("please subscribe, it really helps"), don't ask for likes or bells, and don't put the call to action anywhere except the end.

## Stage 4 — Ledger, scorecard, runtime

- **Loop ledger:** every loop, plant and story thread ("this would be a death blow…"), with where it opens and closes, and whether the payoff satisfies. Find the longest stretch with no loop opening or closing. Anything over ~90 seconds is a retention risk, so fix it with a mini-loop (a short story that asks and answers its own question inside the act).
- **Scorecard:** score all 16 checks in `references/framework.md` honestly, from 1 to 5. Rewrite anything below 4 before calling the script done, or explain clearly why you couldn't.
- **Runtime:** count the spoken words. Exclude cue lines and markers: `awk` out the script section, then strip lines starting with `` ` ``, `◆`, `#`, `>` or `[`, and run `wc -w`. Divide by ~145 words per minute. Put the *measured* runtime in the header, not the target. If timestamps are estimates, say so.

## Stage 5 — Fact-check pass

Do this before handing the script over. A channel built on shocking facts dies the first time one turns out to be wrong.

For every factual claim, record a verdict in a **fact-check log** table: claim | verdict | source | change made.
- ✅ confirmed by a primary or high-quality source
- ✏️ corrected or reworded (say what changed and why)
- ⚠️ secondary sources only, so word it in the script as an estimate or approximation
- Remove anything you can't source at all. Don't soften it into vagueness.

Common traps to check every time:
- **Company-claimed comparisons** (e.g. "our costs vs rivals"): find the exact table, period and basis (which costs are included, which year), and label it on screen as the company's figure.
- **Derived numbers:** recompute them from the primary figures and check that the claim survives the caveat.
- **Quotes:** confirm the exact wording and which statement and date it came from.
- **Absolutes** ("the only", "never", "first", "fastest ever"): check for exceptions.
- **Causes of events** (e.g. why a price spiked): use the company's or regulator's own wording, not one outlet's colourful version.
- **Dates and currencies** in early history: sources often disagree, so use "around" or "c." where they do.
- **Internal consistency:** the same figure stated twice must match ("1,000 stores in four years" vs "900 stores by 2023"), and a stated ratio must match its own numbers ("nearly 3×" when $14B vs $6B is 2.3×).
- **Metric definitions:** revenue vs gross bookings (Airbnb's revenue is its fees, not the booking value), and revenue vs profit per store. Mixing these up is the most common serious error in this genre.
- **Revenue as a share of GDP** ("Samsung is 20% of South Korea's GDP"): GDP counts value added, while revenue counts total sales, including everything bought from other companies, so the ratio overstates a company's weight. If you use it, say "revenue equal to about a fifth of GDP" and don't claim it *is* a fifth of the economy. Better still, use value-added, exports or market-cap comparisons.
- **Overclaimed causes:** "the country is rich because of one company" is rarely true. Check the claim against the script's own later material.
- **The title's thesis vs the evidence:** a "collapse" that isn't happening, or "can't survive" about a company that did, costs credibility with exactly the viewers who would subscribe. Make the title as strong as the evidence allows, and no stronger.
- **Unverified allegations:** don't use a news clip, tweet or "some people believe" as evidence. Find the primary source or leave it out.
- **Self-contradicting statistics:** check that every pair of numbers says what the sentence claims ("bookings up 70%, booking value up 67%" can't support "much more expensive").
- **Dated stories:** if the latest source is more than a year old, look for what has happened since.
- **Founding stories:** check who actually founded the company and when. These are easy to garble from memory.

Fact-checking often turns up *better* material, such as a company statement that answers your open question. Fold it into the script.

---

## Output

Save the script as a Markdown file named after the topic (e.g. `costco-script.md`), filling in every section of `assets/script-template.md`. The sections that matter most, because each fixes a failure seen across the audited channels:
- **Story engine** (characters, decisions, 1–3 scenes): the highest-scoring scripts all had one.
- **The title's promise:** asked out loud in the first minute, explicitly returned to, answered in the final third, and no stronger than the evidence.
- **Best-fact placement:** a strong fact in the first 60 seconds, the strongest at the midpoint, one saved for the ending. Burying the best fact was the second most common failure.
- **Three cold opens** with different devices, scored, with the best one kept. Weak openings were the most common failure on every channel.
- **The minute-by-minute retention plan:** no stretch over 90 seconds without a hook.
- **Anecdote and quote banks**, plus the "what happened next" check.

Then tell the user in a few lines: the central reveal, the strongest shock, any score below 5 and why, and anything left as ⚠️.

**Titles:** write at least one that states a contrarian thesis ("Why X Fails to…", "Why X Can't Survive", "The Rigged Economics of X", "How X *Really* Makes Money"). Also write one plain-curiosity version ("The Business of X"), so the user can test both. The title must promise exactly what the cold open asks.

## Auditing someone else's script

When the user shares a transcript to audit:
- Score it on the 16-point scorecard.
- Map the loops it actually has, including any it leaves implicit.
- List factual errors with a confidence level for each.
- Note any gaps in the transcript (missing timestamps).
- Look up the video's views against the channel's typical views (outlier trackers such as OutlierKit give a multiplier), so you can separate what the topic and title did from what the script did.
- Be honest about what explains performance and what can't be known without retention and click-through data.
- Finish with a short example of how the opening would read under this framework, built only from the script's own claims and labelled as unchecked.
- Add anything new you learn to `references/audit-lessons.md` if the user wants the skill to keep improving.

When revising an existing script, keep a backup of the previous version, change only what's needed, and update the loop map, ledger timestamps, scorecard and fact-check log to match. Stale timestamps in the ledger are a common mistake.
