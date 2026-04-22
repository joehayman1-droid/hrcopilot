import { useState, useRef, useEffect } from "react";

// ── brand colors (exact from logo) ──────────────────────────────────────────
const B = {
  navy:    "#0d1b3e",
  blue:    "#1a7af8",
  blueD:   "#1460cc",
  purple:  "#6b3fa0",
  white:   "#ffffff",
  pearl:   "#f5f8ff",
  silver:  "#e3eaf5",
  fog:     "#8fa3be",
  ink:     "#0d1b3e",
  soft:    "#4a6080",
  green:   "#059669",
  amber:   "#d97706",
  red:     "#dc2626",
  bg:      "#f0f4fb",
};

// Logo SVG — matches hrcopilot brand mark exactly
function LogoMark({ height=32, dark=false }) {
  const navy = dark ? "#ffffff" : "#0d1b3e";
  const blue = "#1a7af8";
  const purple = "#6b3fa0";
  return (
    <svg height={height} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* left person (navy) */}
      <circle cx="22" cy="18" r="6" fill={navy}/>
      <ellipse cx="22" cy="32" rx="9" ry="7" fill={navy}/>
      {/* center person (blue, larger) */}
      <circle cx="44" cy="14" r="8" fill={blue}/>
      <ellipse cx="44" cy="30" rx="12" ry="9" fill={blue}/>
      {/* right person (navy) */}
      <circle cx="66" cy="18" r="6" fill={navy}/>
      <ellipse cx="66" cy="32" rx="9" ry="7" fill={navy}/>
      {/* arc / table */}
      <path d="M8 38 Q44 46 80 38" stroke={navy} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* purple nav arrow */}
      <polygon points="44,52 36,42 52,42" fill={purple}/>
      {/* wordmark: "hr" navy, "copilot" blue */}
      <text x="95" y="38" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="28" fill={navy}>hr</text>
      <text x="127" y="38" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="28" fill={blue}>copilot</text>
    </svg>
  );
}

// ── fonts ─────────────────────────────────────────────────────────────────────
const FS = "'DM Sans', sans-serif";
const FM = "'DM Mono', monospace";

// ── seed data ─────────────────────────────────────────────────────────────────
const INIT_EMPS = [
  { id:1, name:"Sarah Mitchell", role:"Sales Associate", dept:"Sales",
    start:"2022-03-15", email:"sarah@acmeroofing.com", phone:"555-0101",
    pto:{ bal:8.5, used:3.5, rate:1.5 },
    docs:[
      { id:"d1", type:"Written Warning",  date:"Apr 18, 2024", note:"Second no-call/no-show in 30 days" },
      { id:"d2", type:"Commendation",     date:"Jan 10, 2024", note:"Exceeded Q4 sales target by 22%" },
    ],
    checks:[
      { id:"c1",  label:"I-9 Eligibility Verification",  done:true  },
      { id:"c2",  label:"W-4 Federal Withholding",       done:true  },
      { id:"c3",  label:"Direct Deposit Auth",           done:true  },
      { id:"c4",  label:"Employee Handbook Signed",      done:true  },
      { id:"c5",  label:"Benefits Enrollment",           done:false },
      { id:"c6",  label:"IT Access & Credentials",       done:false },
      { id:"c7",  label:"Safety / OSHA Training",        done:false },
    ],
  },
  { id:2, name:"James Torrez", role:"Warehouse Lead", dept:"Operations",
    start:"2021-07-01", email:"james@acmeroofing.com", phone:"555-0102",
    pto:{ bal:12, used:8, rate:2 },
    docs:[
      { id:"d3", type:"Performance Improvement Plan", date:"Apr 12, 2024", note:"Output below threshold 60 days" },
    ],
    checks:[
      { id:"c8",  label:"I-9 Eligibility Verification",  done:true },
      { id:"c9",  label:"W-4 Federal Withholding",       done:true },
      { id:"c10", label:"Direct Deposit Auth",           done:true },
      { id:"c11", label:"Employee Handbook Signed",      done:true },
      { id:"c12", label:"Benefits Enrollment",           done:true },
      { id:"c13", label:"IT Access & Credentials",       done:true },
      { id:"c14", label:"Safety / OSHA Training",        done:true },
    ],
  },
  { id:3, name:"Priya Nair", role:"Office Coordinator", dept:"Admin",
    start:"2023-01-10", email:"priya@acmeroofing.com", phone:"555-0103",
    pto:{ bal:6, used:2, rate:1.5 },
    docs:[
      { id:"d4", type:"Commendation", date:"Apr 5, 2024", note:"Q1 vendor renegotiation saved $14,200/yr" },
    ],
    checks:[
      { id:"c15", label:"I-9 Eligibility Verification",  done:true  },
      { id:"c16", label:"W-4 Federal Withholding",       done:true  },
      { id:"c17", label:"Direct Deposit Auth",           done:false },
      { id:"c18", label:"Employee Handbook Signed",      done:true  },
      { id:"c19", label:"Benefits Enrollment",           done:false },
      { id:"c20", label:"IT Access & Credentials",       done:false },
      { id:"c21", label:"Safety / OSHA Training",        done:false },
    ],
  },
];

const DOC_TYPES = [
  { id:"warn",   label:"Written Warning",              color:B.amber,  hint:"Document a policy violation." },
  { id:"pip",    label:"Performance Improvement Plan", color:B.blue,   hint:"Set measurable goals and timeline." },
  { id:"term",   label:"Termination Letter",           color:B.red,    hint:"Never separate without one." },
  { id:"comm",   label:"Commendation Letter",          color:B.green,  hint:"Reinforce excellent performance." },
  { id:"verbal", label:"Verbal Warning Record",        color:B.fog,    hint:"Document before problems escalate." },
  { id:"offer",  label:"Offer Letter",                 color:B.purple, hint:"Professional offer with at-will language." },
];

const RISK_ITEMS = [
  { id:"r1", label:"I-9 errors — fines up to $27,000 per employee",          sev:"high"   },
  { id:"r2", label:"No signed handbook — policy disputes become unwinnable",  sev:"high"   },
  { id:"r3", label:"Missing verbal warning records — terminations at risk",   sev:"medium" },
  { id:"r4", label:"Contractor misclassification — IRS audits, back pay",     sev:"high"   },
  { id:"r5", label:"OSHA training gaps — liability for workplace injuries",   sev:"medium" },
  { id:"r6", label:"No anti-harassment policy documented",                    sev:"high"   },
];

const TABS = [
  { id:"home",      label:"Home",       icon:"⌂" },
  { id:"dashboard", label:"Dashboard",  icon:"▦" },
  { id:"documents", label:"Documents",  icon:"◧" },
  { id:"employees", label:"People",     icon:"◈" },
  { id:"pto",       label:"PTO",        icon:"◷" },
  { id:"risks",     label:"Risks",      icon:"◉" },
  { id:"expert",    label:"Experts",    icon:"✦" },
  { id:"pricing",   label:"Pricing",    icon:"◆" },
];

// ── atoms ─────────────────────────────────────────────────────────────────────
function Av({ name, size=40, color }) {
  const pal=[B.blue,B.green,B.amber,B.purple,B.blueD];
  const bg=color||pal[name.charCodeAt(0)%pal.length];
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`linear-gradient(135deg,${bg},${bg}bb)`,
      display:"flex",alignItems:"center",justifyContent:"center",
      color:"#fff",fontWeight:700,fontSize:size*.38,fontFamily:FS,
      boxShadow:`0 2px 8px ${bg}40` }}>{name[0]}</div>
  );
}

