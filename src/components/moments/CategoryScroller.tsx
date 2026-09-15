"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

export function CategoryScroller() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("category") ?? "all";
  return <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
    {CATEGORIES.map((category) => <button key={category.value} onClick={() => router.push(category.value === "all" ? "/" : `/?category=${category.value}`)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${active === category.value ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white/70 text-[#5f5a52] hover:border-[#aaa39a]"}`}>{category.label}</button>)}
  </div>;
}
