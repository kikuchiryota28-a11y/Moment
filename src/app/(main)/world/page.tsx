import Link from "next/link";
import { getTodayMoment } from "@/lib/db/v3";
import { getWorldArchive } from "@/lib/db/v3";

export default async function WorldPage(){
 const [today,archive]=await Promise.all([getTodayMoment(),getWorldArchive()]);
 return <main className="py-10 sm:py-16">
  <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">WORLD</p>
  <h1 className="mt-3 text-5xl font-black tracking-[-.06em]">The world, over time.</h1>
  <p className="mt-4 max-w-xl text-[#777269]">Every day leaves one question behind. Open a Moment and see how differently people answered it.</p>
  <section className="mt-10 rounded-[28px] bg-[#171614] p-6 text-white sm:p-8">
   <p className="text-xs font-black uppercase tracking-[.18em] text-white/55">TODAY</p><h2 className="mt-3 text-2xl font-black">{today.prompt}</h2>
   <Link href={`/moment/${today.id}/reveal`} className="mt-5 inline-block rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#171614]">SEE TODAY&apos;S WORLD</Link>
  </section>
  <section className="mt-12"><p className="text-xs font-black uppercase tracking-[.18em] text-[#777269]">ARCHIVE</p>
   <div className="mt-4 divide-y divide-[#ded8ce] rounded-[28px] border border-[#ded8ce] bg-white/60">{archive.length?archive.map((m:any)=><Link key={m.id} href={`/moment/${m.id}/reveal`} className="block p-5 transition hover:bg-[#f1ece3]"><p className="text-xs font-black text-[#777269]">{m.moment_date}</p><p className="mt-2 font-black">{m.prompt}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-[#777269]">{m.status}</p></Link>):<p className="p-8 text-sm text-[#777269]">The archive starts tomorrow.</p>}</div>
  </section>
 </main>
}