function Chip({ label, color, sm }) {
  return (
    <span style={{ display:"inline-block",
      padding:sm?"2px 8px":"3px 11px",borderRadius:20,
      background:color+"18",color,
      fontSize:sm?10:11,fontWeight:700,fontFamily:FM,
      letterSpacing:".3px",textTransform:"uppercase" }}>{label}</span>
  );
}

function Btn({ children, onClick, v="primary", full, disabled, sx={} }) {
  const vs={
    primary:{ background:`linear-gradient(135deg,${B.blue},${B.blueD})`,color:"#fff",border:"none",
              boxShadow:`0 4px 14px ${B.blue}38` },
    purple: { background:`linear-gradient(135deg,${B.purple},#4c1d95)`,color:"#fff",border:"none",
              boxShadow:`0 4px 14px ${B.purple}38` },
    outline:{ background:"transparent",color:B.blue,border:`1.5px solid ${B.blue}` },
    ghost:  { background:B.pearl,color:B.soft,border:`1px solid ${B.silver}` },
    danger: { background:B.red,color:"#fff",border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"13px 22px",borderRadius:14,cursor:disabled?"not-allowed":"pointer",
      fontFamily:FS,fontSize:15,fontWeight:700,opacity:disabled?.5:1,
      transition:"all .18s",width:full?"100%":"auto",
      WebkitTapHighlightColor:"transparent",...vs[v],...sx }}>{children}</button>
  );
}

function SmBtn({ children, onClick, v="ghost", disabled }) {
  const vs={
    primary:{ background:`linear-gradient(135deg,${B.blue},${B.blueD})`,color:"#fff",border:"none" },
    ghost:  { background:B.pearl,color:B.soft,border:`1px solid ${B.silver}` },
    outline:{ background:"transparent",color:B.blue,border:`1px solid ${B.blue}` },
    danger: { background:B.red,color:"#fff",border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:"8px 14px",borderRadius:10,cursor:disabled?"not-allowed":"pointer",
      fontFamily:FS,fontSize:13,fontWeight:600,opacity:disabled?.5:1,
      transition:"all .15s",WebkitTapHighlightColor:"transparent",...vs[v] }}>{children}</button>
  );
}

function Card({ children, sx={} }) {
  return (
    <div style={{ background:B.white,border:`1px solid ${B.silver}`,
      borderRadius:20,padding:20,...sx }}>{children}</div>
  );
}

