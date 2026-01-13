let currentSubject='general',isLoading=false;

// Internal configuration (not exposed)
const _c = {
    e: atob('aHR0cHM6Ly9iaXR0ZXItY2hlcnJ5LWZlM2Euc2FydGhha3BhbmRleTU1MzU1LndvcmtlcnMuZGV2Lw=='),
    a: 'https://text.pollinations.ai/'
};

function toggleSidebar(){
    const s=document.getElementById('sidebar'),
          o=document.getElementById('sidebarOverlay'),
          i=document.getElementById('menuIcon');
    s.classList.toggle('open');
    o.classList.toggle('show');
    i.textContent=s.classList.contains('open')?'✕':'☰';
}

function changePage(page){
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset?.page===page||b.textContent.toLowerCase().includes(page)));
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===page+'Page'));
    if(window.innerWidth<1024)toggleSidebar();
}

function changeSubject(btn,subject){
    currentSubject=subject;
    document.querySelectorAll('.subject-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
}

// Internal search function
async function _ws(q) {
    try {
        const r = await fetch(_c.e + '?query=' + encodeURIComponent(q));
        if (!r.ok) return null;
        const data = await r.json();
        console.log('Search response:', data); // Debug log
        return data;
    } catch (e) {
        console.error('Search error:', e);
        return null;
    }
}

// Check if query needs web search
function _nws(q) {
    const kw = ['latest', 'current', 'today', 'news', 'recent', 'now', '2024', '2025', '2026', 'price', 'weather', 'score', 'update', 'trending'];
    const ql = q.toLowerCase();
    return kw.some(k => ql.includes(k));
}

async function submitQuestion(){
    const q=document.getElementById('questionInput').value.trim();
    if(!q||isLoading)return;
    isLoading=true;
    const btn=document.getElementById('submitBtn');
    btn.disabled=true;
    btn.textContent='Processing...';
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('resultCard').classList.add('hidden');
    document.getElementById('errorCard').classList.add('hidden');
    
    try{
        let systemContent = 'You are LearnFlow by Alexzo - an AI tutor. Subject: '+currentSubject+'. Use markdown, LaTeX for math ($...$), be helpful.';
        
        // Check if web search is needed
        if (_nws(q)) {
            const searchData = await _ws(q);
            // Handle different response formats
            const results = searchData?.results || searchData?.data || searchData?.organic_results || (Array.isArray(searchData) ? searchData : null);
            if (results && results.length > 0) {
                let searchContext = '\n\nWeb Search Results:\n';
                results.slice(0, 5).forEach((r, i) => {
                    const title = r.title || r.name || 'Result';
                    const desc = r.snippet || r.description || r.content || r.text || '';
                    const url = r.url || r.link || '';
                    searchContext += `${i+1}. ${title}: ${desc}${url ? ' ('+url+')' : ''}\n`;
                });
                systemContent += searchContext + '\nUse these search results to provide accurate, up-to-date information.';
            }
        }
        
        const r=await fetch(_c.a,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                messages:[
                    {role:'system',content:systemContent},
                    {role:'user',content:q}
                ],
                model:'openai',
                seed:Math.random()*1e6|0
            })
        });
        if(!r.ok)throw new Error('Server error: '+r.status);
        const t=await r.text();
        if(!t||t.trim()==='')throw new Error('Empty response from AI');
        document.getElementById('resultCard').classList.remove('hidden');
        const c=document.getElementById('resultContent');
        try{
            c.innerHTML=marked.parse(t);
        }catch(parseErr){
            c.textContent=t;
        }
        if(typeof renderMathInElement!=='undefined'){
            try{
                renderMathInElement(c,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
            }catch(mathErr){
                console.warn('Math render error:',mathErr);
            }
        }
        document.getElementById('questionInput').value='';
    }catch(e){
        console.error('Submit error:',e);
        document.getElementById('errorCard').classList.remove('hidden');
        document.getElementById('errorMessage').textContent=e.message||'Something went wrong. Please try again.';
    }finally{
        isLoading=false;
        btn.disabled=false;
        btn.textContent='Get Answer';
        document.getElementById('loadingState').classList.add('hidden');
    }
}

function copyResult(){
    const t=document.getElementById('resultContent').textContent;
    navigator.clipboard.writeText(t).then(()=>showToast('Copied!')).catch(()=>showToast('Failed to copy'));
}

function showAuthModal(){document.getElementById('authModal').classList.remove('hidden')}
function hideAuthModal(){document.getElementById('authModal').classList.add('hidden')}

function signIn(){
    localStorage.setItem('user','demo');
    updateAuth();
    hideAuthModal();
    showToast('Signed in!');
}

function updateAuth(){
    const u=localStorage.getItem('user'),b=document.getElementById('authBtn');
    if(u){
        b.innerHTML='<span class="avatar-placeholder">D</span><span class="sign-in-text">Demo</span>';
        b.onclick=()=>{localStorage.removeItem('user');updateAuth();showToast('Signed out')};
    }else{
        b.innerHTML='<span class="avatar-placeholder">👤</span><span class="sign-in-text">Sign In</span>';
        b.onclick=showAuthModal;
    }
}

function showToast(msg){
    const t=document.getElementById('toast');
    document.getElementById('toastMessage').textContent=msg;
    t.classList.remove('hidden');
    setTimeout(()=>t.classList.add('hidden'),3000);
}

document.addEventListener('DOMContentLoaded',()=>{
    updateAuth();
    document.getElementById('questionInput').addEventListener('keydown',e=>{
        if((e.ctrlKey||e.metaKey)&&e.key==='Enter')submitQuestion();
    });
});