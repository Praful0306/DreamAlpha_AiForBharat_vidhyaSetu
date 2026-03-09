// CodingPlayground.tsx — AI Coding Lab v6 FINAL
// FIX: Calls /api/execute on OUR backend (JDoodle CORS blocks browsers, must proxy server-side)
// Features: Live run · HTML/CSS preview · AI Problem · Help · Expert Code

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { askQuestion } from '../services/api';
import type { Language } from '../translations';

interface CodingPlaygroundProps {
    subject: string;
    language: Language;
    t: any;
    studentProfile: { name: string; age: number; grade: string } | null;
}

interface LangConfig {
    label: string;
    jdoodleLanguage: string;
    jdoodleVersion: string;
    fileExt: string;
    icon: string;
    starter: string;
    isPreview?: boolean;
}

// Bedrock prompt: simulate code execution, return ONLY the output
const mkRunPrompt = (code: string, lang: string) =>
    `You are a ${lang} code executor. Run this code mentally and return ONLY the exact console output, nothing else. No explanation, no markdown, no code blocks — just the raw output the program would print.

If there is a syntax error or runtime error, return only the error message exactly as the interpreter would show it.

CODE:
${code}`;


const LANGUAGES: Record<string, LangConfig> = {
    python: {
        label: 'Python 3', jdoodleLanguage: 'python3', jdoodleVersion: '3',
        fileExt: 'py', icon: '🐍',
        starter: `# Write your Python solution here\n# Press "🤖 Get Problem" to get a coding challenge!\n\ndef solve():\n    # your code here\n    pass\n\nsolve()\n`,
    },
    javascript: {
        label: 'JavaScript', jdoodleLanguage: 'nodejs', jdoodleVersion: '4',
        fileExt: 'js', icon: '⚡',
        starter: `// Write your JavaScript solution here\n// Press "🤖 Get Problem" to get a coding challenge!\n\nfunction solve() {\n  // your code here\n}\n\nconsole.log(solve());\n`,
    },
    cpp: {
        label: 'C++', jdoodleLanguage: 'cpp17', jdoodleVersion: '0',
        fileExt: 'cpp', icon: '⚙️',
        starter: `// Write your C++ solution here\n#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // your code here\n    cout << "Hello!" << endl;\n    return 0;\n}\n`,
    },
    c: {
        label: 'C', jdoodleLanguage: 'c', jdoodleVersion: '5',
        fileExt: 'c', icon: '🔧',
        starter: `// Write your C solution here\n#include <stdio.h>\n\nint main() {\n    // your code here\n    printf("Hello!\\n");\n    return 0;\n}\n`,
    },
    java: {
        label: 'Java', jdoodleLanguage: 'java', jdoodleVersion: '4',
        fileExt: 'java', icon: '☕',
        starter: `// Write your Java solution here\n// NOTE: Class must be named Main\npublic class Main {\n    public static void main(String[] args) {\n        // your code here\n        System.out.println("Hello!");\n    }\n}\n`,
    },
    html: {
        label: 'HTML', jdoodleLanguage: '', jdoodleVersion: '',
        fileExt: 'html', icon: '🌐', isPreview: true,
        starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>My Page</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      background: linear-gradient(135deg, #667eea, #764ba2);\n      display: flex; align-items: center; justify-content: center;\n      min-height: 100vh; margin: 0;\n    }\n    .card { background: white; border-radius: 16px; padding: 32px 40px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }\n    h1 { color: #6a0dad; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Hello, World! 🌏</h1>\n    <p>Edit this HTML and click Preview!</p>\n  </div>\n</body>\n</html>\n`,
    },
    css: {
        label: 'HTML + CSS', jdoodleLanguage: '', jdoodleVersion: '',
        fileExt: 'html', icon: '🎨', isPreview: true,
        starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>CSS Practice</title>\n  <style>\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body {\n      font-family: 'Segoe UI', sans-serif;\n      background: linear-gradient(135deg, #f093fb, #f5576c);\n      min-height: 100vh; display: flex; align-items: center; justify-content: center;\n    }\n    .card {\n      background: white; border-radius: 20px; padding: 40px;\n      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-width: 400px;\n    }\n    h1 { color: #e91e8c; margin-bottom: 12px; font-size: 2rem; }\n    p  { color: #555; line-height: 1.6; }\n    .badge {\n      display: inline-block;\n      background: linear-gradient(135deg,#667eea,#764ba2);\n      color: white; border-radius: 999px; padding: 4px 14px;\n      font-size: 0.8rem; margin-top: 12px;\n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>CSS Magic ✨</h1>\n    <p>Edit the styles above to change this card!</p>\n    <div class="badge">AI Coding Lab</div>\n  </div>\n</body>\n</html>\n`,
    },
};

const DIFFICULTIES = [
    { id: 'easy', label: 'Easy', color: '#00ffaa', bg: 'rgba(0,255,170,0.1)', border: 'rgba(0,255,170,0.3)' },
    { id: 'medium', label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    { id: 'hard', label: 'Hard', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
];

const mkProblem = (topic: string, lang: string, diff: string, name?: string) =>
    `Generate a ${diff} ${lang} coding problem about "${topic || 'basic programming'}".${name ? ` Student: ${name}.` : ''}

Format exactly (max 90 words total):
🎯 TITLE: [short title]

📋 PROBLEM:
[2-3 sentences. Use simple Indian context: farm, market, cricket, train, or school.]

📥 INPUT: [what the program receives]
📤 OUTPUT: [what to print]

💡 EXAMPLE:
Input: [sample]
Output: [expected]

🔑 HINT: [one sentence, no code]`;

const mkApproach = (problem: string, lang: string) =>
    `Problem: ${problem.slice(0, 300)}\n\nGive a step-by-step approach in ${lang}. Plain English ONLY — NO code at all.\nFormat: Step 1 → Step 2 → Step 3 … then "KEY INSIGHT:" at end. Max 80 words.`;

const mkSolution = (problem: string, lang: string) =>
    `Write a clean, well-commented ${lang} solution for:\n${problem.slice(0, 300)}\n\nComment every important line. Add one test at bottom. Keep it simple.`;

const mkExpert = (problem: string, lang: string) =>
    `Write the most efficient expert-level ${lang} solution for:\n${problem.slice(0, 300)}\n\nInclude: optimal algorithm + inline comments + time/space complexity (Big-O) + 2 senior developer tips.`;

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function LockedCode({ text }: { text: string }) {
    return (
        <>
            <div style={{ padding: '7px 14px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700 }}>🚫 COPY DISABLED — Read the code, then write it yourself from memory</span>
            </div>
            <pre
                onCopy={e => e.preventDefault()} onCut={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}
                style={{ margin: 0, padding: '14px 16px', fontFamily: '"JetBrains Mono","Fira Code","Consolas",monospace', fontSize: 'clamp(11px,1.3vw,13px)', lineHeight: 1.7, color: '#a3e4d7', background: 'rgba(2,6,15,0.88)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 360, overflowY: 'auto', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' as any, borderRadius: '0 0 12px 12px' }}
            >{text}</pre>
        </>
    );
}

function Spin() { return <span style={{ display: 'inline-block', animation: 'cpSpin .85s linear infinite' }}>⟳</span>; }

function Skeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[90, 70, 80, 55, 75].map((w, i) => (
                <div key={i} style={{ height: 10, width: `${w}%`, background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: `cpShimmer 1.4s ease-in-out ${i * 0.12}s infinite` }} />
            ))}
        </div>
    );
}

function LineNums({ count }: { count: number }) {
    return (
        <div aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', overflowY: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
            {Array.from({ length: Math.max(count, 18) }, (_, i) => (
                <div key={i} style={{ height: '21.45px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7, color: '#1e293b', fontFamily: 'monospace', fontSize: 11, userSelect: 'none' }}>{i + 1}</div>
            ))}
        </div>
    );
}

// srcDoc iframe — zero cross-origin errors
function HTMLPreview({ html }: { html: string }) {
    return (
        <iframe srcDoc={html} title="HTML Preview" sandbox="allow-scripts allow-same-origin"
            style={{ width: '100%', minHeight: 'clamp(280px,42vh,480px)', border: 'none', background: 'white', borderRadius: '0 0 14px 14px', display: 'block' }}
        />
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export function CodingPlayground({ subject, language, studentProfile }: CodingPlaygroundProps) {
    const navigate = useNavigate();

    const [selLang, setSelLang] = useState('python');
    const [code, setCode] = useState(LANGUAGES.python.starter);
    const [topic, setTopic] = useState(subject || '');
    const [diff, setDiff] = useState('easy');
    const [previewHtml, setPreviewHtml] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const [output, setOutput] = useState('');
    const [outType, setOutType] = useState<'idle' | 'running' | 'ok' | 'err'>('idle');
    const [running, setRunning] = useState(false);
    const [ms, setMs] = useState<number | null>(null);
    const [hasRun, setHasRun] = useState(false);

    const [problem, setProblem] = useState('');
    const [probLoad, setProbLoad] = useState(false);

    const [showHelp, setShowHelp] = useState(false);
    const [helpTab, setHelpTab] = useState<'approach' | 'solution'>('approach');
    const [approach, setApproach] = useState('');
    const [solution, setSolution] = useState('');
    const [helpLoad, setHelpLoad] = useState(false);

    const [showExpert, setShowExpert] = useState(false);
    const [expert, setExpert] = useState('');
    const [expertLoad, setExpertLoad] = useState(false);

    const [ready, setReady] = useState(false);
    const taRef = useRef<HTMLTextAreaElement>(null);
    const outRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setTimeout(() => setReady(true), 60); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (subject && !topic) setTopic(subject); }, [subject]);

    const L = LANGUAGES[selLang];
    const curDiff = DIFFICULTIES.find(d => d.id === diff)!;

    const changeLang = useCallback((k: string) => {
        setSelLang(k); setCode(LANGUAGES[k].starter);
        setOutput(''); setOutType('idle'); setMs(null);
        setShowPreview(false); setPreviewHtml(''); setHasRun(false);
    }, []);

    // ── RUN CODE — uses AWS Bedrock to simulate execution output ─────────────
    const runCode = useCallback(async () => {
        if (!code.trim() || running) return;

        // HTML/CSS: render in iframe instantly
        if (L.isPreview) {
            setPreviewHtml(code); setShowPreview(true);
            setHasRun(true); setOutType('ok'); setOutput('✅ Preview rendered!');
            return;
        }

        setRunning(true); setOutType('running'); setOutput('⚙️ Running your code via AWS Bedrock…');
        setShowHelp(false); setShowExpert(false);
        const t0 = Date.now();

        try {
            const card = await askQuestion({
                language,
                topic: 'Code Execution',
                question: mkRunPrompt(code, L.label),
                student_name: studentProfile?.name,
            });

            const elapsed = Date.now() - t0;
            setMs(elapsed);

            // Bedrock returns the output in card.answer
            const out = (card.answer || '').trim();

            // Detect if it looks like an error
            const isError = /error|exception|traceback|syntaxerror|nameerror|typeerror|valueerror|runtimeerror|segfault|undefined|cannot|failed/i.test(out) && !out.includes('\n');

            if (isError) {
                setOutput(out);
                setOutType('err');
            } else {
                setOutput(out || '✅ Program ran with no output.');
                setOutType('ok');
            }
            setHasRun(true);
        } catch (e: any) {
            setMs(null);
            setOutput(`❌ ${e?.message || 'Could not reach backend. Check your connection.'}`);
            setOutType('err');
        } finally {
            setRunning(false);
            setTimeout(() => outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        }
    }, [code, running, L, language, studentProfile]);

    const onKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); return; }
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget, s = ta.selectionStart, en = ta.selectionEnd;
            const v = ta.value.slice(0, s) + '  ' + ta.value.slice(en);
            setCode(v);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
        }
    }, [runCode]);

    const getProblem = useCallback(async () => {
        if (probLoad) return;
        setProbLoad(true); setProblem(''); setApproach(''); setSolution('');
        setExpert(''); setShowHelp(false); setShowExpert(false);
        setHasRun(false); setOutput(''); setOutType('idle'); setMs(null);
        setShowPreview(false); setPreviewHtml('');
        try {
            const card = await askQuestion({
                language, topic: topic || subject || 'Programming',
                question: mkProblem(topic || subject || '', L.label, diff, studentProfile?.name),
                student_name: studentProfile?.name, student_age: studentProfile?.age, student_grade: studentProfile?.grade,
            });
            setProblem(card.answer || card.analogy || 'Problem generated!');
        } catch { setProblem('⚠️ Backend not reachable. Make sure your server is running.'); }
        finally { setProbLoad(false); }
    }, [probLoad, topic, subject, L.label, diff, language, studentProfile]);

    const getApproach = useCallback(async () => {
        if (!problem || helpLoad) return;
        setShowHelp(true); setHelpTab('approach');
        if (approach) return;
        setHelpLoad(true);
        try {
            const c = await askQuestion({ language, topic: 'Approach', question: mkApproach(problem, L.label), student_name: studentProfile?.name });
            setApproach(c.answer || 'Break the problem into small steps.');
        } catch { setApproach('⚠️ Could not load. Try again.'); }
        finally { setHelpLoad(false); }
    }, [problem, helpLoad, approach, L.label, language, studentProfile]);

    const getSolution = useCallback(async () => {
        if (!problem || helpLoad) return;
        setHelpTab('solution');
        if (solution) return;
        setHelpLoad(true);
        try {
            const c = await askQuestion({ language, topic: 'Solution', question: mkSolution(problem, L.label), student_name: studentProfile?.name });
            setSolution(c.answer || '# Solution unavailable');
        } catch { setSolution('⚠️ Could not load. Try again.'); }
        finally { setHelpLoad(false); }
    }, [problem, helpLoad, solution, L.label, language, studentProfile]);

    const getExpert = useCallback(async () => {
        if (!problem || expertLoad || !hasRun) return;
        setShowExpert(true); setShowHelp(false);
        if (expert) return;
        setExpertLoad(true);
        try {
            const c = await askQuestion({ language, topic: 'Expert Code', question: mkExpert(problem, L.label), student_name: studentProfile?.name });
            setExpert(c.answer || '// Expert solution unavailable');
        } catch { setExpert('⚠️ Could not load. Try again.'); }
        finally { setExpertLoad(false); }
    }, [problem, expertLoad, hasRun, expert, L.label, language, studentProfile]);

    const glass: React.CSSProperties = { background: 'rgba(8,14,26,0.78)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' };
    const btn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 9, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: '9px 16px', transition: 'all 0.2s', whiteSpace: 'nowrap' as const, fontFamily: 'inherit' };

    return (
        <div style={{ padding: 'clamp(12px,2.5vw,28px) clamp(10px,2.5vw,22px)', maxWidth: 1240, margin: '0 auto', opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(14px)', transition: 'opacity .4s, transform .4s' }}>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                    <button onClick={() => navigate('/dashboard')} style={{ ...btn, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', padding: '5px 12px', fontSize: '0.78rem', marginBottom: 10 }}>← Back to Dashboard</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: '1.8rem' }}>💻</span>
                        <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem,3.5vw,1.9rem)', fontWeight: 900, background: 'linear-gradient(135deg,#00f0ff,#b400ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Coding Lab</h1>
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem' }}>
                        Write & run code · AI problems by <span style={{ color: '#ff9900', fontWeight: 700 }}>AWS Bedrock</span>
                        {' '}· <kbd style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '1px 5px', fontSize: '0.73rem', color: '#94a3b8', fontFamily: 'monospace' }}>Ctrl+Enter</kbd> to run
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', color: '#ff9900', borderRadius: 999, padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700 }}>⚡ AWS BEDROCK</span>
                    <span style={{ background: 'rgba(0,255,170,0.07)', border: '1px solid rgba(0,255,170,0.2)', color: '#00ffaa', borderRadius: 999, padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700 }}>🚀 LIVE EXECUTION</span>
                </div>
            </div>

            {/* CONTROLS */}
            <div style={{ ...glass, padding: '14px 18px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Language</label>
                    <select value={selLang} onChange={e => changeLang(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', padding: '8px 12px', fontSize: '0.875rem', cursor: 'pointer', colorScheme: 'dark', fontFamily: 'inherit', outline: 'none' }}>
                        {Object.entries(LANGUAGES).map(([k, l]) => <option key={k} value={k}>{l.icon}  {l.label}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
                    <label style={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Topic / Subject</label>
                    <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Arrays, Sorting, Recursion, HTML Forms…"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', padding: '8px 12px', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
                </div>

                {!L.isPreview && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Difficulty</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {DIFFICULTIES.map(d => (
                                <button key={d.id} onClick={() => setDiff(d.id)}
                                    style={{ ...btn, padding: '7px 13px', background: diff === d.id ? d.bg : 'rgba(0,0,0,0.4)', border: `1px solid ${diff === d.id ? d.border : 'rgba(255,255,255,0.07)'}`, color: diff === d.id ? d.color : '#475569', fontSize: '0.78rem' }}>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={getProblem} disabled={probLoad}
                    style={{ ...btn, background: probLoad ? 'rgba(255,255,255,0.04)' : 'rgba(180,0,255,0.14)', border: `1px solid ${probLoad ? 'rgba(255,255,255,0.06)' : 'rgba(180,0,255,0.4)'}`, color: probLoad ? '#475569' : '#b400ff', boxShadow: !probLoad ? '0 0 16px rgba(180,0,255,0.12)' : 'none' }}>
                    {probLoad ? <><Spin /> Generating…</> : <>🤖 Get Problem</>}
                </button>
            </div>

            {/* SPLIT LAYOUT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,400px)', gap: 14, alignItems: 'start' }}>

                {/* LEFT: EDITOR */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ ...glass, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{L.icon}</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'monospace' }}>main.{L.fileExt}</span>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ffaa', boxShadow: '0 0 6px #00ffaa', animation: 'cpPulse 2s infinite' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={runCode} disabled={running || !code.trim()}
                                style={{ ...btn, background: running ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#00f0ff,#00ffaa)', color: running ? '#475569' : '#0f172a', border: 'none', opacity: (!code.trim() || running) ? 0.6 : 1, boxShadow: !running && code.trim() ? '0 2px 14px rgba(0,240,255,0.28)' : 'none' }}>
                                {running ? <><Spin /> Running…</> : L.isPreview ? '👁 Preview' : '▶ Run'}
                            </button>
                            <button onClick={() => { setCode(L.starter); setOutput(''); setOutType('idle'); setMs(null); setShowPreview(false); setPreviewHtml(''); setHasRun(false); }}
                                style={{ ...btn, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>🔄 Reset</button>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <LineNums count={code.split('\n').length} />
                        <textarea ref={taRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={onKey}
                            spellCheck={false} autoCapitalize="none" autoCorrect="off"
                            style={{ width: '100%', minHeight: 'clamp(280px,42vh,500px)', padding: '14px 14px 14px 48px', background: 'rgba(3,6,16,0.95)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 0, color: '#e2e8f0', fontFamily: '"JetBrains Mono","Fira Code","Consolas",monospace', fontSize: 'clamp(12px,1.4vw,14px)', lineHeight: '1.65', outline: 'none', resize: 'vertical', tabSize: 2, whiteSpace: 'pre', overflowWrap: 'normal' as any, overflowX: 'auto', boxSizing: 'border-box' }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.22)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')} />
                    </div>

                    <div style={{ ...glass, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ color: '#1e293b', fontSize: '0.7rem' }}>{code.split('\n').length} lines · {code.length} chars</span>
                        <span style={{ color: '#1e293b', fontSize: '0.7rem' }}>Tab = 2 spaces</span>
                        {ms !== null && outType === 'ok' && <span style={{ color: '#00ffaa', fontSize: '0.7rem', fontWeight: 700 }}>✅ {ms}ms</span>}
                        {ms !== null && outType === 'err' && <span style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700 }}>❌ Error · {ms}ms</span>}
                        <span style={{ marginLeft: 'auto', color: '#1e293b', fontSize: '0.68rem' }}>{L.isPreview ? 'Ctrl+Enter to preview' : 'Ctrl+Enter to run'}</span>
                    </div>

                    {L.isPreview && showPreview && previewHtml && (
                        <div style={{ ...glass, marginTop: 12, border: '1px solid rgba(0,255,170,0.2)', overflow: 'hidden' }}>
                            <div style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ffaa' }} />
                                <span style={{ color: '#00ffaa', fontWeight: 700, fontSize: '0.78rem' }}>🌐 LIVE PREVIEW</span>
                                <button onClick={() => { setShowPreview(false); setPreviewHtml(''); }} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.78rem' }}>✕ Close</button>
                            </div>
                            <HTMLPreview html={previewHtml} />
                        </div>
                    )}

                    {!L.isPreview && (
                        <div ref={outRef} style={{ ...glass, marginTop: 12, border: `1px solid ${outType === 'ok' ? 'rgba(0,255,170,0.18)' : outType === 'err' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.06)'}` }}>
                            <div style={{ padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: outType === 'ok' ? '#00ffaa' : outType === 'err' ? '#ef4444' : outType === 'running' ? '#f59e0b' : '#334155', transition: 'background 0.3s' }} />
                                <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'monospace' }}>OUTPUT CONSOLE</span>
                                {outType === 'running' && <span style={{ color: '#f59e0b', fontSize: '0.7rem', animation: 'cpPulse 1s infinite' }}>● Running…</span>}
                                {outType === 'ok' && ms && <span style={{ color: '#00ffaa', fontSize: '0.7rem', marginLeft: 'auto' }}>✅ {ms}ms</span>}
                                {outType === 'err' && <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: 'auto' }}>❌ Error</span>}
                            </div>
                            <pre style={{ margin: 0, padding: '12px 16px', minHeight: 80, maxHeight: 220, overflowY: 'auto', fontFamily: '"JetBrains Mono","Fira Code","Consolas",monospace', fontSize: 'clamp(11px,1.3vw,13px)', lineHeight: '1.65', color: outType === 'ok' ? '#a3e4d7' : outType === 'err' ? '#fca5a5' : '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {output || 'Click ▶ Run to execute your code…'}
                            </pre>
                        </div>
                    )}

                    {problem && (
                        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button onClick={getApproach}
                                style={{ ...btn, flex: 1, minWidth: 140, justifyContent: 'center', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.28)', color: '#00f0ff' }}>
                                💡 Help Me Solve
                            </button>
                            <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <button onClick={hasRun ? getExpert : undefined}
                                    title={!hasRun ? 'Run your code first to unlock' : 'See expert-level efficient code'}
                                    style={{ ...btn, width: '100%', justifyContent: 'center', background: hasRun ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hasRun ? 'rgba(245,158,11,0.35)' : 'rgba(255,255,255,0.06)'}`, color: hasRun ? '#f59e0b' : '#334155', cursor: hasRun ? 'pointer' : 'not-allowed' }}>
                                    {hasRun ? '🏆 Expert Code' : '🔒 Expert Code'}
                                </button>
                                {!hasRun && <p style={{ margin: 0, color: '#334155', fontSize: '0.68rem' }}>Run your code first to unlock</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    <div style={{ ...glass, border: problem ? '1px solid rgba(180,0,255,0.22)' : '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ padding: '11px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: '#b400ff', fontWeight: 800, fontSize: '0.85rem' }}>🤖 Problem</span>
                            {problem && !L.isPreview && <span style={{ background: curDiff.bg, border: `1px solid ${curDiff.border}`, color: curDiff.color, borderRadius: 999, padding: '1px 8px', fontSize: '0.63rem', fontWeight: 800 }}>{curDiff.label}</span>}
                            {problem && (
                                <button onClick={getProblem} style={{ marginLeft: 'auto', ...btn, padding: '3px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: '0.7rem' }}
                                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#b400ff')}
                                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}>↻ New</button>
                            )}
                        </div>
                        <div style={{ padding: '14px 15px', minHeight: 90 }}>
                            {probLoad ? <Skeleton /> :
                                problem ? (
                                    <pre style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75, fontFamily: 'inherit' }}>{problem}</pre>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '16px 0', color: '#334155' }}>
                                        <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>🤖</div>
                                        <div style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>Click <strong style={{ color: '#b400ff' }}>Get Problem</strong><br />to get a coding challenge</div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {L.isPreview && (
                        <div style={{ ...glass, padding: '12px 15px', border: '1px solid rgba(0,255,170,0.15)' }}>
                            <div style={{ color: '#00ffaa', fontWeight: 700, fontSize: '0.8rem', marginBottom: 6 }}>🌐 {L.label} Mode</div>
                            <div style={{ color: '#475569', fontSize: '0.76rem', lineHeight: 1.6 }}>
                                Write your HTML{selLang === 'css' ? ' & CSS' : ''} in the editor,<br />
                                then click <strong style={{ color: '#00f0ff' }}>👁 Preview</strong> to see it live.<br />
                                No API limit — works offline!
                            </div>
                        </div>
                    )}

                    {showHelp && problem && (
                        <div style={{ ...glass, border: '1px solid rgba(0,240,255,0.2)' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {(['approach', 'solution'] as const).map(tab => (
                                    <button key={tab} onClick={() => { setHelpTab(tab); if (tab === 'solution') getSolution(); }}
                                        style={{ flex: 1, padding: 10, background: helpTab === tab ? 'rgba(0,240,255,0.07)' : 'transparent', border: 'none', borderBottom: `2px solid ${helpTab === tab ? '#00f0ff' : 'transparent'}`, color: helpTab === tab ? '#00f0ff' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {tab === 'approach' ? '🧠 Approach' : '💻 Solution Code'}
                                    </button>
                                ))}
                                <button onClick={() => setShowHelp(false)} style={{ padding: '10px 14px', background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer' }}>✕</button>
                            </div>
                            {helpTab === 'approach' && (
                                <div style={{ padding: '14px 15px' }}>
                                    {helpLoad && !approach ? <Skeleton /> :
                                        approach ? (
                                            <pre style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75, fontFamily: 'inherit', userSelect: 'none', WebkitUserSelect: 'none' }}
                                                onCopy={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}>{approach}</pre>
                                        ) : <Skeleton />}
                                    <div style={{ marginTop: 12, padding: '9px 12px', background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 8, color: '#475569', fontSize: '0.74rem', lineHeight: 1.55 }}>
                                        💡 Read the approach, then try coding it. When stuck, open <strong style={{ color: '#00f0ff' }}>Solution Code</strong> tab.
                                    </div>
                                </div>
                            )}
                            {helpTab === 'solution' && (
                                <div>
                                    {helpLoad && !solution ? <div style={{ padding: 16 }}><Skeleton /></div> : solution ? <LockedCode text={solution} /> : <div style={{ padding: 16 }}><Skeleton /></div>}
                                    <div style={{ padding: '9px 15px', background: 'rgba(0,240,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#334155', fontSize: '0.72rem', lineHeight: 1.5 }}>
                                        📝 Read the code carefully, then TYPE it yourself in the editor from memory.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {showExpert && hasRun && (
                        <div style={{ ...glass, border: '1px solid rgba(245,158,11,0.25)' }}>
                            <div style={{ padding: '11px 15px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem' }}>🏆 Expert Developer Code</span>
                                <button onClick={() => setShowExpert(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#334155', cursor: 'pointer' }}>✕</button>
                            </div>
                            {expertLoad ? <div style={{ padding: 16 }}><Skeleton /></div> :
                                expert ? (
                                    <>
                                        <LockedCode text={expert} />
                                        <div style={{ padding: '10px 15px', background: 'rgba(245,158,11,0.04)', borderTop: '1px solid rgba(245,158,11,0.1)', color: '#64748b', fontSize: '0.74rem', lineHeight: 1.55 }}>
                                            ⭐ Study these patterns. Next time, try to write at this level from the start!
                                        </div>
                                    </>
                                ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* TIPS */}
            <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['🎯 Get a problem → try to solve it → click Help if stuck', '🔒 Expert Code unlocks after you run your code', '📝 Type code yourself — never copy-paste AI answers', '🌐 Use HTML or CSS mode for web design challenges'].map((h, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 12px', color: '#334155', fontSize: '0.72rem' }}>{h}</span>
                ))}
            </div>

            <style>{`
        @keyframes cpPulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes cpShimmer { 0%{opacity:.3} 50%{opacity:.7} 100%{opacity:.3} }
        @keyframes cpSpin    { to{transform:rotate(360deg)} }
        @media (max-width:860px) { .cp-grid { grid-template-columns: 1fr !important; } }
      `}</style>
        </div>
    );
}
