"use client";

export default function Error({ reset }: { reset: () => void }) { return <div className="py-16 text-center"><h1 className="text-xl font-black">Profile could not be loaded</h1><p className="mt-2 text-sm text-[#777269]">Something went wrong while loading your profile.</p><button onClick={reset} className="mt-6 rounded-full bg-[#171614] px-5 py-3 text-sm font-bold text-white">Try again</button></div>; }
