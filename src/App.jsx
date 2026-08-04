import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&family=Permanent+Marker&family=Indie+Flower&display=swap');`;

const C = {
  bg:"#fdf6ec", paper:"#fffbe9", pink:"#ffb3c6", mint:"#b5ead7",
  lav:"#c9b8f7", yellow:"#ffe066", blue:"#a8d8ea", peach:"#ffcba4",
  text:"#2c1a0e", muted:"#7a6652", border:"#2c1a0e", white:"#fffdf8",
  green:"#4caf8f", purple:"#7b5ea7", red:"#e05c5c",
};

const GROQ_KEY = "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";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const LS = {
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

const MOODS=[{val:"happy",label:"Happy 😊",color:"#ffe066"},{val:"stressed",label:"Stressed 😰",color:"#ffcba4"},{val:"anxious",label:"Anxious 😟",color:"#c9b8f7"},{val:"sad",label:"Sad 😢",color:"#a8d8ea"},{val:"lonely",label:"Lonely 🌧️",color:"#ffb3c6"},{val:"motivated",label:"Motivated 🌟",color:"#b5ead7"},{val:"burntout",label:"Burnt out 🕯️",color:"#e0c8b0"}];
const QUOTES=["You're doing better than you think. 🌸","One small step is still a step forward. 🐾","Rest is productive too. 🛌","You survived every hard day so far. 💛","It's okay to not be okay. 🌧️","Progress, not perfection. 🌱","You are enough, just as you are. ✨","Be gentle with yourself today. 🍵","Every day you try is a win. 🏅","Breathe. You've got this. 🌬️"];
const CHALLENGES=[{id:1,emoji:"💧",title:"Drink a glass of water",pts:10},{id:2,emoji:"🧘",title:"Breathe slowly for 1 minute",pts:15},{id:3,emoji:"🚶",title:"Go outside for 5 minutes",pts:20},{id:4,emoji:"📝",title:"Write one thing you're grateful for",pts:15},{id:5,emoji:"🎨",title:"Doodle something fun",pts:10},{id:6,emoji:"🧹",title:"Tidy up your desk",pts:10},{id:7,emoji:"🤸",title:"Stretch for 2 minutes",pts:15},{id:8,emoji:"😴",title:"Close your eyes for 60 seconds",pts:10}];
const BADGES_LIST=[{id:1,emoji:"⭐",title:"Consistency Star",desc:"7 day streak!"},{id:2,emoji:"🌱",title:"Positive Growth",desc:"Logged mood 5 days"},{id:3,emoji:"🎨",title:"Creative Thinker",desc:"Used Scribble Canvas"},{id:4,emoji:"💪",title:"Wellness Warrior",desc:"10 challenges done"},{id:5,emoji:"🫂",title:"You Survived Today",desc:"Just showing up counts"}];
const ALL_FEATURES=[{id:"chat",label:"AI Buddy Chat 💬"},{id:"challenges",label:"Wellness Challenges 🌿"},{id:"gratitude",label:"Gratitude Corner 🌸"},{id:"scribble",label:"Scribble Canvas 🎨"},{id:"comfort",label:"Comfort Room 🕯️"},{id:"memory",label:"Memory Jar 🫙"},{id:"games",label:"Relaxation Games 🎮"},{id:"badges",label:"Badge Collection 🏅"}];

// ── GAME DATA ──────────────────────────────────────────────────────────────
const RIDDLES=[{q:"I have hands but can't clap. What am I?",opts:["Clock","Glove","Puppet","Robot"],a:0},{q:"The more you take, the more you leave behind. What am I?",opts:["Breath","Footsteps","Memories","Time"],a:1},{q:"What has keys but no locks, space but no room?",opts:["Piano","Keyboard","Garden","Map"],a:1},{q:"What gets wetter the more it dries?",opts:["Rain","Sponge","Towel","River"],a:2},{q:"I speak without a mouth and hear without ears. What am I?",opts:["Echo","Radio","Mirror","Shadow"],a:0},{q:"What can travel the world while staying in a corner?",opts:["Map","Stamp","Sun","Moon"],a:1},{q:"The more you share me, the more you have. What am I?",opts:["Money","Food","Happiness","Water"],a:2},{q:"What breaks yet never falls, and falls yet never breaks?",opts:["Wave","Day & Night","Glass","Heart"],a:1},{q:"Light as a feather but impossible to hold for 2 minutes?",opts:["Bubble","Breath","Cloud","Smoke"],a:1},{q:"What has cities but no houses, mountains but no trees?",opts:["Dream","Map","Painting","Globe"],a:1}];
const TRIVIA=[{q:"Which planet is the Red Planet?",opts:["Venus","Mars","Jupiter","Saturn"],a:1},{q:"How many colors in a rainbow?",opts:["5","6","7","8"],a:2},{q:"Largest ocean on Earth?",opts:["Atlantic","Indian","Arctic","Pacific"],a:3},{q:"Man's best friend?",opts:["Cat","Horse","Dog","Rabbit"],a:2},{q:"Sides on a hexagon?",opts:["5","6","7","8"],a:1},{q:"Fastest land animal?",opts:["Lion","Horse","Cheetah","Leopard"],a:2},{q:"King of fruits?",opts:["Mango","Jackfruit","Durian","Banana"],a:0},{q:"Bones in adult human body?",opts:["186","196","206","216"],a:2},{q:"Smallest planet?",opts:["Earth","Mercury","Mars","Venus"],a:1},{q:"Plants absorb which gas?",opts:["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"],a:2}];
const WYR=[{q:"Would you rather live in...",opts:["A treehouse 🌳","By the beach 🌊","On a mountain ⛰️","A cozy city 🏙️"],a:-1},{q:"Superpower — would you rather...",opts:["Fly ✈️","Breathe underwater 🌊","Be invisible 👻","Read minds 🧠"],a:-1},{q:"For breakfast forever...",opts:["Pancakes 🥞","Waffles 🧇","Omelette 🍳","Smoothie bowl 🍓"],a:-1},{q:"Magical pet — would you rather have...",opts:["Dragon 🐉","Unicorn 🦄","Phoenix 🔥","Griffin 🦅"],a:-1},{q:"Would you rather always...",opts:["Speak in rhymes 🎵","Sing instead of talk 🎤","Talk in slow motion ⏳","Only whisper 🤫"],a:-1}];

// ── NEW GAME DATA ──────────────────────────────────────────────────────────
const WORD_SCRAMBLES = [
  {scrambled:"PPYAH",answer:"HAPPY",hint:"How you feel on a good day 😊"},
  {scrambled:"SERAP",answer:"SPARE",hint:"An extra one you keep"},
  {scrambled:"ICGAM",answer:"MAGIC",hint:"What wizards do ✨"},
  {scrambled:"LFWEO",answer:"FLOWE",hint:"Something that rhymes with 'slower'... it's also R at the end: FLOWER"},
  {scrambled:"USNIC",answer:"MUSIC",hint:"Makes you want to dance 🎵"},
  {scrambled:"OCEAN",answer:"OCEAN",hint:"A giant body of water 🌊"},
  {scrambled:"RABNI",answer:"BRAIN",hint:"Your thinking organ 🧠"},
  {scrambled:"MLSIE",answer:"SMILE",hint:"What your face does when you're happy 😄"},
  {scrambled:"TERWA",answer:"WATER",hint:"H2O 💧"},
  {scrambled:"PLEAP",answer:"APPLE",hint:"A fruit that keeps the doctor away 🍎"},
];
// Override scrambled with truly scrambled versions
const SCRAMBLE_DATA = [
  {scrambled:"PPYAH",answer:"HAPPY",hint:"How you feel on a good day 😊"},
  {scrambled:"CAGIM",answer:"MAGIC",hint:"What wizards do ✨"},
  {scrambled:"ISCUM",answer:"MUSIC",hint:"Makes you want to dance 🎵"},
  {scrambled:"NCAOE",answer:"OCEAN",hint:"A giant body of water 🌊"},
  {scrambled:"NRBIA",answer:"BRAIN",hint:"Your thinking organ 🧠"},
  {scrambled:"LSEMI",answer:"SMILE",hint:"What your face does when you're happy 😄"},
  {scrambled:"RTEWA",answer:"WATER",hint:"H2O 💧"},
  {scrambled:"PPLAE",answer:"APPLE",hint:"A fruit that keeps the doctor away 🍎"},
  {scrambled:"WFLORE",answer:"FLOWER",hint:"Grows in a garden 🌸"},
  {scrambled:"SRTSA",answer:"STARS",hint:"Tiny lights in the night sky ✨"},
];

const EMOJI_PUZZLES = [
  {emojis:"🎸 + 🌟",answer:"ROCKSTAR",hint:"Famous performer"},
  {emojis:"🌊 + 🏄",answer:"SURFING",hint:"Beach sport"},
  {emojis:"🌙 + 🌟",answer:"MOONSTAR",hint:"Celestial bodies"},
  {emojis:"🍕 + ❤️",answer:"PIZZA LOVE",hint:"Everyone's favourite"},
  {emojis:"🐟 + 🏠",answer:"FISH TANK",hint:"Where pet fish live"},
  {emojis:"📚 + 🐛",answer:"BOOKWORM",hint:"A big reader"},
  {emojis:"🌈 + 🦄",answer:"RAINBOW UNICORN",hint:"Magical combo"},
  {emojis:"🎵 + 📖",answer:"SONGBOOK",hint:"Lyrics collection"},
];

const MEMORY_TILES = ["🌸","🌙","⭐","🎨","🎵","🌈","🦋","🌺","🍀","💎","🔮","🎭"];

// ── Groq AI Helper ────────────────────────────────────────────────────────
async function callGroq(messages) {
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`},
      body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 400, temperature: 0.85 })
    });
    const data = await res.json();
    if (data.error) return { error: data.error.message, text: null };
    return { error: null, text: data.choices?.[0]?.message?.content || "" };
  } catch (e) { return { error: e.message, text: null }; }
}

// ── Base UI Components ─────────────────────────────────────────────────────
function Card({children,color,style={},onClick}){
  return <div onClick={onClick} style={{background:color||C.paper,border:`2.5px solid ${C.border}`,borderRadius:"16px 5px 16px 5px",boxShadow:`4px 4px 0 ${C.border}`,padding:"18px 20px",cursor:onClick?"pointer":"default",transition:"transform 0.15s,box-shadow 0.15s",...style}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`6px 6px 0 ${C.border}`;}}}
    onMouseLeave={e=>{if(onClick){e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`4px 4px 0 ${C.border}`;}}}>
    {children}
  </div>;
}
function Sticky({children,color,rotate=0,style={}}){
  return <div style={{background:color||C.yellow,border:"1.5px solid rgba(0,0,0,0.13)",borderRadius:3,boxShadow:"3px 4px 10px rgba(0,0,0,0.13)",padding:"12px 16px",fontFamily:"'Caveat', cursive",fontSize:"1.1rem",color:C.text,transform:`rotate(${rotate}deg)`,display:"inline-block",...style}}>{children}</div>;
}
function Btn({children,onClick,color,style={},small,disabled,pulse}){
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"#ddd":(color||C.lav),border:`2px solid ${disabled?"#aaa":C.border}`,borderRadius:"12px 4px 12px 4px",boxShadow:disabled?"none":`3px 3px 0 ${C.border}`,padding:small?"6px 14px":"10px 22px",fontFamily:"'Caveat', cursive",fontSize:small?"1rem":"1.15rem",fontWeight:700,color:disabled?"#888":C.text,cursor:disabled?"not-allowed":"pointer",transition:"transform 0.12s",animation:pulse?"pulse 1.5s infinite":undefined,...style}}
    onMouseEnter={e=>!disabled&&(e.currentTarget.style.transform="translateY(-2px)")}
    onMouseLeave={e=>!disabled&&(e.currentTarget.style.transform="none")}>{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",style={},onKeyDown}){
  return <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} style={{padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:"12px 4px 12px 4px",fontFamily:"'Patrick Hand', cursive",fontSize:"1rem",color:C.text,background:C.white,outline:"none",width:"100%",boxSizing:"border-box",...style}}/>;
}
function ProgressBar({value,max,color}){
  return <div style={{background:"rgba(0,0,0,0.1)",borderRadius:99,height:10,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
    <div style={{height:"100%",width:`${Math.min(100,(value/max)*100)}%`,background:color||C.mint,borderRadius:99,transition:"width 0.4s ease"}}/>
  </div>;
}

const H1=({children,style={}})=><h1 style={{fontFamily:"'Permanent Marker', cursive",color:C.text,margin:0,...style}}>{children}</h1>;
const H2=({children,style={}})=><h2 style={{fontFamily:"'Caveat', cursive",fontSize:"1.9rem",color:C.text,margin:0,...style}}>{children}</h2>;
const H3=({children,style={}})=><h3 style={{fontFamily:"'Caveat', cursive",fontSize:"1.4rem",color:C.text,margin:0,...style}}>{children}</h3>;
const Txt=({children,style={}})=><p style={{fontFamily:"'Patrick Hand', cursive",fontSize:"1.05rem",color:C.text,margin:0,...style}}>{children}</p>;

// ── Locked Feature ──────────────────────────────────────────────────────────
function LockedFeature({featureLabel,connections,username}){
  const [msg,setMsg]=useState("");const [sent,setSent]=useState(false);
  const aLabel=connections.length>0?({teacher:"Teacher",parent:"Parent",guardian:"Guardian"}[connections[0].adminType]||"Admin"):"Admin";
  function send(){
    if(!msg.trim()||!connections[0])return;
    const k=`featureReqs_${connections[0].adminUsername}`;
    LS.set(k,[...LS.get(k,[]),{from:username,feature:featureLabel,message:msg.trim(),time:new Date().toLocaleString()}]);
    setSent(true);
  }
  return(
    <div style={{textAlign:"center",padding:"40px 20px",maxWidth:420,margin:"0 auto"}}>
      <div style={{fontSize:"4rem",marginBottom:12}}>🔒</div>
      <H2 style={{marginBottom:8}}>{featureLabel}</H2>
      <Txt style={{color:C.muted,marginBottom:24}}>Your {aLabel} hasn't enabled this yet. Send them a request!</Txt>
      {sent?<Sticky color={C.mint} style={{fontSize:"1.1rem"}}>✅ Request sent! Your {aLabel} will see it soon 📨</Sticky>:(
        <Card color={C.paper} style={{textAlign:"left"}}>
          <H3 style={{marginBottom:10}}>Request to your {aLabel} 📨</H3>
          <Txt style={{color:C.muted,marginBottom:12}}>Tell them why you'd like access:</Txt>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder={`I'd love access to ${featureLabel} because...`} rows={4} style={{width:"100%",boxSizing:"border-box",padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:"10px 4px 10px 4px",fontFamily:"'Patrick Hand', cursive",fontSize:"1rem",color:C.text,background:C.white,outline:"none",resize:"vertical",marginBottom:12}}/>
          <Btn onClick={send} color={C.mint} style={{width:"100%"}}>✉️ Send Request</Btn>
        </Card>
      )}
    </div>
  );
}

