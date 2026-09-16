export default function MainLoading() {
  return <div className="space-y-6 py-6" aria-busy="true" aria-label="Loading">
    <div className="h-4 w-24 animate-pulse rounded bg-[#ded8ce]"/>
    <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-[#ded8ce]"/>
    <div className="h-5 w-2/3 animate-pulse rounded-xl bg-[#ded8ce]"/>
    <div className="h-72 animate-pulse rounded-[28px] bg-[#ded8ce]"/>
  </div>;
}
