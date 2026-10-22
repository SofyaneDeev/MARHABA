# Marhaba (React Native + Expo)

An AI travel companion for tourists visiting Morocco, built with Expo SDK 58 (React Native 0.88) for Android, iOS and the web.

On first launch a welcome screen greets travellers in Arabic (مرحبا), Amazigh (ⴰⵏⵙⵓⴼ) and English, over a zellige pattern and a horseshoe arch. Tap مرحبا in the header to see it again.

| Tab | Feature |
|---|---|
| Ask | AI chat assistant (Claude), with suggested questions |
| Cities | 11 cities (Marrakech, Fes, Chefchaouen, Rabat, Casablanca, Tangier, Essaouira, Meknes, Agadir, Ouarzazate, Merzouga): landmarks, markets, taxi gates and a "lost?" tip, with "Open in Maps" |
| Book | Riads & hotels, tours & guides, food & culture, desert trips, trains & buses. Opens the search for the chosen city on Booking.com, Airbnb, GetYourGuide, Viator, ONCF or CTM |
| Phrases | 27 Darija phrases with phonetics, Arabic script, tips, search and categories. 🔊 reads each phrase aloud, ☆ saves it |
| Tools | Emergency SOS button, currency converter (live rates, works offline once loaded), prayer times for each city, and saved phrases and places |

Phrases, Cities, SOS, prayer times and saved items work without internet. Ask and Book need internet; Ask also needs the Supabase backend.

Booking happens on the partner's site. To earn from bookings later, join their affiliate programmes and add your partner IDs to the links in `data/booking.ts`.

## Motion

Built with Reanimated and react-native-svg: the welcome arch draws itself and the zellige drifts, letters of ⴰⵏⵙⵓⴼ and Marhaba appear one by one, cards glide in, buttons spring with a light haptic tap on phones, a swinging lantern shows while loading, and chat messages slide in with typing dots. Everything respects the phone’s reduce-motion setting.

## Project layout

```
app/
  _layout.tsx            Loads fonts, root navigation
  (tabs)/_layout.tsx     Bottom tabs and the blue Marhaba header
  (tabs)/index.tsx       Ask (chat)
  (tabs)/phrases.tsx     Phrases
  (tabs)/medina.tsx      Cities guide
  (tabs)/book.tsx        Guide listings and partner booking links
  request/[id].tsx       Booking request form
  (tabs)/sos.tsx         Emergency help
components/ui.tsx        Shared pieces: titles, cards, chips
components/Welcome.tsx   First-launch welcome screen
components/Zellige.tsx   Zellige pattern and horseshoe arch drawings
constants/theme.ts       Colors (Majorelle blue, saffron, mint) and fonts
data/                    Phrases, cities, emergency numbers
lib/chat.ts              Talks to the Supabase `ask` function
lib/formatReply.ts       Bold text and bullets in chat replies
lib/bookings.ts          Experiences, request checks and sending
lib/supabase.ts          Supabase address and public key
supabase/                Database tables, security rules and sample listings
__tests__/               Jest tests
.env                     Public Supabase URL and anon key
```

## Run it

```bash
npm install
```

```bash
npx expo start
```

- **On your phone:** install **Expo Go** (Google Play / App Store) and scan the QR code. Phone and computer must be on the same Wi-Fi.
- **In the browser:** press `w`, or double-click `run_web.bat` and open http://localhost:8081.

## Checks

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

## AI backend

The chat calls the `ask` Supabase Edge Function in the `marhaba` project (ref `wsqnlpyuohrmnosltqju`). Its code is in `supabase/functions/ask/index.ts`. Deploy changes with `supabase functions deploy ask`.

The function needs an AI key, set under **Edge Functions → Secrets** in the Supabase dashboard:

- `GEMINI_API_KEY`: Google Gemini (`gemini-flash-latest`). This is the one in use now, on the free tier from aistudio.google.com. Google may use free-tier chats to improve its products.
- `ANTHROPIC_API_KEY`: Claude. Used only when no Gemini key is set. To switch to Claude, delete the Gemini secret.