// ── Landing ──────────────────────────────────────────────────────────────────
function LandingPage({onLogin,onSignup}){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden"}}>
      {["#ffb3c6","#b5ead7","#c9b8f7","#ffe066","#a8d8ea"].map((col,i)=>(
        <div key={i} style={{position:"fixed",width:120+i*50,height:120+i*50,borderRadius:"60% 40% 50% 70%",background:col,opacity:0.18,top:[10,55,75,5,38][i]+"%",left:[5,78,12,52,32][i]+"%",pointerEvents:"none",zIndex:0}}/>
      ))}
      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480}}>
        <div style={{fontSize:"4rem",marginBottom:8}}>🌸</div>
        <H1 style={{fontSize:"3rem",marginBottom:8}}>Student Buddy</H1>
        <Txt style={{color:C.muted,marginBottom:28,fontSize:"1.15rem"}}>Your cozy corner for feeling better 🌿</Txt>
        <Sticky color={C.yellow} rotate={-2} style={{marginBottom:32,display:"block",textAlign:"left",fontSize:"1.1rem"}}>✨ "{q}"</Sticky>
        <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn onClick={onLogin} color={C.mint}>Login 🔑</Btn>
          <Btn onClick={onSignup} color={C.pink}>Sign Up 🌸</Btn>
        </div>
        <Txt style={{marginTop:24,color:C.muted,fontSize:"0.95rem"}}>A safe, peaceful space — just for you 💛</Txt>
      </div>
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function AuthPage({mode,onSuccess,onToggle}){
  const [username,setUsername]=useState("");const [name,setName]=useState("");const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");const [role,setRole]=useState("student");const [adminType,setAdminType]=useState("teacher");const [err,setErr]=useState("");
  const sel={marginTop:4,width:"100%",padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:"12px 4px 12px 4px",fontFamily:"'Patrick Hand', cursive",fontSize:"1rem",color:C.text,background:C.white,outline:"none"};
  const lbl={fontFamily:"'Patrick Hand', cursive",color:C.text,fontSize:"1rem",display:"flex",flexDirection:"column",gap:4};
  function handle(){
    const users=LS.get("sb_users",{});
    if(mode==="signup"){
      if(!username.trim()||!name.trim()||!email.trim()||!pass.trim()){setErr("Please fill all fields 🌸");return;}
      if(users[username.trim()]){setErr("Username already taken! Try another 😊");return;}
      const u={username:username.trim(),name:name.trim(),email,pass,role,adminType:role==="admin"?adminType:null};
      users[username.trim()]=u;LS.set("sb_users",users);
      LS.set("sb_session",u.username);
      onSuccess(u);
    }else{
      if(!username.trim()||!pass.trim()){setErr("Fill in your details 🌸");return;}
      const u=users[username.trim()];
      if(!u){setErr("Username not found! Sign up first 😊");return;}
      if(u.pass!==pass){setErr("Wrong password! Try again 🌿");return;}
      LS.set("sb_session",u.username);
      onSuccess(u);
    }
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <Card color={C.paper} style={{width:"100%",maxWidth:400}}>
        <H2 style={{textAlign:"center",marginBottom:20}}>{mode==="login"?"Welcome back 🌿":"Join us! 🌸"}</H2>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <label style={lbl}>Username {mode==="signup"&&<span style={{color:C.muted,fontSize:"0.85rem"}}>(must be unique)</span>}<Inp value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username"/></label>
          {mode==="signup"&&<><label style={lbl}>Display Name<Inp value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Arya"/></label><label style={lbl}>Email<Inp value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"/></label></>}
          <label style={lbl}>Password<Inp value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••" type="password"/></label>
          {mode==="signup"&&<label style={lbl}>I am a...<select value={role} onChange={e=>setRole(e.target.value)} style={sel}><option value="student">Student 🎒</option><option value="admin">Admin (Teacher / Parent / Guardian)</option></select></label>}
          {mode==="signup"&&role==="admin"&&<label style={lbl}>Admin type<select value={adminType} onChange={e=>setAdminType(e.target.value)} style={sel}><option value="teacher">Teacher 📚</option><option value="parent">Parent 🏠</option><option value="guardian">Guardian 🛡️</option></select></label>}
          {err&&<Txt style={{color:"#c0392b"}}>{err}</Txt>}
          <Btn onClick={handle} color={C.mint} style={{width:"100%",marginTop:4}}>{mode==="login"?"Let me in 🚪":"Create my space 🌱"}</Btn>
        </div>
        <Txt style={{textAlign:"center",marginTop:14,color:C.muted,fontSize:"0.95rem"}}>
          {mode==="login"?"New here?":"Already have a space?"}{" "}
          <span onClick={onToggle} style={{color:"#7b5ea7",cursor:"pointer",textDecoration:"underline",fontFamily:"'Patrick Hand', cursive"}}>{mode==="login"?"Sign up 🌸":"Login 🔑"}</span>
        </Txt>
      </Card>
    </div>
  );
}

// ── Mood Widget ───────────────────────────────────────────────────────────────
function MoodWidget({moodLog,onMoodLog}){
  const [sel,setSel]=useState(null);
  function log(m){setSel(m.val);onMoodLog({mood:m.val,label:m.label,time:new Date().toLocaleTimeString(),color:m.color});}
  return(
    <Card color={C.paper} style={{marginBottom:20}}>
      <H3 style={{marginBottom:12}}>How are you feeling? 🌈</H3>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
        {MOODS.map(m=><button key={m.val} onClick={()=>log(m)} style={{background:m.color,border:sel===m.val?`2.5px solid ${C.border}`:"2px solid rgba(0,0,0,0.12)",borderRadius:20,padding:"7px 16px",fontFamily:"'Patrick Hand', cursive",fontSize:"1rem",color:C.text,cursor:"pointer",boxShadow:sel===m.val?`3px 3px 0 ${C.border}`:"none",transition:"all 0.12s"}}>{m.label}</button>)}
      </div>
      {moodLog.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{moodLog.slice(0,5).map((l,i)=><Sticky key={i} color={l.color} rotate={(i%3-1)*2} style={{fontSize:"0.85rem",padding:"7px 12px"}}>{l.label}<br/><span style={{opacity:0.55,fontSize:"0.75rem"}}>{l.time}</span></Sticky>)}</div>}
    </Card>
  );
}

// ── AI Chat ───────────────────────────────────────────────────────────────────
async function generateAdminTasks(username, fullHistory, gratitude, memories, doneChallengeNames, connections) {
  if (!connections || connections.length === 0) return;
  const userMessages = fullHistory.filter(m => m.from === "user");
  if (userMessages.length < 2) return;
  const adminLabel = {teacher:"teacher",parent:"parent",guardian:"guardian"}[connections[0]?.adminType] || "guardian";
  const chatText = fullHistory.slice(-40).map(m=>(m.from==="user"?"Student":"Buddy")+": "+m.text).join("\n");
  const gratText = gratitude.slice(0,10).map(g=>g.text).join(" | ") || "none";
  const memText = memories.slice(0,10).map(m=>m.text).join(" | ") || "none";
  const chalText = doneChallengeNames.join(", ") || "none";
  const system = `You are a child wellbeing advisor. Read the student's full conversation with their wellness buddy, their gratitude entries, memory jar, and completed activities. Deeply understand what the student is going through emotionally.\n\nThen create a JSON to-do list for their ${adminLabel} — practical things the ${adminLabel} can DO to help the student indirectly. The ${adminLabel} must never know exactly what the student said.\n\nRules:\n- 4 tasks, each specific and actionable for the ${adminLabel}\n- Address the student's REAL emotional situation without revealing it\n- Tasks are things the ${adminLabel} does, not the student\n- Warm, positive framing — no alarm language\n- Return ONLY a raw JSON array, no markdown, no explanation:\n[{"emoji":"🌿","title":"...","desc":"...","why":"..."}]`;
  const user = `Full buddy chat:\n${chatText}\n\nGratitude: ${gratText}\nMemory jar: ${memText}\nWellness done: ${chalText}\n\nGenerate 4 to-do tasks for the ${adminLabel}.`;
  const result = await callGroq([{role:"system",content:system},{role:"user",content:user}]);
  if (result.error || !result.text) return;
  try {
    const cleaned = result.text.replace(/```json|```/g,"").trim();
    const tasks = JSON.parse(cleaned);
    if (!Array.isArray(tasks)) return;
    connections.forEach(conn => {
      LS.set(`adminTasks_${conn.adminUsername}_${username}`, {tasks,updatedAt: new Date().toLocaleString(),studentUsername: username});
    });
  } catch { }
}

