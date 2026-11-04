# Felicia recorded voice integration

Source: **New Recording 3.m4a** (48.789 seconds), not the earlier recording. The seven user-provided intervals were applied in script order. The final repeated “6” was interpreted as line 7 / farewell.

| Clip | User interval | Trigger |
| --- | --- | --- |
| `felicia_greet.mp3` | 02–06 | Open Felicia’s trailer service |
| `felicia_pitch.mp3` | 08–15 | After greeting, or HEAR FELICIA’S SPECIAL |
| `felicia_buy.mp3` | 17–23 | Successful snowball purchase |
| `felicia_poor.mp3` | 23–27 | Attempt purchase without enough game cash |
| `felicia_equip.mp3` | 29–36 | After purchase; otherwise equip snowballs, rate-limited |
| `felicia_empty.mp3` | 38–42 | Attempt to throw with no ammo, rate-limited |
| `felicia_bye.mp3` | 43–47 | Close service / Escape |

Files are in `public/game/business-vo/`, mono MP3 at 44.1 kHz / 96 kbps. Short 8ms/15ms boundary fades reduce cut clicks. No pitch shifting, voice imitation, speech recognition or guessed cue removal was used. Boundaries are exactly those supplied; MP3 encoder padding adds a few hundredths of a second. The actual spoken content/cue removal has not been listened to here; revise a range if an endpoint contains a cue or cuts a word. Captions use the existing written script rather than a transcription.

Greeting was corrected to 02–06 in the user’s follow-up. Asset requests use a new cache version so old 00–06 data is not reused.

Each new action interrupts the old queue. A successful purchase refreshes the shop **without repeating the greeting**; purchase confirmation queues the equip instructions. Generation guards prevent stale decode/end/error callbacks from restarting earlier lines. Clips now play as cached Web Audio buffers on the existing gesture-unlocked game AudioContext, so queued pitch/equip lines do not require separate mobile media-element autoplay permission. All seven clips are warmed after a user gesture; failed fetches may retry on a later action. Captions follow actual `playing`; denied/unavailable playback falls back to the written subtitle. No playback is resumed automatically after mute or blur.

Mute stops media immediately. Pause/nonplay, death, the gumbo cutscene, page hide/hidden tab and blur cancel narration/queued lines. The former 400-unit trailer-distance cancellation has been removed: equip/empty-ammo narration must work across the city. Felicia’s explicit shop actions cancel pending Ronnie phone chatter; ordinary phone lines defer while she speaks, and opening Ronnie’s talk panel still stops Felicia. Rain retains its existing quiet mix and ducks by the existing dialogue amount while Felicia speaks. Existing Ronniebaby clips and other audio settings are untouched.

The insufficient-funds purchase control remains operable so it can deliver the refusal line, but does not debit money or add ammo; it is marked `aria-disabled` when unaffordable. Gameplay prices/ammo/damage and the trailer layout are unchanged.

Remaining work: physical-iPhone/Safari listening and autoplay behavior, exact recorded-word boundary review, and recordings/hookup for other characters/contract lines. No new UI voice-clone or speech-synthesis substitute is added.
