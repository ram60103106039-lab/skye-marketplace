import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, Gig, GigMatch, ChatMessage } from '../lib/supabase';

const KEYS = {
  userId: 'milo_anon_user_id',
  profile: 'milo_profile',
  gigs: 'milo_gigs',
  matches: 'milo_matches',
  messages: 'milo_messages',
};

function getOrCreateAnonUserId(): string {
  let id = localStorage.getItem(KEYS.userId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.userId, id);
  }
  return id;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useAppState() {
  const [userId] = useState<string>(getOrCreateAnonUserId);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadJson(KEYS.profile, null));
  const [activeGigs, setActiveGigs] = useState<Gig[]>(() => loadJson(KEYS.gigs, []));
  const [matches, setMatches] = useState<GigMatch[]>(() => loadJson(KEYS.matches, []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadJson(KEYS.messages, []));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async load to allow for future backend swap-in
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => { saveJson(KEYS.profile, profile); }, [profile]);
  useEffect(() => { saveJson(KEYS.gigs, activeGigs); }, [activeGigs]);
  useEffect(() => { saveJson(KEYS.matches, matches); }, [matches]);
  useEffect(() => { saveJson(KEYS.messages, messages); }, [messages]);

  const saveProfile = useCallback(async (data: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const now = new Date().toISOString();
    const existing = loadJson<UserProfile | null>(KEYS.profile, null);
    const updated: UserProfile = {
      id: existing?.id ?? crypto.randomUUID(),
      user_id: userId,
      name: '',
      role: 'both',
      campus_location: '',
      max_walk_time_mins: 20,
      pay_min: 15,
      pay_max: 50,
      skills_interests: [],
      onboarding_complete: false,
      avatar_url: null,
      bio: '',
      latitude: null,
      longitude: null,
      skills: [],
      availability: 'flexible',
      created_at: existing?.created_at ?? now,
      updated_at: now,
      ...existing,
      ...data,
      user_id: userId,
    };
    setProfile(updated);
    return { error: null };
  }, [userId]);

  const addMessage = useCallback(async (msg: Omit<ChatMessage, 'id' | 'user_id' | 'created_at'>) => {
    const entry: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, entry]);
  }, [userId]);

  const saveGig = useCallback(async (gig: Omit<Gig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newGig: Gig = {
      ...gig,
      id: crypto.randomUUID(),
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    setActiveGigs((prev) => [newGig, ...prev]);
    return { data: newGig, error: null };
  }, [userId]);

  const saveMatches = useCallback(async (gigId: string, incomingMatches: GigMatch[]) => {
    const stamped = incomingMatches.map((m) => ({ ...m, gig_id: gigId, user_id: userId }));
    setMatches((prev) => [...stamped, ...prev]);
  }, [userId]);

  const updateMatchDecision = useCallback(async (matchId: string, decision: 'accepted' | 'rejected') => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, decision, escrow_status: decision === 'accepted' ? ('held' as const) : ('pending' as const) }
          : m
      )
    );

    if (decision === 'accepted') {
      setMatches((prev) => {
        const match = prev.find((m) => m.id === matchId);
        if (match) {
          setActiveGigs((gigs) =>
            gigs.map((g) =>
              g.id === match.gig_id
                ? { ...g, status: 'matched' as const, escrow_held: true, escrow_amount: match.pay_max }
                : g
            )
          );
        }
        return prev;
      });
    }
  }, []);

  const releaseEscrow = useCallback(async (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, escrow_status: 'released' as const } : m
      )
    );
    // Mark the gig's escrow as released too
    setMatches((prev) => {
      const match = prev.find((m) => m.id === matchId);
      if (match) {
        setActiveGigs((gigs) =>
          gigs.map((g) =>
            g.id === match.gig_id ? { ...g, escrow_released: true } : g
          )
        );
      }
      return prev;
    });
  }, []);

  const totalEscrow = activeGigs.reduce(
    (sum, g) => sum + (g.escrow_held && !g.escrow_released ? g.escrow_amount : 0),
    0
  );

  return {
    userId,
    profile,
    activeGigs,
    matches,
    messages,
    loading,
    totalEscrow,
    saveProfile,
    addMessage,
    saveGig,
    saveMatches,
    updateMatchDecision,
    releaseEscrow,
  };
}
