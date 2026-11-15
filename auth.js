(() => {
  const cfg = window.APP_CONFIG || {};
  const message = document.getElementById("authMessage");
  const loginPanel = document.getElementById("loginPanel");
  const privateContent = document.getElementById("privateContent");
  const logoutButton = document.getElementById("logoutButton");
  const form = document.getElementById("loginForm");
  const ready = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  
  if (!ready || !window.supabase) {
    message.textContent = "Setup needed: add your Supabase Project URL and anon public key in app-config.js.";
    return;
  }
  
  const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  
  async function isApproved(user) {
    const { data, error } = await client.from("couple_members")
      .select("user_id").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return !!data;
  }
  
  async function privateFile(path) {
    const { data, error } = await client.storage.from("couple-private").download(path);
    if (error) throw error;
    return data;
  }
  
  async function loadPrivateWorld() {
    
    message.textContent = "Opening your little world… 💗";
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    if (!(await isApproved(user))) {
      await client.auth.signOut();
      throw new Error("This account is not on our two-person guest list.");
    }
    
    const htmlBlob = await privateFile("site/site.html");
    const htmlText = await htmlBlob.text();
    const parsed = new DOMParser().parseFromString(htmlText, "text/html");
    const nodes = [...parsed.body.children].filter(node => node.tagName !== "SCRIPT");
    
    // Fetch every image/audio file from the private bucket using the signed-in session.
    const objectUrls = [];
    for (const node of nodes) {
      const assets = [];
      if (node.matches?.("[src]")) assets.push(node);
      assets.push(...(node.querySelectorAll ? node.querySelectorAll("[src]") : []));
      for (const el of assets) {
        const raw = el.getAttribute("src") || "";
        const path = raw.replace(/^\.?\//, "");
        if (!path.startsWith("images/") && !path.startsWith("music/")) continue;
        const blob = await privateFile(path);
        const url = URL.createObjectURL(blob);
        objectUrls.push(url);
        el.setAttribute("src", url);
      }
    }
    
    privateContent.replaceChildren(...nodes);
    privateContent.hidden = false;
    loginPanel.hidden = true;
    logoutButton.hidden = false;
    message.textContent = "";
    
    // Load the private website CSS after successful login.
    const cssBlob = await privateFile("site/style.css");
    const cssUrl = URL.createObjectURL(cssBlob);
    objectUrls.push(cssUrl);
    
    let privateStylesheet = document.getElementById("privateSiteStylesheet");
    
    if (!privateStylesheet) {
      privateStylesheet = document.createElement("link");
      privateStylesheet.id = "privateSiteStylesheet";
      privateStylesheet.rel = "stylesheet";
      document.head.appendChild(privateStylesheet);
    }
    
    privateStylesheet.href = cssUrl;
    
    // Load the original private application logic only after successful authentication.
    window.vasuSupabase = client;
    const appBlob = await privateFile("site/app.js");
    const appUrl = URL.createObjectURL(appBlob);
    objectUrls.push(appUrl);
    const script = document.createElement("script");
    script.src = appUrl;
    script.onload = () => { window.__vasuPrivateObjectUrls = objectUrls; };
    script.onerror = () => { message.textContent = "The private page script could not be loaded. Please refresh."; };
    document.body.appendChild(script);
  }
  
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = document.getElementById("loginButton");
    button.disabled = true;
    message.textContent = "Checking your password…";
    try {
      const { error } = await client.auth.signInWithPassword({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value
      });
      if (error) throw error;
      await loadPrivateWorld();
    } catch (error) {
      await client.auth.signOut();
      message.textContent = error.message || "Unable to sign in. Please try again.";
    } finally {
      button.disabled = false;
    }
  });
  
  logoutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    privateContent.replaceChildren();
    privateContent.hidden = true;
    loginPanel.hidden = false;
    logoutButton.hidden = true;
    (window.__vasuPrivateObjectUrls || []).forEach(URL.revokeObjectURL);
    window.__vasuPrivateObjectUrls = [];
    location.reload();
  });
  
  // Restore a valid existing session on refresh.
  client.auth.getSession().then(async ({ data }) => {
    if (data.session) {
      try { await loadPrivateWorld(); }
      catch (error) { message.textContent = error.message || "Please sign in again."; }
    }
  });
})();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}