function SectionHead({ label, title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      {label && <div style={{ fontSize:10,fontFamily:FM,color:B.blue,fontWeight:700,
        letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6 }}>{label}</div>}
      <h1 style={{ fontSize:26,fontWeight:700,color:B.ink,fontFamily:FS,
        margin:0,letterSpacing:"-.3px",lineHeight:1.2 }}>{title}</h1>
      {sub && <p style={{ color:B.soft,fontFamily:FS,marginTop:6,
        fontSize:14,lineHeight:1.6,margin:"6px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ── bottom nav (mobile) ───────────────────────────────────────────────────────
function BottomNav({ active, go }) {
  const primary=[
    { id:"dashboard", label:"home",   icon:"▦" },
    { id:"documents", label:"docs",   icon:"◧" },
    { id:"employees", label:"people", icon:"◈" },
    { id:"pto",       label:"pto",    icon:"◷" },
    { id:"risks",     label:"risks",  icon:"◉" },
  ];
  return (
    <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:100,
      background:B.white,borderTop:`1px solid ${B.silver}`,
      display:"flex",paddingBottom:"env(safe-area-inset-bottom)",
      boxShadow:"0 -4px 20px rgba(13,27,62,.08)" }}>
      {primary.map(t=>{
        const on=active===t.id;
        return (
          <button key={t.id} onClick={()=>go(t.id)} style={{
            flex:1,padding:"10px 0 8px",border:"none",
            background:"transparent",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            WebkitTapHighlightColor:"transparent" }}>
            <span style={{ fontSize:18,color:on?B.blue:B.fog,
              transition:"color .15s" }}>{t.icon}</span>
            <span style={{ fontSize:10,fontFamily:FM,fontWeight:700,
              color:on?B.blue:B.fog,letterSpacing:".3px",
              textTransform:"uppercase",transition:"color .15s" }}>{t.label}</span>
            {on && <div style={{ width:4,height:4,borderRadius:"50%",
              background:B.blue,marginTop:-2 }}/>}
          </button>
        );
      })}
    </div>
  );
}

// ── top bar ───────────────────────────────────────────────────────────────────
function TopBar({ tab, go }) {
  const isHome = tab==="home";
  if(isHome) return null;
  return (
    <div style={{ position:"sticky",top:0,zIndex:50,
      background:"rgba(240,244,251,.95)",backdropFilter:"blur(12px)",
      WebkitBackdropFilter:"blur(12px)",
      borderBottom:`1px solid ${B.silver}`,
      padding:"12px 20px",display:"flex",alignItems:"center",
      justifyContent:"space-between" }}>
      <LogoMark height={36}/>
      <div style={{ display:"flex",gap:8 }}>
        <SmBtn onClick={()=>go("expert")} v="outline">experts ✦</SmBtn>
        <SmBtn onClick={()=>go("pricing")} v="primary">upgrade</SmBtn>
      </div>
    </div>
  );
}

// ── landing ───────────────────────────────────────────────────────────────────
function Landing({ go }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{ setTimeout(()=>setVis(true),100); },[]);

  return (
    <div style={{ minHeight:"100vh",background:B.navy,
      display:"flex",flexDirection:"column",fontFamily:FS }}>

      {/* glow bg */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-180,right:-120,width:420,height:420,
          borderRadius:"50%",background:`radial-gradient(circle,${B.blue}18,transparent 70%)` }}/>
        <div style={{ position:"absolute",bottom:-120,left:-80,width:320,height:320,
          borderRadius:"50%",background:`radial-gradient(circle,${B.purple}12,transparent 70%)` }}/>
      </div>

      {/* nav */}
      <div style={{ position:"relative",padding:"20px 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:`1px solid rgba(255,255,255,.08)` }}>
        <LogoMark height={42} dark={true}/>
        <div style={{ display:"flex",gap:8 }}>
          <SmBtn onClick={()=>go("dashboard")} v="ghost">log in</SmBtn>
          <Btn onClick={()=>go("dashboard")} sx={{ padding:"10px 18px",fontSize:14 }}>start free</Btn>
        </div>
      </div>

      {/* hero */}
      <div style={{ position:"relative",flex:1,display:"flex",
        flexDirection:"column",alignItems:"center",textAlign:"center",
        padding:"52px 28px 40px",
        opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",
        transition:"all .8s ease" }}>

        <div style={{ display:"inline-flex",alignItems:"center",gap:7,
          background:`${B.purple}28`,border:`1px solid ${B.purple}50`,
          borderRadius:30,padding:"5px 14px",marginBottom:24 }}>
          <span style={{ fontSize:11,color:"#c4a8f0",fontFamily:FM,
            fontWeight:700,letterSpacing:".5px" }}>✦ backed by certified hr professionals</span>
        </div>

        <h1 style={{ fontSize:40,fontWeight:800,color:B.white,fontFamily:FS,
          lineHeight:1.1,letterSpacing:"-.5px",margin:"0 0 18px",maxWidth:340 }}>
          HR that actually<br/>
          <span style={{ background:`linear-gradient(135deg,${B.blue},#60a5fa)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            protects you.
          </span>
        </h1>

        <p style={{ fontSize:16,color:"#7fa8c8",fontFamily:FS,
          maxWidth:320,margin:"0 0 32px",lineHeight:1.7 }}>
          AI-powered HR tools plus real certified professionals — built for
          businesses too small for an HR department.
        </p>

        <Btn onClick={()=>go("dashboard")} full
          sx={{ maxWidth:320,padding:"16px",fontSize:16,borderRadius:16 }}>
          see the platform →
        </Btn>
        <button onClick={()=>go("expert")} style={{ marginTop:14,background:"none",
          border:"none",color:"#7fa8c8",fontFamily:FS,fontSize:14,cursor:"pointer",
          textDecoration:"underline",textUnderlineOffset:3 }}>
          meet our experts
        </button>

        {/* fear stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",
          gap:12,marginTop:44,width:"100%",maxWidth:360 }}>
          {[
            { n:"$85k+", d:"To defend a wrongful termination lawsuit" },
            { n:"40%",   d:"Of small businesses faced lawsuits in 2024" },
            { n:"$27k",  d:"Fine per I-9 error, per employee" },
            { n:"80%",   d:"Of turnover starts with a bad hire" },
          ].map(s=>(
            <div key={s.n} style={{ background:"rgba(255,255,255,.05)",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:16,padding:"16px 14px",textAlign:"left" }}>
              <div style={{ fontSize:26,fontWeight:800,
                background:`linear-gradient(135deg,${B.blue},#818cf8)`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                lineHeight:1,marginBottom:6 }}>{s.n}</div>
              <div style={{ fontSize:11,color:"#6a8aaa",fontFamily:FS,
                lineHeight:1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* features */}
      <div style={{ position:"relative",padding:"0 20px 32px" }}>
        <div style={{ fontSize:11,color:B.blue,fontFamily:FM,fontWeight:700,
          letterSpacing:"1.5px",textTransform:"uppercase",
          marginBottom:16,textAlign:"center" }}>everything you need</div>
        {[
          { icon:"◧", title:"AI document generator",   color:B.blue,
            d:"Warnings, PIPs, termination letters in 60 seconds." },
          { icon:"◉", title:"risk radar",               color:B.amber,
            d:"Know your compliance gaps before they become lawsuits." },
          { icon:"◈", title:"employee file cabinet",    color:B.green,
            d:"Every doc, signature, and onboarding step in one place." },
          { icon:"✦", title:"ask our experts",          color:B.purple,
            d:"Real certified HR professionals answer your hardest questions." },
        ].map(f=>(
          <div key={f.title} style={{ background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.07)",
            borderRadius:16,padding:"18px",marginBottom:10,
            display:"flex",alignItems:"flex-start",gap:14 }}>
            <div style={{ fontSize:22,color:f.color,flexShrink:0,
              marginTop:2 }}>{f.icon}</div>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:B.white,
                fontFamily:FS,marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:13,color:"#6a8aaa",fontFamily:FS,
                lineHeight:1.6 }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* expert strip */}
      <div style={{ position:"relative",margin:"0 20px 40px",
        background:`linear-gradient(135deg,${B.purple}20,${B.blue}10)`,
        border:`1px solid ${B.purple}30`,borderRadius:20,padding:"22px 20px" }}>
        <Chip label="✦ human experts · not just ai" color={B.purple}/>
        <h2 style={{ fontSize:20,fontWeight:700,color:B.white,fontFamily:FS,
          margin:"12px 0 8px",lineHeight:1.2 }}>
          real answers from certified hr professionals.
        </h2>
        <p style={{ fontSize:13,color:"#7fa8c8",fontFamily:FS,
          lineHeight:1.7,margin:"0 0 16px" }}>
          Our expert network brings decades of combined experience. When AI isn't enough,
          a real professional is a tap away.
        </p>
        <Btn onClick={()=>go("expert")} v="purple"
          sx={{ padding:"12px 20px",fontSize:14 }}>meet our experts →</Btn>
      </div>

      {/* cta */}
      <div style={{ position:"relative",padding:"0 20px 60px",textAlign:"center" }}>
        <h2 style={{ fontSize:26,fontWeight:700,color:B.white,fontFamily:FS,
          margin:"0 0 10px" }}>ready to stop flying blind?</h2>
        <p style={{ color:"#6a8aaa",fontFamily:FS,marginBottom:24,fontSize:14 }}>
          start free. no credit card. cancel anytime.
        </p>
        <Btn onClick={()=>go("dashboard")} full
          sx={{ maxWidth:320,margin:"0 auto",display:"block",
            padding:"16px",fontSize:16,borderRadius:16 }}>
          get started free →
        </Btn>
        <button onClick={()=>go("pricing")} style={{ marginTop:12,background:"none",
          border:"none",color:"#6a8aaa",fontFamily:FS,fontSize:13,cursor:"pointer" }}>
          view pricing
        </button>
      </div>
    </div>
  );
}

// ── dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ emps, go, setSel }) {
  const totalDocs=emps.reduce((a,e)=>a+e.docs.length,0);
  const gaps=emps.filter(e=>e.checks.some(c=>!c.done));
  const pto=emps.reduce((a,e)=>a+e.pto.bal,0);

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="welcome back" title="your hr dashboard"
        sub="Stay protected. Stay organized."/>

      {/* kpi grid */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24 }}>
        {[
          { v:emps.length,    l:"employees",      color:B.blue   },
          { v:totalDocs,      l:"documents",      color:B.green  },
          { v:pto.toFixed(1), l:"pto days left",  color:B.amber  },
          { v:gaps.length,    l:"onboard gaps",   color:gaps.length?B.red:B.green },
        ].map(k=>(
          <Card key={k.l} sx={{ padding:"18px 16px" }}>
            <div style={{ fontSize:34,fontWeight:800,color:k.color,lineHeight:1 }}>{k.v}</div>
            <div style={{ fontSize:12,color:B.soft,fontFamily:FM,marginTop:5,
              textTransform:"uppercase",letterSpacing:".5px" }}>{k.l}</div>
          </Card>
        ))}
      </div>

      {/* quick actions */}
      <Card sx={{ marginBottom:16 }}>
        <div style={{ fontSize:12,fontFamily:FM,color:B.fog,fontWeight:700,
          textTransform:"uppercase",letterSpacing:".8px",marginBottom:14 }}>quick actions</div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[
            { label:"generate a document",    tab:"documents", color:B.blue,   icon:"◧" },
            { label:"check compliance risks", tab:"risks",     color:B.amber,  icon:"◉" },
            { label:"manage pto requests",    tab:"pto",       color:B.green,  icon:"◷" },
            { label:"ask our hr experts",     tab:"expert",    color:B.purple, icon:"✦", pro:true },
          ].map(a=>(
            <button key={a.label} onClick={()=>go(a.tab)} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"14px 16px",borderRadius:14,
              border:`1px solid ${B.silver}`,background:B.pearl,
              cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent" }}>
              <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
                background:a.color+"18",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:18,color:a.color }}>{a.icon}</div>
              <span style={{ fontSize:15,fontFamily:FS,color:B.ink,fontWeight:600,flex:1 }}>
                {a.label}
              </span>
              {a.pro && <Chip label="pro" color={B.purple} sm/>}
              <span style={{ color:B.fog,fontSize:16 }}>›</span>
            </button>
          ))}
        </div>
      </Card>

      {/* team */}
      <Card sx={{ marginBottom:16 }}>
        <div style={{ fontSize:12,fontFamily:FM,color:B.fog,fontWeight:700,
          textTransform:"uppercase",letterSpacing:".8px",marginBottom:14 }}>your team</div>
        {emps.map(e=>{
          const pct=Math.round(e.checks.filter(c=>c.done).length/e.checks.length*100);
          return (
            <button key={e.id} onClick={()=>{ setSel(e); go("employees"); }} style={{
              display:"flex",alignItems:"center",gap:12,width:"100%",
              padding:"12px 0",borderBottom:`1px solid ${B.pearl}`,
              background:"none",border:"none",cursor:"pointer",
              borderBottom:`1px solid ${B.pearl}`,
              WebkitTapHighlightColor:"transparent" }}>
              <Av name={e.name} size={42}/>
              <div style={{ flex:1,textAlign:"left" }}>
                <div style={{ fontSize:15,fontWeight:700,color:B.ink,fontFamily:FS }}>{e.name}</div>
                <div style={{ fontSize:11,color:B.soft,fontFamily:FM,marginTop:1 }}>{e.role}</div>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:6 }}>
                  <div style={{ flex:1,background:B.silver,borderRadius:3,height:4,maxWidth:80 }}>
                    <div style={{ height:"100%",borderRadius:3,
                      width:`${pct}%`,background:pct===100?B.green:B.blue,
                      transition:"width .5s" }}/>
                  </div>
                  <span style={{ fontSize:10,color:pct===100?B.green:B.soft,
                    fontFamily:FM,fontWeight:700 }}>{pct}%</span>
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontSize:14,fontWeight:700,color:B.blue }}>{e.pto.bal}d</div>
                <div style={{ fontSize:10,color:B.fog,fontFamily:FM }}>PTO</div>
              </div>
            </button>
          );
        })}
      </Card>

      {/* expert tip */}
      <div style={{ background:`linear-gradient(135deg,${B.navy},#162545)`,
        borderRadius:20,padding:"20px" }}>
        <Chip label="expert insight" color={B.purple}/>
        <p style={{ fontSize:14,color:"#8faabe",fontFamily:FS,
          lineHeight:1.75,margin:"10px 0 10px" }}>
          "The costliest HR mistake we see is owners waiting until a situation is serious
          before documenting. Start your paper trail at the very first conversation."
        </p>
        <div style={{ fontSize:11,color:B.purple,fontFamily:FM }}>
          — hrcopilot expert network
        </div>
      </div>
    </div>
  );
}

