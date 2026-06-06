import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Asterisk, Menu, X, Sparkles, Feather, AudioLines, ImagePlus, Bold, Italic, List, Heading2, LogOut } from 'lucide-react';
import { supabase } from './supabase';
import './styles.css';

const lensText = {
  Close: 'AI can trace recurring images, rhythms, and relationships across a text, helping readers notice patterns that may be difficult to see in a single reading.',
  Machine: 'By comparing language across genres, periods, and cultures, AI can suggest unexpected connections while leaving interpretation, judgment, and meaning in human hands.',
  Strange: 'For creative writers, AI can act as a playful collaborator: offering alternate structures, unfamiliar perspectives, and surprising prompts that open new directions without replacing the writer.',
};

function App() {
  const editorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('home');
  const [lens, setLens] = useState('Close');
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [draft, setDraft] = useState({ type: 'Article', title: '', author: '', introduction: '', image: '' });

  useEffect(() => {
    loadStories();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
      setIsAdmin(Boolean(data));
    };
    checkAdmin();
  }, [session]);

  const loadStories = async () => {
    const { data } = await supabase.from('writings').select('*').eq('published', true).order('created_at', { ascending: false });
    setStories(data || []);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const login = async (event) => {
    event.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword(authForm);
    if (error) return setMessage(error.message);
    setLoginOpen(false);
    setAuthForm({ email: '', password: '' });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setView('home');
  };

  const openEditor = () => {
    if (isAdmin) setView('editor');
    else setLoginOpen(true);
    setMenuOpen(false);
  };

  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setDraft((current) => ({ ...current, image: URL.createObjectURL(file) }));
  };

  const formatText = (command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const publishWriting = async (event) => {
    event.preventDefault();
    if (!isAdmin || !session?.user) return;
    setSaving(true);
    setMessage('');
    let imageUrl = null;
    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${session.user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('writing-images').upload(path, imageFile);
      if (uploadError) {
        setSaving(false);
        return setMessage(uploadError.message);
      }
      imageUrl = supabase.storage.from('writing-images').getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from('writings').insert({
      type: draft.type,
      title: draft.title,
      author: draft.author,
      introduction: draft.introduction,
      body: editorRef.current.innerHTML,
      image_url: imageUrl,
      created_by: session.user.id,
    });
    setSaving(false);
    if (error) return setMessage(error.message);
    setDraft({ type: 'Article', title: '', author: '', introduction: '', image: '' });
    setImageFile(null);
    await loadStories();
    setView('home');
    setTimeout(() => scrollTo('journal'), 0);
  };

  if (view === 'editor' && isAdmin) {
    return (
      <main className="editor-page">
        <header className="editor-header">
          <button className="brand" onClick={() => setView('home')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Admin Panel</span>
          <div className="editor-account"><button className="editor-exit" onClick={() => setView('home')}><X size={18} /> Close</button><button className="editor-exit" onClick={logout}><LogOut size={17} /> Sign out</button></div>
        </header>
        <form className="writing-editor" onSubmit={publishWriting}>
          <div className="editor-title"><span className="eyebrow">Add new writing</span><h1>Compose your work.</h1><p>Publish an article or poem to AiLit.</p></div>
          <div className="editor-fields">
            <div className="editor-row">
              <label>Writing type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}><option>Article</option><option>Poem</option></select></label>
              <label>Author<input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} required /></label>
            </div>
            <label>Title<input className="title-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="An untitled thought" required /></label>
            <label>Short introduction<textarea value={draft.introduction} onChange={(event) => setDraft({ ...draft, introduction: event.target.value })} placeholder="A brief introduction shown on the home page" required /></label>
            <div className="rich-field">
              <span>Your writing</span>
              <div className="editor-toolbar">
                <button type="button" onClick={() => formatText('bold')} title="Bold"><Bold /></button>
                <button type="button" onClick={() => formatText('italic')} title="Italic"><Italic /></button>
                <button type="button" onClick={() => formatText('formatBlock', 'h2')} title="Heading"><Heading2 /></button>
                <button type="button" onClick={() => formatText('insertUnorderedList')} title="List"><List /></button>
              </div>
              <div ref={editorRef} className={`rich-editor ${draft.type === 'Poem' ? 'poem-editor' : ''}`} contentEditable suppressContentEditableWarning data-placeholder={draft.type === 'Poem' ? 'Begin your poem...' : 'Begin your article...'} />
            </div>
            <label className="image-upload">
              {draft.image ? <img src={draft.image} alt="Upload preview" /> : <><ImagePlus size={28} /><b>Upload a picture</b><span>Choose an image up to 10 MB.</span></>}
              <input type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={uploadImage} />
            </label>
            {message && <p className="form-message">{message}</p>}
            <div className="editor-actions"><button type="button" onClick={() => setView('home')}>Cancel</button><button className="solid-button" type="submit" disabled={saving}>{saving ? 'Publishing...' : 'Publish writing'} <ArrowRight size={18} /></button></div>
          </div>
        </form>
      </main>
    );
  }

  if (view === 'about') {
    return (
      <main className="about-page">
        <header className="editor-header">
          <button className="brand" onClick={() => setView('home')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>About</span>
          <button className="editor-exit" onClick={() => setView('home')}><X size={19} /> Close</button>
        </header>
        <section className="about-content">
          <span className="eyebrow">Artificial Intelligence · Literature</span>
          <h1>Where technology<br />meets imagination.</h1>
          <div className="about-copy">
            <p>AiLit stands for Artificial Intelligence and Literature. It is a literary magazine that encourages a thoughtful fusion of computational tools with human storytelling, poetry, criticism, and imagination.</p>
            <p>We believe this meeting matters because AI can help readers discover new patterns and help writers approach language from unfamiliar directions. AiLit keeps human voice, judgment, and creativity at the centre while exploring how technology can open new possibilities for literature.</p>
          </div>
        </section>
      </main>
    );
  }

  if (view === 'story' && selectedStory) {
    return (
      <main className="reading-page">
        <header className="editor-header">
          <button className="brand" onClick={() => setView('home')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>{selectedStory.type}</span>
          <button className="editor-exit" onClick={() => { setView('home'); setTimeout(() => scrollTo('journal'), 0); }}><X size={19} /> Close</button>
        </header>
        <article className={`reading-article ${selectedStory.type === 'Poem' ? 'reading-poem' : ''}`}>
          <div className="reading-heading">
            <span className="eyebrow">{selectedStory.type}</span>
            <h1>{selectedStory.title}</h1>
            <p>{selectedStory.introduction}</p>
            <div className="author">By {selectedStory.author}</div>
          </div>
          {selectedStory.image_url && <img className="reading-image" src={selectedStory.image_url} alt="" />}
          <div className="reading-body" dangerouslySetInnerHTML={{ __html: selectedStory.body }} />
        </article>
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo('top')} aria-label="AiLit home"><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <button onClick={() => { setView('home'); setMenuOpen(false); setTimeout(() => scrollTo('top'), 0); }}>Home</button>
          {isAdmin && <button onClick={openEditor}>Add New Writing</button>}
          <button onClick={() => scrollTo('journal')}>New Writing</button>
          <button onClick={() => { setView('about'); setMenuOpen(false); }}>About</button>
        </nav>
        <div className="header-actions">
          {isAdmin ? <button className="text-button" onClick={logout}>Sign out</button> : <button className="text-button" onClick={() => setLoginOpen(true)}>Admin</button>}
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow">Literature, in conversation with Artificial Intelligence</p><h1>What does it mean<br />to <em>imagine</em> now?</h1><p className="hero-deck">AiLit explores fiction, poetry, criticism, and experiments from the shifting border between human language and Artificial Intelligence.</p></div><div className="cover-wrap"><div className="cover"><div className="cover-top"><span>AiLit</span></div><div className="orb"><div className="orb-line one" /><div className="orb-line two" /><div className="orb-line three" /><Asterisk className="orb-star" /></div><div className="cover-title">Intimacy<br />& Artificial Intelligence</div><div className="cover-foot">Fiction · Poetry · Essays · Experiments</div></div></div></div></section>
      <section className="manifesto"><Asterisk size={24} /><p>We believe technology does not diminish literature's mystery. It gives the mystery <em>new rooms</em> to inhabit.</p></section>
      <section className="journal section" id="journal"><div className="section-heading"><div><h2>New writing</h2></div></div>{stories.length ? <div className="story-grid">{stories.map((story) => <article className="story story-link" key={story.id} tabIndex="0" role="link" onClick={() => { setSelectedStory(story); setView('story'); window.scrollTo(0, 0); }} onKeyDown={(event) => { if (event.key === 'Enter') { setSelectedStory(story); setView('story'); window.scrollTo(0, 0); } }}><div className="story-art rust">{story.image_url ? <img src={story.image_url} alt="" /> : <div className="glyph">“</div>}</div><div className="story-meta"><span>{story.type}</span><span>Read <ArrowRight size={13} /></span></div><h3>{story.title}</h3><p>{story.introduction}</p><div className="author">By {story.author}</div></article>)}</div> : <div className="empty-writing"><p>New work will appear here.</p></div>}</section>
      <section className="lab section" id="lab"><div className="lab-intro"><span className="eyebrow light">AiLit Reading Lab · 01</span><h2>New ways to read.<br />New ways to write.</h2><p>Artificial Intelligence can offer fresh insight into literature by revealing hidden patterns, making unexpected connections, and inviting writers to explore possibilities beyond familiar habits.</p><div className="principles"><span><Feather size={16} /> Human-led</span><span><Sparkles size={16} /> Exploratory</span><span><AudioLines size={16} /> Creative</span></div></div><div className="reader"><div className="reader-label">Artificial Intelligence and literary imagination</div><blockquote>“AI does not decide what a story means. It gives readers and writers another way to ask what it might become.”</blockquote><div className="lens-tabs">{Object.keys(lensText).map((item) => <button className={lens === item ? 'active' : ''} onClick={() => setLens(item)} key={item}>{item === 'Close' ? 'Discover patterns' : item === 'Machine' ? 'Find connections' : 'Create possibilities'}</button>)}</div><div className="lens-output" key={lens}><Sparkles size={17} /><p>{lensText[lens]}</p></div></div></section>
      <footer><div className="footer-brand"><img src="/ailit-logo.png" alt="" /><span>AiLit</span><p>A literary magazine for language, imagination, and Artificial Intelligence.</p></div><div className="copyright">© 2026 AiLit Magazine <span>Made by humans, with questions.</span></div></footer>

      {loginOpen && <div className="login-backdrop" onMouseDown={() => setLoginOpen(false)}><form className="login-panel" onSubmit={login} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="admin-close" onClick={() => setLoginOpen(false)}><X /></button><span className="eyebrow">Admin access</span><h2>Sign in</h2><label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label><label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>{message && <p className="form-message">{message}</p>}<button className="solid-button" type="submit">Continue <ArrowRight size={18} /></button></form></div>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
