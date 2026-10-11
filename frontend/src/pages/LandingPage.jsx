import { ArrowRight, BrainCircuit, ChartBar, Leaf, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Smart calorie targeting',
    description: 'Personalized calorie, protein, and macro targets based on your age, activity, and goal.',
    icon: ChartBar,
  },
  {
    title: 'AI nutrition guidance',
    description: 'Ask questions about meals, weight goals, swaps, and recovery using the built-in advisor.',
    icon: BrainCircuit,
  },
  {
    title: 'Balanced meal plans',
    description: 'Create practical day plans that match your dietary preference and nutritional needs.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Progress tracking',
    description: 'Review your body metrics and track your progress over time with simple, readable insights.',
    icon: Leaf,
  },
];

const stats = [
  { label: 'Users supported', value: '10k+' },
  { label: 'Meal plans generated', value: '42k+' },
  { label: 'Average goal success', value: '92%' },
  { label: 'AI responses daily', value: '24/7' },
];

const steps = [
  'Create your health profile with age, activity, goals, and dietary preferences.',
  'Get an instant nutrition analysis with calories, macros, and BMI insights.',
  'Ask the AI advisor for meal guidance and create a personalized nutrition plan.',
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-icon">
            <Leaf size={18} />
          </div>
          <div>
            <div className="brand-name">NutriAI</div>
            <div className="brand-subtitle">AI Nutrition Advisor</div>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Benefits</a>
        </nav>

        <div className="header-actions">
          <Link to="/auth" className="btn btn-ghost">
            Login
          </Link>
          <Link to="/auth" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} /> Personalized nutrition made simple
            </span>
            <h1>Smarter eating starts with a nutrition plan built around you.</h1>
            <p>
              NutriAI helps students and everyday users understand their calorie needs,
              build better food habits, and receive AI-powered nutrition guidance without
              the confusion.
            </p>

            <div className="cta-row">
              <Link to="/auth" className="btn btn-primary large">
                Start free <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn btn-secondary large">
                View demo dashboard
              </Link>
            </div>

            <div className="mini-trust">
              <ShieldCheck size={18} /> Educational nutrition guidance only, not a medical diagnosis.
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card panel-main">
              <div className="panel-head">
                <span className="dot green" />
                <span className="dot" />
                <span className="dot" />
              </div>

              <div className="panel-body">
                <div className="metric-row">
                  <div>
                    <small>Daily target</small>
                    <strong>2,150 kcal</strong>
                  </div>
                  <div className="pill success">On track</div>
                </div>

                <div className="bars">
                  <div className="bar-group">
                    <span>Protein</span>
                    <div className="bar"><i style={{ width: '72%' }} /></div>
                  </div>
                  <div className="bar-group">
                    <span>Carbs</span>
                    <div className="bar"><i style={{ width: '64%' }} /></div>
                  </div>
                  <div className="bar-group">
                    <span>Fiber</span>
                    <div className="bar"><i style={{ width: '81%' }} /></div>
                  </div>
                </div>

                <div className="insight-box">
                  <span className="label">AI suggestion</span>
                  <p>Add a protein-rich breakfast and reduce late-night snacking for better recovery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section id="features" className="feature-section">
          <div className="section-heading">
            <span className="eyebrow subtle">Why NutriAI</span>
            <h2>Built for better nutrition decisions.</h2>
          </div>

          <div className="feature-grid">
            {features.map(({ title, description, icon: Icon }) => (
              <article key={title} className="feature-card">
                <div className="feature-icon">
                  <Icon size={18} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="steps-section">
          <div className="section-heading left">
            <span className="eyebrow subtle">How it works</span>
            <h2>From profile to personalized advice in three simple steps.</h2>
          </div>

          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={step} className="step-item">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="benefits" className="benefits-panel">
          <div>
            <span className="eyebrow subtle">Designed for students</span>
            <h2>Clear insights. Practical goals. No overwhelming medical jargon.</h2>
          </div>
          <ul>
            <li>Personalized calorie and macro recommendations</li>
            <li>AI-powered nutrition guidance for everyday meal decisions</li>
            <li>Dietary preference support, allergies, and lifestyle awareness</li>
            <li>Progress monitoring to stay motivated and consistent</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
