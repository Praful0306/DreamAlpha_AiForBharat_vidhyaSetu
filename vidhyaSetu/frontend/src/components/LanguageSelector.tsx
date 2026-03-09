// LanguageSelector.tsx
// Lets the student choose a language (English or Kannada)


interface LanguageSelectorProps {
    selected: string;
    onChange: (lang: string) => void;
}

const LANGUAGES = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
];

export function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
    return (
        <div className="language-selector">
            <span className="selector-label">🌐 Language / ಭಾಷೆ</span>
            <div className="language-buttons">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        className={`lang-btn ${selected === lang.code ? "active" : ""}`}
                        onClick={() => onChange(lang.code)}
                        title={lang.label}
                    >
                        {lang.nativeLabel}
                    </button>
                ))}
            </div>
        </div>
    );
}
