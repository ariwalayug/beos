import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Check, X, Zap, Building2, Crown,
    ArrowRight, Phone, Mail
} from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import { motion } from 'framer-motion';
import './Pricing.css';

function Pricing() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const plans = [
        {
            name: 'Starter',
            icon: <Zap size={24} />,
            description: 'For small clinics and nursing homes',
            price: { monthly: 15000, yearly: 12000 },
            features: [
                { text: 'Up to 5 staff accounts', included: true },
                { text: 'Basic emergency alerts', included: true },
                { text: 'Local donor network', included: true },
                { text: 'Email support', included: true },
                { text: 'AI predictions', included: false },
                { text: 'API access', included: false },
                { text: 'Multi-branch support', included: false },
                { text: 'Dedicated account manager', included: false }
            ],
            cta: 'Start Free Trial',
            popular: false
        },
        {
            name: 'Professional',
            icon: <Building2 size={24} />,
            description: 'For mid-size hospitals',
            price: { monthly: 50000, yearly: 42000 },
            features: [
                { text: 'Unlimited staff accounts', included: true },
                { text: 'Priority emergency alerts', included: true },
                { text: 'Regional donor network', included: true },
                { text: 'Priority email + chat support', included: true },
                { text: 'AI shortage predictions', included: true },
                { text: 'API access', included: true },
                { text: 'Multi-branch support', included: false },
                { text: 'Dedicated account manager', included: false }
            ],
            cta: 'Start Free Trial',
            popular: true
        },
        {
            name: 'Enterprise',
            icon: <Crown size={24} />,
            description: 'For hospital chains & networks',
            price: { monthly: null, yearly: null },
            features: [
                { text: 'Unlimited everything', included: true },
                { text: 'Custom SLA (99.99%)', included: true },
                { text: 'National donor network', included: true },
                { text: '24/7 phone support', included: true },
                { text: 'Advanced AI + custom models', included: true },
                { text: 'Full API + webhooks', included: true },
                { text: 'Multi-branch dashboard', included: true },
                { text: 'Dedicated account manager', included: true }
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    const faqs = [
        {
            q: 'What happens after the 14-day trial?',
            a: 'After your trial ends, you can choose a plan that fits your needs. If you don\'t subscribe, your account will be downgraded to read-only access.'
        },
        {
            q: 'Can I switch plans later?',
            a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
        },
        {
            q: 'Is there a setup fee?',
            a: 'No setup fees for Starter and Professional plans. Enterprise plans may include custom implementation services.'
        },
        {
            q: 'Do you offer discounts for government hospitals?',
            a: 'Yes, we offer special pricing for government and charitable hospitals. Contact our sales team for details.'
        }
    ];

    return (
        <PageTransition className="pricing-page">
            {/* Header */}
            <section className="pricing-header">
                <div className="container">
                    <FadeIn>
                        <h1>Simple, Transparent Pricing</h1>
                        <p>Choose the plan that fits your hospital's needs. All plans include a 14-day free trial.</p>

                        <div className="billing-toggle">
                            <button
                                className={billingCycle === 'monthly' ? 'active' : ''}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={billingCycle === 'yearly' ? 'active' : ''}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                Yearly <span className="discount-badge">Save 20%</span>
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="plans-section">
                <div className="container">
                    <div className="plans-grid">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                className={`plan-card glass-card ${plan.popular ? 'popular' : ''}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                {plan.popular && <div className="popular-badge">Most Popular</div>}

                                <div className="plan-icon">{plan.icon}</div>
                                <h3>{plan.name}</h3>
                                <p className="plan-desc">{plan.description}</p>

                                <div className="plan-price">
                                    {plan.price[billingCycle] ? (
                                        <>
                                            <span className="currency">₹</span>
                                            <span className="amount">{plan.price[billingCycle]?.toLocaleString()}</span>
                                            <span className="period">/month</span>
                                        </>
                                    ) : (
                                        <span className="custom-pricing">Custom Pricing</span>
                                    )}
                                </div>

                                <ul className="plan-features">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className={feature.included ? 'included' : 'excluded'}>
                                            {feature.included ? <Check size={16} /> : <X size={16} />}
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>

                                {plan.price[billingCycle] ? (
                                    <Link to="/register" className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full`}>
                                        {plan.cta} <ArrowRight size={16} />
                                    </Link>
                                ) : (
                                    <a href="mailto:enterprise@beos.health" className="btn btn-outline w-full">
                                        {plan.cta} <Mail size={16} />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="faq-section">
                <div className="container">
                    <FadeIn className="section-header">
                        <h2>Frequently Asked Questions</h2>
                    </FadeIn>

                    <div className="faq-grid">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                className="faq-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <h4>{faq.q}</h4>
                                <p>{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pricing-cta">
                <div className="container">
                    <div className="cta-box glass-card">
                        <h2>Need help choosing?</h2>
                        <p>Our team can help you find the right plan for your hospital.</p>
                        <div className="cta-actions">
                            <a href="tel:+919876543210" className="btn btn-primary">
                                <Phone size={18} /> Schedule a Call
                            </a>
                            <a href="mailto:sales@beos.health" className="btn btn-outline">
                                <Mail size={18} /> Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </PageTransition>
    );
}

export default Pricing;