function AIChatPage({username, chatHistory, setChatHistory, connections, gratitudeEntries, memories}){
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const BUDDY_SYSTEM = `You are "Buddy" — a warm, caring emotional companion for school students. You're like a kind, emotionally intelligent older friend — NOT a therapist, NOT a bot.\n\nPersonality:\n- Warm, genuine, casual, never preachy\n- Soft emojis (🌸 💛 🌿 ✨) — 1-2 per message only\n- Short replies (2-4 sentences) unless they need more\n- NEVER bullet points or formal lists\n\nGoals:\n1. Make student feel heard, seen and safe — always first\n2. When they share something hard, acknowledge warmly THEN ask one gentle question to understand more\n3. Gently explore their school/home life naturally — "How's school lately?" "How are things at home?"\n4. Celebrate wins enthusiastically\n5. If very distressed, gently suggest talking to a trusted adult\n6. NEVER generic advice — always respond to what THEY said\n7. End with a soft question to keep them talking\n\nUse the full conversation history to show you were listening.`;
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[chatHistory]);
  async function send(){
    if(!input.trim()||loading)return;
    const userMsg=input.trim();setInput("");
    const newHist=[...chatHistory,{from:"user",text:userMsg}];
    setChatHistory(newHist);setLoading(true);
    const messages=[{role:"system",content:BUDDY_SYSTEM},...newHist.map(m=>({role:m.from==="user"?"user":"assistant",content:m.text}))];
    const result=await callGroq(messages);
    const finalHist=result.error?[...newHist,{from:"buddy",text:"I'm here for you 🌸 (tiny tech hiccup, try again?)"}]:[...newHist,{from:"buddy",text:result.text}];
    setChatHistory(finalHist);setLoading(false);
    const todayKey=`challenges_${username}_${new Date().toDateString()}`;
    const doneChallenges=LS.get(todayKey,[]);
    const doneNames=doneChallenges.map(id=>CHALLENGES.find(c=>c.id===id)?.title||"").filter(Boolean);
    generateAdminTasks(username,finalHist,gratitudeEntries||[],memories||[],doneNames,connections||[]);
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <H2 style={{marginBottom:4}}>AI Buddy Chat 💬</H2>
      <Txt style={{color:C.muted,marginBottom:8}}>Talk to me — I'm always here 🌸</Txt>
      <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:12,maxHeight:420,paddingRight:4,minHeight:200}}>
        {chatHistory.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
            <div style={{background:m.from==="user"?C.lav:C.mint,border:`2px solid ${C.border}`,borderRadius:m.from==="user"?"18px 4px 18px 18px":"4px 18px 18px 18px",padding:"10px 16px",maxWidth:"78%",fontFamily:"'Indie Flower', cursive",fontSize:"1.05rem",color:C.text,boxShadow:"2px 2px 0 rgba(0,0,0,0.07)"}}>
              {m.from==="buddy"&&<span style={{fontSize:"0.8rem",opacity:0.5,display:"block",marginBottom:2,fontFamily:"'Patrick Hand', cursive"}}>🌸 Buddy</span>}
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<Txt style={{color:C.muted,padding:"8px 16px",fontFamily:"'Indie Flower', cursive"}}>Buddy is typing... 🌸</Txt>}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Inp value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Tell me how you're feeling..." style={{flex:1}}/>
        <Btn onClick={send} color={C.pink} style={{flexShrink:0}} disabled={loading}>Send 💌</Btn>
      </div>
    </div>
  );
}

