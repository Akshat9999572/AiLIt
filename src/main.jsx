import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Asterisk, Menu, X, Sparkles, Feather, AudioLines, ImagePlus } from 'lucide-react';
import './styles.css';

const lensText = {
  Close: 'The repeated "remember" turns memory into a physical act. The sentence balances the intimate against the planetary, making the machine archive feel tender rather than total.',
  Machine: 'Key semantic clusters: memory, domestic voice, and environment. The passage uses personification to reduce distance between computational storage and human recollection.',
  Strange: 'What if the machine is not remembering the mother, but teaching the weather to impersonate her? The line opens a small door between archive and haunting.',
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('home');
  const [lens, setLens] = useState('Close');
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [stories, setStories] = useState([]);
  const [draft, setDraft] = useState({ type: 'Article', title: '', author: '', deck: '', body: '', image: '' });

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const publishWriting = (event) => {
    event.preventDefault();
    setStories((current) => [...current, {
      ...draft,
      num: String(current.length + 1).padStart(2, '0'),
      color: ['rust', 'blue', 'green'][current.length % 3],
    }]);
    setDraft({ type: 'Article', title: '', author: '', deck: '', body: '', image: '' });
    setView('home');
    setTimeout(() => scrollTo('journal'), 0);
  };

  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  if (view === 'editor') {
    return (
      <main className="editor-page">
        <header className="editor-header">
          <button className="brand" onClick={() => setView('home')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Admin Panel</span>
          <button className="editor-exit" onClick={() => setView('home')}><X size={19} /> Close</button>
        </header>
        <form className="writing-editor" onSubmit={publishWriting}>
          <div className="editor-title">
            <span className="eyebrow">Add new writing</span>
            <h1>Compose your work.</h1>
            <p>Write an article or poem and pair it with an image.</p>
          </div>
          <div className="editor-fields">
            <div className="editor-row">
              <label>Writing type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}><option>Article</option><option>Poem</option></select></label>
              <label>Author<input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} required /></label>
            </div>
            <label>Title<input className="title-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="An untitled thought" required /></label>
            <label>Short introduction<textarea value={draft.deck} onChange={(event) => setDraft({ ...draft, deck: event.target.value })} placeholder="A brief introduction shown on the home page" required /></label>
            <label>Your writing<textarea className="body-input" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder={draft.type === 'Poem' ? 'Begin your poem...' : 'Begin your article...'} required /></label>
            <label className="image-upload">
              {draft.image ? <img src={draft.image} alt="Upload preview" /> : <><ImagePlus size={28} /><b>Upload a picture</b><span>JPEG, PNG, WebP, GIF, SVG, AVIF, BMP, TIFF, HEIC, and other image formats supported by your browser.</span></>}
              <input type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={uploadImage} />
            </label>
            <div className="editor-actions"><button type="button" onClick={() => setView('home')}>Cancel</button><button className="solid-button" type="submit">Publish writing <ArrowRight size={18} /></button></div>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo('top')} aria-label="AiLit home"><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <button onClick={() => { setView('editor'); setMenuOpen(false); }}>Add New Writing</button>
          <button onClick={() => scrollTo('journal')}>New Writing</button>
          <button onClick={() => scrollTo('about')}>About</button>
        </nav>
        <div className="header-actions">
          <button className="text-button" onClick={() => scrollTo('newsletter')}>Subscribe</button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Literature, in conversation with Artificial Intelligence</p>
            <h1>What does it mean<br />to <em>imagine</em> now?</h1>
            <p className="hero-deck">AiLit explores fiction, poetry, criticism, and experiments from the shifting border between human language and Artificial Intelligence.</p>
          </div>
          <div className="cover-wrap"><div className="cover">
            <div className="cover-top"><span>AiLit</span></div>
            <div className="orb"><div className="orb-line one" /><div className="orb-line two" /><div className="orb-line three" /><Asterisk className="orb-star" /></div>
            <div className="cover-title">Intimacy<br />& Artificial Intelligence</div>
            <div className="cover-foot">Fiction · Poetry · Essays · Experiments</div>
          </div></div>
        </div>
      </section>

      <section className="manifesto" id="about"><Asterisk size={24} /><p>We believe technology does not diminish literature's mystery. It gives the mystery <em>new rooms</em> to inhabit.</p></section>

      <section className="journal section" id="journal">
        <div className="section-heading"><div><h2>New writing</h2></div></div>
        {stories.length > 0 ? <div className="story-grid">{stories.map((story) => (
          <article className="story" key={story.title}>
            <div className={`story-art ${story.color}`}>{story.image ? <img src={story.image} alt="" /> : <><span>{story.num}</span><div className="glyph">“</div></>}</div>
            <div className="story-meta"><span>{story.type}</span><span>New</span></div>
            <h3>{story.title}</h3><p>{story.deck}</p><div className="author">By {story.author}</div>
          </article>
        ))}</div> : <div className="empty-writing"><p>New work will appear here.</p></div>}
      </section>

      <section className="lab section" id="lab">
        <div className="lab-intro"><span className="eyebrow light">AiLit Reading Lab · 01</span><h2>A text can hold<br />more than one mind.</h2><p>Our Reading Lab uses generative tools as a companion to interpretation, never a replacement for it. Choose a lens and see a passage shift.</p><div className="principles"><span><Feather size={16} /> Human-led</span><span><Sparkles size={16} /> Transparent</span><span><AudioLines size={16} /> Playful</span></div></div>
        <div className="reader"><div className="reader-label">From “Weather Archive” by June Okafor</div><blockquote>“The machine remembered my mother's voice the way weather remembers a city: incompletely, and everywhere.”</blockquote><div className="lens-tabs">{Object.keys(lensText).map((item) => <button className={lens === item ? 'active' : ''} onClick={() => setLens(item)} key={item}>{item === 'Close' ? 'Close reading' : item === 'Machine' ? 'Machine reading' : 'Make it strange'}</button>)}</div><div className="lens-output" key={lens}><Sparkles size={17} /><p>{lensText[lens]}</p></div></div>
      </section>

      <section className="newsletter section" id="newsletter"><img src="/ailit-logo.png" alt="" /><span className="eyebrow">Letters from the edge of language</span><h2>One considered email,<br />once in a while.</h2>{joined ? <p className="thanks">You're on the list. Welcome to AiLit.</p> : <form onSubmit={(event) => { event.preventDefault(); if (email) setJoined(true); }}><input type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} required /><button aria-label="Subscribe"><ArrowRight /></button></form>}<p className="fine">New work, reading notes, and no noise. Unsubscribe anytime.</p></section>

      <footer><div className="footer-brand"><img src="/ailit-logo.png" alt="" /><span>AiLit</span><p>A literary magazine for language, imagination, and Artificial Intelligence.</p></div><div className="copyright">© 2026 AiLit Magazine <span>Made by humans, with questions.</span></div></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
