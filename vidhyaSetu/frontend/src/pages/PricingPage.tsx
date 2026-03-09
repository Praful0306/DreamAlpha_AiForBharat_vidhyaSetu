import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const CrossIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

export function PricingPage({ t, language }: { t?: any; language?: any }) {
    const navigate = useNavigate();
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Free',
            badge: null,
            monthlyPrice: 0,
            yearlyPrice: 0,
            tagline: 'Perfect for getting started',
            color: 'var(--cyan)',
            borderColor: 'rgba(0,240,255,0.3)',
            glowColor: 'rgba(0,240,255,0.1)',
            features: [
                { text: 'Up to 5 AI-generated modules', included: true },
                { text: '3 knowledge check tests', included: true },
                { text: 'English language support', included: true },
                { text: 'Basic progress tracking', included: true },
                { text: 'AI chatbot (10 queries/day)', included: true },
                { text: 'Priority AI responses', included: false },
                { text: 'Multilingual support', included: false },
                { text: 'Advanced analytics', included: false },
                { text: 'Offline downloads', included: false },
                { text: 'Dedicated support', included: false },
            ],
            ctaText: 'Get Started Free',
            ctaStyle: { background: 'transparent', border: '1px solid rgba(0,240,255,0.4)', color: 'var(--cyan)' },
        },
        {
            name: 'Pro',
            badge: '⭐ Most Popular',
            monthlyPrice: 299,
            yearlyPrice: 2499,
            tagline: 'For serious students & learners',
            color: 'var(--magenta)',
            borderColor: 'rgba(180,0,255,0.5)',
            glowColor: 'rgba(180,0,255,0.08)',
            features: [
                { text: 'Unlimited AI-generated modules', included: true },
                { text: 'Unlimited knowledge checks', included: true },
                { text: 'All 3 language support (EN, HI, KN)', included: true },
                { text: 'Full analytics dashboard', included: true },
                { text: 'AI chatbot (unlimited)', included: true },
                { text: 'Priority AI responses', included: true },
                { text: 'Offline content downloads', included: true },
                { text: 'Performance reports (PDF)', included: true },
                { text: 'Dedicated support', included: false },
                { text: 'Institution dashboard', included: false },
            ],
            ctaText: 'Start Pro Plan',
            ctaStyle: { background: 'linear-gradient(135deg, var(--magenta), #7b00ff)', color: '#fff', border: 'none', boxShadow: '0 0 20px rgba(180,0,255,0.4)' },
        },
        {
            name: 'Institution',
            badge: '🏛️ For Schools',
            monthlyPrice: 4999,
            yearlyPrice: 44999,
            tagline: 'For schools, colleges & coaching centers',
            color: '#f59e0b',
            borderColor: 'rgba(245,158,11,0.3)',
            glowColor: 'rgba(245,158,11,0.06)',
            features: [
                { text: 'Everything in Pro', included: true },
                { text: 'Up to 500 student accounts', included: true },
                { text: 'Central admin dashboard', included: true },
                { text: 'Batch progress tracking', included: true },
                { text: 'Custom curriculum templates', included: true },
                { text: 'API access for integrations', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Custom reports & exports', included: true },
                { text: 'SLA & uptime guarantee', included: true },
                { text: 'On-site training (optional)', included: true },
            ],
            ctaText: 'Contact Sales',
            ctaStyle: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', border: 'none', boxShadow: '0 0 20px rgba(245,158,11,0.3)' },
        },
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 18px', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginBottom: '32px', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
                Back
            </button>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '999px', padding: '6px 16px', color: 'var(--cyan)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '20px' }}>
                    💡 PRICING PLANS
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
                    Invest in Your<br /><span style={{ background: 'linear-gradient(135deg, var(--cyan), var(--magenta))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Future Learning</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                    Start free and scale as you grow. All prices are in Indian Rupees (₹) and include GST.
                </p>

                {/* Billing Toggle */}
                <div style={{ display: 'inline-flex', gap: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '4px' }}>
                    {(['monthly', 'yearly'] as const).map(b => (
                        <button key={b} onClick={() => setBilling(b)} style={{ padding: '8px 20px', borderRadius: '8px', background: billing === b ? 'rgba(0,240,255,0.1)' : 'transparent', border: billing === b ? '1px solid rgba(0,240,255,0.3)' : '1px solid transparent', color: billing === b ? 'var(--cyan)' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {b === 'monthly' ? 'Monthly' : <>Yearly <span style={{ background: 'linear-gradient(135deg, #00ffaa, #00f0ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '0.75rem' }}>Save 30%</span></>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {plans.map((plan, i) => (
                    <div key={i} style={{ background: `rgba(15,23,42,0.6)`, backdropFilter: 'blur(16px)', border: `1px solid ${plan.borderColor}`, borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative', boxShadow: plan.badge ? `0 0 40px ${plan.glowColor}` : 'none', transform: plan.badge ? 'scale(1.03)' : 'none', transition: 'transform 0.3s' }}>
                        {plan.badge && (
                            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, var(--magenta), #7b00ff)`, color: '#fff', padding: '6px 20px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(180,0,255,0.4)' }}>
                                {plan.badge}
                            </div>
                        )}

                        <div>
                            <p style={{ color: plan.color, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>{plan.name}</p>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                                    {billing === 'monthly' ? (plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice}`) : (plan.yearlyPrice === 0 ? 'Free' : `₹${plan.yearlyPrice}`)}
                                </span>
                                {(billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) > 0 && (
                                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', paddingBottom: '6px' }}>/{billing === 'monthly' ? 'month' : 'year'}</span>
                                )}
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{plan.tagline}</p>
                        </div>

                        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s', ...plan.ctaStyle } as React.CSSProperties}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {plan.ctaText}
                        </button>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', margin: '0 0 16px 0' }}>What's included</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {plan.features.map((f, fi) => (
                                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: f.included ? '#00ffaa' : '#475569', flexShrink: 0 }}>{f.included ? <CheckIcon /> : <CrossIcon />}</span>
                                        <span style={{ color: f.included ? '#cbd5e1' : '#475569', fontSize: '0.9rem' }}>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom note */}
            <div style={{ textAlign: 'center', marginTop: '60px', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 8px 0' }}>🇮🇳 All prices in Indian Rupees (₹). GST and applicable taxes may apply.</p>
                <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>Need a custom plan? <a href="mailto:support@vidyasetu.in" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Contact us</a> for a tailored solution for your institution.</p>
            </div>
        </div>
    );
}
