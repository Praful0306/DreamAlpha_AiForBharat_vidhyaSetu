import { useState } from "react";

interface StudentProfile {
    name: string;
    age: number;
    grade: string;
}

interface StudentProfileModalProps {
    onSave: (profile: StudentProfile) => void;
    onCancel?: () => void;
    language: string;
    t: any;
}

export function StudentProfileModal({ onSave, onCancel, language, t }: StudentProfileModalProps) {
    const [name, setName] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [grade, setGrade] = useState("");

    const isKannada = language === "kn";

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (name.trim() && age && grade.trim()) {
            onSave({ name: name.trim(), age: Number(age), grade: grade.trim() });
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: -1 }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: -1 }}></div>

                <div className="modal-header" style={{ position: 'relative' }}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                position: 'absolute', top: '0', right: '0', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                    <div className="modal-icon">✨</div>
                    <h2 className="modal-title">
                        {t?.welcomeToVidyaSetu || "Welcome to Vidya-Setu!"}
                    </h2>
                    <p className="modal-subtitle">
                        {t?.tellUsAboutYourself || "Tell us a bit about yourself so AI can personalize your unique learning path."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-field">
                        <label className="modal-label">
                            {t?.yourName || "FULL NAME"}
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t?.namePlaceholder || "e.g. Rahul Sharma"}
                            className="modal-input"
                        />
                    </div>

                    <div className="modal-row">
                        <div className="modal-field">
                            <label className="modal-label">
                                {t?.age || "AGE"}
                            </label>
                            <input
                                type="number"
                                required
                                min="5"
                                max="50"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value) || "")}
                                placeholder="12"
                                className="modal-input"
                            />
                        </div>

                        <div className="modal-field">
                            <label className="modal-label">
                                {t?.classGrade || "GRADE / LEVEL"}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    required
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="modal-input"
                                >
                                    <option value="" disabled>{t?.select || "Select Class"}</option>
                                    {[5, 6, 7, 8, 9, 10, 11, 12, "College Degree"].map(num => (
                                        <option key={num} value={num.toString()}>
                                            {typeof num === "number" ? `${t?.classPrefix || "Class"} ${num}` : (t?.collegeDegree || "College Degree")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || !age || !grade.trim()}
                        className="modal-submit-btn"
                    >
                        {isKannada ? "ಪ್ರಾರಂಭಿಸಿ! 🚀" : "Let's Start Your Journey! ✨"}
                    </button>
                </form>
            </div>
        </div>
    );
}
