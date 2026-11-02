# Rock the Routine - Team Work Plan

**Author:** Prachi `<u1479273@utah.edu>`  
**Updated:** November 2, 2026  
**Purpose:** Build and demonstrate a polished, functional Red Rocks NIL MVP that grows athlete opportunity through sponsor matching, fan support, and measurable community impact.

## Product decision and MVP cut line

Use **Rock the Routine** as the only public product name. The MVP tells one complete story: a sponsor discovers a fictional athlete, funds the **Confidence Starts Here** Impact Routine, and a supporter uses a QR code to make a clearly labelled fake $10 contribution. The campaign total and WRTH admin activity update live.

The live demo must include:

1. Home page and campaign entry point.
2. Explore Athletes with working search, filters, and sort.
3. Sponsor questionnaire and top-three match results.
4. Reusable athlete profile with story, packages, availability, and impact.
5. Mobile QR support page and `Give $10 Demo` flow - **no real payment**.
6. Realtime campaign total, supporter count, and admin activity update.
7. One campaign: **Confidence Starts Here** ($15,000 goal; seeded at $8,240, 186 supporters, $6,500 business funding, and $1,740 fan contributions).
8. One athlete story video, QR table tent, and athlete trading cards for the pitch.

Do not begin stretch work (3D Ripple Wall, Chalk Notes, multiple campaigns, full CRM, advanced analytics, or a complete celebration-video workflow) until the above is stable and rehearsed.

## Shared setup - do this first

- [ ] Agree on the fictional data set and keep it consistent everywhere:
  - Avery Davis - Fan Favorite; youth confidence and mentorship.
  - Mia Torres - Rising Routine; inclusion.
  - Sofia Patel - Rising Routine; education/STEM.
  - Jordan Lee - Fan Favorite; wellness/family.
- [ ] Use a fictional Utah family/wellness/youth-sports sponsor unless written approval permits a real business.
- [ ] Treat the supplied `Red rocks digital assets.zip` as the approved source pack for the prototype only; confirm intended presentation/web usage with the asset owner before public publication. Do not imply that a supplied image grants permission to use athlete likenesses or official marks beyond the challenge demo.
- [ ] Use conspicuous labels: “Demo contribution - no payment will be processed” and “Fictional athlete / demo profile” where relevant.
- [ ] Establish a shared `.env.example`, data contract, route list, and one deployed preview URL before integration.

## Prachi - backend, data, and live-demo owner

**Definition of done:** the frontend can read demo data from simple helpers/endpoints, and a $10 demo contribution updates two independently open screens without refresh.

- [ ] Create Supabase project and schema: `athletes`, `campaigns`, `donations`, `supporter_tiers`, `tasks`, `sponsor_matches`, `fan_actions`, and `sponsor_prospects`.
- [ ] Seed four fictional athlete records, one campaign, supporter tiers, campaign tasks, and the stated baseline metrics. Each athlete needs name, photo URL, specialty, bio, quote, causes, campaign types, audience tags, availability, budget minimum, reach, engagement rate, feature type, story URL, goal, and current raised amount.
- [ ] Provide athlete list, filtered list, and athlete-by-ID queries. Support the frontend filters for cause, audience, campaign type, budget, availability, social platform, engagement, in-person appearance, and feature type.
- [ ] Implement the sponsor matcher. Inputs: business goal, audience, cause, format, budget, and desired athlete scope. Score cause 35%, audience 25%, campaign format 20%, budget 10%, and availability 10%; return the best three athletes, score breakdowns, plain-language explanations, and a recommended campaign.
- [ ] Implement `Give $10 Demo`: create a mock donation, update the campaign total/supporter count/fan contribution amount, and publish a realtime event. Never call a payment provider.
- [ ] Subscribe and expose live campaign progress, latest donation, admin activity feed, and campaign tasks.
- [ ] Add a protected/demo-only reset action that restores seeded metrics before each rehearsal.
- [ ] If core work is complete, add Partner Finder as a draft-only admin helper. It may suggest an athlete, campaign, outreach email, and LinkedIn message; it must never send a message automatically.

**Handoff to frontend:** endpoint/query examples, Supabase types, seeded IDs/slugs, realtime channel names, loading/error states, and the deployed Supabase environment variables.

## Diya - frontend, integration, deployment, and demo-flow owner

