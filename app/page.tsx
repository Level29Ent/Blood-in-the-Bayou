export default function Page() {
  return (
    <main className="fixed inset-0 bg-[#0b0e10]">
      <iframe
        src="/game/index.html"
        title="Level 29 · Blood in the Bayou"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; gamepad"
        allowFullScreen
      />
    </main>
  )
}
