import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Level 29 · Blood in the Bayou',
    short_name: 'Level 29',
    description:
      'Open-world bayou action game: jobs, zombies, BoomCity casino, steamboat shrimping and multiplayer.',
    start_url: '/',
    scope: '/',
    display: 'fullscreen',
    display_override: ['fullscreen', 'standalone'],
    orientation: 'landscape',
    background_color: '#0b0e10',
    theme_color: '#0b0e10',
    categories: ['games', 'entertainment'],
    icons: [
<<<<<<< HEAD
      { src: '/icons/bayou-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/bayou-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/bayou-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
=======
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
>>>>>>> main
    ],
    screenshots: [
      {
        src: '/screenshots/title-1920x1080.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Title screen over the foggy French Quarter',
      },
      {
        src: '/screenshots/mansion-1920x1080.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: "Meeting Ronniebaby at the guarded mansion",
      },
      {
        src: '/screenshots/jobs-1920x1080.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Jobs and careers: clock in and earn',
      },
    ],
  }
}