**Definition of done:** a judge can use a phone to complete the $10 demo in under 20 seconds, then visibly see the laptop dashboard update.

- [ ] Create the Next.js app shell, Tailwind design tokens, responsive navigation, accessible focus states, and desktop/mobile layouts. Navigation: Home, Get Matched, Explore Athletes, Impact Routines, Support, Admin Demo.
- [ ] Build Home with a cinematic supplied-asset hero, the line “Find the story your brand can stand behind,” four audience entry points, the featured Confidence Starts Here campaign, and previews for Fan Favorites and Rising Routines.
- [ ] Build Explore Athletes: search, filter drawer/panel, sort, athlete card grid, and equally prominent Fan Favorites and Rising Routines sections. Each card shows image, name, specialty, cause, reach, engagement, availability, and actions to view, sponsor, or support.
- [ ] Build Get Matched as a short, step-by-step business questionnaire. Show the top three result cards, score percentages/breakdowns, match reasoning, compare behavior, and a “Build Campaign” call to action.
- [ ] Build one reusable athlete-profile route driven by Supabase data: hero/quote, story video, causes, audience and social metrics, packages, availability, sponsor fit, support CTA, and Your Impact section.
- [ ] Build the support flow: support amounts ($10/$25/$100/custom), loading state, `Give $10 Demo`, thank-you screen, story-video preview, updated total, and “I Rocked the Routine” digital card. Keep the no-payment statement visible before the call to action.
- [ ] Build the phone-first QR route for Avery/campaign support. Optimize it for a single-thumb flow and test from a physical phone.
- [ ] Build Admin Demo UI: total funding, total supporters, campaign progress, latest activity, tasks, recent fan actions, and sponsor-pipeline preview. Make the newest event unmistakable: “Demo Judge backed Avery Davis with $10.”
- [ ] Add focused, preloaded demo routes: `/demo`, `/demo/athlete/avery`, and `/demo/admin`.
- [ ] Deploy to Vercel, verify on presenter laptop and phone, generate/provide the production demo URL, and record a 90-second fallback video after the live rehearsal passes.

**Handoff to creative:** deployed URL and final QR route as soon as they are stable; final image/video dimensions and safe-area requirements before print assets are made.

## Raghav - Adobe creative, supplied asset curation, and physical-demo owner

**Definition of done:** frontend imagery is consistently art directed; the pitch includes one compelling athlete story and production-ready print materials that link to the live demo.

- [ ] Deliver a compact brand kit first: Rock the Routine wordmark, palette, type choices, icon/button guidance, photo treatment, texture rules, and export-ready SVG/PNG assets. Use Illustrator, Adobe Fonts, Photoshop/Lightroom, and Adobe Capture as appropriate.
- [ ] Curate the supplied Red Rocks asset pack into a frontend-ready manifest (file name, crop, placement, alt text, and any usage limitation). Export optimized derivatives rather than committing or serving the 1.2 GB archive directly.
- [ ] Produce the four fictional-athlete visual sets: desktop profile, card crop, mobile crop, optional action image, cause badge, and Fan Favorite/Rising Routine label. Do not misrepresent supplied real-athlete photos as Avery, Mia, Sofia, or Jordan; use abstract, anonymized, or clearly labelled editorial/campaign imagery if approvals are absent.
- [ ] Create Avery’s 45-second Confidence Starts Here story: confidence quote, youth-mentorship motivation, community visual, sponsor/fan invitation, and QR end card. Deliver desktop, mobile, pitch, and 15-second teaser exports. Use Premiere Pro/After Effects; enhance approved audio with Podcast Enhance/Audition.
- [ ] Create campaign assets in Adobe Express: two social posts, Story, Reel cover, QR poster, sponsor offer, thank-you card, impact-report cover, and digital “I Rocked the Routine” card.
- [ ] After Diya provides the final URL, create the QR table tent, four trading cards, impact receipt, three-year-path poster ($200K -> $646K -> $1.24M -> $2M), and one final sticker/wristband phrase. Export print-ready PDFs and print backups.
- [ ] Create pitch visuals: opening visual, animated impact metrics, closing visual, sponsor-proposal PDF, and impact-report PDF. Treat the optional 3D Ripple Wall as last priority.

## Supplied Red Rocks digital assets - frontend placement map