// ── document generator ────────────────────────────────────────────────────────
function DocGen({ emps, onSave }) {
  const [step,setStep]=useState(1);
  const [emp,setEmp]=useState(null);
  const [dt,setDt]=useState(null);
  const [form,setForm]=useState({ what:"",when:"",prior:"none",context:"" });
  const [out,setOut]=useState("");
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(false);

  const run=async()=>{
    setLoading(true); setStep(4);
    const prompt=`You are a senior HR professional generating a formal ${dt.label} for a small business.
Employee: ${emp.name} | Role: ${emp.role} | Start: ${emp.start}
Document: ${dt.label}
Incident: ${form.what}
Date: ${form.when||"Today"}
Prior Record: ${form.prior}
Context: ${form.context}
Write a complete, professional, legally-defensible document in plain text. Include company name placeholder, date, RE: line, 2-3 factual paragraphs, clear expectations, and signature blocks. Tone: firm, fair, protective.`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:prompt}] })});
      const d=await r.json();
      const text=d.content?.map(b=>b.text||"").join("");
      if(text) { setOut(text); setLoading(false); return; }
    } catch(_) {}
    // Demo output for preview environments
    const today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    setOut(`[COMPANY NAME]
${today}

RE: ${dt.label} — ${emp.name}

Dear ${emp.name},

This ${dt.label} is being issued regarding the following matter: ${form.what||"[incident details]"}.

${form.prior==="none"
  ? "This is a first formal notice. We take this matter seriously and expect immediate and sustained improvement."
  : "Given prior warnings already on record, this situation requires your immediate attention and corrective action."}

${form.context ? form.context+"\n\n" : ""}You are expected to demonstrate immediate improvement in the areas outlined above. Failure to do so may result in further disciplinary action, up to and including termination of employment.

Please sign below to acknowledge receipt of this document. Acknowledgment of receipt does not constitute agreement with its contents.

___________________________          Date: __________
${emp.name}, ${emp.role}

___________________________          Date: __________
Employer / Manager

___________________________          Date: __________
Witness

— — —
This document has been placed in your personnel file.`);
    setLoading(false);
  };

  const saveDoc=()=>{
    if(saved)return;
    onSave(emp.id,{ id:`d${Date.now()}`,type:dt.label,
      date:new Date().toLocaleDateString(),note:form.what.slice(0,70),content:out });
    setSaved(true);
  };

  const pdf=()=>{
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>${dt.label}</title>
    <style>body{font-family:Georgia,serif;max-width:680px;margin:60px auto;
      line-height:1.9;color:#0d1b3e;font-size:14px}
    h2{font-size:18px;border-bottom:2px solid #1a7af8;padding-bottom:10px;margin-bottom:20px}
    pre{white-space:pre-wrap;font-family:Georgia,serif;line-height:1.9}
    footer{margin-top:48px;border-top:1px solid #e3eaf5;padding-top:14px;
      text-align:center;font-size:11px;color:#8fa3be;font-family:monospace}
    </style></head><body>
    <h2>hrcopilot — ${dt.label}</h2>
    <p style="color:#8fa3be;font-size:12px;font-family:monospace">
      ${emp.name} · ${emp.role} · ${new Date().toLocaleDateString()}</p>
    <pre>${out}</pre>
    <footer>hrcopilot · expert-backed hr · review with your attorney before use</footer>
    </body></html>`);
    w.document.close(); w.print();
  };

  const reset=()=>{ setStep(1);setEmp(null);setDt(null);
    setForm({what:"",when:"",prior:"none",context:""});setOut("");setSaved(false); };

  const inp={ width:"100%",padding:"13px 14px",borderRadius:12,
    border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
    color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",
    WebkitAppearance:"none" };

  // stepper dots
  const StepDots=()=>(
    <div style={{ display:"flex",justifyContent:"center",gap:6,marginBottom:24 }}>
      {[1,2,3,4].map(s=>(
        <div key={s} style={{ width:s===step?24:8,height:8,borderRadius:4,
          transition:"all .3s",
          background:s<step?B.green:s===step?B.blue:B.silver }}/>
      ))}
    </div>
  );

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="ai-powered" title="document generator"
        sub="Professional HR documents in 60 seconds."/>
      <StepDots/>

      {step===1 && (
        <div>
          <div style={{ fontSize:16,fontWeight:700,color:B.ink,
            fontFamily:FS,marginBottom:16 }}>who is this for?</div>
          {emps.map(e=>(
            <button key={e.id} onClick={()=>{ setEmp(e);setStep(2); }} style={{
              display:"flex",alignItems:"center",gap:14,width:"100%",
              padding:"16px",borderRadius:16,border:`1.5px solid ${B.silver}`,
              background:B.white,cursor:"pointer",marginBottom:10,textAlign:"left",
              WebkitTapHighlightColor:"transparent" }}>
              <Av name={e.name} size={46}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16,fontWeight:700,color:B.ink }}>{e.name}</div>
                <div style={{ fontSize:12,color:B.soft,fontFamily:FM,marginTop:2 }}>
                  {e.role} · {e.docs.length} docs on file
                </div>
              </div>
              <span style={{ color:B.blue,fontSize:20 }}>›</span>
            </button>
          ))}
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{ fontSize:16,fontWeight:700,color:B.ink,marginBottom:4 }}>
            document type
          </div>
          <div style={{ fontSize:13,color:B.soft,marginBottom:18 }}>
            for <strong>{emp?.name}</strong>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {DOC_TYPES.map(d=>(
              <button key={d.id} onClick={()=>{ setDt(d);setStep(3); }} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"16px",borderRadius:16,border:`1.5px solid ${B.silver}`,
                background:B.white,cursor:"pointer",textAlign:"left",
                WebkitTapHighlightColor:"transparent" }}>
                <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,
                  background:d.color+"18",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:18,color:d.color }}>●</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:B.ink }}>{d.label}</div>
                  <div style={{ fontSize:12,color:B.soft,marginTop:2 }}>{d.hint}</div>
                </div>
                <span style={{ color:B.blue,fontSize:20 }}>›</span>
              </button>
            ))}
          </div>
          <button onClick={()=>setStep(1)} style={{ marginTop:16,background:"none",
            border:"none",color:B.blue,cursor:"pointer",fontFamily:FS,fontSize:15,
            padding:"10px 0" }}>← back</button>
        </div>
      )}

      {step===3 && (
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
            <Chip label={dt?.label} color={dt?.color}/>
          </div>
          <div style={{ fontSize:13,color:B.soft,marginBottom:20 }}>
            for <strong>{emp?.name}</strong>
          </div>
          {[
            { k:"what", label:"what happened?", rows:4,
              ph:"Be specific and factual. Include date, what occurred, and who was present." },
            { k:"when", label:"date of incident", rows:1,
              ph:"e.g. April 18, 2026" },
            { k:"context", label:"additional context (optional)", rows:3,
              ph:"Prior conversations, policy references, expectations going forward..." },
          ].map(f=>(
            <div key={f.k} style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:13,fontWeight:700,
                color:B.soft,marginBottom:8 }}>{f.label}</label>
              <textarea value={form[f.k]}
                onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))}
                placeholder={f.ph} rows={f.rows}
                style={{ ...inp,resize:"vertical" }}/>
            </div>
          ))}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,
              color:B.soft,marginBottom:8 }}>prior warnings?</label>
            <select value={form.prior}
              onChange={e=>setForm(p=>({...p,prior:e.target.value}))}
              style={{ ...inp,cursor:"pointer" }}>
              <option value="none">none — first offense</option>
              <option value="verbal">verbal warning only</option>
              <option value="one">1 written warning</option>
              <option value="multiple">multiple warnings on file</option>
            </select>
          </div>
          <Btn onClick={run} disabled={!form.what} full>generate document →</Btn>
          <button onClick={()=>setStep(2)} style={{ display:"block",width:"100%",
            marginTop:12,background:"none",border:"none",color:B.blue,
            cursor:"pointer",fontFamily:FS,fontSize:15,padding:"10px 0" }}>← back</button>
        </div>
      )}

      {step===4 && (
        loading ? (
          <div style={{ textAlign:"center",padding:"60px 0" }}>
            <div style={{ width:48,height:48,borderRadius:"50%",margin:"0 auto 20px",
              border:`3px solid ${B.silver}`,borderTop:`3px solid ${B.blue}`,
              animation:"spin .8s linear infinite" }}/>
            <div style={{ fontSize:16,color:B.soft }}>drafting your document...</div>
            <div style={{ fontSize:12,color:B.blue,fontFamily:FM,marginTop:6 }}>
              expert-quality language, generated by ai
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:16 }}>
              <div>
                <div style={{ fontSize:16,fontWeight:700,color:B.ink }}>ready</div>
                <Chip label="✓ generated" color={B.green} sm/>
              </div>
              <SmBtn onClick={reset} v="outline">new doc</SmBtn>
            </div>
            <pre style={{ background:B.pearl,border:`1px solid ${B.silver}`,
              borderRadius:16,padding:18,fontFamily:FM,fontSize:12,color:B.ink,
              whiteSpace:"pre-wrap",lineHeight:1.9,maxHeight:360,
              overflowY:"auto",marginBottom:14 }}>{out}</pre>
            <div style={{ display:"flex",gap:10,marginBottom:14,flexWrap:"wrap" }}>
              <SmBtn onClick={()=>navigator.clipboard?.writeText(out)}>copy</SmBtn>
              <SmBtn onClick={saveDoc} disabled={saved} v="primary">
                {saved?"✓ saved":"save to file"}
              </SmBtn>
              <SmBtn onClick={pdf} v="outline">export pdf</SmBtn>
            </div>
            <div style={{ padding:"12px 14px",background:"#fffbeb",
              border:`1px solid ${B.amber}28`,borderRadius:12 }}>
              <div style={{ fontSize:11,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>
                ⚠ review with your attorney before use for sensitive matters.
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ── employees ─────────────────────────────────────────────────────────────────
function Employees({ emps, sel, setSel, onToggle }) {
  const [view,setView]=useState("list"); // list | detail
  const e=sel||emps[0];
  const pct=Math.round(e.checks.filter(c=>c.done).length/e.checks.length*100);

  if(view==="list"||!sel) return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="team management" title="people"/>
      {emps.map(em=>{
        const p2=Math.round(em.checks.filter(c=>c.done).length/em.checks.length*100);
        return (
          <button key={em.id} onClick={()=>{ setSel(em);setView("detail"); }} style={{
            display:"flex",alignItems:"center",gap:14,width:"100%",
            padding:"16px",borderRadius:16,border:`1px solid ${B.silver}`,
            background:B.white,cursor:"pointer",marginBottom:10,textAlign:"left",
            WebkitTapHighlightColor:"transparent" }}>
            <Av name={em.name} size={48}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16,fontWeight:700,color:B.ink }}>{em.name}</div>
              <div style={{ fontSize:12,color:B.soft,fontFamily:FM,marginTop:1 }}>{em.role}</div>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:7 }}>
                <div style={{ width:60,background:B.silver,borderRadius:3,height:4 }}>
                  <div style={{ height:"100%",borderRadius:3,width:`${p2}%`,
                    background:p2===100?B.green:B.blue }}/>
                </div>
                <span style={{ fontSize:10,color:p2===100?B.green:B.soft,
                  fontFamily:FM,fontWeight:700 }}>{p2}% onboarded</span>
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontSize:15,fontWeight:700,color:B.blue }}>{em.pto.bal}d</div>
              <div style={{ fontSize:10,color:B.fog,fontFamily:FM }}>{em.docs.length} docs</div>
            </div>
          </button>
        );
      })}
      <button style={{ display:"flex",alignItems:"center",justifyContent:"center",
        gap:8,width:"100%",padding:"16px",borderRadius:16,
        border:`1.5px dashed ${B.silver}`,background:"transparent",
        cursor:"pointer",color:B.blue,fontSize:15,fontFamily:FS,fontWeight:700,
        WebkitTapHighlightColor:"transparent" }}>+ add employee</button>
    </div>
  );

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <button onClick={()=>setView("list")} style={{ background:"none",border:"none",
        color:B.blue,cursor:"pointer",fontFamily:FS,fontSize:15,
        padding:"0 0 16px",display:"flex",alignItems:"center",gap:6 }}>
        ← people
      </button>
      {/* profile */}
      <Card sx={{ marginBottom:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
          <Av name={e.name} size={56}/>
          <div>
            <div style={{ fontSize:20,fontWeight:700,color:B.ink }}>{e.name}</div>
            <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>{e.role} · {e.dept}</div>
            <Chip label={e.status} color={B.green} sm/>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          {[
            { l:"email",   v:e.email },
            { l:"phone",   v:e.phone },
            { l:"started", v:e.start },
            { l:"pto",     v:`${e.pto.bal} days` },
          ].map(f=>(
            <div key={f.l} style={{ background:B.pearl,borderRadius:10,padding:"10px 12px" }}>
              <div style={{ fontSize:9,fontWeight:700,color:B.fog,fontFamily:FM,
                letterSpacing:".8px",textTransform:"uppercase",marginBottom:2 }}>{f.l}</div>
              <div style={{ fontSize:13,fontWeight:600,color:B.ink,
                wordBreak:"break-all" }}>{f.v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* docs */}
      <Card sx={{ marginBottom:14 }}>
        <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:14 }}>
          document history
        </div>
        {e.docs.length===0 &&
          <div style={{ color:B.fog,fontSize:13 }}>no documents yet.</div>}
        {e.docs.map(doc=>{
          const dt2=DOC_TYPES.find(d=>d.label===doc.type)||{ color:B.fog };
          return (
            <div key={doc.id} style={{ display:"flex",alignItems:"flex-start",gap:12,
              padding:"12px 0",borderBottom:`1px solid ${B.pearl}` }}>
              <div style={{ width:8,height:8,borderRadius:"50%",
                background:dt2.color,flexShrink:0,marginTop:5 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:600,color:B.ink }}>{doc.type}</div>
                <div style={{ fontSize:12,color:B.soft,marginTop:1 }}>{doc.note}</div>
              </div>
              <div style={{ fontSize:11,color:B.fog,fontFamily:FM,flexShrink:0 }}>{doc.date}</div>
            </div>
          );
        })}
      </Card>

      {/* onboarding */}
      <Card>
        <div style={{ display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:14 }}>
          <div style={{ fontSize:13,fontWeight:700,color:B.ink }}>onboarding</div>
          <Chip label={`${pct}%`} color={pct===100?B.green:B.blue} sm/>
        </div>
        {e.checks.map(item=>(
          <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,
            padding:"10px 0",borderBottom:`1px solid ${B.pearl}` }}>
            <button onClick={()=>onToggle(e.id,item.id)} style={{
              width:24,height:24,borderRadius:7,flexShrink:0,
              border:`2px solid ${item.done?B.green:B.silver}`,
              background:item.done?B.green:"transparent",
              cursor:"pointer",display:"flex",alignItems:"center",
              justifyContent:"center",transition:"all .2s",
              WebkitTapHighlightColor:"transparent" }}>
              {item.done && <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>✓</span>}
            </button>
            <span style={{ fontSize:14,color:item.done?B.soft:B.ink,
              textDecoration:item.done?"line-through":"none",flex:1 }}>{item.label}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── pto ───────────────────────────────────────────────────────────────────────
function PTO({ emps }) {
  const [reqs,setReqs]=useState([
    { id:1,name:"Sarah Mitchell",dates:"May 5–7",days:3,status:"pending",reason:"Family vacation" },
    { id:2,name:"James Torrez",  dates:"Apr 28", days:1,status:"approved",reason:"Medical" },
    { id:3,name:"Priya Nair",    dates:"Jun 2–6",days:5,status:"approved",reason:"Wedding" },
  ]);
  const sc={ pending:B.amber,approved:B.green,denied:B.red };

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="time off" title="pto tracker"
        sub="Balances, accrual, and approvals."/>

      {/* balances */}
      {emps.map(e=>{
        const tot=e.pto.bal+e.pto.used;
        return (
          <Card key={e.id} sx={{ marginBottom:12,padding:"16px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
              <Av name={e.name} size={36}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{e.name}</div>
                <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>{e.role}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ fontSize:28,fontWeight:800,color:B.blue,lineHeight:1 }}>
                  {e.pto.bal}
                </span>
                <span style={{ fontSize:11,color:B.fog,marginLeft:4 }}>days left</span>
              </div>
            </div>
            <div style={{ background:B.pearl,borderRadius:5,height:6,overflow:"hidden" }}>
              <div style={{ height:"100%",borderRadius:5,transition:"width .5s",
                width:`${e.pto.bal/tot*100}%`,
                background:`linear-gradient(90deg,${B.blue},${B.purple})` }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",
              fontSize:10,color:B.fog,fontFamily:FM,marginTop:6 }}>
              <span>{e.pto.used} days used</span>
              <span>{e.pto.rate} days/month accrual</span>
            </div>
          </Card>
        );
      })}

      {/* requests */}
      <Card sx={{ marginTop:8 }}>
        <div style={{ display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:16 }}>
          <div style={{ fontSize:13,fontWeight:700,color:B.ink }}>requests</div>
          <SmBtn v="primary">+ log request</SmBtn>
        </div>
        {reqs.map(r=>(
          <div key={r.id} style={{ padding:"14px 0",borderBottom:`1px solid ${B.pearl}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:r.status==="pending"?10:0 }}>
              <Av name={r.name} size={34}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{r.name}</div>
                <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>
                  {r.dates} · {r.days}d · {r.reason}
                </div>
              </div>
              <Chip label={r.status} color={sc[r.status]} sm/>
            </div>
            {r.status==="pending" && (
              <div style={{ display:"flex",gap:8,marginLeft:44 }}>
                <SmBtn v="primary" onClick={()=>setReqs(p=>p.map(x=>x.id===r.id?{...x,status:"approved"}:x))}>
                  approve
                </SmBtn>
                <SmBtn onClick={()=>setReqs(p=>p.map(x=>x.id===r.id?{...x,status:"denied"}:x))}>
                  deny
                </SmBtn>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── risk radar ────────────────────────────────────────────────────────────────
function RiskRadar({ emps }) {
  const [dismissed,setDismissed]=useState([]);
  const active=RISK_ITEMS.filter(r=>!dismissed.includes(r.id));
  const high=active.filter(r=>r.sev==="high").length;
  const incomplete=emps.filter(e=>e.checks.some(c=>!c.done));

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="compliance intelligence" title="risk radar"
        sub="Know your exposure before it becomes a lawsuit."/>

      {/* score cards */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
        <Card sx={{ padding:"16px",borderLeft:`4px solid ${B.red}` }}>
          <div style={{ fontSize:30,fontWeight:800,color:B.red,lineHeight:1 }}>{high}</div>
          <div style={{ fontSize:11,color:B.soft,fontFamily:FM,marginTop:4,
            textTransform:"uppercase",letterSpacing:".5px" }}>high severity</div>
          <div style={{ fontSize:10,color:B.red,marginTop:3 }}>act immediately</div>
        </Card>
        <Card sx={{ padding:"16px",borderLeft:`4px solid ${B.green}` }}>
          <div style={{ fontSize:30,fontWeight:800,color:B.green,lineHeight:1 }}>
            {RISK_ITEMS.length-active.length}
          </div>
          <div style={{ fontSize:11,color:B.soft,fontFamily:FM,marginTop:4,
            textTransform:"uppercase",letterSpacing:".5px" }}>resolved</div>
          <div style={{ fontSize:10,color:B.green,marginTop:3 }}>keep it up</div>
        </Card>
      </div>

      {/* risks */}
      <Card sx={{ marginBottom:16 }}>
        <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:14 }}>
          open compliance risks
        </div>
        {active.length===0 && (
          <div style={{ textAlign:"center",padding:"24px 0",color:B.green,fontSize:14 }}>
            ✓ all risks resolved — great work.
          </div>
        )}
        {active.map(r=>(
          <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,
            padding:"13px 0",borderBottom:`1px solid ${B.pearl}` }}>
            <div style={{ width:10,height:10,borderRadius:"50%",flexShrink:0,
              background:r.sev==="high"?B.red:B.amber }}/>
            <div style={{ flex:1,fontSize:14,color:B.ink,lineHeight:1.4 }}>{r.label}</div>
            <SmBtn onClick={()=>setDismissed(p=>[...p,r.id])}>resolve</SmBtn>
          </div>
        ))}
      </Card>

      {/* onboarding gaps */}
      {incomplete.length>0 && (
        <Card>
          <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:10 }}>
            onboarding gaps
          </div>
          <div style={{ padding:"10px 12px",background:"#fef2f2",
            border:`1px solid ${B.red}20`,borderRadius:10,marginBottom:12 }}>
            <div style={{ fontSize:12,color:B.red,fontFamily:FM,lineHeight:1.6 }}>
              ⚠ unsigned docs create immediate legal liability. Fines from $676/employee.
            </div>
          </div>
          {incomplete.map(e=>{
            const open=e.checks.filter(c=>!c.done);
            return (
              <div key={e.id} style={{ display:"flex",alignItems:"flex-start",
                gap:12,padding:"12px 0",borderBottom:`1px solid ${B.pearl}` }}>
                <Av name={e.name} size={36}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{e.name}</div>
                  {open.map(c=>(
                    <div key={c.id} style={{ fontSize:12,color:B.red,
                      fontFamily:FM,marginTop:3 }}>✕ {c.label}</div>
                  ))}
                </div>
                <Chip label={`${open.length} open`} color={B.red} sm/>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ── ask experts ───────────────────────────────────────────────────────────────
function Experts() {
  const [q,setQ]=useState("");
  const [ans,setAns]=useState("");
  const [loading,setLoading]=useState(false);
  const [asked,setAsked]=useState(false);

  const examples=[
    "Can I fire someone who is on FMLA leave?",
    "My employee won't sign a write-up. What now?",
    "What do I need before terminating for performance?",
    "Can I make an employee repay training costs?",
    "An employee is threatening to sue. What do I do?",
  ];

  const ask=async(query)=>{
    const q2=query||q; if(!q2.trim())return;
    setLoading(true); setAsked(true); setAns("");
    const p=`You are a senior HR professional in the hrcopilot expert network with deep expertise in HR compliance, employee relations, and small business HR strategy. A small business owner needs practical guidance.
Question: ${q2}
Provide a thorough, direct answer: answer immediately, give actionable steps, note when an attorney is truly needed. Tone: like a trusted senior HR colleague. Prose paragraphs only, no bullets.`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:p}] })});
      const d=await r.json();
      const text=d.content?.map(b=>b.text||"").join("");
      if(text){ setAns(text); setLoading(false); return; }
    } catch(_) {}
    // Demo response for preview environments
    setAns(`That's one of the most common — and important — questions we get from small business owners, and the answer depends on a few key factors.\n\nFirst, the short answer: it depends on why you're terminating and how you handle the timing. The FMLA itself does not make an employee untouchable — it protects the leave, not the person from all discipline. If you have a legitimate, documented, pre-existing reason for termination that is completely unrelated to the leave, you can legally proceed. The critical word there is "documented." If the performance issues, policy violations, or restructuring decisions were already on record before the leave began, you're in a much stronger position.\n\nWhere employers get into serious trouble is when the termination happens during or immediately after FMLA leave with no paper trail — courts and the DOL tend to view that timing as suspicious, and the burden shifts to you to prove the decision wasn't retaliatory. Even if you're right, proving it without documentation is expensive and stressful.\n\nMy strong recommendation: before you take any action, make sure you have written records of the performance issues or business reason, that the decision wasn't triggered by the leave itself, and that you'd have made the same call if this person had never taken FMLA. If all three are true and documented, consult your employment attorney before the meeting — a 30-minute call now is far cheaper than a lawsuit later.`);
    setLoading(false);
  };

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="expert guidance" title="ask our experts"
        sub="Certified HR professionals. Real answers."/>

      {/* expert badge */}
      <div style={{ background:`linear-gradient(135deg,${B.navy},#162545)`,
        borderRadius:20,padding:"20px",marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:12 }}>
          <div style={{ width:48,height:48,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20 }}>✦</div>
          <div>
            <Chip label="certified hr professionals" color={B.purple}/>
            <div style={{ fontSize:16,fontWeight:700,color:B.white,
              fontFamily:FS,marginTop:6 }}>our expert network</div>
          </div>
        </div>
        <p style={{ fontSize:13,color:"#7fa8c8",fontFamily:FS,
          margin:0,lineHeight:1.7 }}>
          Decades of combined experience across industries. When AI isn't enough,
          a real professional is a tap away.
        </p>
      </div>

      {/* input */}
      <Card sx={{ marginBottom:16 }}>
        <div style={{ fontSize:14,fontWeight:700,color:B.ink,marginBottom:12 }}>
          what's your question?
        </div>
        <textarea value={q} onChange={e=>setQ(e.target.value)}
          placeholder="e.g. An employee is threatening to sue. What should I do right now?"
          rows={4} style={{ width:"100%",padding:"13px 14px",borderRadius:12,
            border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
            color:B.ink,background:B.pearl,resize:"none",
            outline:"none",boxSizing:"border-box",WebkitAppearance:"none" }}/>
        <Btn onClick={()=>ask()} disabled={!q.trim()} full v="purple"
          sx={{ marginTop:12 }}>ask the experts →</Btn>
      </Card>

      {/* examples */}
      {!asked && (
        <Card>
          <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:12 }}>
            common questions
          </div>
          {examples.map(ex=>(
            <button key={ex} onClick={()=>{ setQ(ex); ask(ex); }} style={{
              display:"flex",alignItems:"center",gap:10,width:"100%",
              padding:"13px 0",borderBottom:`1px solid ${B.pearl}`,
              background:"none",border:"none",borderBottom:`1px solid ${B.pearl}`,
              cursor:"pointer",textAlign:"left",
              WebkitTapHighlightColor:"transparent" }}>
              <span style={{ color:B.purple,flexShrink:0 }}>✦</span>
              <span style={{ fontSize:14,color:B.ink,fontFamily:FS }}>{ex}</span>
            </button>
          ))}
        </Card>
      )}

      {/* answer */}
      {asked && (
        <Card sx={{ borderLeft:`4px solid ${B.purple}` }}>
          {loading ? (
            <div style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 0" }}>
              <div style={{ width:36,height:36,borderRadius:"50%",flexShrink:0,
                border:`3px solid ${B.silver}`,borderTop:`3px solid ${B.purple}`,
                animation:"spin .8s linear infinite" }}/>
              <div>
                <div style={{ fontSize:15,fontWeight:700,color:B.ink }}>on it...</div>
                <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>
                  drawing on expert experience
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,
                  background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>✦</div>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>expert response</div>
                  <div style={{ fontSize:10,color:B.purple,fontFamily:FM }}>hrcopilot expert network</div>
                </div>
              </div>
              <div style={{ fontSize:15,color:B.ink,lineHeight:1.9,
                whiteSpace:"pre-wrap" }}>{ans}</div>
              <div style={{ marginTop:16,padding:"12px 14px",background:"#fffbeb",
                border:`1px solid ${B.amber}28`,borderRadius:10 }}>
                <div style={{ fontSize:11,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>
                  ⚠ general hr guidance only. employment law varies by state.
                  consult an attorney for active legal threats.
                </div>
              </div>
              <button onClick={()=>{ setAsked(false);setQ("");setAns(""); }} style={{
                marginTop:14,background:"none",border:"none",color:B.blue,
                cursor:"pointer",fontFamily:FS,fontSize:14,padding:"8px 0" }}>
                ask another question →
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ── pricing ───────────────────────────────────────────────────────────────────
function Pricing({ go }) {
  const plans=[
    { name:"starter", price:"$0",   period:"forever", color:B.fog,
      desc:"Try it free. No card needed.",
      features:["up to 3 employees","5 ai documents/month","pto tracking","onboarding checklists"],
      cta:"start free", v:"ghost" },
    { name:"pro",     price:"$39",  period:"/month",  color:B.blue,
      desc:"Everything a small business needs.",
      features:["up to 20 employees","unlimited ai documents","pdf export & document vault",
        "full onboarding tools","pto approvals","risk radar","priority support"],
      cta:"start 14-day trial", v:"primary", pop:true },
    { name:"expert",  price:"$99",  period:"/month",  color:B.purple,
      desc:"AI plus real human experts.",
      features:["everything in pro","unlimited employees","ask our experts — anytime",
        "monthly hr strategy session","custom templates","compliance alerts"],
      cta:"get expert access", v:"purple" },
    { name:"concierge",price:"$299",period:"/month",  color:B.amber,
      desc:"Your dedicated HR partner.",
      features:["everything in expert","dedicated hr hours",
        "custom employee handbook","policy drafting","hiring support"],
      cta:"contact us", v:"ghost" },
  ];

  return (
    <div style={{ padding:"20px 20px 100px" }}>
      <SectionHead label="pricing" title="hr that pays for itself."
        sub="One lawsuit costs $85k+ to defend. hrcopilot pays for itself the first time you use it."/>

      {plans.map(p=>(
        <div key={p.name} style={{
          background:p.pop?B.navy:B.white,
          border:p.pop?"none":`1.5px solid ${B.silver}`,
          borderRadius:20,padding:"22px",marginBottom:14,
          boxShadow:p.pop?`0 8px 32px ${B.blue}22`:"none",
          position:"relative" }}>
          {p.pop && (
            <div style={{ position:"absolute",top:-11,left:20,
              background:`linear-gradient(135deg,${B.blue},${B.blueD})`,
              color:"#fff",fontSize:9,fontWeight:700,fontFamily:FM,
              padding:"4px 12px",borderRadius:20,letterSpacing:"1px" }}>
              most popular
            </div>
          )}
          <div style={{ display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:p.color,
                fontFamily:FM,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4 }}>
                {p.name}
              </div>
              <div style={{ fontSize:13,color:p.pop?"#7fa8c8":B.soft }}>{p.desc}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontSize:32,fontWeight:800,
                color:p.pop?B.white:B.ink,lineHeight:1 }}>{p.price}</span>
              <div style={{ fontSize:11,color:p.pop?B.fog:B.soft,fontFamily:FM }}>
                {p.period}
              </div>
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            {p.features.map(f=>(
              <div key={f} style={{ display:"flex",alignItems:"flex-start",
                gap:8,marginBottom:7 }}>
                <span style={{ color:B.green,fontSize:13,fontWeight:700,flexShrink:0 }}>✓</span>
                <span style={{ fontSize:13,color:p.pop?"#c8d8ee":B.ink,lineHeight:1.4 }}>{f}</span>
              </div>
            ))}
          </div>
          <Btn onClick={()=>go("dashboard")} full v={p.v}>{p.cta}</Btn>
        </div>
      ))}

      <div style={{ textAlign:"center",padding:"20px 0",
        borderTop:`1px solid ${B.silver}`,marginTop:8 }}>
        {["🔒 encrypted","⚡ ai-powered","👩‍💼 expert-reviewed","✕ cancel anytime"].map(b=>(
          <div key={b} style={{ fontSize:12,color:B.soft,marginBottom:8 }}>{b}</div>
        ))}
      </div>
    </div>
  );
}

// ── root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("home");
  const [emps,setEmps]=useState(INIT_EMPS);
  const [sel,setSel]=useState(null);

  const go=t=>setTab(t);
  const onSave=(eid,doc)=>setEmps(es=>es.map(e=>e.id===eid?{...e,docs:[...e.docs,doc]}:e));
  const onToggle=(eid,cid)=>setEmps(es=>es.map(e=>e.id===eid
    ?{...e,checks:e.checks.map(c=>c.id===cid?{...c,done:!c.done}:c)}:e));

  const isHome=tab==="home";

  return (
    <div style={{ maxWidth:430,margin:"0 auto",
      minHeight:"100vh",background:isHome?B.navy:B.bg,
      position:"relative",fontFamily:FS }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{transition:all .18s;-webkit-tap-highlight-color:transparent}
        button:active:not(:disabled){transform:scale(.97)}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{display:none}
        textarea,select,input{-webkit-appearance:none;appearance:none}
        textarea:focus,select:focus{border-color:${B.blue}!important;
          box-shadow:0 0 0 3px ${B.blue}18!important;outline:none}
        html{-webkit-text-size-adjust:100%}
      `}</style>

      <TopBar tab={tab} go={go}/>

      <div style={{ paddingTop:isHome?0:0 }}>
        {tab==="home"      && <Landing go={go}/>}
        {tab==="dashboard" && <Dashboard emps={emps} go={go} setSel={setSel}/>}
        {tab==="documents" && <DocGen emps={emps} onSave={onSave}/>}
        {tab==="employees" && <Employees emps={emps} sel={sel} setSel={setSel} onToggle={onToggle}/>}
        {tab==="pto"       && <PTO emps={emps}/>}
        {tab==="risks"     && <RiskRadar emps={emps}/>}
        {tab==="expert"    && <Experts/>}
        {tab==="pricing"   && <Pricing go={go}/>}
      </div>

      {!isHome && <BottomNav active={tab} go={go}/>}
    </div>
  );
}
