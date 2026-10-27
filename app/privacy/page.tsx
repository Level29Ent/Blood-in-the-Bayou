import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy · Level 29',
  description: 'How Level 29 · Blood in the Bayou handles your data.',
}

const sections = [
  {
    h: 'What we collect',
    p: 'Level 29 saves your game progress (cash, unlocks, best scores, settings) on your own device using browser storage. We do not ask for your name, email, location, contacts or photos to play.',
  },
  {
    h: 'Multiplayer',
    p: 'When you join an online session, your chosen player name, position and in-game actions are sent to other players in that session so the game can work. This data is not stored after the session ends.',
  },
  {
    h: 'Analytics',
    p: 'We use privacy-friendly, anonymous page analytics (Vercel Analytics) to count visits and fix problems. It does not use cookies and does not identify you personally.',
  },
  {
    h: 'In-game money',
    p: 'All casino games, shops and cash in Level 29 use fictional in-game money only. No real money can be wagered, won or withdrawn.',
  },
  {
    h: 'Children',
    p: 'Level 29 is intended for players aged 17 and older. We do not knowingly collect information from children.',
  },
  {
    h: 'Deleting your data',
    p: 'You can erase all saved progress at any time by clearing this site’s data in your browser or deleting the app. Contact us below if you have any questions.',
  },
]

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-neutral-200">
      <h1 className="text-3xl font-bold text-white text-balance">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-400">Level 29 · Blood in the Bayou · Last updated October 2026</p>
      <div className="mt-8 flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold text-white">{s.h}</h2>
            <p className="mt-1 leading-relaxed text-pretty">{s.p}</p>
          </section>
        ))}
        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="mt-1 leading-relaxed">
            Questions about privacy? Email{' '}
            <a className="text-amber-300 underline" href="mailto:support@level29ent.com">
              support@level29ent.com
            </a>
            .
          </p>
        </section>
      </div>
      <nav className="mt-10 flex gap-4 text-sm">
        <Link className="text-amber-300 underline" href="/">Back to game</Link>
        <Link className="text-amber-300 underline" href="/terms">Terms of Use</Link>
      </nav>
    </main>
  )
}