Use local optimized copies, preserve source filenames in the asset manifest, and add meaningful alt text. These files are in `Red rocks digital assets.zip`; do not unpack all 1.2 GB into the app by default.

| Source asset | Frontend use | Owner / implementation note |
| --- | --- | --- |
| `WRTH_high res 3.jpg` | Home hero or WRTH/impact section | Raghav: produce wide and mobile crops; Diya: use responsive `<Image>` with a gradient overlay for headline contrast. |
| `Amelie -U- Ring.jpg`, `9750.jpeg`, `11421.jpeg`, `11423.jpeg`, `47854 (1).jpeg`, `51609 (1).jpeg`, `51611 (1).jpeg`, `51614 (1).jpeg`, `100169.jpeg`, `15201.png` | Editorial athlete/campaign gallery and athlete-card background treatments | Raghav: select/crop only after likeness review; Diya: never attach a real person’s image to a fictional profile name. |
| `20230106_190405.jpg`, `20230203_185732.jpg`, `20230303_185517.jpg`, `20240202_182638.jpg`, `20240202_182640.jpg`, `Dedication.jpg`, `Pac12Trophies2.jpg`, `FB_IMG_1694238920268.jpg` | History/impact storytelling, campaign proof, sponsor proposal, and empty-state/editorial sections | Use as authentic Red Rocks context, with accurate captions and descriptive alt text. |
| `Screenshot_20230111_152830_Facebook.jpg`, `Screenshot_20250104_045249_Instagram.jpg`, `Screenshot_20251006_204021_Facebook.jpg` | Social-proof strip or “campaign reach” storytelling | Raghav: redact/crop any sensitive UI or names if needed; do not present organic social screenshots as live platform analytics. |
| `20230622_163520.mp4`, `WRTH Dumke Tour.mp4`, `WRTH x Sammy_s Buddy.mp4` | Optional home/profile video backdrop, community-impact section, and pitch B-roll | Transcode short muted web clips with poster frames; respect autoplay/motion preferences and provide captions. |
| `GYM_Eras1_BeginningTo1990_v1.mp4`, `GYM_Eras2_1991To2001_v1.mp4`, `GYM_Eras3_2001To2010_v1.mp4`, `GYM_Eras4_10sToPresent_v1.mp4` | Optional “legacy timeline”/pitch sequence | Use only after core demo is complete; select short excerpts rather than shipping 618 MB of historical video. |

## Integration order and checkpoints

1. **Foundation:** Prachi publishes schema/seed types; Raghav provides brand tokens and a temporary approved hero crop; Diya ships static routes/components.
2. **Discovery:** Diya connects Explore and athlete profile to live data; Prachi validates filtering and match scoring; Raghav supplies optimized card/profile imagery.
3. **Conversion:** Diya connects sponsor matcher and support UI; Prachi completes demo donation and realtime subscriptions; Raghav supplies thank-you/QR artwork.
4. **Live demo:** Diya deploys; Raghav generates QR/print materials from that exact route; Prachi verifies two-screen realtime behavior and reset.
5. **Pitch readiness:** run the complete judge flow at least five times, scan the printed QR from a phone, test projector/presenter laptop, record the backup demo, and print spare cards/tents/receipts.

## Acceptance checklist

- [ ] All demo data is explicitly fictional or has documented permission.
- [ ] Sponsor matching returns three understandable, non-follower-count-only recommendations.
- [ ] Filters, sorting, profile navigation, and the mobile QR route work without dead ends.
- [ ] `$10 Demo` creates only mock data and updates the supporter experience plus admin dashboard live.
- [ ] Desktop, phone, QR, video, and fallback-recording tests pass.
- [ ] Adobe Creative Cloud work is visible in the product/pitch through supplied-asset treatment, campaign creative, and print materials.
- [ ] The pitch connects the MVP to the $200K -> $646K -> $1.24M -> $2M target as a model, not a guarantee.
- [ ] The final submission has an accessible MVP link/PDF, slide deck, and a practiced 10-minute presentation.

## Why this order

The rubric awards the most weight to credible NIL funding impact (35 points), followed by MVP polish, athlete/sponsor engagement, and presentation (15 points each). The working, visible path from business match or fan QR scan to a measurable campaign result should therefore be complete before optional AI or visual experiments. AI should assist approved copy, match explanations, and campaign planning; an athlete reviews every public output.
