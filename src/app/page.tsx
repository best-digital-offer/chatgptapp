const features = [
  {
    number: "01",
    title: "Save what matters",
    description:
      "Choose the conversations worth keeping and save them to your own organized library.",
  },
  {
    number: "02",
    title: "Find it later",
    description:
      "Search your saved conversations by title, topic, and the content you chose to archive.",
  },
  {
    number: "03",
    title: "Keep your own archive",
    description:
      "Organize conversations into folders and retrieve them when the context becomes useful again.",
  },
];

export default function HomePage() {
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="/" aria-label="SameWindow home">
          <span className="brand-mark">S</span>
          <span>samewindow</span>
          <span className="brand-product">for ChatGPT</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <a className="nav-cta" href="/login">Sign in</a>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span /> YOUR CONVERSATION LIBRARY</div>
        <h1>Keep the conversations<br /><em>worth coming back to.</em></h1>
        <p className="hero-copy">
          Save the ChatGPT conversations you choose, organize them into folders,
          and find useful context when you need it again.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="/signup">Get started <span>→</span></a>
          <a className="secondary-button" href="#features">How it works</a>
        </div>
        <p className="hero-note">You stay in control. SameWindow only saves content you explicitly choose to share.</p>
        <div className="preview" aria-label="Preview of a conversation library">
          <div className="preview-sidebar">
            <div className="preview-logo"><span className="brand-mark small">S</span> SameWindow</div>
            <div className="preview-search">⌕ &nbsp; Search saved chats</div>
            <div className="preview-label">YOUR LIBRARY</div>
            <div className="preview-folder active">▣ &nbsp; All conversations <b>24</b></div>
            <div className="preview-folder">▱ &nbsp; Product research</div>
            <div className="preview-folder">▱ &nbsp; Marketing ideas</div>
            <div className="preview-folder">▱ &nbsp; Development</div>
          </div>
          <div className="preview-content">
            <div className="preview-top"><span>All conversations</span><span className="preview-count">24 saved</span></div>
            <div className="preview-card">
              <span className="preview-tag">PRODUCT</span>
              <h3>Building a focused SaaS product</h3>
              <p>Positioning, feature priorities, and a practical launch roadmap...</p>
              <small>Saved to Product research · 2 hours ago</small>
            </div>
            <div className="preview-card">
              <span className="preview-tag">MARKETING</span>
              <h3>Organic growth strategy</h3>
              <p>Content ideas, search intent, and a repeatable publishing plan...</p>
              <small>Saved to Marketing ideas · Yesterday</small>
            </div>
            <div className="preview-card muted-card">
              <span className="preview-tag">DEVELOPMENT</span>
              <h3>Debugging an API integration</h3>
              <p>Implementation notes and the final working approach...</p>
              <small>Saved to Development · Monday</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <span className="eyebrow">A BETTER WAY TO RETURN</span>
          <h2>Your useful context,<br /><em>right where you need it.</em></h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy" id="privacy">
        <div>
          <span className="eyebrow">PRIVATE BY DESIGN</span>
          <h2>Your conversations<br />belong to you.</h2>
        </div>
        <p>
          SameWindow does not silently import your ChatGPT history. You decide
          what to save, and your private archive is accessible only through your
          authenticated account.
        </p>
      </section>

      <footer>
        <a className="brand" href="/"><span className="brand-mark">S</span><span>samewindow</span></a>
        <span>© {new Date().getFullYear()} SameWindow. All rights reserved.</span>
        <div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a></div>
      </footer>
    </main>
  );
}
