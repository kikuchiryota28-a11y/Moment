"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitTodayResult } from "@/actions/v3";
import { createClient } from "@/lib/supabase/client";
import type { ResultType } from "@/types/v3";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

const TYPES: { value: ResultType; label: string }[] = [
  { value: "text", label: "DESCRIBE" },
  { value: "choice", label: "CHOOSE" },
  { value: "photo", label: "CAPTURE" },
  { value: "video", label: "RECORD" },
  { value: "combination", label: "COMBINE" },
];

const CHOICES = [
  "Something ordinary",
  "Something surprising", 
  "Something beautiful",
  "Something strange",
];

export function ResultComposer({ dailyMomentId }: { dailyMomentId: string }) {
  const [type, setType] = useState<ResultType>("text");
  const [text, setText] = useState("");
  const [choice, setChoice] = useState("");
  const [why, setWhy] = useState("");
  const [media, setMedia] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [commitPhase, setCommitPhase] = useState<"idle" | "compressing" | "committing" | "success" | "error">("idle");
  const [resultData, setResultData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const needsMedia = type === "photo" || type === "video" || type === "combination";
  const valid = type === "text" ? Boolean(text.trim()) : type === "choice" ? Boolean(choice) : Boolean(media) && (type !== "combination" || Boolean(text.trim()));

  const placeholders: Record<ResultType, string> = {
    text: "What happened? What did you notice?",
    choice: "",
    photo: "",
    video: "",
    combination: "Add a note about this moment",
  };

  const mediaLabels: Record<ResultType, string> = {
    photo: "Capture a photo",
    video: "Record a short video",
    combination: "Add photo or video",
    text: "",
    choice: "",
  };

  async function upload(file: File) {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const max = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if ((!isImage && !isVideo) || file.size > max) {
      setMessage(isVideo ? "Use a video up to 50MB." : "Use an image up to 8MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setMessage("Please log in again."); setBusy(false); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${user.id}/v3/${crypto.randomUUID()}-${safeName}`;
    const { error } = await sb.storage.from("moment-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setMessage(error.message); setBusy(false); return; }
    const { data: { publicUrl } } = sb.storage.from("moment-media").getPublicUrl(path);
    setMedia(publicUrl);
    setMediaPreview(publicUrl);
    setBusy(false);
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setMediaPreview(URL.createObjectURL(file));
      }
      void upload(file);
    }
  }

  function startCommitAnimation() {
    return new Promise<void>((resolve) => {
      // Phase 1: Compress
      setCommitPhase("compressing");
      setTimeout(() => {
        // Phase 2: Committing with progress
        setCommitPhase("committing");
        setProgress(0);
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => Math.min(prev + Math.random() * 15, 90));
        }, 100);
        
        // Simulate server request time
        setTimeout(() => {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setProgress(100);
          resolve();
        }, 1500);
      }, 200);
    });
  }

  async function submit() {
    if (!valid || busy) return;
    
    setBusy(true);
    setMessage("");
    await startCommitAnimation();

    const fd = new FormData();
    fd.set("dailyMomentId", dailyMomentId);
    fd.set("resultType", type);
    fd.set("textContent", text);
    fd.set("choiceValue", choice);
    fd.set("why", why);
    fd.set("mediaUrl", media);
    
    const r = await submitTodayResult(fd);
    
    if (r.success) {
      setCommitPhase("success");
      setResultData({
        type,
        text: text.trim(),
        choice: choice,
        why: why.trim(),
        media: media,
      });
      setMessage("ACTION COMMITTED.");
      
      // Redirect after showing success
      setTimeout(() => {
        window.location.href = `/moment/${dailyMomentId}/reveal`;
      }, 1500);
    } else {
      setCommitPhase("error");
      setMessage(r.error ?? "Something went wrong.");
      setBusy(false);
    }
  }

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card variant="default" className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Input Form */}
        {commitPhase === "idle" && (
          <div key="form" className="animate-in fade-in-0 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)] mb-4">DECLARE YOUR ACTION</p>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Action format">
                {TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setType(value); setMessage(""); }}
                    aria-selected={type === value}
                    role="tab"
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200",
                      type === value
                        ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-line)]"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(type === "text" || type === "combination") && (
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                placeholder={placeholders[type]}
                className="mb-4"
              />
            )}

            {type === "choice" && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4">
                {CHOICES.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => setChoice(x)}
                    aria-pressed={choice === x}
                    className={cn(
                      "rounded-[16px] border p-4 text-left text-sm font-semibold transition-colors duration-200",
                      choice === x
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-line)]"
                    )}
                  >
                    {x}
                  </button>
                ))}
              </div>
            )}

            {needsMedia && (
              <div className="mb-4">
                <label className={cn(
                  "flex cursor-pointer items-center justify-center rounded-[16px] border-2 border-dashed p-8 text-center text-sm font-semibold transition-colors relative",
                  media ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]" : "border-[var(--color-line)] bg-[var(--color-surface)]/50 hover:bg-[var(--color-line)]"
                )}>
                  {mediaPreview && type === "photo" && (
                    <div className="absolute inset-0">
                      <img src={mediaPreview} alt="Preview" className="h-full w-full object-cover rounded-[14px]" />
                    </div>
                  )}
                  {media ? (
                    <>
                      {type === "video" && <span className="relative z-10">📹 Video ready — choose another</span>}
                      {type !== "video" && <span className="relative z-10">Media ready — choose another</span>}
                    </>
                  ) : (
                    <span className="relative z-10">{mediaLabels[type]}</span>
                  )}
                  <input
                    type="file"
                    accept={type === "video" ? "video/*" : "image/*"}
                    className="hidden"
                    onChange={handleMediaChange}
                  />
                </label>
              </div>
            )}

            <Input
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              maxLength={500}
              placeholder="Optional: why this action?"
              className="mb-4"
            />

            <Button
              type="button"
              onClick={() => void submit()}
              disabled={busy || !valid}
              loading={false}
              fullWidth
              size="lg"
              className="mb-3"
            >
              COMMIT ACTION
            </Button>

            {message && (
              <p role="status" className={cn(
                "text-sm font-semibold text-center",
                message === "ACTION COMMITTED." ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
              )}>
                {message}
              </p>
            )}
          </div>
        )}

        {/* Commit Animation */}
        {commitPhase === "compressing" && (
          <motion.div
            key="compressing"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0.95, opacity: 0.8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-xl mx-auto"
          >
            <div className="rounded-[16px] bg-[var(--color-ink)] p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-white/30"
              />
              <p className="text-white font-semibold text-lg">COMMITTING…</p>
            </div>
          </motion.div>
        )}

        {commitPhase === "committing" && (
          <motion.div
            key="committing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto"
          >
            <div className="rounded-[16px] bg-[var(--color-ink)] p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="white/10"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#EF6B35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: 283,
                      strokeDashoffset: 283 * (1 - progress / 100),
                    }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl font-[var(--font-display)]">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
              <p className="text-white/80 font-semibold text-lg">SEALING YOUR BRANCH</p>
            </div>
          </motion.div>
        )}

        {commitPhase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="max-w-xl mx-auto"
          >
            <div className="rounded-[16px] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)] flex items-center justify-center"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <p className="text-[var(--color-success)] font-semibold text-xl mb-2">ACTION COMMITTED</p>
              <p className="text-[var(--color-muted-ink)]">Your branch is now part of the world.</p>
              
              {/* Show preview of what was submitted */}
              <div className="mt-6 p-4 rounded-[12px] bg-[var(--color-surface)] text-left">
                {resultData?.type === "text" && resultData.text && (
                  <p className="text-sm text-[var(--color-ink)]">"{resultData.text}"</p>
                )}
                {resultData?.type === "choice" && resultData.choice && (
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{resultData.choice}</p>
                )}
                {resultData?.type === "photo" && (
                  <p className="text-sm text-[var(--color-ink)]">📷 Photo captured</p>
                )}
                {resultData?.type === "video" && (
                  <p className="text-sm text-[var(--color-ink)]">📹 Video recorded</p>
                )}
                {resultData?.type === "combination" && (
                  <>
                    {resultData.media && <p className="text-sm text-[var(--color-ink)]">📷 Media included</p>}
                    {resultData.text && <p className="text-sm text-[var(--color-ink)] mt-1">"{resultData.text}"</p>}
                  </>
                )}
                {resultData?.why && (
                  <p className="text-xs text-[var(--color-muted-ink)] mt-2">Why: "{resultData.why}"</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {commitPhase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="rounded-[16px] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="[var(--color-danger)]" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[var(--color-danger)] font-semibold mb-1">COMMIT FAILED</p>
              <p className="text-sm text-[var(--color-muted-ink)] mb-4">{message}</p>
              <Button
                variant="secondary"
                onClick={() => setCommitPhase("idle")}
                fullWidth
              >
                TRY AGAIN
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}