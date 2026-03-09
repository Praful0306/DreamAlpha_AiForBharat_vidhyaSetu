// OfflineBanner.tsx
// Shows a warning banner when the user is offline.
// When offline, they cannot ask new questions but can still view saved cards.


interface OfflineBannerProps {
    isOnline: boolean;
    savedCardsCount: number;
}

export function OfflineBanner({ isOnline, savedCardsCount }: OfflineBannerProps) {
    if (isOnline) return null; // Don't show anything when online

    return (
        <div className="offline-banner" role="alert">
            <span className="offline-icon">📵</span>
            <div className="offline-text">
                <strong>You are offline</strong>
                <span>
                    {savedCardsCount > 0
                        ? ` Showing your ${savedCardsCount} saved card${savedCardsCount > 1 ? "s" : ""} below.`
                        : " No saved cards yet. Connect to the internet to learn!"}
                </span>
            </div>
        </div>
    );
}
