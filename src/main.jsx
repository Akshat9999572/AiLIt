import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Asterisk, Menu, X, Sparkles, Feather, AudioLines, ImagePlus, Bold, Italic, Underline, List, ListOrdered, Heading2, Quote, Link, AlignLeft, AlignCenter, AlignRight, AlignJustify, RemoveFormatting, LogOut, Trash2, Share2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { PushNotifications } from '@capacitor/push-notifications';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { supabase } from './supabase';
import './styles.css';

const isNativeApp = Capacitor.isNativePlatform();
const siteUrl = 'https://ailitmagazine.xyz';

const lensText = {
  Close: 'AI can trace recurring images, rhythms, and relationships across a text, helping readers notice patterns that may be difficult to see in a single reading.',
  Machine: 'By comparing language across genres, periods, and cultures, AI can suggest unexpected connections while leaving interpretation, judgment, and meaning in human hands.',
  Strange: 'For creative writers, AI can act as a playful collaborator: offering alternate structures, unfamiliar perspectives, and surprising prompts that open new directions without replacing the writer.',
};

function AnalogueWriter() {
  return (
    <section className="analogue-writer" aria-labelledby="analogue-writer-title">
      <div className="analogue-copy">
        <span className="eyebrow">A dialogue in language</span>
        <h2 id="analogue-writer-title">Language<br /><em>in Motion.</em></h2>
      </div>
      <div className="analogue-stage">
        <svg className="analogue-machine" viewBox="0 0 760 560" role="img" aria-label="Animated old desktop computer producing strips of literary text">
          <defs>
            <filter id="paper-shadow" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#171713" floodOpacity=".2" />
            </filter>
            <pattern id="vent-lines" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 5H10" stroke="#1b2523" strokeWidth="2" />
            </pattern>
          </defs>

          <g className="text-ribbons crt-ribbons" filter="url(#paper-shadow)">
            <g className="text-ribbon ribbon-one">
              <rect x="426" y="146" width="245" height="54" rx="2" />
              <text x="446" y="178">memory enters the sentence</text>
            </g>
            <g className="text-ribbon ribbon-two">
              <rect x="416" y="212" width="310" height="54" rx="2" />
              <text x="436" y="244">language answers with a question</text>
            </g>
            <g className="text-ribbon ribbon-three">
              <rect x="432" y="278" width="220" height="54" rx="2" />
              <text x="452" y="310">who is imagining whom?</text>
            </g>
          </g>

          <g className="machine-body crt-computer">
            <path className="crt-shadow" d="M126 104h340l44 42v272H91V147z" />
            <path className="crt-shell" d="M109 87h340l44 42v272H74V130z" />
            <path className="crt-side" d="M449 87l44 42v272l-44-19z" />
            <rect className="crt-bezel" x="116" y="126" width="290" height="209" rx="11" />
            <path className="crt-screen" d="M143 151h236c13 0 19 12 19 79s-6 79-19 79H143c-13 0-19-12-19-79s6-79 19-79z" />
            <g className="crt-copy">
              <text x="153" y="190">AILIT_OS  /  LANGUAGE MODEL</text>
              <text x="153" y="226">&gt; COMPLETE THE THOUGHT:</text>
              <text x="153" y="260">“A WORD BECOMES HUMAN WHEN</text>
              <text x="153" y="281"> SOMEONE CHOOSES TO MEAN IT.”</text>
              <rect className="crt-cursor" x="153" y="293" width="11" height="4" />
            </g>
            <rect className="crt-drive" x="122" y="352" width="139" height="17" rx="2" />
            <rect className="crt-drive-slot" x="137" y="358" width="109" height="4" />
            <circle className="crt-power" cx="382" cy="359" r="8" />
            <circle className="crt-power-light" cx="411" cy="359" r="4" />
            <rect className="paper-slot" x="405" y="150" width="31" height="160" rx="3" />
            <path className="crt-base" d="M147 401h277l28 32H122z" />
            <path className="crt-keyboard" d="M103 435h375l87 70H55z" />
            <g className="keyboard-keys">
              <path d="M98 454h351M83 473h390M70 492h427" />
              <path d="M126 447l-11 55M165 447l-7 55M204 447l-4 55M243 447v55M282 447l4 55M321 447l7 55M360 447l11 55M399 447l15 55M438 447l19 55" />
            </g>
          </g>

          <g className="loose-pages">
            <path d="M522 405l104-24 18 79-104 24z" />
            <path d="M550 428l63-15M555 445l50-12M561 461l58-14" />
          </g>
        </svg>
        <span className="analogue-caption">PROMPT: A HUMAN QUESTION&nbsp;&nbsp; RESPONSE: A NEW POSSIBILITY</span>
      </div>
    </section>
  );
}