// ── Challenges ────────────────────────────────────────────────────────────────
function ChallengesPage({username}){
  const todayKey=`challenges_${username}_${new Date().toDateString()}`;
  const [done,setDone]=useState(()=>LS.get(todayKey,[]));
  function markDone(id){
    if(done.includes(id))return;
    const updated=[...done,id];setDone(updated);LS.set(todayKey,updated);
  }
  const pts=done.reduce((s,id)=>s+(CHALLENGES.find(c=>c.id===id)?.pts||0),0);
  const pct=Math.round((done.length/CHALLENGES.length)*100);
  return(
    <div>
      <H2 style={{marginBottom:4}}>Daily Wellness Challenges 🌿</H2>
      <Txt style={{color:C.muted,marginBottom:14}}>Small actions, big impact. Check them off!</Txt>
      <div style={{display:"flex",gap:14,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <Sticky color={C.yellow} rotate={-1}>⭐ {pts} points</Sticky>
        <Sticky color={C.mint} rotate={-2}>{done.length}/{CHALLENGES.length} today</Sticky>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Daily progress</Txt>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>{pct}%</Txt>
        </div>
        <ProgressBar value={done.length} max={CHALLENGES.length} color={C.green}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
        {CHALLENGES.map(c=>(
          <Card key={c.id} color={done.includes(c.id)?C.mint:C.paper} onClick={()=>markDone(c.id)} style={{position:"relative",overflow:"hidden"}}>
            {done.includes(c.id)&&<div style={{position:"absolute",top:8,right:10,fontSize:"1.3rem"}}>✅</div>}
            <div style={{fontSize:"2rem",marginBottom:6}}>{c.emoji}</div>
            <H3 style={{marginBottom:6}}>{c.title}</H3>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Txt style={{color:C.muted,fontSize:"0.9rem"}}>+{c.pts} pts</Txt>
              {!done.includes(c.id)&&<Btn small color={C.lav}>Done!</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Scribble ──────────────────────────────────────────────────────────────────
function ScribbleCanvas(){
  const canvasRef=useRef(null);const [drawing,setDrawing]=useState(false);const [color,setColor]=useState("#2c1a0e");const [size,setSize]=useState(5);const [tool,setTool]=useState("pen");const lastPos=useRef(null);
  function getPos(e){const r=canvasRef.current.getBoundingClientRect();if(e.touches)return{x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top};return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function start(e){setDrawing(true);lastPos.current=getPos(e);}
  function draw(e){if(!drawing)return;const ctx=canvasRef.current.getContext("2d"),p=getPos(e);ctx.beginPath();ctx.moveTo(lastPos.current.x,lastPos.current.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle=tool==="eraser"?"#fffdf5":color;ctx.lineWidth=tool==="eraser"?size*3:size;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();lastPos.current=p;}
  function stop(){setDrawing(false);lastPos.current=null;}
  function clear(){const ctx=canvasRef.current.getContext("2d");ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);}
  function save(){const link=document.createElement("a");link.download="my-doodle.png";link.href=canvasRef.current.toDataURL();link.click();}
  const colors=["#2c1a0e","#e05c5c","#7b5ea7","#4caf8f","#f0a500","#3a86d4","#e91e8c","#fffdf8","#ff9800","#00bcd4"];
  return(
    <div>
      <H2 style={{marginBottom:4}}>Scribble Canvas 🎨</H2>
      <Txt style={{color:C.muted,marginBottom:14}}>Draw, doodle, relax — no rules here!</Txt>
      <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {colors.map(col=><button key={col} onClick={()=>{setColor(col);setTool("pen");}} style={{width:28,height:28,borderRadius:"50%",background:col,border:(color===col&&tool==="pen")?`3px solid ${C.border}`:"2px solid rgba(0,0,0,0.2)",cursor:"pointer"}}/>)}
        <div style={{display:"flex",gap:6}}>
          <Btn small color={tool==="pen"?C.lav:C.paper} onClick={()=>setTool("pen")}>✏️ Pen</Btn>
          <Btn small color={tool==="eraser"?C.lav:C.paper} onClick={()=>setTool("eraser")}>🧹 Eraser</Btn>
        </div>
        <label style={{fontFamily:"'Patrick Hand', cursive",color:C.text,display:"flex",alignItems:"center",gap:6}}>Size:<input type="range" min={2} max={24} value={size} onChange={e=>setSize(+e.target.value)} style={{width:80}}/><span style={{minWidth:20}}>{size}</span></label>
        <Btn small color={C.pink} onClick={clear}>Clear 🗑️</Btn>
        <Btn small color={C.mint} onClick={save}>Save 💾</Btn>
      </div>
      <canvas ref={canvasRef} width={700} height={360}
        style={{border:`2.5px solid ${C.border}`,borderRadius:"12px 4px 12px 4px",background:"#fffdf5",cursor:tool==="eraser"?"cell":"crosshair",touchAction:"none",maxWidth:"100%",boxShadow:`4px 4px 0 ${C.border}`}}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={e=>{e.preventDefault();start(e);}} onTouchMove={e=>{e.preventDefault();draw(e);}} onTouchEnd={stop}/>
    </div>
  );
}

// ── Gratitude ─────────────────────────────────────────────────────────────────
function GratitudePage({username,gratitudeEntries,setGratitudeEntries}){
  const [val,setVal]=useState("");
  const getCd=()=>{const cd=LS.get(`gcd_${username}`,null);if(!cd)return null;if(Date.now()-cd>=86400000){LS.set(`gcd_${username}`,null);return null;}return cd;};
  const [cooldown,setCooldown]=useState(getCd);
  useEffect(()=>{const t=setInterval(()=>{if(getCd()===null&&cooldown!==null)setCooldown(null);},60000);return()=>clearInterval(t);},[]);
  function timeLeft(){if(!cooldown)return null;const rem=86400000-(Date.now()-cooldown);if(rem<=0){LS.set(`gcd_${username}`,null);setCooldown(null);return null;}return`${Math.floor(rem/3600000)}h ${Math.floor((rem%3600000)/60000)}m`;}
  function add(){
    if(!val.trim()||cooldown)return;
    const entry={text:val.trim(),date:new Date().toLocaleDateString("en",{month:"short",day:"numeric"})};
    const updated=[entry,...gratitudeEntries];setGratitudeEntries(updated);LS.set(`gratitude_${username}`,updated);
    const now=Date.now();LS.set(`gcd_${username}`,now);setCooldown(now);setVal("");
  }
  const tLeft=timeLeft();
  const cols=[C.yellow,C.pink,C.mint,C.lav,C.blue,C.peach];
  return(
    <div>
      <H2 style={{marginBottom:4}}>Gratitude Corner 🌸</H2>
      <Txt style={{color:C.muted,marginBottom:16}}>One good thing today? Write it down.</Txt>
      {tLeft?(
        <Card color={C.peach} style={{marginBottom:20,maxWidth:400}}>
          <Txt style={{fontSize:"1.05rem"}}>🌻 You've already added today's gratitude!</Txt>
          <Txt style={{color:C.muted,marginTop:6}}>Come back in <b>{tLeft}</b> — see you tomorrow! 💛</Txt>
        </Card>
      ):(
        <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}>
          <Inp value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Today I'm grateful for..." style={{flex:1,minWidth:200}}/>
          <Btn onClick={add} color={C.mint}>Add 🌿</Btn>
        </div>
      )}
      <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
        {gratitudeEntries.map((e,i)=>(
          <Sticky key={i} color={cols[i%cols.length]} rotate={(i%5-2)*2.5} style={{minWidth:140,maxWidth:200}}>
            <div style={{fontSize:"0.78rem",opacity:0.55,marginBottom:4}}>{e.date}</div>{e.text}
          </Sticky>
        ))}
      </div>
    </div>
  );
}

// ── Comfort Room ──────────────────────────────────────────────────────────────
function ComfortRoomPage(){
  const [playing,setPlaying]=useState(null);const [sz,setSz]=useState(80);const [phase,setPhase]=useState("inhale");
  const phRef=useRef("inhale"),szRef=useRef(80);
  useEffect(()=>{
    const t=setInterval(()=>{
      if(phRef.current==="inhale"){szRef.current=Math.min(szRef.current+3,140);if(szRef.current>=140)phRef.current="hold";}
      else if(phRef.current==="hold"){setTimeout(()=>{phRef.current="exhale";},1200);}
      else{szRef.current=Math.max(szRef.current-3,80);if(szRef.current<=80)phRef.current="inhale";}
      setSz(szRef.current);setPhase(phRef.current);
    },80);
    return()=>clearInterval(t);
  },[]);
  const sounds=[{id:"rain",emoji:"🌧️",label:"Rain"},{id:"lofi",emoji:"🎵",label:"Lo-fi"},{id:"birds",emoji:"🐦",label:"Birds"},{id:"ocean",emoji:"🌊",label:"Ocean"}];
  return(
    <div style={{textAlign:"center"}}>
      <H2 style={{marginBottom:4}}>Comfort Room 🕯️</H2>
      <Txt style={{color:C.muted,marginBottom:24}}>A peaceful space just for you. Breathe.</Txt>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
        <div style={{width:sz,height:sz,borderRadius:"50%",background:`radial-gradient(circle at 40% 40%, ${C.lav}, ${C.blue})`,border:"3px solid rgba(0,0,0,0.08)",transition:"width 0.3s, height 0.3s",boxShadow:`0 0 ${sz/2}px rgba(200,180,255,0.45)`,marginBottom:14}}/>
        <p style={{fontFamily:"'Caveat', cursive",fontSize:"1.5rem",color:"#7b5ea7",margin:0}}>{phase==="inhale"?"Breathe in... 🌬️":phase==="hold"?"Hold... ✨":"Breathe out... 🍃"}</p>
      </div>
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:24}}>
        {sounds.map(s=>(
          <Card key={s.id} color={playing===s.id?C.mint:C.paper} onClick={()=>setPlaying(p=>p===s.id?null:s.id)} style={{padding:"14px 20px",textAlign:"center",minWidth:90}}>
            <div style={{fontSize:"2rem"}}>{s.emoji}</div>
            <H3 style={{fontSize:"1.1rem"}}>{s.label}</H3>
            {playing===s.id&&<Txt style={{fontSize:"0.8rem",color:"#4caf8f",marginTop:4}}>♪ playing</Txt>}
          </Card>
        ))}
      </div>
      <Sticky color={C.yellow} rotate={-1} style={{display:"inline-block",maxWidth:340}}>💛 You don't have to do everything today. Rest is part of healing.</Sticky>
    </div>
  );
}

// ── Memory Jar ───────────────────────────────────────────────────────────────
function MemoryJarPage({username,memories,setMemories}){
  const [val,setVal]=useState("");
  function add(){if(!val.trim())return;const e={text:val.trim(),date:new Date().toLocaleDateString("en",{month:"short",day:"numeric"})};const u=[e,...memories];setMemories(u);LS.set(`memories_${username}`,u);setVal("");}
  const cols=[C.yellow,C.pink,C.mint,C.lav,C.peach,C.blue];
  return(
    <div>
      <H2 style={{marginBottom:4}}>Memory Jar 🫙</H2>
      <Txt style={{color:C.muted,marginBottom:16}}>Save happy moments, compliments, little wins. Open when you need a smile.</Txt>
      <div style={{display:"flex",gap:10,marginBottom:22}}>
        <Inp value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="A good memory or moment..." style={{flex:1}}/>
        <Btn onClick={add} color={C.yellow}>Add 🫙</Btn>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
        {memories.map((m,i)=>(
          <Sticky key={i} color={cols[i%cols.length]} rotate={(i%5-2)*3} style={{minWidth:150,maxWidth:210}}>
            <div style={{fontSize:"0.78rem",opacity:0.5,marginBottom:4}}>{m.date}</div>{m.text}
          </Sticky>
        ))}
      </div>
    </div>
  );
}

// ── Badges ────────────────────────────────────────────────────────────────────
function BadgesPage({onGoToChallenges}){
  return(
    <div>
      <H2 style={{marginBottom:4}}>Your Badges 🏅</H2>
      <Txt style={{color:C.muted,marginBottom:20}}>Every badge is proof of your journey 🌱</Txt>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:20}}>
        {BADGES_LIST.map((b,i)=>(
          <Card key={b.id} color={[C.yellow,C.mint,C.lav,C.peach,C.pink][i%5]} style={{textAlign:"center"}}>
            <div style={{fontSize:"3rem",marginBottom:8}}>{b.emoji}</div>
            <H3 style={{marginBottom:4}}>{b.title}</H3>
            <Txt style={{color:C.muted,fontSize:"0.95rem"}}>{b.desc}</Txt>
          </Card>
        ))}
        <Card color={C.paper} onClick={onGoToChallenges} style={{textAlign:"center",border:`2.5px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:140}}>
          <div style={{fontSize:"2.5rem",marginBottom:6}}>➕</div>
          <H3 style={{fontSize:"1.1rem",color:C.muted}}>Earn more badges</H3>
          <Txt style={{color:C.muted,fontSize:"0.9rem",marginTop:4}}>Go to Challenges →</Txt>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GAMES — Fully rewritten with 6 diverse game types
// ══════════════════════════════════════════════════════════════════════════════

// Shared MCQ game (Riddles / Trivia / Would You Rather)
function MCQGame({questions,isWYR,title,emoji,onBack}){
  const [qIdx,setQIdx]=useState(0);const [sel,setSel]=useState(null);const [score,setScore]=useState(0);const [done,setDone]=useState(false);const [streak,setStreak]=useState(0);
  function restart(){setQIdx(0);setSel(null);setScore(0);setDone(false);setStreak(0);}
  function pick(i){
    if(sel!==null)return;setSel(i);
    const correct=!isWYR&&i===questions[qIdx].a;
    if(correct)setScore(s=>s+1);
    setStreak(s=>correct?s+1:0);
    setTimeout(()=>{
      if(qIdx+1>=questions.length)setDone(true);
      else{setQIdx(qi=>qi+1);setSel(null);}
    },900);
  }
  const q=questions[qIdx];
  if(done)return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:"4rem",marginBottom:12}}>{isWYR?"🎭":"🏆"}</div>
      <H2 style={{marginBottom:8}}>All done!</H2>
      {!isWYR&&<><Txt style={{fontSize:"1.2rem",marginBottom:8}}>Score: {score}/{questions.length}</Txt>
      <Sticky color={score>=7?C.mint:score>=4?C.yellow:C.peach} style={{fontSize:"1.1rem",marginBottom:20,display:"inline-block"}}>
        {score>=7?"Amazing! 🌟":score>=4?"Good going! 💛":"Keep practising! 🌸"}
      </Sticky></>}
      {isWYR&&<Txt style={{color:C.muted,marginBottom:20}}>Hope that brought a smile! 😄</Txt>}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={restart} color={C.lav}>Play Again 🔁</Btn>
        <Btn onClick={onBack} color={C.pink} small>← Back</Btn>
      </div>
    </div>
  );
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H3>{emoji} {title}</H3>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!isWYR&&streak>=2&&<Sticky color={C.yellow} style={{fontSize:"0.85rem",padding:"4px 10px"}}>🔥 {streak} streak!</Sticky>}
          <Btn small color={C.pink} onClick={onBack}>← Back</Btn>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Q {qIdx+1} / {questions.length}</Txt>
          {!isWYR&&<Txt style={{fontSize:"0.9rem",color:C.muted}}>Score: {score}</Txt>}
        </div>
        <ProgressBar value={qIdx} max={questions.length} color={isWYR?C.pink:C.lav}/>
      </div>
      <Card color={isWYR?C.lav:C.paper} style={{marginBottom:16}}>
        <p style={{fontFamily:"'Caveat', cursive",fontSize:"1.4rem",color:C.text,margin:0,lineHeight:1.4}}>{q.q}</p>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {q.opts.map((opt,i)=>{
          let bg=C.paper;
          if(sel!==null){if(!isWYR&&i===q.a)bg=C.mint;else if(i===sel)bg=isWYR?C.lav:"#ffb3b3";}
          return<button key={i} onClick={()=>pick(i)} style={{background:bg,border:`2px solid ${sel!==null&&!isWYR&&i===q.a?C.green:C.border}`,borderRadius:"12px 4px 12px 4px",padding:"12px 16px",textAlign:"left",fontFamily:"'Patrick Hand', cursive",fontSize:"1.02rem",color:C.text,cursor:sel!==null?"default":"pointer",boxShadow:`2px 2px 0 ${C.border}`,transition:"background 0.2s",lineHeight:1.3}}>{opt}</button>;
        })}
      </div>
    </div>
  );
}

// Word Scramble Game
function WordScrambleGame({onBack}){
  const [idx,setIdx]=useState(0);const [input,setInput]=useState("");const [result,setResult]=useState(null);const [score,setScore]=useState(0);const [hint,setHint]=useState(false);const [done,setDone]=useState(false);
  const data=SCRAMBLE_DATA;
  function check(){
    if(!input.trim())return;
    const correct=input.trim().toUpperCase()===data[idx].answer;
    setResult(correct?"correct":"wrong");
    if(correct)setScore(s=>s+1);
    setTimeout(()=>{
      if(idx+1>=data.length){setDone(true);}
      else{setIdx(i=>i+1);setInput("");setResult(null);setHint(false);}
    },900);
  }
  function skip(){if(idx+1>=data.length)setDone(true);else{setIdx(i=>i+1);setInput("");setResult(null);setHint(false);}}
  function restart(){setIdx(0);setInput("");setResult(null);setScore(0);setHint(false);setDone(false);}
  if(done)return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:"4rem",marginBottom:12}}>🔤</div>
      <H2 style={{marginBottom:8}}>Word Wiz Done!</H2>
      <Txt style={{fontSize:"1.2rem",marginBottom:20}}>Got {score}/{data.length} correct! {score>=7?"🌟 Incredible!":score>=4?"💛 Nice work!":"🌸 Keep going!"}</Txt>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={restart} color={C.lav}>Play Again 🔁</Btn>
        <Btn onClick={onBack} color={C.pink} small>← Back</Btn>
      </div>
    </div>
  );
  const current=data[idx];
  return(
    <div style={{maxWidth:480}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H3>🔤 Word Scramble</H3>
        <Btn small color={C.pink} onClick={onBack}>← Back</Btn>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Word {idx+1} / {data.length}</Txt>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Score: {score}</Txt>
        </div>
        <ProgressBar value={idx} max={data.length} color={C.mint}/>
      </div>
      <Card color={C.mint} style={{textAlign:"center",marginBottom:16}}>
        <Txt style={{color:C.muted,fontSize:"0.9rem",marginBottom:8}}>Unscramble this word:</Txt>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {current.scrambled.split("").map((ch,i)=>(
            <div key={i} style={{width:44,height:50,background:C.white,border:`2.5px solid ${C.border}`,borderRadius:"8px 2px 8px 2px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Permanent Marker', cursive",fontSize:"1.5rem",color:C.text,boxShadow:`3px 3px 0 ${C.border}`}}>{ch}</div>
          ))}
        </div>
      </Card>
      {hint&&<Sticky color={C.yellow} style={{marginBottom:12,fontSize:"0.95rem",display:"block"}}>{current.hint}</Sticky>}
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <Inp value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Type your answer..." style={{flex:1,textTransform:"uppercase",letterSpacing:2}}/>
        <Btn onClick={check} color={result==="correct"?C.mint:result==="wrong"?"#ffb3b3":C.lav}>Check ✓</Btn>
      </div>
      <div style={{display:"flex",gap:8}}>
        {!hint&&<Btn small color={C.yellow} onClick={()=>setHint(true)}>Hint 💡</Btn>}
        <Btn small color={C.paper} onClick={skip}>Skip →</Btn>
      </div>
      {result&&<div style={{marginTop:10,padding:"8px 14px",background:result==="correct"?C.mint:"#ffb3b3",border:`2px solid ${C.border}`,borderRadius:10}}>
        <Txt>{result==="correct"?"✅ Correct! Great job! 🌟":"❌ The answer was: "+current.answer}</Txt>
      </div>}
    </div>
  );
}

// Emoji Puzzle Game
function EmojiPuzzleGame({onBack}){
  const [idx,setIdx]=useState(0);const [input,setInput]=useState("");const [result,setResult]=useState(null);const [score,setScore]=useState(0);const [hint,setHint]=useState(false);const [done,setDone]=useState(false);
  const data=EMOJI_PUZZLES;
  function check(){
    if(!input.trim())return;
    const correct=input.trim().toLowerCase()===data[idx].answer.toLowerCase();
    setResult(correct?"correct":"wrong");
    if(correct)setScore(s=>s+1);
    setTimeout(()=>{
      if(idx+1>=data.length)setDone(true);
      else{setIdx(i=>i+1);setInput("");setResult(null);setHint(false);}
    },900);
  }
  function skip(){if(idx+1>=data.length)setDone(true);else{setIdx(i=>i+1);setInput("");setResult(null);setHint(false);}}
  function restart(){setIdx(0);setInput("");setResult(null);setScore(0);setHint(false);setDone(false);}
  if(done)return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:"4rem",marginBottom:12}}>🧩</div>
      <H2 style={{marginBottom:8}}>Emoji Master!</H2>
      <Txt style={{fontSize:"1.2rem",marginBottom:20}}>Got {score}/{data.length} right! {score>=6?"🌟 Brilliant!":score>=3?"💛 Good fun!":"🌸 Try again!"}</Txt>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={restart} color={C.lav}>Play Again 🔁</Btn>
        <Btn onClick={onBack} color={C.pink} small>← Back</Btn>
      </div>
    </div>
  );
  const current=data[idx];
  return(
    <div style={{maxWidth:480}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H3>🧩 Emoji Puzzle</H3>
        <Btn small color={C.pink} onClick={onBack}>← Back</Btn>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Puzzle {idx+1} / {data.length}</Txt>
          <Txt style={{fontSize:"0.9rem",color:C.muted}}>Score: {score}</Txt>
        </div>
        <ProgressBar value={idx} max={data.length} color={C.yellow}/>
      </div>
      <Card color={C.lav} style={{textAlign:"center",marginBottom:16,padding:"30px 20px"}}>
        <Txt style={{color:C.muted,fontSize:"0.9rem",marginBottom:12}}>What phrase do these emojis make?</Txt>
        <div style={{fontSize:"3rem",letterSpacing:8,marginBottom:4}}>{current.emojis}</div>
      </Card>
      {hint&&<Sticky color={C.yellow} style={{marginBottom:12,fontSize:"0.95rem",display:"block"}}>{current.hint}</Sticky>}
      <div style={{display:"flex",gap:10,marginBottom:10}}>
        <Inp value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="What does it mean?" style={{flex:1}}/>
        <Btn onClick={check} color={result==="correct"?C.mint:result==="wrong"?"#ffb3b3":C.lav}>Check ✓</Btn>
      </div>
      <div style={{display:"flex",gap:8}}>
        {!hint&&<Btn small color={C.yellow} onClick={()=>setHint(true)}>Hint 💡</Btn>}
        <Btn small color={C.paper} onClick={skip}>Skip →</Btn>
      </div>
      {result&&<div style={{marginTop:10,padding:"8px 14px",background:result==="correct"?C.mint:"#ffb3b3",border:`2px solid ${C.border}`,borderRadius:10}}>
        <Txt>{result==="correct"?"✅ Correct! You're an emoji genius! 🌟":"❌ Answer: "+current.answer}</Txt>
      </div>}
    </div>
  );
}

// Memory Match Game
function MemoryMatchGame({onBack}){
  const allTiles=MEMORY_TILES.slice(0,8);
  function newBoard(){
    const doubled=[...allTiles,...allTiles];
    for(let i=doubled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[doubled[i],doubled[j]]=[doubled[j],doubled[i]];}
    return doubled.map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
  }
  const [tiles,setTiles]=useState(newBoard);
  const [selected,setSelected]=useState([]);
  const [moves,setMoves]=useState(0);const [matches,setMatches]=useState(0);const [done,setDone]=useState(false);
  const [locked,setLocked]=useState(false);
  function flip(tile){
    if(locked||tile.flipped||tile.matched)return;
    const newTiles=tiles.map(t=>t.id===tile.id?{...t,flipped:true}:t);
    setTiles(newTiles);
    const newSel=[...selected,tile];
    if(newSel.length===2){
      setMoves(m=>m+1);setLocked(true);
      if(newSel[0].emoji===newSel[1].emoji){
        setTiles(prev=>prev.map(t=>t.emoji===newSel[0].emoji?{...t,matched:true}:t));
        setMatches(m=>m+1);
        if(matches+1===allTiles.length)setTimeout(()=>setDone(true),400);
        setSelected([]);setLocked(false);
      }else{
        setTimeout(()=>{
          setTiles(prev=>prev.map(t=>newSel.some(s=>s.id===t.id)&&!t.matched?{...t,flipped:false}:t));
          setSelected([]);setLocked(false);
        },900);
      }
    }else setSelected(newSel);
  }
  function restart(){setTiles(newBoard());setSelected([]);setMoves(0);setMatches(0);setDone(false);setLocked(false);}
  if(done)return(
    <div style={{textAlign:"center",padding:"20px 0"}}>
      <div style={{fontSize:"4rem",marginBottom:12}}>🧠</div>
      <H2 style={{marginBottom:8}}>Memory Master!</H2>
      <Txt style={{fontSize:"1.2rem",marginBottom:8}}>Matched all pairs in {moves} moves!</Txt>
      <Sticky color={moves<=14?C.mint:moves<=20?C.yellow:C.peach} style={{fontSize:"1.1rem",marginBottom:20,display:"inline-block"}}>
        {moves<=14?"Perfect memory! 🌟":moves<=20?"Great job! 💛":"You did it! 🌸"}
      </Sticky>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <Btn onClick={restart} color={C.lav}>Play Again 🔁</Btn>
        <Btn onClick={onBack} color={C.pink} small>← Back</Btn>
      </div>
    </div>
  );
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H3>🧠 Memory Match</H3>
        <div style={{display:"flex",gap:8}}>
          <Sticky color={C.yellow} style={{fontSize:"0.9rem",padding:"5px 10px"}}>Moves: {moves}</Sticky>
          <Btn small color={C.pink} onClick={onBack}>← Back</Btn>
        </div>
      </div>
      <Txt style={{color:C.muted,marginBottom:14}}>Find all matching pairs! 🃏</Txt>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:380}}>
        {tiles.map(tile=>(
          <button key={tile.id} onClick={()=>flip(tile)} style={{
            width:"100%",aspectRatio:"1",fontSize:tile.flipped||tile.matched?"2rem":"1rem",
            background:tile.matched?C.mint:tile.flipped?C.lav:C.paper,
            border:`2.5px solid ${tile.matched?C.green:C.border}`,
            borderRadius:"12px 4px 12px 4px",
            boxShadow:tile.matched?`3px 3px 0 ${C.green}`:`3px 3px 0 ${C.border}`,
            cursor:tile.matched?"default":"pointer",
            transition:"all 0.25s",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:tile.flipped||tile.matched?C.text:C.muted,
          }}>
            {tile.flipped||tile.matched?tile.emoji:"?"}
          </button>
        ))}
      </div>
      <Txt style={{color:C.muted,marginTop:12,fontSize:"0.9rem"}}>Pairs found: {matches}/{allTiles.length}</Txt>
    </div>
  );
}

// Breathing Mini-game (calm clicks)
function BreathingGame({onBack}){
  const [phase,setPhase]=useState("start");// start | inhale | hold | exhale | done
  const [round,setRound]=useState(0);const [timer,setTimer]=useState(0);const [sz,setSz]=useState(100);
  const timerRef=useRef(null);const ROUNDS=5;
  function startCycle(){
    setPhase("inhale");setTimer(4);setSz(170);
    let t=4;
    timerRef.current=setInterval(()=>{
      t-=1;setTimer(t);
      if(t<=0){
        clearInterval(timerRef.current);setPhase("hold");setTimer(4);t=4;
        timerRef.current=setInterval(()=>{
          t-=1;setTimer(t);
          if(t<=0){
            clearInterval(timerRef.current);setPhase("exhale");setTimer(6);setSz(100);t=6;
            timerRef.current=setInterval(()=>{
              t-=1;setTimer(t);
              if(t<=0){
                clearInterval(timerRef.current);
                setRound(r=>{
                  const next=r+1;
                  if(next>=ROUNDS){setPhase("done");}
                  else{setTimeout(()=>startCycle(),500);}
                  return next;
                });
                setPhase("rest");setTimer(0);
              }
            },1000);
          }
        },1000);
      }
    },1000);
  }
  useEffect(()=>()=>clearInterval(timerRef.current),[]);
  const phaseColors={inhale:C.mint,hold:C.lav,exhale:C.blue,rest:C.paper,start:C.paper,done:C.yellow};
  const phaseText={inhale:`Breathe in... ${timer}`,hold:`Hold... ${timer}`,exhale:`Breathe out... ${timer}`,rest:"Nice! Resting...",start:"Ready to breathe?",done:"Amazing! 🌸"};
  return(
    <div style={{textAlign:"center",maxWidth:400,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <H3>🌬️ Breathing Space</H3>
        <Btn small color={C.pink} onClick={onBack}>← Back</Btn>
      </div>
      <Txt style={{color:C.muted,marginBottom:20}}>4-4-6 breathing to calm your mind. {ROUNDS} rounds total.</Txt>
      <div style={{marginBottom:20}}>
        <ProgressBar value={round} max={ROUNDS} color={C.mint}/>
        <Txt style={{fontSize:"0.85rem",color:C.muted,marginTop:6}}>Round {Math.min(round+1,ROUNDS)} / {ROUNDS}</Txt>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,height:220}}>
        <div style={{
          width:sz,height:sz,borderRadius:"50%",
          background:phaseColors[phase]||C.paper,
          border:`3px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"width 1s ease, height 1s ease, background 0.5s",
          boxShadow:`4px 4px 0 ${C.border}`,
        }}>
          <p style={{fontFamily:"'Caveat', cursive",fontSize:"1.2rem",color:C.text,margin:0,padding:"0 10px"}}>{phaseText[phase]}</p>
        </div>
      </div>
      {phase==="start"&&<Btn onClick={startCycle} color={C.mint} style={{fontSize:"1.2rem"}}>Start 🌿</Btn>}
      {phase==="done"&&(
        <div>
          <Sticky color={C.mint} style={{display:"block",marginBottom:16,fontSize:"1.1rem"}}>✨ You completed {ROUNDS} breathing rounds! Feel calmer? 💛</Sticky>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <Btn onClick={()=>{setPhase("start");setRound(0);setSz(100);}} color={C.lav}>Again 🌬️</Btn>
            <Btn onClick={onBack} color={C.pink} small>← Back</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Games Page
function GamesPage(){
  const [game,setGame]=useState(null);// null = menu
  const GAME_MENU=[
    {id:"riddles",emoji:"🧩",title:"Riddle Me This",desc:"Brain-tickling riddles to crack!",color:C.lav,tag:"quiz"},
    {id:"trivia",emoji:"🌍",title:"Fun Trivia",desc:"Feel-good quiz questions!",color:C.mint,tag:"quiz"},
    {id:"wyr",emoji:"🎭",title:"Would You Rather",desc:"Lighthearted fun choices!",color:C.pink,tag:"fun"},
    {id:"scramble",emoji:"🔤",title:"Word Scramble",desc:"Unscramble the letters!",color:C.peach,tag:"words"},
    {id:"emoji",emoji:"🧩",title:"Emoji Puzzles",desc:"Decode emoji phrases!",color:C.yellow,tag:"fun"},
    {id:"memory",emoji:"🧠",title:"Memory Match",desc:"Flip & match the pairs!",color:C.blue,tag:"brain"},
    {id:"breathing",emoji:"🌬️",title:"Breathing Space",desc:"Calm your mind in 5 rounds.",color:C.mint,tag:"calm"},
  ];
  if(game==="riddles") return <div style={{maxWidth:520}}><MCQGame questions={RIDDLES} isWYR={false} title="Riddle Me This" emoji="🧩" onBack={()=>setGame(null)}/></div>;
  if(game==="trivia")  return <div style={{maxWidth:520}}><MCQGame questions={TRIVIA}  isWYR={false} title="Fun Trivia"     emoji="🌍" onBack={()=>setGame(null)}/></div>;
  if(game==="wyr")     return <div style={{maxWidth:520}}><MCQGame questions={WYR}     isWYR={true}  title="Would You Rather" emoji="🎭" onBack={()=>setGame(null)}/></div>;
  if(game==="scramble") return <WordScrambleGame onBack={()=>setGame(null)}/>;
  if(game==="emoji")    return <EmojiPuzzleGame  onBack={()=>setGame(null)}/>;
  if(game==="memory")   return <MemoryMatchGame  onBack={()=>setGame(null)}/>;
  if(game==="breathing")return <BreathingGame    onBack={()=>setGame(null)}/>;

  const tagColors={quiz:C.lav,fun:C.pink,words:C.peach,brain:C.blue,calm:C.mint};
  return(
    <div>
      <H2 style={{marginBottom:4}}>Relaxation Games 🎮</H2>
      <Txt style={{color:C.muted,marginBottom:20}}>Pick a game to relax, focus, or have fun — all at your own pace!</Txt>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:14}}>
        {GAME_MENU.map(g=>(
          <Card key={g.id} color={g.color} onClick={()=>setGame(g.id)} style={{position:"relative"}}>
            <div style={{position:"absolute",top:10,right:12,background:"rgba(255,255,255,0.55)",borderRadius:20,padding:"2px 10px",fontFamily:"'Patrick Hand', cursive",fontSize:"0.78rem",color:C.muted,border:`1px solid rgba(0,0,0,0.1)`}}>{g.tag}</div>
            <div style={{fontSize:"2.5rem",marginBottom:8}}>{g.emoji}</div>
            <H3 style={{marginBottom:4}}>{g.title}</H3>
            <Txt style={{fontSize:"0.95rem",color:C.muted}}>{g.desc}</Txt>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfilePage({user,pfp,setPfp,onGoToChallenges}){
  const [bio,setBio]=useState(()=>LS.get(`bio_${user.username}`,"Just a student trying my best 🌸"));
  const [editing,setEditing]=useState(false);const [tmp,setTmp]=useState(bio);const fileRef=useRef(null);
  function saveBio(){setBio(tmp);LS.set(`bio_${user.username}`,tmp);setEditing(false);}
  function handlePfp(e){const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>{setPfp(ev.target.result);LS.set(`pfp_${user.username}`,ev.target.result);};r.readAsDataURL(file);}
  return(
    <div style={{maxWidth:540}}>
      <H2 style={{marginBottom:16}}>My Profile 🌸</H2>
      <Card color={C.paper} style={{marginBottom:20}}>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div onClick={()=>fileRef.current.click()} title="Click to change profile picture" style={{width:72,height:72,borderRadius:"50%",background:pfp?"transparent":`linear-gradient(135deg,${C.lav},${C.pink})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",border:`2.5px solid ${C.border}`,cursor:"pointer",overflow:"hidden"}}>
              {pfp?<img src={pfp} alt="pfp" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(user.name?.[0]?.toUpperCase()||"🌸")}
            </div>
            <div onClick={()=>fileRef.current.click()} style={{position:"absolute",bottom:0,right:0,background:C.yellow,border:`1.5px solid ${C.border}`,borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",cursor:"pointer"}}>✏️</div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePfp}/>
          </div>
          <div>
            <p style={{fontFamily:"'Caveat', cursive",fontSize:"1.6rem",color:C.text,margin:0}}>{user.name}</p>
            <Txt style={{color:C.muted,fontSize:"0.95rem"}}>@{user.username}</Txt>
            <Txt style={{color:"#7b5ea7",marginTop:2,fontSize:"0.9rem"}}>{user.role==="student"?"Student 🎒":`Admin — ${user.adminType} 📚`}</Txt>
          </div>
        </div>
        <div style={{marginTop:14}}>
          {editing?(
            <div style={{display:"flex",gap:8}}>
              <Inp value={tmp} onChange={e=>setTmp(e.target.value)} style={{flex:1}}/>
              <Btn small color={C.mint} onClick={saveBio}>Save</Btn>
              <Btn small color={C.pink} onClick={()=>setEditing(false)}>Cancel</Btn>
            </div>
          ):(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Txt style={{color:C.muted}}>{bio}</Txt>
              <Btn small color={C.yellow} onClick={()=>{setTmp(bio);setEditing(true);}}>Edit ✏️</Btn>
            </div>
          )}
        </div>
      </Card>
      <H3 style={{marginBottom:10}}>My Badges 🏅</H3>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {BADGES_LIST.slice(0,3).map(b=><div key={b.id} title={b.desc} style={{background:C.yellow,border:`2px solid ${C.border}`,borderRadius:"50%",width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",cursor:"help"}}>{b.emoji}</div>)}
        <div onClick={onGoToChallenges} title="Earn more badges — go to Challenges!" style={{width:52,height:52,border:`2px dashed ${C.muted}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:"1.4rem",cursor:"pointer"}}>+</div>
      </div>
    </div>
  );
}

// ── Mailbox ───────────────────────────────────────────────────────────────────
function MailboxPage({username,connections,setConnections}){
  const reqKey=`connReqs_${username}`;
  const [requests,setRequests]=useState(()=>LS.get(reqKey,[]));
  function respond(idx,accept){
    const req=requests[idx];
    const updated=requests.filter((_,i)=>i!==idx);
    setRequests(updated);LS.set(reqKey,updated);
    if(accept){
      const newConn={adminUsername:req.from,adminName:req.fromName,adminType:req.adminType,features:req.features||[],featureIds:req.featureIds||[]};
      const updConns=[...connections,newConn];setConnections(updConns);LS.set(`connections_${username}`,updConns);
      const nk=`adminNotif_${req.from}`;LS.set(nk,[...LS.get(nk,[]),{type:"accepted",studentUsername:username,time:new Date().toLocaleString()}]);
      const adminSentKey=`adminSent_${req.from}`;
      const adminSent=LS.get(adminSentKey,[]);
      LS.set(adminSentKey,adminSent.map(r=>r.to===username?{...r,status:"accepted"}:r));
    }
  }
  return(
    <div style={{maxWidth:560}}>
      <H2 style={{marginBottom:4}}>📬 Mailbox</H2>
      <Txt style={{color:C.muted,marginBottom:20}}>Connection requests & notifications from your admin</Txt>
      {requests.length===0?(
        <Card color={C.paper} style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:"3rem",marginBottom:10}}>📭</div>
          <H3>All caught up!</H3>
          <Txt style={{color:C.muted,marginTop:6}}>No new messages right now.</Txt>
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {requests.map((req,i)=>(
            <Card key={i} color={C.paper} style={{borderLeft:`5px solid ${C.lav}`}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                <div>
                  <H3 style={{marginBottom:4}}>Connection Request 🔗</H3>
                  <Txt><b>{req.fromName}</b> ({req.adminType}) wants to connect with you</Txt>
                  {req.features?.length>0&&<Txt style={{color:C.muted,marginTop:6,fontSize:"0.9rem"}}>Features they'll enable: {req.features.join(", ")}</Txt>}
                  <Txt style={{color:C.muted,fontSize:"0.8rem",marginTop:4}}>{req.time}</Txt>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <Btn small color={C.mint} onClick={()=>respond(i,true)}>✅ Accept</Btn>
                  <Btn small color={C.pink} onClick={()=>respond(i,false)}>❌ Reject</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {connections.length>0&&(
        <div style={{marginTop:24}}>
          <H3 style={{marginBottom:10}}>Your Connections ✅</H3>
          {connections.map((c,i)=>(
            <Card key={i} color={C.mint} style={{marginBottom:8,padding:"10px 14px"}}>
              <Txt><b>{c.adminName}</b> ({c.adminType}) — connected</Txt>
              {c.features?.length>0&&<Txt style={{color:C.muted,fontSize:"0.9rem",marginTop:4}}>Enabled: {c.features.join(", ")}</Txt>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function StudentSearchBar({value,onChange,onConfirm,confirmedUser,searchStatus}){
  const [suggestions,setSuggestions]=useState([]);const [showSug,setShowSug]=useState(false);
  useEffect(()=>{
    if(!value.trim()){setSuggestions([]);setShowSug(false);return;}
    const users=LS.get("sb_users",{});
    const matches=Object.values(users).filter(u=>u.role==="student"&&(u.username.toLowerCase().includes(value.toLowerCase())||u.name.toLowerCase().includes(value.toLowerCase()))).slice(0,5);
    setSuggestions(matches);setShowSug(matches.length>0);
  },[value]);
  return(
    <div style={{position:"relative",marginBottom:16}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{flex:1,position:"relative"}}>
          <Inp value={value} onChange={e=>onChange(e.target.value)}/>
          {showSug&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:200,background:C.white,border:`2px solid ${C.border}`,borderRadius:"0 0 12px 12px",boxShadow:`4px 4px 0 ${C.border}`,overflow:"hidden"}}>
              {suggestions.map((u,i)=>(
                <div key={i} onClick={()=>{onChange(u.username);setShowSug(false);onConfirm(u.username);}}
                  style={{padding:"10px 14px",cursor:"pointer",fontFamily:"'Patrick Hand', cursive",fontSize:"1rem",color:C.text,borderBottom:`1px solid rgba(0,0,0,0.07)`,background:"transparent",display:"flex",alignItems:"center",gap:10}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.lav}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span>👤</span><div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:"0.85rem",opacity:0.6}}>@{u.username}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Btn small color={C.mint} onClick={()=>onConfirm(value)} disabled={searchStatus==="loading"}>{searchStatus==="loading"?"Checking...":"Search 🔍"}</Btn>
      </div>
      {searchStatus==="found"&&confirmedUser&&(
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:C.mint,border:`2px solid ${C.border}`,borderRadius:10}}>
          <span>✅</span><Txt style={{fontSize:"0.95rem"}}><b>{confirmedUser.name}</b> (@{confirmedUser.username}) found!</Txt>
        </div>
      )}
      {searchStatus==="notfound"&&(
        <div style={{marginTop:10,padding:"8px 14px",background:"#ffe5e5",border:`2px solid ${C.border}`,borderRadius:10}}>
          <Txt style={{color:"#c0392b",fontSize:"0.95rem"}}>❌ Student not found. Check the username.</Txt>
        </div>
      )}
    </div>
  );
}

function FeatureCheckboxes({selFeatures,onToggle,searchStatus}){
  const isActive=searchStatus==="found";
  return(
    <div>
      <H3 style={{marginBottom:12}}>Enable features for this student:</H3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginBottom:16}}>
        {ALL_FEATURES.map(f=>{
          const checked=selFeatures.includes(f.id);
          return(
            <div key={f.id} onClick={()=>isActive&&onToggle(f.id)}
              style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",background:isActive?(checked?C.mint:C.paper):"#f0ede8",border:`2px solid ${isActive?(checked?C.border:"rgba(0,0,0,0.2)"):"#ccc"}`,borderRadius:"12px 4px 12px 4px",cursor:isActive?"pointer":"not-allowed",opacity:isActive?1:0.5,transition:"all 0.2s",boxShadow:isActive&&checked?`3px 3px 0 ${C.border}`:"none",userSelect:"none"}}>
              <div style={{width:18,height:18,borderRadius:4,flexShrink:0,background:checked?(isActive?"#7b5ea7":"#aaa"):"transparent",border:`2px solid ${checked?(isActive?"#7b5ea7":"#aaa"):(isActive?"#888":"#ccc")}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                {checked&&<span style={{color:"#fff",fontSize:"0.75rem",fontWeight:700,lineHeight:1}}>✓</span>}
              </div>
              <span style={{fontFamily:"'Caveat', cursive",fontSize:"1.05rem",color:isActive?C.text:"#aaa"}}>{f.label}</span>
            </div>
          );
        })}
      </div>
      {!isActive&&<Sticky color={C.peach} style={{fontSize:"0.95rem",display:"inline-block"}}>🔍 Search and confirm a student first to enable features</Sticky>}
    </div>
  );
}

function AIInsightsPanel({adminUsername}){
  const [selectedStudent,setSelectedStudent]=useState(null);const [taskData,setTaskData]=useState(null);const [tick,setTick]=useState(0);const [connectedStudents,setConnectedStudents]=useState([]);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),3000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const sentReqs=LS.get(`adminSent_${adminUsername}`,[]);setConnectedStudents(sentReqs.filter(r=>r.status==="accepted").map(r=>r.to));},[tick,adminUsername]);
  useEffect(()=>{if(!selectedStudent)return;setTaskData(LS.get(`adminTasks_${adminUsername}_${selectedStudent}`,null));},[selectedStudent,tick]);
  const tasks=taskData?.tasks||[];
  return(
    <div style={{maxWidth:640}}>
      <H2 style={{marginBottom:4}}>✨ Student Insights</H2>
      <Txt style={{color:C.muted,marginBottom:20}}>Your personalised to-do list — updated automatically as your student chats.</Txt>
      {connectedStudents.length===0?(
        <Card color={C.paper} style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:"3rem",marginBottom:10}}>🔗</div>
          <H3>No connected students yet</H3>
          <Txt style={{color:C.muted,marginTop:6}}>Send a connection request and wait for the student to accept.</Txt>
        </Card>
      ):(
        <>
          <H3 style={{marginBottom:10}}>Select a student:</H3>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
            {connectedStudents.map((s,i)=>{
              const hasData=!!LS.get(`adminTasks_${adminUsername}_${s}`,null);
              return(
                <button key={i} onClick={()=>setSelectedStudent(s)}
                  style={{background:selectedStudent===s?C.lav:C.paper,border:`2px solid ${C.border}`,borderRadius:"12px 4px 12px 4px",padding:"9px 18px",fontFamily:"'Patrick Hand', cursive",fontSize:"1.05rem",color:C.text,cursor:"pointer",boxShadow:selectedStudent===s?`3px 3px 0 ${C.border}`:"none",position:"relative"}}>
                  👤 {s}
                  {hasData&&<span style={{position:"absolute",top:-6,right:-6,background:C.mint,border:`2px solid ${C.border}`,borderRadius:"50%",width:16,height:16,fontSize:"0.6rem",display:"flex",alignItems:"center",justifyContent:"center"}}>✓</span>}
                </button>
              );
            })}
          </div>
          {selectedStudent&&(!taskData?(
            <Card color={C.paper} style={{textAlign:"center",padding:"36px 20px"}}>
              <div style={{fontSize:"2.5rem",marginBottom:10}}>💬</div>
              <H3 style={{marginBottom:8}}>Waiting for student activity</H3>
              <Txt style={{color:C.muted}}>Tasks appear once <b>@{selectedStudent}</b> chats with Buddy.</Txt>
            </Card>
          ):(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <H3>To-do list for @{selectedStudent} 🌿</H3>
                {taskData.updatedAt&&<Sticky color={C.mint} style={{fontSize:"0.8rem",padding:"5px 10px"}}>Updated {taskData.updatedAt}</Sticky>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {tasks.map((t,i)=>(
                  <Card key={i} color={[C.mint,C.lav,C.yellow,C.peach][i%4]}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <span style={{fontSize:"2.2rem",flexShrink:0,lineHeight:1}}>{t.emoji}</span>
                      <div>
                        <H3 style={{marginBottom:5}}>{t.title}</H3>
                        <Txt style={{marginBottom:6,lineHeight:1.5}}>{t.desc}</Txt>
                        <Txt style={{color:C.muted,fontSize:"0.88rem",fontStyle:"italic"}}>💡 {t.why}</Txt>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function AdminDashboard({user}){
  const [tab,setTab]=useState("overview");const [stuUsername,setStuUsername]=useState("");const [confirmedUser,setConfirmedUser]=useState(null);const [searchStatus,setSearchStatus]=useState(null);const [selFeatures,setSelFeatures]=useState([]);const [tick,setTick]=useState(0);
  const [notifs,setNotifs]=useState(()=>LS.get(`adminNotif_${user.username}`,[]));
  const [featureReqs,setFeatureReqs]=useState(()=>LS.get(`featureReqs_${user.username}`,[]));
  useEffect(()=>{
    const t=setInterval(()=>{setTick(x=>x+1);setNotifs(LS.get(`adminNotif_${user.username}`,[]));setFeatureReqs(LS.get(`featureReqs_${user.username}`,[]));},3000);
    return()=>clearInterval(t);
  },[user.username]);
  const sentReqs=LS.get(`adminSent_${user.username}`,[]);
  const connectedStudents=sentReqs.filter(r=>r.status==="accepted").map(r=>r.to);
  function handleConfirm(uname){
    if(!uname.trim())return;setSearchStatus("loading");setConfirmedUser(null);
    setTimeout(()=>{const users=LS.get("sb_users",{});const target=users[uname.trim()];if(!target||target.role!=="student"){setSearchStatus("notfound");}else{setConfirmedUser(target);setSearchStatus("found");}},1000);
  }
  function toggleF(id){setSelFeatures(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);}
  function sendReq(){
    if(!confirmedUser)return;
    const existing=sentReqs.find(r=>r.to===confirmedUser.username);
    if(existing){alert(`⚠️ Already sent a request to @${confirmedUser.username}! Status: ${existing.status}`);return;}
    const req={from:user.username,fromName:user.name,adminType:user.adminType,features:selFeatures.map(id=>ALL_FEATURES.find(f=>f.id===id)?.label||id),featureIds:selFeatures,time:new Date().toLocaleString()};
    const sk=`connReqs_${confirmedUser.username}`;LS.set(sk,[...LS.get(sk,[]),req]);
    LS.set(`adminSent_${user.username}`,[...sentReqs,{to:confirmedUser.username,featureIds:selFeatures,status:"pending"}]);
    setStuUsername("");setSelFeatures([]);setConfirmedUser(null);setSearchStatus(null);
    alert(`✅ Request sent to @${confirmedUser.username}!`);
  }
  const tabs=["overview","connect","insights","notifications","badges"];
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <Btn key={t} small color={tab===t?C.lav:C.paper} onClick={()=>setTab(t)}>
            {t==="insights"?"🤖 AI Insights":t==="connect"?"🔗 Connect":t==="overview"?"🏠 Overview":t==="notifications"?"📬 Notifications":"🏅 Badges"}
          </Btn>
        ))}
      </div>
      {tab==="overview"&&(
        <div>
          <H2 style={{marginBottom:14}}>{user.adminType==="teacher"?"Teacher Dashboard 📚":user.adminType==="parent"?"Parent Dashboard 🏠":"Guardian Dashboard 🛡️"}</H2>
          <Txt style={{color:C.muted,marginBottom:16}}>⚠️ Only connected students' data is visible — student privacy is always protected.</Txt>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20}}>
            <Card color={C.mint}><div style={{fontFamily:"'Caveat', cursive",fontSize:"2.5rem",color:C.text}}>{connectedStudents.length}</div><Txt>Connected Students</Txt></Card>
            <Card color={C.yellow}><div style={{fontFamily:"'Caveat', cursive",fontSize:"2.5rem",color:C.text}}>{notifs.length}</div><Txt>Notifications</Txt></Card>
            <Card color={C.peach}><div style={{fontFamily:"'Caveat', cursive",fontSize:"2.5rem",color:C.text}}>{featureReqs.length}</div><Txt>Feature Requests</Txt></Card>
          </div>
          {sentReqs.length>0&&(
            <div>
              <H3 style={{marginBottom:10}}>Sent Requests</H3>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sentReqs.map((r,i)=>(
                  <Card key={i} color={r.status==="accepted"?C.mint:r.status==="rejected"?"#ffe5e5":C.paper} style={{padding:"10px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                      <Txt>👤 <b>@{r.to}</b></Txt>
                      <span style={{fontFamily:"'Patrick Hand', cursive",fontSize:"0.95rem",color:r.status==="accepted"?"#2e7d52":r.status==="rejected"?"#c0392b":C.muted}}>
                        {r.status==="pending"?"⏳ Pending":r.status==="accepted"?"✅ Connected":"❌ Rejected"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <Txt style={{color:C.muted,fontSize:"0.82rem",marginTop:16}}>🔄 Dashboard refreshes every 3 seconds automatically.</Txt>
        </div>
      )}
      {tab==="connect"&&(
        <div style={{maxWidth:600}}>
          <H2 style={{marginBottom:8}}>Send Connection Request 🔗</H2>
          <Txt style={{color:C.muted,marginBottom:16}}>Student must approve — only then can you see their wellness data.</Txt>
          <StudentSearchBar value={stuUsername} onChange={setStuUsername} onConfirm={handleConfirm} confirmedUser={confirmedUser} searchStatus={searchStatus}/>
          <div style={{marginTop:20}}>
            <FeatureCheckboxes selFeatures={selFeatures} onToggle={toggleF} searchStatus={searchStatus}/>
          </div>
          {searchStatus==="found"&&<Btn onClick={sendReq} color={C.mint} style={{marginTop:16}}>Send Request to {confirmedUser?.name} 📨</Btn>}
        </div>
      )}
      {tab==="insights"&&<AIInsightsPanel adminUsername={user.username} adminType={user.adminType}/>}
      {tab==="notifications"&&(
        <div style={{maxWidth:520}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <H2>Notifications 📬</H2>
            {notifs.length>0&&<Btn small color={C.pink} onClick={()=>{LS.set(`adminNotif_${user.username}`,[]);setNotifs([]);}}>Clear all</Btn>}
          </div>
          {notifs.length===0&&featureReqs.length===0?(
            <Card color={C.paper} style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:"3rem",marginBottom:10}}>📭</div><H3>No notifications yet</H3></Card>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {notifs.map((n,i)=>(
                <Card key={i} color={C.mint} style={{borderLeft:"5px solid #4caf8f"}}>
                  <Txt>✅ <b>@{n.studentUsername}</b> accepted your connection request!</Txt>
                  <Txt style={{color:C.muted,fontSize:"0.85rem",marginTop:4}}>{n.time}</Txt>
                </Card>
              ))}
              {featureReqs.map((r,i)=>(
                <Card key={`fr${i}`} color={C.lav} style={{borderLeft:"5px solid #9b6dff"}}>
                  <H3 style={{marginBottom:4}}>Feature Request 🔓</H3>
                  <Txt><b>@{r.from}</b> is requesting: <b>{r.feature}</b></Txt>
                  <Txt style={{color:C.muted,marginTop:6,fontStyle:"italic"}}>"{r.message}"</Txt>
                  <Txt style={{color:C.muted,fontSize:"0.85rem",marginTop:4}}>{r.time}</Txt>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {tab==="badges"&&(
        <div style={{maxWidth:480}}>
          <H2 style={{marginBottom:8}}>Award a Badge 🏅</H2>
          <Txt style={{color:C.muted,marginBottom:16}}>Tap a badge to award it to a connected student.</Txt>
          <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
            {BADGES_LIST.map(b=>(
              <Card key={b.id} color={C.yellow} style={{padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontSize:"1.8rem"}}>{b.emoji}</div>
                <H3 style={{fontSize:"1rem"}}>{b.title}</H3>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({user,onLogout}){
  const [page,setPage]=useState("home");
  const [moodLog,setMoodLog]=useState([]);
  const [chatHistory,setChatHistory]=useState(()=>LS.get(`chat_${user.username}`,[{from:"buddy",text:"Hey! 🌸 I'm your buddy. Talk to me — what's on your mind today?"}]));
  const [gratitudeEntries,setGratitudeEntries]=useState(()=>LS.get(`gratitude_${user.username}`,[]));
  const [memories,setMemories]=useState(()=>LS.get(`memories_${user.username}`,[]));
  const [connections,setConnections]=useState(()=>LS.get(`connections_${user.username}`,[]));
  const [pfp,setPfp]=useState(()=>LS.get(`pfp_${user.username}`,null));
  const [menuOpen,setMenuOpen]=useState(false);

  useEffect(()=>{LS.set(`chat_${user.username}`,chatHistory);},[chatHistory,user.username]);

  const mailCount=LS.get(`connReqs_${user.username}`,[]).length;
  const enabledIds=connections.flatMap(c=>c.featureIds||[]);
  const hasConn=connections.length>0;

  function gate(id,label,content){
    if(user.role!=="student")return content;
    if(!hasConn)return(
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{fontSize:"3rem",marginBottom:12}}>🔒</div>
        <H2 style={{marginBottom:8}}>{label}</H2>
        <Txt style={{color:C.muted}}>No admin has connected yet. Check your 📬 Mailbox for connection requests!</Txt>
      </div>
    );
    if(!enabledIds.includes(id))return<LockedFeature featureLabel={label} connections={connections} username={user.username}/>;
    return content;
  }

  const quote=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  const stuNav=[
    {id:"home",emoji:"🏠",label:"Home"},
    {id:"chat",emoji:"💬",label:"Chat"},
    {id:"challenges",emoji:"🌿",label:"Challenges"},
    {id:"gratitude",emoji:"🌸",label:"Gratitude"},
    {id:"scribble",emoji:"🎨",label:"Scribble"},
    {id:"comfort",emoji:"🕯️",label:"Comfort"},
    {id:"memory",emoji:"🫙",label:"Memories"},
    {id:"games",emoji:"🎮",label:"Games"},
    {id:"badges",emoji:"🏅",label:"Badges"},
    {id:"mailbox",emoji:"📬",label:mailCount>0?`Mail (${mailCount})`:"Mailbox"},
    {id:"profile",emoji:"👤",label:"Profile"},
  ];
  const admNav=[{id:"home",emoji:"🏠",label:"Home"},{id:"admin",emoji:"🛡️",label:"Dashboard"},{id:"profile",emoji:"👤",label:"Profile"}];
  const nav=user.role==="student"?stuNav:admNav;

  function renderPage(){
    switch(page){
      case"home":return(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,flexWrap:"wrap",gap:8}}>
            <H2>Hey {user.name}! 👋</H2>
            {user.role==="student"&&<Sticky color={C.mint} style={{fontSize:"0.85rem",padding:"5px 12px"}}>{hasConn?`🔗 Connected`:"⚠️ No admin yet"}</Sticky>}
          </div>
          <Sticky color={C.yellow} rotate={-1} style={{marginBottom:20,display:"block",fontSize:"1.1rem"}}>✨ {quote}</Sticky>
          {user.role==="student"?(
            <>
              <MoodWidget moodLog={moodLog} onMoodLog={m=>setMoodLog(p=>[m,...p])}/>
              <H3 style={{marginBottom:12}}>What would you like to do? 🌈</H3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:14}}>
                {[
                  {emoji:"💬",label:"Buddy Chat",id:"chat",color:C.lav},
                  {emoji:"🌿",label:"Challenges",id:"challenges",color:C.mint},
                  {emoji:"🌸",label:"Gratitude",id:"gratitude",color:C.pink},
                  {emoji:"🎨",label:"Scribble",id:"scribble",color:C.peach},
                  {emoji:"🕯️",label:"Comfort Room",id:"comfort",color:C.blue},
                  {emoji:"🫙",label:"Memory Jar",id:"memory",color:C.yellow},
                  {emoji:"🎮",label:"Games",id:"games",color:C.lav},
                ].map(item=>(
                  <Card key={item.id} color={item.color} onClick={()=>setPage(item.id)} style={{textAlign:"center",position:"relative"}}>
                    <div style={{fontSize:"2rem",marginBottom:6}}>{item.emoji}</div>
                    <H3>{item.label}</H3>
                    {hasConn&&!enabledIds.includes(item.id)&&(
                      <div style={{position:"absolute",top:8,right:10,fontSize:"0.75rem",background:"rgba(255,255,255,0.6)",borderRadius:10,padding:"2px 8px",color:C.muted}}>🔒 locked</div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          ):<AdminDashboard user={user}/>}
        </div>
      );
      case"chat":       return gate("chat",      "AI Buddy Chat 💬",         <AIChatPage username={user.username} chatHistory={chatHistory} setChatHistory={setChatHistory} connections={connections} gratitudeEntries={gratitudeEntries} memories={memories}/>);
      case"challenges": return gate("challenges","Wellness Challenges 🌿",    <ChallengesPage username={user.username}/>);
      case"gratitude":  return gate("gratitude", "Gratitude Corner 🌸",       <GratitudePage username={user.username} gratitudeEntries={gratitudeEntries} setGratitudeEntries={setGratitudeEntries}/>);
      case"scribble":   return gate("scribble",  "Scribble Canvas 🎨",        <ScribbleCanvas/>);
      case"comfort":    return gate("comfort",   "Comfort Room 🕯️",          <ComfortRoomPage/>);
      case"memory":     return gate("memory",    "Memory Jar 🫙",             <MemoryJarPage username={user.username} memories={memories} setMemories={setMemories}/>);
      case"games":      return gate("games",     "Relaxation Games 🎮",        <GamesPage/>);
      case"badges":     return gate("badges",    "Badge Collection 🏅",        <BadgesPage onGoToChallenges={()=>setPage("challenges")}/>);
      case"mailbox":    return <MailboxPage username={user.username} connections={connections} setConnections={setConnections}/>;
      case"profile":    return <ProfilePage user={user} pfp={pfp} setPfp={setPfp} onGoToChallenges={()=>setPage("challenges")}/>;
      case"admin":      return <AdminDashboard user={user}/>;
      default: return null;
    }
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        .nav-btn:hover{background:${C.lav}!important;border-color:${C.border}!important;}
      `}</style>
      {/* Header */}
      <div style={{background:C.paper,borderBottom:`2.5px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:8,position:"sticky",top:0,zIndex:100,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Permanent Marker', cursive",fontSize:"1.3rem",color:C.text,marginRight:4,flexShrink:0}}>🌸 Buddy</span>
        {/* desktop nav */}
        <div style={{flex:1,display:"flex",gap:4,flexWrap:"wrap",minWidth:0}}>
          {nav.map(n=>(
            <button key={n.id} className="nav-btn" onClick={()=>setPage(n.id)} style={{background:page===n.id?C.lav:"transparent",border:page===n.id?`2px solid ${C.border}`:"2px solid transparent",borderRadius:"12px 4px 12px 4px",padding:"5px 11px",fontFamily:"'Patrick Hand', cursive",fontSize:"0.9rem",color:C.text,cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap",fontWeight:page===n.id?700:400}}>
              {n.emoji} {n.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {pfp?<img src={pfp} alt="" style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${C.border}`,objectFit:"cover",cursor:"pointer"}} onClick={()=>setPage("profile")}/>:<div onClick={()=>setPage("profile")} style={{width:30,height:30,borderRadius:"50%",background:C.lav,border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"'Caveat', cursive",fontWeight:700}}>{user.name?.[0]?.toUpperCase()}</div>}
          <Btn small color={C.pink} onClick={onLogout}>Logout 🚪</Btn>
        </div>
      </div>
      {/* Content */}
      <div style={{flex:1,padding:"24px 20px",maxWidth:900,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
        {renderPage()}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState(()=>{
    const s=LS.get("sb_session",null);
    if(s){const u=LS.get("sb_users",{});if(u[s])return"app";}
    return"landing";
  });
  const [user,setUser]=useState(()=>{
    const s=LS.get("sb_session",null);
    if(s){const u=LS.get("sb_users",{});return u[s]||null;}
    return null;
  });
  function handleAuth(u){setUser(u);setScreen("app");}
  function handleLogout(){LS.set("sb_session",null);setUser(null);setScreen("landing");}
  return(
    <>
      <style>{FONTS}</style>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fdf6ec;color:#2c1a0e;-webkit-font-smoothing:antialiased;}
        input,textarea,select,button{color:#2c1a0e;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:#c9b8f7;border-radius:3px;}
        button:focus-visible{outline:2px solid #7b5ea7;outline-offset:2px;}
      `}</style>
      {screen==="landing"&&<LandingPage onLogin={()=>setScreen("login")} onSignup={()=>setScreen("signup")}/>}
      {screen==="login"  &&<AuthPage mode="login"  onSuccess={handleAuth} onToggle={()=>setScreen("signup")}/>}
      {screen==="signup" &&<AuthPage mode="signup" onSuccess={handleAuth} onToggle={()=>setScreen("login")}/>}
      {screen==="app"    &&user&&<Dashboard user={user} onLogout={handleLogout}/>}
    </>
  );
}