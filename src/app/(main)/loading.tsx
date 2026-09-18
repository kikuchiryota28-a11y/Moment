export default function MainLoading() {
  return <div className="relative h-[100dvh] overflow-hidden bg-[#eee9df] px-5 py-7 text-[#181715]" aria-busy="true" aria-label="Loading">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,#faf7f0_0%,#eee9df_48%,#dcd5c9_100%)]" />
    <div className="absolute left-5 top-5 h-3 w-20 animate-pulse rounded bg-black/10 sm:left-8 sm:top-7" />
    <div className="absolute left-1/2 top-1/2 h-[min(62vh,620px)] w-[min(62vh,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/20" />
    <div className="absolute left-1/2 top-[53%] w-[min(89vw,570px)] -translate-x-1/2 -translate-y-1/2 border-y border-white/70 bg-white/30 px-5 py-8 sm:px-8">
      <div className="h-3 w-28 animate-pulse rounded bg-black/10" />
      <div className="mt-5 h-20 max-w-[28rem] animate-pulse rounded-2xl bg-black/10" />
      <div className="mt-7 flex items-end justify-between gap-5">
        <div className="h-10 w-48 animate-pulse rounded bg-black/10" />
        <div className="h-12 w-40 animate-pulse rounded-[15px] bg-black/15" />
      </div>
    </div>
  </div>;
}
