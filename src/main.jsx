import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Asterisk, Menu, X, Sparkles, Feather, AudioLines, ImagePlus, Bold, Italic, List, Heading2, LogOut, Trash2 } from 'lucide-react';
import { supabase } from './supabase';
import './styles.css';

const lensText = {
  Close: 'AI can trace recurring images, rhythms, and relationships across a text, helping readers notice patterns that may be difficult to see in a single reading.',
  Machine: 'By comparing language across genres, periods, and cultures, AI can suggest unexpected connections while leaving interpretation, judgment, and meaning in human hands.',
  Strange: 'For creative writers, AI can act as a playful collaborator: offering alternate structures, unfamiliar perspectives, and surprising prompts that open new directions without replacing the writer.',
};

function App() {
  const editorRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const editorSelectionRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState(window.location.pathname === '/admin' ? 'admin' : 'home');
  const [lens, setLens] = useState('Close');
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterSaving, setNewsletterSaving] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
  const [saving, setSaving] = useState(false);
  const [inlineImageUploading, setInlineImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [draft, setDraft] = useState({ type: 'Article', title: '', author: '', introduction: '', image: '' });

  useEffect(() => {
    loadStories();
    const unsubscribeToken = new URLSearchParams(window.location.search).get('unsubscribe');
    if (unsubscribeToken) {
      supabase.functions.invoke('newsletter', {
        body: { action: 'unsubscribe', token: unsubscribeToken },
      }).then(({ data, error }) => {
        setNewsletterMessage(error ? 'We could not unsubscribe this address. Please try again.' : data.message);
        window.history.replaceState({}, '', '/');
        setTimeout(() => document.getElementById('newsletter')?.scrollIntoView(), 0);
      });
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallMessage('');
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
      setInstallMessage('AiLit is installed.');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthReady(true); });
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }
      setAdminChecked(false);
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
      setIsAdmin(Boolean(data));
      setAdminChecked(true);
    };
    checkAdmin();
  }, [session]);

  const loadStories = async () => {
    const { data } = await supabase.from('writings').select('*').eq('published', true).order('created_at', { ascending: false });
    setStories(data || []);
    const storyId = new URLSearchParams(window.location.search).get('story');
    const linkedStory = data?.find((story) => story.id === storyId);
    if (linkedStory) {
      setSelectedStory(linkedStory);
      setView('story');
      window.history.replaceState({}, '', '/');
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const installWebApp = async () => {
    setMenuOpen(false);
    if (isStandalone) {
      setInstallMessage('AiLit is already running as an installed web app.');
      return;
    }
    if (!installPrompt) {
      setInstallMessage('Install is available from your browser menu if the prompt does not appear automatically.');
      return;
    }
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setInstallMessage('AiLit is installing.');
    }
  };

  const login = async (event) => {
    event.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword(authForm);
    if (error) return setMessage(error.message);
    setAuthForm({ email: '', password: '' });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/');
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

  const chooseInlineImage = () => {
    editorSelectionRef.current = null;
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      editorSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
    inlineImageInputRef.current?.click();
  };

  const insertInlineImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !isAdmin || !session?.user) return;
    if (!file.type.startsWith('image/') && !/\.(heic|heif|tif|tiff|bmp|svg)$/i.test(file.name)) {
      return setMessage('Choose a valid image file.');
    }
    if (file.size > 10 * 1024 * 1024) return setMessage('Inline images must be smaller than 10 MB.');

    setInlineImageUploading(true);
    setMessage('');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${session.user.id}/inline/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('writing-images').upload(path, file);
    if (uploadError) {
      setInlineImageUploading(false);
      return setMessage(uploadError.message);
    }

    const imageUrl = supabase.storage.from('writing-images').getPublicUrl(path).data.publicUrl;
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = '';
    image.className = 'inline-writing-image';

    editorRef.current?.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    if (editorSelectionRef.current) {
      selection?.addRange(editorSelectionRef.current);
      editorSelectionRef.current.deleteContents();
      editorSelectionRef.current.insertNode(image);
      editorSelectionRef.current.setStartAfter(image);
      editorSelectionRef.current.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(editorSelectionRef.current);
    } else {
      editorRef.current?.append(image);
    }
    setInlineImageUploading(false);
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
    const { data: publishedStory, error } = await supabase.from('writings').insert({
      type: draft.type,
      title: draft.title,
      author: draft.author,
      introduction: draft.introduction,
      body: editorRef.current.innerHTML,
      image_url: imageUrl,
      created_by: session.user.id,
    }).select().single();
    setSaving(false);
    if (error) return setMessage(error.message);
    setDraft({ type: 'Article', title: '', author: '', introduction: '', image: '' });
    setImageFile(null);
    await loadStories();
    if (editorRef.current) editorRef.current.innerHTML = '';
    const { data: newsletterData, error: newsletterError } = await supabase.functions.invoke('newsletter', {
      body: { action: 'notify', story: publishedStory },
    });
    setMessage(newsletterError
      ? 'Published successfully. Newsletter delivery is not configured yet.'
      : `Published successfully. Newsletter sent to ${newsletterData.sent} subscriber${newsletterData.sent === 1 ? '' : 's'}.`);
  };

  const subscribeToNewsletter = async (event) => {
    event.preventDefault();
    setNewsletterSaving(true);
    setNewsletterMessage('');
    const { data, error } = await supabase.functions.invoke('newsletter', {
      body: { action: 'subscribe', email: newsletterEmail },
    });
    setNewsletterSaving(false);
    if (error) return setNewsletterMessage('Subscription failed. Please check the email and try again.');
    setNewsletterEmail('');
    setNewsletterMessage(data.message);
  };

  const deleteWriting = async (story) => {
    if (!isAdmin || !window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    setMessage('');
    const { error } = await supabase.from('writings').delete().eq('id', story.id);
    if (error) return setMessage(error.message);
    await loadStories();
  };

  if (view === 'admin' && !authReady) {
    return <main className="admin-loading">Checking admin access...</main>;
  }

  if (view === 'admin' && !session) {
    return (
      <main className="admin-login-page">
        <header className="editor-header">
          <button className="brand" onClick={() => window.location.assign('/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Admin Panel</span>
          <button className="editor-exit" onClick={() => window.location.assign('/')}><X size={19} /> Close</button>
        </header>
        <form className="admin-login-form" onSubmit={login}>
          <span className="eyebrow">Restricted access</span>
          <h1>Admin sign in.</h1>
          <label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label>
          <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>
          {message && <p className="form-message">{message}</p>}
          <button className="solid-button" type="submit">Continue <ArrowRight size={18} /></button>
        </form>
      </main>
    );
  }

  if (view === 'admin' && session && !adminChecked) {
    return <main className="admin-loading">Checking admin access...</main>;
  }

  if (view === 'admin' && session && !isAdmin) {
    return <main className="access-denied"><h1>Access denied.</h1><p>This account is not an AiLit administrator.</p><button className="solid-button" onClick={logout}>Sign out</button></main>;
  }

  if (view === 'admin' && isAdmin) {
    return (
      <main className="editor-page">
        <header className="editor-header">
          <button className="brand" onClick={() => window.location.assign('/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Admin Panel</span>
          <div className="editor-account"><button className="editor-exit" onClick={() => window.location.assign('/')}><X size={18} /> Close</button><button className="editor-exit" onClick={logout}><LogOut size={17} /> Sign out</button></div>
        </header>
        <form className="writing-editor admin-compose" onSubmit={publishWriting}>
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
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={chooseInlineImage} title="Insert image" disabled={inlineImageUploading}><ImagePlus /></button>
                <input ref={inlineImageInputRef} className="inline-image-input" type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={insertInlineImage} />
                {inlineImageUploading && <span className="toolbar-status">Uploading image...</span>}
              </div>
              <div ref={editorRef} className={`rich-editor ${draft.type === 'Poem' ? 'poem-editor' : ''}`} contentEditable suppressContentEditableWarning data-placeholder={draft.type === 'Poem' ? 'Begin your poem...' : 'Begin your article...'} />
            </div>
            <label className="image-upload">
              {draft.image ? <img src={draft.image} alt="Upload preview" /> : <><ImagePlus size={28} /><b>Upload a picture</b><span>Choose an image up to 10 MB.</span></>}
              <input type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={uploadImage} />
            </label>
            {message && <p className="form-message">{message}</p>}
            <div className="editor-actions"><button type="button" onClick={() => window.location.assign('/')}>Cancel</button><button className="solid-button" type="submit" disabled={saving}>{saving ? 'Publishing...' : 'Publish writing'} <ArrowRight size={18} /></button></div>
          </div>
        </form>
        <section className="published-manager">
          <span className="eyebrow">Published work</span>
          <h2>Manage writing</h2>
          {stories.length ? <div className="published-list">{stories.map((story) => <article key={story.id}><div><span>{story.type}</span><h3>{story.title}</h3><p>By {story.author}</p></div><button onClick={() => deleteWriting(story)} aria-label={`Delete ${story.title}`}><Trash2 size={18} /> Delete</button></article>)}</div> : <p className="manager-empty">No published writing yet.</p>}
          {message && <p className="form-message">{message}</p>}
        </section>
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
          <figure className="about-art">
            <img src="/about-ai-literature.png" alt="Abstract artwork of pages and neural traces representing AI and literature" />
          </figure>
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
        <button className="nav-title" onClick={() => scrollTo('top')} aria-label="AiLit home">
          <span className="round-mark" aria-hidden="true"><span /></span>
          <span>Artificial Intelligence<br />& Literature</span>
        </button>
        <nav className={menuOpen ? 'nav open' : 'nav'}>
          <button onClick={() => { setView('home'); setMenuOpen(false); setTimeout(() => scrollTo('top'), 0); }}>Home</button>
          <button onClick={() => scrollTo('journal')}>New Writing</button>
          <button onClick={() => scrollTo('newsletter')}>Newsletter</button>
          <button onClick={() => { setView('about'); setMenuOpen(false); }}>About</button>
          <button onClick={installWebApp}>{isStandalone ? 'Open Installed App' : 'Install Web App'}</button>
        </nav>
        <div className="header-actions">
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow">Literature, in conversation with Artificial Intelligence</p><h1>What does it mean<br />to <em>imagine</em> now?</h1><p className="hero-deck">AiLit explores fiction, poetry, criticism, and experiments from the shifting border between human language and Artificial Intelligence.</p></div><div className="cover-wrap"><div className="cover"><div className="cover-top"><span>AiLit</span></div><div className="orb"><div className="orb-line one" /><div className="orb-line two" /><div className="orb-line three" /><Asterisk className="orb-star" /></div><div className="cover-title">Intimacy<br />& Artificial Intelligence</div><div className="cover-foot">Fiction · Poetry · Essays · Experiments</div></div></div></div></section>
      <section className="manifesto"><Asterisk size={24} /><p>We believe technology does not diminish literature's mystery. It gives the mystery <em>new rooms</em> to inhabit.</p></section>
      <section className="journal section" id="journal"><div className="section-heading"><div><h2>New writing</h2></div></div>{stories.length ? <div className="story-grid">{stories.map((story) => <article className="story story-link" key={story.id} tabIndex="0" role="link" onClick={() => { setSelectedStory(story); setView('story'); window.scrollTo(0, 0); }} onKeyDown={(event) => { if (event.key === 'Enter') { setSelectedStory(story); setView('story'); window.scrollTo(0, 0); } }}><div className="story-art rust">{story.image_url ? <img src={story.image_url} alt="" /> : <div className="glyph">“</div>}</div><div className="story-meta"><span>{story.type}</span><span>Read <ArrowRight size={13} /></span></div><h3>{story.title}</h3><p>{story.introduction}</p><div className="author">By {story.author}</div></article>)}</div> : <div className="empty-writing"><p>New work will appear here.</p></div>}</section>
      <section className="lab section" id="lab"><div className="lab-intro"><span className="eyebrow light">AiLit Reading Lab · 01</span><h2>New ways to read.<br />New ways to write.</h2><p>Artificial Intelligence can offer fresh insight into literature by revealing hidden patterns, making unexpected connections, and inviting writers to explore possibilities beyond familiar habits.</p><div className="principles"><span><Feather size={16} /> Human-led</span><span><Sparkles size={16} /> Exploratory</span><span><AudioLines size={16} /> Creative</span></div></div><div className="reader"><div className="reader-label">Artificial Intelligence and literary imagination</div><blockquote>“AI does not decide what a story means. It gives readers and writers another way to ask what it might become.”</blockquote><div className="lens-tabs">{Object.keys(lensText).map((item) => <button className={lens === item ? 'active' : ''} onClick={() => setLens(item)} key={item}>{item === 'Close' ? 'Discover patterns' : item === 'Machine' ? 'Find connections' : 'Create possibilities'}</button>)}</div><div className="lens-output" key={lens}><Sparkles size={17} /><p>{lensText[lens]}</p></div></div></section>
      <section className="newsletter section" id="newsletter">
        <img src="/ailit-logo.png" alt="" />
        <span className="eyebrow">The AiLit newsletter</span>
        <h2>New writing,<br />once in a while.</h2>
        <p>Receive a quiet note whenever a new article or poem is published.</p>
        <form onSubmit={subscribeToNewsletter}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" placeholder="Your email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required />
          <button type="submit" aria-label="Subscribe" disabled={newsletterSaving}>{newsletterSaving ? 'Joining...' : <ArrowRight />}</button>
        </form>
        {newsletterMessage && <p className="newsletter-message" role="status">{newsletterMessage}</p>}
      </section>
      <footer><div className="footer-brand"><img src="/ailit-logo.png" alt="" /><span>AiLit</span><p>A literary magazine for language, imagination, and Artificial Intelligence.</p></div><div className="copyright">© 2026 AiLit Magazine <span>Made by humans, with questions.</span></div></footer>
      {installMessage && <div className="install-toast" role="status">{installMessage}</div>}

    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
