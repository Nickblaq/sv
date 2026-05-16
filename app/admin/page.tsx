"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Participant, defaultParticipants } from "@/lib/data";
import { loadParticipants, saveParticipants, resetParticipants } from "@/lib/store";

type Tab = "participants" | "stats";

const EMPTY: Omit<Participant, "id"> = {
  fullName: "",
  nickname: "",
  avatar: "",
  bio: "",
  state: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  votes: 0,
  visible: true,
  ranked: true,
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<Tab>("participants");
  const [editing, setEditing] = useState<Participant | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Participant, "id">>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadParticipants();
    setParticipants(stored.length ? stored : defaultParticipants);
  }, []);

  const save = (updated: Participant[]) => {
    setParticipants(updated);
    saveParticipants(updated);
  };

  const handleLogin = () => {
    if (pin === "1234") setAuthed(true);
    else alert("Wrong PIN. (Demo PIN: 1234)");
  };

  const handleEdit = (p: Participant) => {
    setEditing(p);
    setForm({ ...p });
    setAdding(false);
  };

  const handleAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(EMPTY);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    save(participants.map((p) => (p.id === editing.id ? { ...form, id: p.id } : p)));
    setEditing(null);
  };

  const handleSaveAdd = () => {
    const newP: Participant = {
      ...form,
      id: Date.now().toString(),
      avatar: form.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${form.nickname || form.fullName}`,
    };
    save([...participants, newP]);
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    save(participants.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const toggle = (id: string, field: "visible" | "ranked") => {
    save(participants.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p)));
  };

  const handleReset = () => {
    if (confirm("Reset all data to defaults?")) {
      const fresh = defaultParticipants;
      save(fresh);
    }
  };

  const totalVotes = participants.reduce((s, p) => s + p.votes, 0);
  const topVoter = [...participants].sort((a, b) => b.votes - a.votes)[0];

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <span className="text-[#c9a227] text-3xl">🔐</span>
            <h1 className="font-display font-black text-white text-2xl mt-3">Admin Access</h1>
            <p className="text-white/40 text-sm mt-1">Enter your PIN to continue</p>
          </div>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest outline-none mb-4 focus:border-[#c9a227]/60"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#c9a227] hover:bg-[#f0d060] text-black font-bold py-3 rounded-xl transition-all"
          >
            Enter
          </button>
          <p className="text-white/20 text-xs text-center mt-4">Demo PIN: 1234</p>
        </div>
      </div>
    );
  }

  const showForm = editing || adding;

  return (
    <div className="min-h-screen bg-[#080810] text-white font-body">
      {/* Admin header */}
      <header className="border-b border-white/5 bg-[#080810]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Public</Link>
            <span className="text-white/20">/</span>
            <span className="font-display font-black text-white">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="text-xs text-white/30 hover:text-red-400 transition-colors border border-white/10 px-3 py-1.5 rounded-lg">
              Reset Data
            </button>
            <button onClick={() => setAuthed(false)} className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Participants", value: participants.length },
            { label: "Visible", value: participants.filter((p) => p.visible).length },
            { label: "Total Votes", value: totalVotes.toLocaleString() },
            { label: "Leader", value: topVoter?.nickname || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{label}</p>
              <p className="font-display font-black text-white text-xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["participants", "stats"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                tab === t ? "bg-[#c9a227] text-black" : "text-white/50 border border-white/10 hover:border-white/30"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={handleAdd}
            className="ml-auto px-4 py-2 text-sm font-semibold bg-white text-black rounded-xl hover:bg-[#c9a227] transition-all"
          >
            + Add Participant
          </button>
        </div>

        {/* Form drawer */}
        {showForm && (
          <div className="bg-white/[0.03] border border-[#c9a227]/30 rounded-2xl p-6 mb-6">
            <h3 className="font-display font-black text-white text-xl mb-5">
              {adding ? "Add Participant" : `Edit: ${editing?.nickname}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {(
                [
                  ["fullName", "Full Name *"],
                  ["nickname", "Nickname"],
                  ["state", "State"],
                  ["avatar", "Avatar URL"],
                  ["instagram", "Instagram"],
                  ["twitter", "Twitter/X"],
                  ["tiktok", "TikTok"],
                ] as [keyof typeof form, string][]
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="text-white/40 text-xs uppercase tracking-wider block mb-1">{label}</label>
                  <input
                    value={(form[key] as string) || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#c9a227]/60"
                  />
                </div>
              ))}
              <div>
                <label className="text-white/40 text-xs uppercase tracking-wider block mb-1">Votes (override)</label>
                <input
                  type="number"
                  value={form.votes}
                  onChange={(e) => setForm({ ...form, votes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#c9a227]/60"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-white/40 text-xs uppercase tracking-wider block mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#c9a227]/60 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={adding ? handleSaveAdd : handleSaveEdit}
                className="bg-[#c9a227] hover:bg-[#f0d060] text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(null); setAdding(false); }}
                className="border border-white/10 text-white/60 px-6 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Participant list */}
        {tab === "participants" && (
          <div className="space-y-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  p.visible ? "bg-white/[0.03] border-white/8" : "bg-white/[0.01] border-white/4 opacity-50"
                }`}
              >
                <img src={p.avatar} alt={p.fullName} className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-white">{p.nickname}</span>
                    <span className="text-white/40 text-xs">{p.fullName}</span>
                    <span className="text-white/20 text-xs">· {p.state}</span>
                  </div>
                  <p className="text-[#c9a227] font-bold text-sm mt-0.5">{p.votes.toLocaleString()} votes</p>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggle(p.id, "visible")}
                    title={p.visible ? "Hide" : "Show"}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      p.visible
                        ? "border-green-500/30 text-green-400 bg-green-500/10"
                        : "border-white/10 text-white/30 bg-white/5"
                    }`}
                  >
                    {p.visible ? "Visible" : "Hidden"}
                  </button>
                  <button
                    onClick={() => toggle(p.id, "ranked")}
                    title={p.ranked ? "Remove from ranking" : "Add to ranking"}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      p.ranked
                        ? "border-[#c9a227]/30 text-[#c9a227] bg-[#c9a227]/10"
                        : "border-white/10 text-white/30 bg-white/5"
                    }`}
                  >
                    {p.ranked ? "Ranked" : "Unranked"}
                  </button>
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-xs px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Edit
                  </button>
                  {deleteConfirm === p.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(p.id)} className="text-xs px-2.5 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold">
                        Confirm
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-white/40 rounded-lg">
                        ×
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(p.id)} className="text-xs px-3 py-1 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="space-y-3">
            {[...participants]
              .sort((a, b) => b.votes - a.votes)
              .map((p, i) => {
                const pct = totalVotes > 0 ? (p.votes / totalVotes) * 100 : 0;
                return (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8">
                    <span className="text-white/30 font-display font-black text-sm w-6 text-center">#{i + 1}</span>
                    <span className="font-semibold text-white flex-1">{p.nickname}</span>
                    <div className="w-40 hidden md:block bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#f0d060]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[#c9a227] font-bold font-display w-20 text-right">{p.votes.toLocaleString()}</span>
                    <span className="text-white/30 text-xs w-12 text-right">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
