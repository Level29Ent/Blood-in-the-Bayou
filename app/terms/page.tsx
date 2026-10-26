import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use · Level 29',
  description: 'Terms of use for Level 29 · Blood in the Bayou.',
}

const terms = [
  'Level 29 is a work of fiction intended for players 17 and older. It contains violence, simulated gambling, alcohol and mature themes.',
  'All casino games use fictional in-game money. Nothing in the game can be exchanged for real money, prizes or anything of value.',
  'In multiplayer, be respectful. Harassment, cheating or abusive names may get you removed from sessions.',
  'The game is provided as is. We may update, change or remove features at any time.',
  'Level 29 names, logos, characters and music belong to their owners and may not be copied or resold.',
]

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-neutral-200">
      <h1 className="text-3xl font-bold text-white text-balance">Terms of Use</h1>
      <p className="mt-2 text-sm text-neutral-400">Level 29 · Blood in the Bayou · Last updated October 2026</p>
      <ol className="mt-8 flex list-decimal flex-col gap-4 pl-5 leading-relaxed">
        {terms.map((t) => (
          <li key={t} className="text-pretty">{t}</li>
        ))}
      </ol>
      <p className="mt-8">
        Questions? Email{' '}
        <a className="text-amber-300 underline" href="mailto:support@level29ent.com">support@level29ent.com</a>.
      </p>
      <nav className="mt-10 flex gap-4 text-sm">
        <Link className="text-amber-300 underline" href="/">Back to game</Link>
        <Link className="text-amber-300 underline" href="/privacy">Privacy Policy</Link>
      </nav>
    </main>
  )
}