function App() {
  if (window.location.pathname.startsWith('/app-shell')) {
    const cleanPath = window.location.pathname.replace(/^\/app-shell/, '') || '/';
    window.history.replaceState({}, '', cleanPath + window.location.search + window.location.hash);
  }
  const editorRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const editorSelectionRef = useRef(null);
  const formattingSelectionRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const routeView = () => {
    if (window.location.pathname === '/admin') return 'admin';
    if (window.location.pathname === '/editorial-agent') return 'editorialAgent';
    if (window.location.pathname === '/editorial-dashboard') return 'editorialDashboard';
    if (window.location.pathname.startsWith('/editorial-dashboard/')) return 'editorialDetail';
    if (window.location.pathname === '/about') return 'about';
    if (window.location.pathname === '/privacy') return 'privacy';
    if (window.location.pathname === '/submit') return 'submit';
    if (window.location.pathname.startsWith('/writing/')) return 'story';
    return 'home';
  };
  const [view, setView] = useState(routeView);
  const [lens, setLens] = useState('Close');
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
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
  const [newsletterPopupOpen, setNewsletterPopupOpen] = useState(false);
  const [pushState, setPushState] = useState(() => window.localStorage.getItem('ailit-push-enabled') ? 'enabled' : 'idle');
  const [submission, setSubmission] = useState({ name: '', email: '', designation: '', shortBio: '' });
  const [submissionPicture, setSubmissionPicture] = useState(null);
  const [submissionManuscript, setSubmissionManuscript] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionSaving, setSubmissionSaving] = useState(false);
  const [adminSubmissions, setAdminSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
  const [saving, setSaving] = useState(false);
  const [inlineImageUploading, setInlineImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [draft, setDraft] = useState({ type: 'Article', title: '', author: '', introduction: '', image: '', imageDescription: '' });
  const [editorialForm, setEditorialForm] = useState({ title: '', author_name: '', author_email: '', declared_genre: '', submission_text: '' });
  const [editorialSaving, setEditorialSaving] = useState(false);
  const [editorialError, setEditorialError] = useState('');
  const [editorialResult, setEditorialResult] = useState(null);
  const [editorialList, setEditorialList] = useState([]);
  const [editorialListLoading, setEditorialListLoading] = useState(false);
  const [editorialDetail, setEditorialDetail] = useState(null);
  const [editorialDetailLoading, setEditorialDetailLoading] = useState(false);
  const [editorialUpdateSaving, setEditorialUpdateSaving] = useState(false);
  const [editorialMessage, setEditorialMessage] = useState('');

  useEffect(() => {
    if (!isNativeApp) return undefined;
    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#f2eee4' }).catch(() => {});

    const appUrlListener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const incomingUrl = new URL(url);
      if (incomingUrl.pathname === '/admin' || incomingUrl.pathname.startsWith('/admin/')) {
        Browser.open({ url: `${siteUrl}${incomingUrl.pathname}` }).catch(() => {});
        navigateTo('home', '/');
        return;
      }
      window.history.pushState({}, '', `${incomingUrl.pathname}${incomingUrl.search}`);
      const nextView = routeView();
      setView(nextView);
      if (nextView === 'story') loadStories();
      window.scrollTo(0, 0);
    });

    const backListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (window.location.pathname !== '/' || canGoBack) window.history.back();
      else CapacitorApp.exitApp();
    });

    if (window.location.pathname === '/admin') {
      Browser.open({ url: `${siteUrl}/admin` }).catch(() => {});
      navigateTo('home', '/');
    }

    return () => {
      appUrlListener.then((listener) => listener.remove());
      backListener.then((listener) => listener.remove());
    };
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem('ailit-newsletter-invitation-seen')) return;
    const popupTimer = window.setTimeout(() => setNewsletterPopupOpen(true), 900);
    return () => window.clearTimeout(popupTimer);
  }, []);

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
    const onPopState = () => {
      const nextView = routeView();
      setView(nextView);
      if (nextView === 'story') {
        loadStories();
      } else {
        setSelectedStory(null);
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPopState);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setAuthReady(true); });
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('popstate', onPopState);
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

  useEffect(() => {
    if (isAdmin) loadSubmissions();
  }, [isAdmin]);

  useEffect(() => {
    if (view === 'editorialDashboard' && session && isAdmin) loadEditorialSubmissions();
    if (view === 'editorialDetail' && session && isAdmin) loadEditorialSubmission();
  }, [view, session, isAdmin]);

  const loadStories = async () => {
    const { data } = await supabase.from('writings').select('*').eq('published', true).order('created_at', { ascending: false });
    setStories(data || []);
    const storyId = window.location.pathname.startsWith('/writing/')
      ? window.location.pathname.split('/writing/')[1]
      : new URLSearchParams(window.location.search).get('story');
    const linkedStory = data?.find((story) => story.id === storyId);
    if (linkedStory) {
      setSelectedStory(linkedStory);
      setView('story');
      if (!window.location.pathname.startsWith('/writing/')) window.history.replaceState({}, '', `/writing/${linkedStory.id}`);
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navigateTo = (nextView, path) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setView(nextView);
    setSelectedStory(null);
    setMenuOpen(false);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
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
    restoreEditorSelection();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, value);
    saveEditorSelection();
  };

  const saveEditorSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) {
      formattingSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreEditorSelection = () => {
    if (!formattingSelectionRef.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(formattingSelectionRef.current);
  };

  const insertLink = () => {
    const url = window.prompt('Enter the link URL');
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    formatText('createLink', href);
  };

  const openStory = (story) => {
    window.history.pushState({}, '', `/writing/${story.id}`);
    setSelectedStory(story);
    setView('story');
    setShareMessage('');
    window.scrollTo(0, 0);
  };

  const shareStory = async (story, event) => {
    event?.stopPropagation();
    const url = `${window.location.origin}/writing/${story.id}`;
    try {
      if (isNativeApp) {
        await Share.share({ title: story.title, text: story.introduction, url, dialogTitle: `Share ${story.title}` });
      } else if (navigator.share) {
        await navigator.share({ title: story.title, text: story.introduction, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage('Link copied.');
        setTimeout(() => setShareMessage(''), 2500);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setShareMessage('Could not share this link.');
    }
  };

  const enablePushNotifications = async () => {
    if (!isNativeApp || pushState === 'registering') return;
    setMenuOpen(false);
    setPushState('registering');
    try {
      let permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt') permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        setPushState('denied');
        setInstallMessage('Notifications were not enabled. You can allow them later in Android settings.');
        return;
      }
      await PushNotifications.removeAllListeners();
      await PushNotifications.createChannel({
        id: 'new_writing',
        name: 'New writing',
        description: 'Alerts when AiLit publishes a new piece.',
        importance: 4,
        visibility: 1,
        vibration: true,
      });
      await PushNotifications.addListener('registration', async ({ value }) => {
        const { error } = await supabase.functions.invoke('push-notifications', {
          body: { action: 'register', token: value, platform: 'android' },
        });
        if (error) {
          setPushState('error');
          setInstallMessage('This device could not be registered for alerts.');
          return;
        }
        window.localStorage.setItem('ailit-push-enabled', 'true');
        setPushState('enabled');
        setInstallMessage('New-writing notifications are enabled.');
      });
      await PushNotifications.addListener('registrationError', () => {
        setPushState('error');
        setInstallMessage('Notifications could not be enabled on this device.');
      });
      await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
        const path = notification.data?.path || '/';
        window.history.pushState({}, '', path);
        if (path.startsWith('/writing/')) loadStories();
        else navigateTo(routeView(), path);
      });
      await PushNotifications.register();
    } catch {
      setPushState('error');
      setInstallMessage('Notifications could not be enabled on this device.');
    }
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
    const wasEditing = Boolean(editingStoryId);
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
    const writingPayload = {
      type: draft.type,
      title: draft.title,
      author: draft.author,
      introduction: draft.introduction,
      image_description: draft.imageDescription.trim() || null,
      body: editorRef.current.innerHTML,
      created_by: session.user.id,
    };
    if (imageUrl) writingPayload.image_url = imageUrl;
    const query = editingStoryId
      ? supabase.from('writings').update(writingPayload).eq('id', editingStoryId)
      : supabase.from('writings').insert(writingPayload);
    const { data: publishedStory, error } = await query.select().single();
    setSaving(false);
    if (error) return setMessage(error.message);
    setDraft({ type: 'Article', title: '', author: '', introduction: '', image: '', imageDescription: '' });
    setImageFile(null);
    setEditingStoryId(null);
    await loadStories();
    if (editorRef.current) editorRef.current.innerHTML = '';
    if (wasEditing) {
      setMessage('Writing updated and republished successfully.');
    } else {
      const [{ data: newsletterData, error: newsletterError }, { error: pushError }] = await Promise.all([
        supabase.functions.invoke('newsletter', { body: { action: 'notify', story: publishedStory } }),
        supabase.functions.invoke('push-notifications', { body: { action: 'notify', story: publishedStory } }),
      ]);
      setMessage(newsletterError
        ? `Published successfully, but the newsletter could not be sent${newsletterError.message ? `: ${newsletterError.message}` : '.'}`
        : `Published successfully. Newsletter sent to ${newsletterData.sent} subscriber${newsletterData.sent === 1 ? '' : 's'}${pushError ? '; app alerts are not configured yet.' : ', and app alerts were queued.'}`);
    }
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
    window.localStorage.setItem('ailit-newsletter-invitation-seen', 'true');
    setNewsletterPopupOpen(false);
  };

  const closeNewsletterPopup = () => {
    window.localStorage.setItem('ailit-newsletter-invitation-seen', 'true');
    setNewsletterPopupOpen(false);
  };

  const submitWriting = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!submissionManuscript) return setSubmissionMessage('Upload your manuscript.');
    if (submissionPicture && submissionPicture.size > 1024 * 1024) return setSubmissionMessage('Your picture must be 1 MB or smaller.');
    if (submissionManuscript.size > 5 * 1024 * 1024) return setSubmissionMessage('Your manuscript must be 5 MB or smaller.');
    setSubmissionSaving(true);
    setSubmissionMessage('');
    setSubmissionSuccess(false);
    const formData = new FormData();
    Object.entries(submission).forEach(([key, value]) => formData.append(key, value));
    if (submissionPicture) formData.append('picture', submissionPicture);
    formData.append('manuscript', submissionManuscript);
    const { data, error } = await supabase.functions.invoke('submit-writing', { body: formData });
    setSubmissionSaving(false);
    if (error) return setSubmissionMessage(error.message || 'The submission could not be completed. Please check the files and try again.');
    setSubmission({ name: '', email: '', designation: '', shortBio: '' });
    setSubmissionPicture(null);
    setSubmissionManuscript(null);
    form.reset();
    setSubmissionMessage('Successfully Submitted');
    setSubmissionSuccess(true);
    requestAnimationFrame(() => document.querySelector('.submission-success')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    const { data, error } = await supabase.functions.invoke('submit-writing', {
      body: { action: 'list' },
    });
    setSubmissionsLoading(false);
    if (error) return;
    setAdminSubmissions(data.submissions || []);
  };

  const deleteSubmission = async (item) => {
    if (!isAdmin || !window.confirm(`Delete the submission from ${item.name}? This cannot be undone.`)) return;
    const { error } = await supabase.functions.invoke('submit-writing', {
      body: { action: 'delete', submissionId: item.id },
    });
    if (error) return setMessage('The submission could not be deleted.');
    setAdminSubmissions((current) => current.filter((submissionItem) => submissionItem.id !== item.id));
  };

  const editWriting = (story) => {
    setEditingStoryId(story.id);
    setDraft({
      type: story.type,
      title: story.title,
      author: story.author,
      introduction: story.introduction,
      image: story.image_url || '',
      imageDescription: story.image_description || '',
    });
    setImageFile(null);
    if (editorRef.current) editorRef.current.innerHTML = story.body || '';
    setMessage(`Editing "${story.title}". Make changes and select Republish.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteWriting = async (story) => {
    if (!isAdmin || !window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    setMessage('');
    const { error } = await supabase.from('writings').delete().eq('id', story.id);
    if (error) return setMessage(error.message);
    await loadStories();
  };

  const editorialFetch = async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.message ? `: ${data.message}` : '';
      throw new Error(`${data.error || 'The editorial request failed.'}${detail}`);
    }
    return data;
  };

  const analyzeEditorialSubmission = async (event) => {
    event.preventDefault();
    setEditorialSaving(true);
    setEditorialError('');
    setEditorialResult(null);
    try {
      const data = await editorialFetch('/api/editorial?action=analyze', {
        method: 'POST',
        body: JSON.stringify(editorialForm),
      });
      setEditorialResult(data.submission);
    } catch (error) {
      setEditorialError(error.message);
    } finally {
      setEditorialSaving(false);
    }
  };

  const loadEditorialSubmissions = async () => {
    setEditorialListLoading(true);
    setEditorialError('');
    try {
      const data = await editorialFetch('/api/editorial?action=list');
      setEditorialList(data.submissions || []);
    } catch (error) {
      setEditorialError(error.message);
    } finally {
      setEditorialListLoading(false);
    }
  };

  const loadEditorialSubmission = async () => {
    const id = window.location.pathname.split('/editorial-dashboard/')[1];
    if (!id) return;
    setEditorialDetailLoading(true);
    setEditorialError('');
    setEditorialMessage('');
    try {
      const data = await editorialFetch(`/api/editorial?action=get&id=${encodeURIComponent(id)}`);
      setEditorialDetail(data.submission);
    } catch (error) {
      setEditorialError(error.message);
      setEditorialDetail(null);
    } finally {
      setEditorialDetailLoading(false);
    }
  };

  const openEditorialSubmission = (item) => {
    navigateTo('editorialDetail', `/editorial-dashboard/${item.id}`);
  };

  const updateEditorialSubmission = async (event) => {
    event.preventDefault();
    if (!editorialDetail) return;
    setEditorialUpdateSaving(true);
    setEditorialError('');
    setEditorialMessage('');
    try {
      const data = await editorialFetch(`/api/editorial?action=update&id=${encodeURIComponent(editorialDetail.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: editorialDetail.status, editor_notes: editorialDetail.editor_notes || '' }),
      });
      setEditorialDetail(data.submission);
      setEditorialMessage('Editorial status and notes saved.');
    } catch (error) {
      setEditorialError(error.message);
    } finally {
      setEditorialUpdateSaving(false);
    }
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
              <label>Writing type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}><option>Article</option><option>Poem</option><option>Essay</option><option>Opinion Piece</option><option>Short Story</option><option>Review</option><option>Research Paper</option></select></label>
              <label>Author<input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} required /></label>
            </div>
            <label>Title<input className="title-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="An untitled thought" required /></label>
            <label>Short introduction<textarea value={draft.introduction} onChange={(event) => setDraft({ ...draft, introduction: event.target.value })} placeholder="A brief introduction shown on the home page" required /></label>
            <div className="rich-field">
              <span>Your writing</span>
              <div className="editor-toolbar">
                <div className="toolbar-group toolbar-selects">
                  <select aria-label="Font family" defaultValue="" onMouseDown={saveEditorSelection} onChange={(event) => { formatText('fontName', event.target.value); event.target.value = ''; }}>
                    <option value="" disabled>Font</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Garamond">Garamond</option>
                    <option value="Baskerville">Baskerville</option>
                    <option value="Palatino Linotype">Palatino</option>
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Trebuchet MS">Trebuchet</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                  <select aria-label="Font size" defaultValue="" onMouseDown={saveEditorSelection} onChange={(event) => { formatText('fontSize', event.target.value); event.target.value = ''; }}>
                    <option value="" disabled>Size</option>
                    <option value="2">Small</option>
                    <option value="3">Normal</option>
                    <option value="4">Medium</option>
                    <option value="5">Large</option>
                    <option value="6">Extra large</option>
                  </select>
                  <label className="color-control" title="Text color">
                    <span>A</span>
                    <input type="color" defaultValue="#171713" onMouseDown={saveEditorSelection} onChange={(event) => formatText('foreColor', event.target.value)} />
                  </label>
                </div>
                <div className="toolbar-group">
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('bold')} title="Bold"><Bold /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('italic')} title="Italic"><Italic /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('underline')} title="Underline"><Underline /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('formatBlock', 'h2')} title="Heading"><Heading2 /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('formatBlock', 'blockquote')} title="Quote"><Quote /></button>
                </div>
                <div className="toolbar-group">
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('justifyLeft')} title="Align left"><AlignLeft /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('justifyCenter')} title="Align center"><AlignCenter /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('justifyRight')} title="Align right"><AlignRight /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('justifyFull')} title="Justify"><AlignJustify /></button>
                </div>
                <div className="toolbar-group">
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('insertUnorderedList')} title="Bullet list"><List /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('insertOrderedList')} title="Numbered list"><ListOrdered /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} title="Insert link"><Link /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => formatText('removeFormat')} title="Clear formatting"><RemoveFormatting /></button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={chooseInlineImage} title="Insert image" disabled={inlineImageUploading}><ImagePlus /></button>
                </div>
                <input ref={inlineImageInputRef} className="inline-image-input" type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={insertInlineImage} />
                {inlineImageUploading && <span className="toolbar-status">Uploading image...</span>}
              </div>
              <div ref={editorRef} className={`rich-editor ${draft.type === 'Poem' ? 'poem-editor' : ''}`} contentEditable suppressContentEditableWarning onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder={draft.type === 'Poem' ? 'Begin your poem...' : 'Begin your writing...'} />
            </div>
            <label className="image-upload">
              {draft.image ? <img src={draft.image} alt="Upload preview" /> : <><ImagePlus size={28} /><b>Upload a picture</b><span>Choose an image up to 10 MB.</span></>}
              <input type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.svg" onChange={uploadImage} />
            </label>
            <label>Cover image description<textarea value={draft.imageDescription} onChange={(event) => setDraft({ ...draft, imageDescription: event.target.value })} placeholder="Describe the image, artwork, or source" /></label>
            {message && <p className="form-message">{message}</p>}
            <div className="editor-actions"><button type="button" onClick={() => { if (editingStoryId) { setEditingStoryId(null); setDraft({ type: 'Article', title: '', author: '', introduction: '', image: '', imageDescription: '' }); if (editorRef.current) editorRef.current.innerHTML = ''; } else window.location.assign('/'); }}>Cancel</button><button className="solid-button" type="submit" disabled={saving}>{saving ? 'Publishing...' : editingStoryId ? 'Republish' : 'Publish writing'} <ArrowRight size={18} /></button></div>
          </div>
        </form>
        <section className="published-manager">
          <span className="eyebrow">Published work</span>
          <h2>Manage writing</h2>
          {stories.length ? <div className="published-list">{stories.map((story) => <article key={story.id}><div><span>{story.type}</span><h3>{story.title}</h3><p>By {story.author}</p></div><div className="published-actions"><button className="edit-writing-button" onClick={() => editWriting(story)}>Edit</button><button className="republish-writing-button" onClick={() => editWriting(story)}>Republish</button><button onClick={() => deleteWriting(story)} aria-label={`Delete ${story.title}`}><Trash2 size={18} /> Delete</button></div></article>)}</div> : <p className="manager-empty">No published writing yet.</p>}
          {message && <p className="form-message">{message}</p>}
        </section>
        <section className="submissions-manager">
          <div className="manager-heading">
            <div><span className="eyebrow">Incoming work</span><h2>Submissions</h2></div>
            <button className="text-button" onClick={loadSubmissions}>Refresh</button>
          </div>
          {submissionsLoading ? <p className="manager-empty">Loading submissions...</p> : adminSubmissions.length ? (
            <div className="submission-admin-list">
              {adminSubmissions.map((item) => (
                <article className="submission-admin-card" key={item.id}>
                  <div className="submission-admin-person">
                    {item.picture_url && <img src={item.picture_url} alt="" />}
                    <div>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <h3>{item.name}</h3><p>{item.designation}</p>
                    </div>
                  </div>
                  <div className="submission-admin-details">
                    <div><b>Email</b><a href={`mailto:${item.email}`}>{item.email}</a></div>
                    <div><b>Short bio</b><p>{item.short_bio}</p></div>
                    <div><b>Manuscript</b>{item.manuscript_url ? <a className="download-link" href={item.manuscript_url}>Download {item.manuscript_name} <ArrowRight size={14} /></a> : <span>Unavailable</span>}</div>
                    <button className="delete-submission-button" type="button" onClick={() => deleteSubmission(item)}><Trash2 size={17} /> Delete submission</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="manager-empty">No submissions received yet.</p>}
        </section>
      </main>
    );
  }

  if (view === 'editorialAgent') {
    const resultRows = editorialResult ? [
      ['Summary', editorialResult.summary],
      ['Detected genre', editorialResult.detected_genre],
      ['Theme fit score', editorialResult.theme_fit_score],
      ['Literary quality score', editorialResult.literary_quality_score],
      ['Originality score', editorialResult.originality_score],
      ['Fit with AiLit theme', editorialResult.fit_with_ailit_theme],
      ['Strengths', editorialResult.strengths],
      ['Weaknesses', editorialResult.weaknesses],
      ['Editorial recommendation', editorialResult.editorial_recommendation],
      ['Editor notes', editorialResult.editor_notes],
      ['Polite response email draft', editorialResult.polite_response_email_draft],
    ] : [];

    return (
      <main className="editorial-agent-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Editorial Agent</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <section className="editorial-shell">
          <div className="editorial-intro">
            <span className="eyebrow">Kaggle capstone</span>
            <h1>AiLit Editorial Agent.</h1>
            <p>The agent reads a literary submission and prepares structured editorial support for AiLit: summary, genre, scores, strengths, weaknesses, recommendation, notes, and a draft response email.</p>
            <p className="human-notice">AI analysis is advisory. Final editorial decisions remain with the human editor.</p>
          </div>
          <form className="editorial-form" onSubmit={analyzeEditorialSubmission}>
            <label>Title<input value={editorialForm.title} onChange={(event) => setEditorialForm({ ...editorialForm, title: event.target.value })} required /></label>
            <div className="editorial-row">
              <label>Author name<input value={editorialForm.author_name} onChange={(event) => setEditorialForm({ ...editorialForm, author_name: event.target.value })} /></label>
              <label>Author email<input type="email" value={editorialForm.author_email} onChange={(event) => setEditorialForm({ ...editorialForm, author_email: event.target.value })} /></label>
            </div>
            <label>Declared genre<input value={editorialForm.declared_genre} onChange={(event) => setEditorialForm({ ...editorialForm, declared_genre: event.target.value })} placeholder="Poem, essay, fiction, review..." /></label>
            <label>Submission text<textarea value={editorialForm.submission_text} onChange={(event) => setEditorialForm({ ...editorialForm, submission_text: event.target.value })} required /></label>
            {editorialError && <p className="form-message" role="alert">{editorialError}</p>}
            <button className="solid-button" type="submit" disabled={editorialSaving}>{editorialSaving ? 'Analyzing...' : 'Analyze Submission'} <Sparkles size={18} /></button>
          </form>
          {editorialSaving && <p className="editorial-loading">Reading the submission and preparing advisory analysis...</p>}
          {editorialResult && (
            <section className="editorial-result" aria-live="polite">
              <span className="eyebrow">Saved analysis</span>
              <h2>{editorialResult.title}</h2>
              <p className="human-notice">This is an editorial recommendation only. It does not publish, accept, reject, or email the author automatically.</p>
              <div className="analysis-grid">
                {resultRows.map(([label, value]) => <article key={label}><b>{label}</b><p>{value || 'Not provided'}</p></article>)}
              </div>
            </section>
          )}
        </section>
      </main>
    );
  }

  if ((view === 'editorialDashboard' || view === 'editorialDetail') && !authReady) {
    return <main className="admin-loading">Checking editorial access...</main>;
  }

  if ((view === 'editorialDashboard' || view === 'editorialDetail') && !session) {
    return (
      <main className="admin-login-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Editorial Dashboard</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <form className="admin-login-form" onSubmit={login}>
          <span className="eyebrow">Restricted access</span>
          <h1>Editor sign in.</h1>
          <label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label>
          <label>Password<input type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>
          {message && <p className="form-message">{message}</p>}
          <button className="solid-button" type="submit">Continue <ArrowRight size={18} /></button>
        </form>
      </main>
    );
  }

  if ((view === 'editorialDashboard' || view === 'editorialDetail') && session && !adminChecked) {
    return <main className="admin-loading">Checking editorial access...</main>;
  }

  if ((view === 'editorialDashboard' || view === 'editorialDetail') && session && !isAdmin) {
    return <main className="access-denied"><h1>Access denied.</h1><p>This account is not an AiLit administrator.</p><button className="solid-button" onClick={logout}>Sign out</button></main>;
  }

  if (view === 'editorialDashboard' && isAdmin) {
    return (
      <main className="editorial-dashboard-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Editorial Dashboard</span>
          <div className="editor-account"><button className="editor-exit" onClick={() => navigateTo('editorialAgent', '/editorial-agent')}>Agent</button><button className="editor-exit" onClick={logout}><LogOut size={17} /> Sign out</button></div>
        </header>
        <section className="editorial-list-shell">
          <div className="manager-heading">
            <div><span className="eyebrow">Human-in-the-loop review</span><h1>Editorial submissions</h1></div>
            <button className="text-button" onClick={loadEditorialSubmissions}>Refresh</button>
          </div>
          {editorialError && <p className="form-message">{editorialError}</p>}
          {editorialListLoading ? <p className="manager-empty">Loading editorial submissions...</p> : editorialList.length ? (
            <div className="editorial-table">
              <div className="editorial-table-head"><span>Title</span><span>Author</span><span>Genre</span><span>Theme</span><span>Recommendation</span><span>Status</span><span>Date</span></div>
              {editorialList.map((item) => (
                <button className="editorial-table-row" key={item.id} onClick={() => openEditorialSubmission(item)}>
                  <span>{item.title}</span>
                  <span>{item.author_name || 'Unknown'}</span>
                  <span>{item.detected_genre || 'Unreviewed'}</span>
                  <span>{item.theme_fit_score ?? '—'}</span>
                  <span>{item.editorial_recommendation || 'Pending'}</span>
                  <span>{item.status || 'pending'}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          ) : <p className="manager-empty">No editorial submissions yet.</p>}
        </section>
      </main>
    );
  }

  if (view === 'editorialDetail' && isAdmin) {
    const scoreRows = editorialDetail ? [
      ['Theme fit', editorialDetail.theme_fit_score],
      ['Literary quality', editorialDetail.literary_quality_score],
      ['Originality', editorialDetail.originality_score],
    ] : [];
    return (
      <main className="editorial-dashboard-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('editorialDashboard', '/editorial-dashboard')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Editorial Review</span>
          <button className="editor-exit" onClick={() => navigateTo('editorialDashboard', '/editorial-dashboard')}><X size={19} /> Dashboard</button>
        </header>
        <section className="editorial-detail-shell">
          {editorialDetailLoading ? <p className="manager-empty">Loading editorial review...</p> : editorialDetail ? (
            <>
              <article className="editorial-detail-main">
                <span className="eyebrow">{editorialDetail.declared_genre || 'Submission'}</span>
                <h1>{editorialDetail.title}</h1>
                <p className="author">By {editorialDetail.author_name || 'Unknown author'} {editorialDetail.author_email ? `· ${editorialDetail.author_email}` : ''}</p>
                <div className="score-strip">{scoreRows.map(([label, value]) => <div key={label}><b>{value ?? '—'}</b><span>{label}</span></div>)}</div>
                <section><h2>Original submission</h2><p className="submission-text-display">{editorialDetail.submission_text}</p></section>
                <section><h2>AI summary</h2><p>{editorialDetail.summary || 'Not available'}</p></section>
                <section><h2>Detected genre</h2><p>{editorialDetail.detected_genre || 'Not available'}</p></section>
                <section><h2>Fit with AiLit theme</h2><p>{editorialDetail.fit_with_ailit_theme || 'Not available'}</p></section>
                <section><h2>Strengths</h2><p>{editorialDetail.strengths || 'Not available'}</p></section>
                <section><h2>Weaknesses</h2><p>{editorialDetail.weaknesses || 'Not available'}</p></section>
                <section><h2>Recommendation</h2><p>{editorialDetail.editorial_recommendation || 'Not available'}</p></section>
                <section><h2>Polite response email draft</h2><p className="submission-text-display">{editorialDetail.polite_response_email_draft || 'Not available'}</p></section>
              </article>
              <form className="editorial-review-panel" onSubmit={updateEditorialSubmission}>
                <p className="human-notice">AI analysis is advisory. Final editorial decisions remain with the human editor.</p>
                <label>Status<select value={editorialDetail.status || 'pending'} onChange={(event) => setEditorialDetail({ ...editorialDetail, status: event.target.value })}><option value="pending">pending</option><option value="accepted">accepted</option><option value="maybe">maybe</option><option value="revise">revise</option><option value="rejected">rejected</option></select></label>
                <label>Editor notes<textarea value={editorialDetail.editor_notes || ''} onChange={(event) => setEditorialDetail({ ...editorialDetail, editor_notes: event.target.value })} /></label>
                {editorialError && <p className="form-message" role="alert">{editorialError}</p>}
                {editorialMessage && <p className="submission-success" role="status">{editorialMessage}</p>}
                <button className="solid-button" type="submit" disabled={editorialUpdateSaving}>{editorialUpdateSaving ? 'Saving...' : 'Save editorial review'} <ArrowRight size={18} /></button>
              </form>
            </>
          ) : <p className="form-message">{editorialError || 'Editorial submission not found.'}</p>}
        </section>
      </main>
    );
  }

  if (view === 'about') {
    return (
      <main className="about-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>About</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <section className="about-content">
          <span className="eyebrow">Artificial Intelligence · Literature</span>
          <h1>Where technology<br />meets imagination.</h1>
          <div className="about-copy">
            <p>AiLit stands for Artificial Intelligence and Literature. It is a literary magazine that encourages a thoughtful fusion of computational tools with human storytelling, poetry, criticism, and imagination.</p>
            <p>We believe this meeting matters because AI can help readers discover new patterns and help writers approach language from unfamiliar directions. AiLit keeps human voice, judgment, and creativity at the centre while exploring how technology can open new possibilities for literature.</p>
          </div>
          <aside className="about-contact">
            <span>Contact</span>
            <div><p>Editorial enquiries, collaborations, and correspondence</p><a href="mailto:ailitmagazine@gmail.com">ailitmagazine@gmail.com <ArrowRight size={18} /></a></div>
          </aside>
        </section>
      </main>
    );
  }

  if (view === 'privacy') {
    return (
      <main className="privacy-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Privacy</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <article className="privacy-content">
          <span className="eyebrow">AiLit Magazine · Privacy policy</span>
          <h1>Your reading life<br />belongs to you.</h1>
          <p className="privacy-updated">Effective June 13, 2026</p>
          <section><h2>Information we collect</h2><p>AiLit collects an email address when you join the newsletter. When you submit work, we collect the name, email, designation, biography, manuscript, and optional photograph you provide. The Android app stores a device notification token only when you choose to enable new-writing alerts.</p></section>
          <section><h2>How information is used</h2><p>We use this information to deliver newsletters and publication alerts, review literary submissions, contact contributors, administer the magazine, and keep the service secure. AiLit does not sell personal information or use it for third-party advertising.</p></section>
          <section><h2>Service providers</h2><p>Data is processed using Supabase for authentication, database, file storage, and server functions; Resend for newsletter delivery; Firebase Cloud Messaging for optional Android notifications; and Vercel for website hosting.</p></section>
          <section><h2>Choices and deletion</h2><p>Newsletter messages include an unsubscribe link. Android notifications can be disabled in device settings. To request access to or deletion of submission information, email <a href="mailto:ailitmagazine@gmail.com">ailitmagazine@gmail.com</a>.</p></section>
          <section><h2>Security and retention</h2><p>AiLit limits administrative access and keeps submission files in protected storage. Information is retained only as long as reasonably necessary for editorial, legal, operational, and security purposes.</p></section>
          <section><h2>Contact</h2><p>Questions about this policy may be sent to <a href="mailto:ailitmagazine@gmail.com">ailitmagazine@gmail.com</a>.</p></section>
        </article>
      </main>
    );
  }

  if (view === 'submit') {
    return (
      <main className="submission-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>Submissions</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <section className="submission-content">
          <div className="submission-intro">
            <span className="eyebrow">Send us your work</span>
            <h1>Literature in conversation with intelligence.</h1>
            <p>Submit an article, essay, story, or poem that explores the intersection of Artificial Intelligence and literature.</p>
            <p className="submission-call">Our door remains open throughout the year. Good writing asks for patient attention, so it may be a while before your work finds its published home in AiLit.</p>
          </div>
          <form className="submission-form" onSubmit={submitWriting}>
            <div className="submission-row">
              <label>Name<input value={submission.name} onChange={(event) => setSubmission({ ...submission, name: event.target.value })} maxLength="120" required /></label>
              <label>Email<input type="email" value={submission.email} onChange={(event) => setSubmission({ ...submission, email: event.target.value })} required /></label>
            </div>
            <label>Designation<input value={submission.designation} onChange={(event) => setSubmission({ ...submission, designation: event.target.value })} placeholder="Writer, student, researcher..." maxLength="160" required /></label>
            <label>Short bio<textarea value={submission.shortBio} onChange={(event) => setSubmission({ ...submission, shortBio: event.target.value })} maxLength="1000" placeholder="Tell us a little about yourself." required /></label>
            <div className="submission-uploads">
              <label className="submission-upload">
                <ImagePlus size={25} />
                <b>{submissionPicture ? submissionPicture.name : 'Upload your picture (optional)'}</b>
                <span>Optional · JPG, PNG, WebP, or GIF, up to 1 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setSubmissionPicture(event.target.files?.[0] || null)} />
              </label>
              <label className="submission-upload">
                <Feather size={25} />
                <b>{submissionManuscript ? submissionManuscript.name : 'Upload your manuscript'}</b>
                <span>PDF, DOC, or DOCX, up to 5 MB</span>
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setSubmissionManuscript(event.target.files?.[0] || null)} required />
              </label>
            </div>
            <p className="submission-note">By submitting, you confirm that this work is yours and that AiLit may review it for publication.</p>
            {submissionMessage && <p className={submissionSuccess ? 'submission-success' : 'form-message'} role="status">{submissionMessage}</p>}
            <button className="solid-button submission-button" type="submit" disabled={submissionSaving}>{submissionSaving ? 'Sending...' : 'Send submission'} <ArrowRight size={18} /></button>
          </form>
        </section>
      </main>
    );
  }

  if (view === 'story' && selectedStory) {
    return (
      <main className="reading-page">
        <header className="editor-header">
          <button className="brand" onClick={() => navigateTo('home', '/')}><img src="/ailit-logo.png" alt="" /><span>AiLit</span></button>
          <span>{selectedStory.type}</span>
          <button className="editor-exit" onClick={() => navigateTo('home', '/')}><X size={19} /> Close</button>
        </header>
        <article className={`reading-article ${selectedStory.type === 'Poem' ? 'reading-poem' : ''}`}>
          <div className="reading-heading">
            <span className="eyebrow">{selectedStory.type}</span>
            <h1>{selectedStory.title}</h1>
            <p>{selectedStory.introduction}</p>
            <div className="author">By {selectedStory.author}</div>
            <button className="reading-share" onClick={(event) => shareStory(selectedStory, event)}><Share2 size={17} /> Share this writing</button>
            {shareMessage && <span className="share-message" role="status">{shareMessage}</span>}
          </div>
          {selectedStory.image_url && <figure className="reading-cover"><img className="reading-image" src={selectedStory.image_url} alt={selectedStory.image_description || ''} />{selectedStory.image_description && <figcaption>{selectedStory.image_description}</figcaption>}</figure>}
          <div className="reading-body" dangerouslySetInnerHTML={{ __html: selectedStory.body }} />
          <footer className="article-colophon">
            <div className="article-colophon-mark">
              <img src="/ailit-logo.png" alt="" />
              <div><span>Published with</span><strong>AiLit Magazine</strong><p>Artificial Intelligence and Literature</p></div>
            </div>
            <button onClick={() => navigateTo('home', '/')}>Home <ArrowRight size={18} /></button>
          </footer>
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
          <button onClick={() => navigateTo('home', '/')}>Home</button>
          <button onClick={() => scrollTo('journal')}>New Writing</button>
          <button onClick={() => scrollTo('newsletter')}>Newsletter</button>
          <button onClick={() => navigateTo('submit', '/submit')}>Submit</button>
          <button onClick={() => navigateTo('about', '/about')}>About</button>
          {isNativeApp
            ? <button onClick={enablePushNotifications}>{pushState === 'registering' ? 'Enabling Alerts...' : pushState === 'enabled' ? 'New Writing Alerts On' : 'Enable New Writing Alerts'}</button>
            : <button onClick={installWebApp}>{isStandalone ? 'Open Installed App' : 'Install Web App'}</button>}
        </nav>
        <div className="header-actions">
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top"><div className="hero-grid"><div className="hero-copy"><p className="eyebrow">Literature, in conversation with Artificial Intelligence</p><h1>What does it mean<br />to <em>imagine</em> now?</h1><p className="hero-deck">AiLit explores fiction, poetry, criticism, and experiments from the shifting border between human language and Artificial Intelligence.</p></div><div className="cover-wrap"><div className="cover"><div className="cover-top"><span>AiLit</span></div><div className="orb"><div className="orb-line one" /><div className="orb-line two" /><div className="orb-line three" /><Asterisk className="orb-star" /></div><div className="cover-title">Creativity<br />& Artificial Intelligence</div><div className="cover-foot">Fiction · Poetry · Essays · Experiments</div></div></div></div></section>
      <section className="manifesto"><Asterisk size={24} /><p>We believe technology does not diminish literature's mystery. It gives the mystery <em>new rooms</em> to inhabit.</p></section>
      <AnalogueWriter />
      <section className="journal section" id="journal"><div className="section-heading"><div><h2>New writing</h2></div></div>{stories.length ? <div className="story-grid">{stories.map((story) => <article className="story story-link" key={story.id} tabIndex="0" role="link" onClick={() => openStory(story)} onKeyDown={(event) => { if (event.key === 'Enter') openStory(story); }}><div className="story-art rust">{story.image_url ? <img src={story.image_url} alt="" /> : <div className="glyph">“</div>}</div><div className="story-meta"><span>{story.type}</span></div><h3>{story.title}</h3><p>{story.introduction}</p><div className="author">By {story.author}</div><div className="story-actions"><button className="story-read" onClick={(event) => { event.stopPropagation(); openStory(story); }}>Read <ArrowRight size={18} /></button><button className="story-share" onClick={(event) => shareStory(story, event)} aria-label={`Share ${story.title}`}><Share2 size={17} /> Share</button></div></article>)}</div> : <div className="empty-writing"><p>New work will appear here.</p></div>}{shareMessage && <div className="share-toast" role="status">{shareMessage}</div>}</section>
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
      <footer><div className="footer-brand"><img src="/ailit-logo.png" alt="" /><span>AiLit</span><p>A literary magazine for language, imagination, and Artificial Intelligence.</p></div><div className="copyright">© 2026 AiLit Magazine <button onClick={() => navigateTo('privacy', '/privacy')}>Privacy</button><span>Made by humans, with questions.</span></div></footer>
      {newsletterPopupOpen && <div className="newsletter-popup-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeNewsletterPopup(); }}>
        <section className="newsletter-popup" role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-title">
          <button className="newsletter-popup-close" type="button" onClick={closeNewsletterPopup} aria-label="Close newsletter invitation"><X size={21} /></button>
          <img src="/ailit-logo.png" alt="" />
          <span className="eyebrow">The AiLit newsletter</span>
          <h2 id="newsletter-popup-title">Stay close to<br />new writing.</h2>
          <p>Receive a quiet note when a new article or poem enters the magazine.</p>
          <form onSubmit={subscribeToNewsletter}>
            <label className="sr-only" htmlFor="newsletter-popup-email">Email address</label>
            <input id="newsletter-popup-email" type="email" placeholder="Your email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required autoFocus />
            <button type="submit" disabled={newsletterSaving}>{newsletterSaving ? 'Joining...' : <>Subscribe <ArrowRight size={17} /></>}</button>
          </form>
          {newsletterMessage && <p className="newsletter-popup-message" role="status">{newsletterMessage}</p>}
          <small>Occasional letters only. Unsubscribe at any time.</small>
        </section>
      </div>}
      {installMessage && <div className="install-toast" role="status">{installMessage}</div>}

    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
