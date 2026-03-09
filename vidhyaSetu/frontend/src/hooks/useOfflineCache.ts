// useOfflineCache.ts
// Custom hook: saves and retrieves Knowledge Cards from localStorage.
// 
// When online:  automatically saves the last 3 Knowledge Cards.
// When offline: retrieves saved cards so the student can still study.

import { useState, useEffect } from "react";
import type { KnowledgeCard } from "../services/api";

const STORAGE_KEY = "vidya_setu_saved_cards";
const MAX_SAVED = 3;

export function useOfflineCache() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [savedCards, setSavedCards] = useState<KnowledgeCard[]>([]);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Load saved cards from localStorage on startup
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setSavedCards(JSON.parse(raw));
            }
        } catch {
            // If localStorage is corrupted, start fresh
            setSavedCards([]);
        }
    }, []);

    /**
     * Save a new Knowledge Card to localStorage.
     * Keeps only the most recent MAX_SAVED cards.
     */
    function saveCard(card: KnowledgeCard) {
        setSavedCards(prev => {
            const updated = [card, ...prev].slice(0, MAX_SAVED);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
                // localStorage might be full — ignore error
            }
            return updated;
        });
    }

    /**
     * Clear all saved cards.
     */
    function clearCards() {
        setSavedCards([]);
        localStorage.removeItem(STORAGE_KEY);
    }

    return { isOnline, savedCards, saveCard, clearCards };
}