The anon key in `.env` is public by design; the AI keys must never be in this app.

## Editing the city guide

The Cities tab (and the city lists in Book and prayer times) reads the guide from four Supabase tables. Edit them in the Supabase dashboard → **Table Editor**; travellers see changes the next time they open the app. No app update needed.

| Table | One row is… | Useful columns |
|---|---|---|
| `cities` | a city | `id` (short, like `marrakech`), `name`, `lat`/`lng` (for prayer times), `known_for`, `tip_title`, `tip_text`, `best_season`, `seasons` (any of winter, spring, summer, autumn), `nightlife_tip`, `sort_order`, `active` |
| `places` | a place in a city | `city_id`, `name`, `kind` (gate, sight, square, market, garden, nature, nightlife), `description`, `sort_order`, `active` |
| `parks` | a garden or park | `name`, `near`, `best_for`, `kind` (garden, park, national), `sort_order`, `active` |
| `seasonal_recommendations` | a season | `label`, `months`, `experiences`, `destinations` (city names open that city; other names open Maps) |

- **Hide instead of delete:** set `active` to false to take a city, place or park out of the app without losing it.
- **Order:** lower `sort_order` shows first.
- **Offline:** the app saves the last guide it loaded and uses it without internet. On a first launch with no internet, it uses the guide built into the app (`data/cities.ts`, `data/parks.ts`, `data/seasons.ts`).
- **Refreshing the built-in copy:** before an app release, copy your latest edits into those files. To reset the database to the built-in guide, run `node scripts/generate-guide-seed.mts` and run `supabase/seed_city_guide.sql` in the SQL editor.
- **Security:** the app's public key can only read active rows. Only you, in the dashboard, can change the guide (`supabase/migrations/20261022120000_city_guide.sql`).
- **Saved places:** travellers' ☆ saved places are matched by city and place name, so renaming a place removes it from their Saved list.

## Booking requests

> **Switched off for now.** Nobody receives requests yet, so `GUIDE_REQUESTS_ENABLED` in `constants/features.ts` is `false`: the Book tab shows only the partner sites, and the request page says "coming soon". Turn it back on once real guides join and each request reaches someone (an email alert or the guide's WhatsApp). The tables and code below are kept and still tested.

The Book tab lists experiences from the `experiences` table for the chosen city. "Request to book" opens a form (`app/request/[id].tsx`) that saves a row in `booking_requests`.

- **Tables and security:** `supabase/migrations/20261021170000_booking_requests.sql`. The app can read active experiences and create requests, but cannot read, change or delete requests, because they contain travellers' personal details.
- **Sample listings:** `supabase/seed_samples.sql` adds 16 example experiences (`is_sample = true`). The app marks them "Sample" and tells travellers no guide is linked yet. Set `active = false` on them once real guides join.
- **Adding a real guide:** insert a row in `experiences` with `is_sample = false`, and set `licensed = true` only after checking the guide's official licence.
- **Handling requests:** open the Supabase dashboard → Table Editor → `booking_requests`. Contact the traveller by email, then update `status` to `contacted`, `confirmed` or `declined`.

## Test APK from GitHub Actions

Every push to `main` builds an installable Android APK (`.github/workflows/android-apk.yml`), about 15–25 minutes per build:

1. On GitHub, open the repository → **Releases** → the newest **Marhaba test build**.
2. On your Android phone, download the `.apk`, open it, and allow installing from your browser if Android asks.

You can also start a build by hand: **Actions** → **Android APK** → **Run workflow**. Each run also keeps the APK under **Artifacts** on its run page.

This APK is signed with a test key, so it is for testing only. The Play Store needs a build signed with your own upload key (see below). To install a newer test build over an older one, it must come from the same workflow, as here.

## Build for the stores

Use EAS to build in the cloud (no Android Studio or Mac needed):

```bash
npx eas-cli@latest build --platform android
```
