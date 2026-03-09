// TopicSelector.tsx
// Shows school subject topics the student can choose from


interface TopicSelectorProps {
    selected: string;
    onChange: (topic: string) => void;
    language: string;
}

// Topic list in English and Kannada
const TOPICS = [
    {
        value: "Physics - Gravity",
        en: "⚽ Gravity",
        kn: "⚽ ಗುರುತ್ವಾಕರ್ಷಣೆ",
        subject: "Physics",
    },
    {
        value: "Physics - Light",
        en: "💡 Light",
        kn: "💡 ಬೆಳಕು",
        subject: "Physics",
    },
    {
        value: "Maths - Fractions",
        en: "🔢 Fractions",
        kn: "🔢 ಭಿನ್ನರಾಶಿಗಳು",
        subject: "Maths",
    },
    {
        value: "Biology - Photosynthesis",
        en: "🌿 Photosynthesis",
        kn: "🌿 ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ",
        subject: "Biology",
    },
    {
        value: "Biology - Human Body",
        en: "🫀 Human Body",
        kn: "🫀 ಮಾನವ ದೇಹ",
        subject: "Biology",
    },
    {
        value: "Geography - Water Cycle",
        en: "💧 Water Cycle",
        kn: "💧 ನೀರಿನ ಚಕ್ರ",
        subject: "Geography",
    },
];

export function TopicSelector({ selected, onChange, language }: TopicSelectorProps) {
    return (
        <div className="topic-selector">
            <span className="selector-label">
                📚 {language === "kn" ? "ವಿಷಯ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose a Topic"}
            </span>
            <div className="topic-grid">
                {TOPICS.map((topic) => (
                    <button
                        key={topic.value}
                        className={`topic-btn ${selected === topic.value ? "active" : ""}`}
                        onClick={() => onChange(topic.value)}
                        title={topic.value}
                    >
                        <span className="topic-subject">{topic.subject}</span>
                        <span className="topic-name">
                            {language === "kn" ? topic.kn : topic.en}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
