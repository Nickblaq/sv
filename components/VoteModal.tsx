"use client";
import { useState } from "react";
import { Participant } from "@/lib/data";

interface Props {
  participant: Participant;
  onClose: () => void;
  onPay: (amount: number) => void;
}

const PRESETS = [100, 500, 1000, 2000, 5000];

export default function VoteModal({ participant: p, onClose, onPay }: Props) {
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [step, setStep] = useState<"select" | "confirm" | "processing" | "done">("select");

  const effectiveAmount = custom ? parseInt(custom) || 0 : amount;
  const votes = Math.floor(effectiveAmount / 100);

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      setTimeout(() => onPay(effectiveAmount), 1200);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0e0e1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-[#c9a227]/20 to-transparent border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={p.avatar} alt={p.fullName} className="w-10 h-10 rounded-full object-cover border border-[#c9a227]/40" />
            <div>
              <p className="font-display font-black text-white text-sm">{p.nickname || p.fullName}</p>
              <p className="text-white/40 text-xs">{p.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        <div className="p-6">
          {step === "select" && (
            <>
              <h2 className="font-display font-black text-white text-2xl mb-1">Cast Your Votes</h2>
              <p className="text-white/40 text-sm mb-6">₦100 = 1 vote. Choose your amount below.</p>

              {/* Preset amounts */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PRESETS.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAmount(v); setCustom(""); }}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      amount === v && !custom
                        ? "bg-[#c9a227] text-black"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="mb-6">
                <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#c9a227]/60">
                  <span className="px-4 text-[#c9a227] font-bold">₦</span>
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
                    className="flex-1 bg-transparent text-white py-3 pr-4 outline-none text-sm placeholder:text-white/20"
                    min={100}
                    step={100}
                  />
                </div>
                {custom && parseInt(custom) < 100 && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">Minimum amount is ₦100</p>
                )}
              </div>

              {/* Vote summary */}
              <div className="bg-[#c9a227]/10 border border-[#c9a227]/20 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">You're paying</span>
                  <span className="text-[#c9a227] font-black font-display text-xl">
                    ₦{effectiveAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/60 text-sm">Votes added for <strong className="text-white">{p.nickname}</strong></span>
                  <span className="text-white font-bold text-lg">+{votes} 🗳️</span>
                </div>
              </div>

              <button
                onClick={() => setStep("confirm")}
                disabled={effectiveAmount < 100}
                className="w-full bg-[#c9a227] hover:bg-[#f0d060] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm"
              >
                Continue to Payment →
              </button>
            </>
          )}

          {step === "confirm" && (
            <>
              <h2 className="font-display font-black text-white text-2xl mb-1">Confirm Payment</h2>
              <p className="text-white/40 text-sm mb-6">Review your vote details before proceeding.</p>

              <div className="space-y-3 mb-6">
                {[
                  ["Voting for", p.nickname || p.fullName],
                  ["Amount", `₦${effectiveAmount.toLocaleString()}`],
                  ["Votes added", `${votes} votes`],
                  ["Payment method", "Simulated (Demo)"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/40 text-sm">{label}</span>
                    <span className="text-white font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("select")} className="flex-1 border border-white/10 text-white/60 py-3.5 rounded-2xl text-sm font-semibold hover:bg-white/5 transition-all">
                  ← Back
                </button>
                <button onClick={handlePay} className="flex-1 bg-[#c9a227] hover:bg-[#f0d060] text-black font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98]">
                  Pay Now
                </button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-[#c9a227]/20 border-t-[#c9a227] animate-spin" />
              <h2 className="font-display font-black text-white text-xl mb-2">Processing...</h2>
              <p className="text-white/40 text-sm">Verifying your payment</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-3xl">
                ✅
              </div>
              <h2 className="font-display font-black text-white text-xl mb-2">Payment Successful!</h2>
              <p className="text-white/40 text-sm">+{votes} votes added for <span className="text-[#c9a227] font-semibold">{p.nickname}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
