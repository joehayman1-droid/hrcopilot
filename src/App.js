import { useState, useEffect, useCallback } from "react";

// ── brand ─────────────────────────────────────────────────────────────────────
const B = {
  navy:"#0d1b3e", navyMid:"#111f35", navyLight:"#1a2f4a",
  blue:"#1a7af8", blueD:"#1460cc", blueGlow:"#1a7af812",
  purple:"#6b3fa0", purpleGlow:"#6b3fa014",
  white:"#ffffff", pearl:"#f5f8ff", silver:"#e3eaf5",
  fog:"#8fa3be", ink:"#0d1b3e", soft:"#4a6080",
  green:"#059669", amber:"#d97706", red:"#dc2626", bg:"#f0f4fb",
};
const FS="'DM Sans', sans-serif";
const FM="'DM Mono', monospace";

// ── storage helpers ───────────────────────────────────────────────────────────
const store = {
  get:(k,def=null)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } },
  set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
  del:(k)=>{ try{ localStorage.removeItem(k); }catch{} },
};

// ── doc types ─────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { id:"warn",   label:"Written Warning",              color:B.amber,  hint:"Document a policy violation." },
  { id:"pip",    label:"Performance Improvement Plan", color:B.blue,   hint:"Set measurable goals and timeline." },
  { id:"term",   label:"Termination Letter",           color:B.red,    hint:"Never separate without one." },
  { id:"comm",   label:"Commendation Letter",          color:B.green,  hint:"Reinforce excellent performance." },
  { id:"verbal", label:"Verbal Warning Record",        color:B.fog,    hint:"Document before problems escalate." },
  { id:"offer",  label:"Offer Letter",                 color:B.purple, hint:"Professional offer with at-will language." },
];

const RISK_ITEMS = [
  { id:"r1", label:"I-9 errors — fines up to $27,000 per employee",         sev:"high"   },
  { id:"r2", label:"No signed handbook — policy disputes become unwinnable", sev:"high"   },
  { id:"r3", label:"Missing verbal warning records — terminations at risk",  sev:"medium" },
  { id:"r4", label:"Contractor misclassification — IRS audits, back pay",    sev:"high"   },
  { id:"r5", label:"OSHA training gaps — liability for workplace injuries",  sev:"medium" },
  { id:"r6", label:"No anti-harassment policy documented",                   sev:"high"   },
];

const ONBOARD_RESOURCES = {
  "I-9 Employment Eligibility Verification": {
    why: "Federal law requires every employer to verify employment eligibility for all new hires — citizens and non-citizens alike. Errors carry fines of $676–$27,272 per violation. Complete within 3 days of hire.",
    url: "https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf",
    urlLabel: "Download Official I-9 (USCIS)",
    tips: [
      "Employee completes Section 1 on or before first day of work",
      "Employer completes Section 2 within 3 business days of hire",
      "Keep I-9s for 3 years after hire OR 1 year after termination, whichever is later",
      "Never ask for specific documents — employee chooses from List A, B, or C",
      "Remote hires: use an authorized representative to physically examine documents",
    ],
    warning: "I-9 audits are increasing. Store physical or digital copies separately from the personnel file.",
  },
  "W-4 Federal Tax Withholding": {
    why: "Tells you how much federal income tax to withhold from each paycheck. Employees should update when life changes — marriage, new baby, second job.",
    url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf",
    urlLabel: "Download Official W-4 (IRS)",
    tips: [
      "Collect before or on the first day of work",
      "If no W-4 is submitted, withhold as Single with no adjustments",
      "Keep on file — do not send to the IRS unless requested",
      "Employees can update their W-4 at any time",
      "Some states have their own withholding form in addition to the federal W-4",
    ],
    warning: "Check your state — many states require a separate state withholding form.",
  },
  "Direct Deposit Authorization": {
    why: "Authorizes you to deposit payroll directly into the employee's bank account. Reduces check fraud, eliminates paper, and employees get paid faster.",
    url: "https://eforms.com/download/2014/12/direct-deposit-authorization-form.pdf",
    urlLabel: "Download Sample Form (eForms)",
    template: `DIRECT DEPOSIT AUTHORIZATION FORM
[COMPANY NAME]

Employee Name: _______________________________
Employee ID / SSN (last 4): ______________________
Start Date: ____________________________________

BANK ACCOUNT INFORMATION
Bank Name: ___________________________________
Bank Routing Number (9 digits): __________________
Account Number: ______________________________
Account Type:  ☐ Checking   ☐ Savings

DEPOSIT INSTRUCTIONS
☐ Deposit entire net pay to account above
☐ Deposit $________ to account above; remainder to second account
   Second Bank: _____________ Routing: _____________ Account: _____________

AUTHORIZATION
I hereby authorize [Company Name] to initiate credit entries and, if necessary, debit entries to correct errors, to my account at the financial institution named above. This authorization will remain in effect until I provide written notice of cancellation.

Employee Signature: ___________________________ Date: ___________

EMPLOYER USE ONLY
Entered by: _________________ Date: _____________ Payroll system updated: ☐
Voided check or bank letter attached: ☐ Yes  ☐ No`,
    tips: [
      "Attach a voided check or bank verification letter for accuracy",
      "Keep original on file for the duration of employment plus 2 years",
      "Run a test transaction before first live payroll if possible",
      "Update immediately when employee reports a bank change",
      "Some states require employee consent — check your state law",
    ],
    warning: "Never store routing/account numbers in email. Keep in a locked file or encrypted system.",
  },
  "Employee Handbook Signed": {
    why: "The signed acknowledgment is your proof that the employee received, read, and understands your policies. Without it, you cannot enforce policies in a dispute or termination.",
    template: `EMPLOYEE HANDBOOK ACKNOWLEDGMENT

I, _________________________, acknowledge that I have received a copy of the [Company Name] Employee Handbook, effective [Date].

I understand that the handbook contains important information about the Company's policies, procedures, and my benefits and obligations as an employee. I agree to read the handbook carefully and to comply with all policies and guidelines.

I understand that the handbook is not a contract of employment and does not guarantee employment for any specific duration. Employment at [Company Name] is at-will, meaning either the Company or I may terminate the employment relationship at any time, with or without cause or notice.

I understand that the Company reserves the right to modify, rescind, or supplement the policies in this handbook at any time, with or without notice.

If I have questions about the content of this handbook, I will direct them to my manager or HR.

Employee Signature: ___________________________ Date: ___________
Printed Name: ________________________________
Job Title: ____________________________________
Department: __________________________________

Witness / HR Signature: _______________________ Date: ___________`,
    handbookSections: [
      "Welcome & Company Mission",
      "At-Will Employment Statement",
      "Equal Employment Opportunity (EEO) Policy",
      "Anti-Harassment & Anti-Discrimination Policy",
      "Code of Conduct & Professional Standards",
      "Work Schedule & Attendance Policy",
      "PTO, Sick Leave & Holiday Policy",
      "FMLA & Leave of Absence Policy",
      "Pay & Overtime Policy (FLSA Compliance)",
      "Performance Review Process",
      "Progressive Discipline Policy",
      "Termination & Separation Policy",
      "Workplace Safety Policy (OSHA)",
      "Drug & Alcohol Policy",
      "Confidentiality & Data Privacy",
      "Social Media Policy",
      "Technology & Device Usage Policy",
      "Complaint & Grievance Procedure",
      "Acknowledgment Signature Page",
    ],
    tips: [
      "Review and update your handbook at least once per year",
      "Have an employment attorney review before distributing",
      "State-specific policies vary significantly — Michigan, California, and New York have additional requirements",
      "A missing harassment policy is one of the most costly omissions in small business HR",
      "Keep signed acknowledgments in the personnel file permanently",
    ],
    warning: "A handbook that hasn't been updated since 2020 may already be out of compliance. Remote work, AI use, and paid leave laws have all changed significantly.",
  },
  "Benefits Enrollment": {
    why: "Employees must enroll in health, dental, vision, and retirement benefits within their eligibility window — typically 30 days of hire. Missing this window can mean waiting until open enrollment.",
    tips: [
      "Most benefits have a 30-day enrollment window from hire date",
      "COBRA notice must be provided within 14 days of coverage becoming available",
      "If offering health insurance to any full-time employee, you must offer it consistently",
      "ACA requires employers with 50+ FTEs to offer affordable coverage — under 50 it's optional but smart",
      "Document all waiver decisions (when employees decline coverage) in writing",
      "401(k) eligibility rules must be applied consistently to avoid IRS issues",
    ],
    links: [
      { label:"Healthcare.gov Small Business Options", url:"https://www.healthcare.gov/small-businesses/employers/" },
      { label:"DOL COBRA Information", url:"https://www.dol.gov/general/topic/health-plans/cobra" },
      { label:"IRS 401(k) Plan Overview", url:"https://www.irs.gov/retirement-plans/401k-plans" },
    ],
    warning: "Benefits discrimination — offering different benefits to different classes of employees — is a significant legal risk. Consistency is everything.",
  },
  "IT Access & Credentials": {
    why: "Documenting IT access at hire creates a clean record for offboarding. When an employee leaves, you need to know exactly what to revoke — immediately.",
    template: `IT ACCESS & CREDENTIALS CHECKLIST
Employee: _________________________ Start Date: _____________
Completed by: _____________________ Date: _________________

ACCOUNTS CREATED
☐ Company email address: _______________________________
☐ Network / system login created
☐ Password manager enrollment
☐ Multi-factor authentication (MFA) enabled
☐ VPN access (if applicable)

SOFTWARE & SYSTEMS ACCESS
☐ ________________________________ (Access level: _________)
☐ ________________________________ (Access level: _________)
☐ ________________________________ (Access level: _________)
☐ Company social media accounts (list): ___________________

EQUIPMENT ISSUED
☐ Laptop / Computer  Serial #: ___________________________
☐ Mobile phone       Serial #: ___________________________
☐ Key / Access card  #: _________________________________
☐ Other: _______________________________________________

POLICIES ACKNOWLEDGED
☐ Acceptable Use Policy signed
☐ Data Privacy & Confidentiality Agreement signed
☐ Personal device (BYOD) policy acknowledged (if applicable)

IT STAFF SIGNATURE: ________________________ Date: ________
EMPLOYEE SIGNATURE: _______________________ Date: ________

— KEEP THIS FORM — Required for offboarding checklist —`,
    tips: [
      "This form is your offboarding blueprint — whatever's on it gets revoked on the last day",
      "Revoke all access on the day of termination, not after",
      "Company email should be disabled within hours of departure, not days",
      "Document who has admin vs. standard access for each system",
      "Review access levels annually — employees often accumulate permissions they no longer need",
    ],
    warning: "Failure to revoke access promptly is one of the top causes of data breaches in small businesses. Build offboarding into your process now.",
  },
  "Safety / OSHA Training": {
    why: "OSHA requires employers to provide a safe workplace and document safety training. Even office environments have requirements. Construction, manufacturing, and trades have extensive additional requirements.",
    url: "https://www.osha.gov/Publications/osha2254.pdf",
    urlLabel: "OSHA Small Business Handbook (PDF)",
    links: [
      { label:"OSHA Training Institute", url:"https://www.osha.gov/ote" },
      { label:"Free OSHA 10 Information", url:"https://www.osha.gov/training/outreach" },
      { label:"Injury & Illness Recordkeeping (300 Log)", url:"https://www.osha.gov/recordkeeping" },
    ],
    tips: [
      "Post the OSHA Job Safety and Health poster in a visible location — it's required",
      "Document all safety training with date, topics covered, and employee signature",
      "Maintain OSHA 300 Log if you had 11+ employees at any point in the previous year",
      "Construction, manufacturing, and trades: OSHA 10 or 30 certification is strongly recommended",
      "Conduct a workplace hazard assessment within the first week for every new hire",
    ],
    warning: "OSHA fines start at $16,131 per serious violation and can reach $161,323 for willful violations. Documentation is your defense.",
  },
  "Emergency Contact Form": {
    why: "Required to reach family in a medical emergency. Also documents who has authority to act on an employee's behalf. Keep current — employees should update after major life events.",
    template: `EMERGENCY CONTACT INFORMATION
[COMPANY NAME] — Confidential

Employee Name: _______________________________
Employee ID: ________________________________
Department: _________________________________
Date: ______________________________________

PRIMARY EMERGENCY CONTACT
Name: ______________________________________
Relationship: ________________________________
Primary Phone: ______________________________
Secondary Phone: ____________________________
Email: ______________________________________

SECONDARY EMERGENCY CONTACT
Name: ______________________________________
Relationship: ________________________________
Primary Phone: ______________________________

MEDICAL INFORMATION (Optional — Employee Discretion)
Known allergies: _____________________________
Medical conditions first responders should know: _________________
Current medications (optional): ________________
Primary physician: ___________________________
Physician phone: ____________________________
Preferred hospital: ___________________________

PERSONAL PHYSICIAN
Name: ______________________________________
Phone: _____________________________________

Employee Signature: ___________________________ Date: ___________

This information is confidential and will only be used in the event of a workplace emergency.`,
    tips: [
      "Remind employees to update this form after marriage, divorce, or a move",
      "Store separately from the main personnel file for privacy",
      "Review and update annually — stale emergency contacts are common",
      "Never share this information for any purpose other than a genuine emergency",
    ],
    warning: "HIPAA does not technically apply to emergency contact info, but best practice is to treat it as confidential health-adjacent data.",
  },
};

const ONBOARD_TEMPLATE = [
  { label:"I-9 Employment Eligibility Verification", url:"https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf" },
  { label:"W-4 Federal Tax Withholding",             url:"https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
  { label:"Direct Deposit Authorization",            url:null },
  { label:"Employee Handbook Signed",                url:null },
  { label:"Benefits Enrollment",                     url:null },
  { label:"IT Access & Credentials",                 url:null },
  { label:"Safety / OSHA Training",                  url:"https://www.osha.gov/Publications/osha2254.pdf" },
  { label:"Emergency Contact Form",                  url:null },
];

const TABS = [
  { id:"dashboard", label:"Home",    icon:"▦" },
  { id:"documents", label:"Docs",    icon:"◧" },
  { id:"employees", label:"People",  icon:"◈" },
  { id:"pto",       label:"PTO",     icon:"◷" },
  { id:"risks",     label:"Risks",   icon:"◉" },
  { id:"expert",    label:"Experts", icon:"✦" },
  { id:"handbook",  label:"Handbook",icon:"📋" },
];

// ── atoms ─────────────────────────────────────────────────────────────────────
function Av({ name, size=40, color }) {
  const pal=[B.blue,B.green,B.amber,B.purple,B.blueD];
  const bg=color||pal[(name||"A").charCodeAt(0)%pal.length];
  return <div style={{ width:size,height:size,borderRadius:"50%",flexShrink:0,
    background:`linear-gradient(135deg,${bg},${bg}bb)`,
    display:"flex",alignItems:"center",justifyContent:"center",
    color:"#fff",fontWeight:700,fontSize:size*.38,fontFamily:FS,
    boxShadow:`0 2px 8px ${bg}40` }}>{(name||"?")[0].toUpperCase()}</div>;
}

function Chip({ label, color, sm }) {
  return <span style={{ display:"inline-block",
    padding:sm?"2px 8px":"3px 11px",borderRadius:20,
    background:color+"18",color,fontSize:sm?10:11,fontWeight:700,
    fontFamily:FM,letterSpacing:".3px",textTransform:"uppercase" }}>{label}</span>;
}

function Btn({ children, onClick, v="primary", full, disabled, sx={} }) {
  const vs={
    primary:{ background:`linear-gradient(135deg,${B.blue},${B.blueD})`,color:"#fff",border:"none",boxShadow:`0 4px 14px ${B.blue}38` },
    purple: { background:`linear-gradient(135deg,${B.purple},#4c1d95)`,color:"#fff",border:"none",boxShadow:`0 4px 14px ${B.purple}38` },
    outline:{ background:"transparent",color:B.blue,border:`1.5px solid ${B.blue}` },
    ghost:  { background:B.pearl,color:B.soft,border:`1px solid ${B.silver}` },
    danger: { background:B.red,color:"#fff",border:"none" },
    green:  { background:B.green,color:"#fff",border:"none" },
  };
  return <button onClick={onClick} disabled={disabled} style={{
    padding:"13px 22px",borderRadius:14,cursor:disabled?"not-allowed":"pointer",
    fontFamily:FS,fontSize:15,fontWeight:700,opacity:disabled?.5:1,
    transition:"all .18s",width:full?"100%":"auto",
    WebkitTapHighlightColor:"transparent",...vs[v],...sx }}>{children}</button>;
}

function SmBtn({ children, onClick, v="ghost", disabled }) {
  const vs={
    primary:{ background:`linear-gradient(135deg,${B.blue},${B.blueD})`,color:"#fff",border:"none" },
    ghost:  { background:B.pearl,color:B.soft,border:`1px solid ${B.silver}` },
    outline:{ background:"transparent",color:B.blue,border:`1px solid ${B.blue}` },
    danger: { background:"transparent",color:B.red,border:`1px solid ${B.red}` },
    green:  { background:B.green,color:"#fff",border:"none" },
  };
  return <button onClick={onClick} disabled={disabled} style={{
    padding:"8px 14px",borderRadius:10,cursor:disabled?"not-allowed":"pointer",
    fontFamily:FS,fontSize:13,fontWeight:600,opacity:disabled?.5:1,
    transition:"all .15s",WebkitTapHighlightColor:"transparent",...vs[v] }}>{children}</button>;
}

function Card({ children, sx={} }) {
  return <div style={{ background:B.white,border:`1px solid ${B.silver}`,
    borderRadius:20,padding:20,...sx }}>{children}</div>;
}

function SectionHead({ label, title, sub }) {
  return <div style={{ marginBottom:22 }}>
    {label && <div style={{ fontSize:10,fontFamily:FM,color:B.blue,fontWeight:700,
      letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5 }}>{label}</div>}
    <h1 style={{ fontSize:26,fontWeight:700,color:B.ink,fontFamily:FS,
      margin:0,letterSpacing:"-.3px",lineHeight:1.2 }}>{title}</h1>
    {sub && <p style={{ color:B.soft,fontFamily:FS,marginTop:5,fontSize:14,
      lineHeight:1.6,margin:"5px 0 0" }}>{sub}</p>}
  </div>;
}

function Input({ label, value, onChange, placeholder, type="text", required }) {
  return <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:"block",fontSize:13,fontWeight:700,
      color:B.soft,marginBottom:7 }}>{label}{required&&<span style={{color:B.red}}> *</span>}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} style={{ width:"100%",padding:"13px 14px",
      borderRadius:12,border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
      color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",
      WebkitAppearance:"none" }}/>
  </div>;
}

function Modal({ title, children, onClose }) {
  return <div style={{ position:"fixed",inset:0,zIndex:200,
    background:"rgba(13,27,62,.5)",backdropFilter:"blur(4px)",
    display:"flex",alignItems:"flex-end",justifyContent:"center" }}
    onClick={e=>{ if(e.target===e.currentTarget)onClose(); }}>
    <div style={{ background:B.white,borderRadius:"24px 24px 0 0",
      padding:"28px 24px",width:"100%",maxWidth:430,
      maxHeight:"90vh",overflowY:"auto",
      boxShadow:"0 -8px 40px rgba(13,27,62,.2)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:20 }}>
        <div style={{ fontSize:18,fontWeight:700,color:B.ink }}>{title}</div>
        <button onClick={onClose} style={{ background:"none",border:"none",
          fontSize:22,color:B.fog,cursor:"pointer",padding:"0 4px" }}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

// ── logo ──────────────────────────────────────────────────────────────────────
function LogoMark({ height=32, dark=false }) {
  const navy=dark?"#ffffff":"#0d1b3e";
  const blue="#1a7af8";
  const purple="#6b3fa0";
  return <svg height={height} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="18" r="6" fill={navy}/>
    <ellipse cx="22" cy="32" rx="9" ry="7" fill={navy}/>
    <circle cx="44" cy="14" r="8" fill={blue}/>
    <ellipse cx="44" cy="30" rx="12" ry="9" fill={blue}/>
    <circle cx="66" cy="18" r="6" fill={navy}/>
    <ellipse cx="66" cy="32" rx="9" ry="7" fill={navy}/>
    <path d="M8 38 Q44 46 80 38" stroke={navy} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <polygon points="44,52 36,42 52,42" fill={purple}/>
    <text x="95" y="38" fontFamily="DM Sans,sans-serif" fontWeight="800" fontSize="28" fill={navy}>hr</text>
    <text x="127" y="38" fontFamily="DM Sans,sans-serif" fontWeight="800" fontSize="28" fill={blue}>copilot</text>
  </svg>;
}

// ── landing page ──────────────────────────────────────────────────────────────
function Landing({ onGetStarted }) {
  const [vis,setVis]=useState(false);
  const [modal,setModal]=useState(null);
  useEffect(()=>{ setTimeout(()=>setVis(true),80); },[]);

  const PRIVACY=`PRIVACY POLICY — Last updated April 23, 2026\n\nhrcopilot is a product of Hayman Investments LLC. This Privacy Policy explains how we collect, use, and protect your information.\n\nINFORMATION WE COLLECT\nWe collect information you provide directly: your name, email, company name, state, and any employee data you enter into the platform. We also collect usage data such as features used and pages visited.\n\nHOW WE USE YOUR INFORMATION\nWe use your information to provide and improve the hrcopilot platform, communicate with you about your account, and send product updates you have opted into. We do not sell your personal information to third parties.\n\nDATA STORAGE\nYour data is stored securely using industry-standard encryption. Employee records and HR documents you create are stored per account and are not accessible to other users.\n\nAI PROCESSING\nWhen you use the document generator or Ask Our Experts features, your inputs are sent to Anthropic's API to generate responses. Please do not include sensitive personal identifiers such as Social Security Numbers in prompts.\n\nYOUR RIGHTS\nYou may request access to, correction of, or deletion of your personal data at any time by contacting privacy@gethrcopilot.com.\n\nCONTACT\nprivacy@gethrcopilot.com\nHayman Investments LLC — Michigan, United States`;

  const TERMS=`TERMS OF SERVICE — Last updated April 23, 2026\n\nThese Terms govern your use of hrcopilot, a product of Hayman Investments LLC.\n\nACCEPTANCE\nBy creating an account you agree to these Terms. If you do not agree, do not use the platform.\n\nNOT LEGAL ADVICE\nhrcopilot is not a law firm and does not provide legal advice. Documents generated by the platform are professional drafts intended as starting points. For matters involving termination, discrimination claims, or active legal disputes, consult a licensed employment attorney in your state.\n\nACCEPTABLE USE\nYou agree to use hrcopilot only for lawful business purposes. You may not use the platform to generate documents intended to harass, discriminate against, or harm employees.\n\nSUBSCRIPTION & BILLING\nPaid plans are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. Refunds are not provided for partial months.\n\nLIMITATION OF LIABILITY\nHayman Investments LLC is not liable for any employment-related legal claims arising from use of documents generated by the platform.\n\nCHANGES\nWe may update these Terms at any time. Continued use constitutes acceptance.\n\nCONTACT\nlegal@gethrcopilot.com`;

  const CONTACT=`CONTACT US\n\nWe'd love to hear from you. We typically respond within 1 business day.\n\nGENERAL INQUIRIES\nhello@gethrcopilot.com\n\nSUPPORT\nFor help with your account, documents, or technical issues:\nsupport@gethrcopilot.com\n\nPRIVACY & DATA\nprivacy@gethrcopilot.com\n\nLEGAL\nlegal@gethrcopilot.com\n\nPARTNERSHIPS & PRESS\npartners@gethrcopilot.com\n\nMAILING ADDRESS\nHayman Investments LLC\nMichigan, United States`;

  const MODALS={ privacy:{ title:"Privacy Policy",body:PRIVACY }, terms:{ title:"Terms of Service",body:TERMS }, contact:{ title:"Contact Us",body:CONTACT } };

  const stats=[
    { n:"$85k+", d:"Minimum cost to defend a wrongful termination lawsuit" },
    { n:"40%",   d:"Of small businesses faced an employee lawsuit in 2024" },
    { n:"$27k",  d:"Fine per employee for a single I-9 filing error" },
    { n:"80%",   d:"Of turnover starts with a bad hire or poor documentation" },
  ];

  const features=[
    { icon:"◧", title:"AI document generator", color:B.blue,
      d:"Written warnings, PIPs, termination letters — in 60 seconds. Branded with your company name." },
    { icon:"◉", title:"risk radar", color:B.amber,
      d:"Know your compliance gaps before they become $85,000 lawsuits." },
    { icon:"◈", title:"employee file cabinet", color:B.green,
      d:"Every document, signature, and onboarding step stored and organized." },
    { icon:"◷", title:"pto management", color:B.purple,
      d:"Track balances, approve requests. No spreadsheets, no disputes." },
    { icon:"☑", title:"onboarding checklists", color:B.blue,
      d:"Never miss an I-9, W-4, or handbook signature again." },
    { icon:"✦", title:"ask our experts", color:B.purple,
      d:"Real certified HR professionals answer your hardest questions." },
  ];

  return (
    <div style={{ minHeight:"100vh",background:B.navy,fontFamily:FS,overflowX:"hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{-webkit-tap-highlight-color:transparent}button:active{transform:scale(.97)}`}</style>

      {/* nav */}
      <div style={{ padding:"20px 24px",display:"flex",alignItems:"center",
        justifyContent:"space-between",borderBottom:`1px solid rgba(255,255,255,.08)` }}>
        <LogoMark height={40} dark={true}/>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onGetStarted} style={{ padding:"9px 16px",borderRadius:12,
            background:"transparent",border:`1px solid rgba(255,255,255,.2)`,
            color:"#fff",fontFamily:FS,fontSize:13,fontWeight:600,cursor:"pointer" }}>log in</button>
          <button onClick={onGetStarted} style={{ padding:"9px 18px",borderRadius:12,
            background:`linear-gradient(135deg,${B.blue},${B.blueD})`,border:"none",
            color:"#fff",fontFamily:FS,fontSize:13,fontWeight:700,cursor:"pointer",
            boxShadow:`0 4px 14px ${B.blue}50` }}>start free →</button>
        </div>
      </div>

      {/* hero */}
      <div style={{ padding:"52px 24px 44px",textAlign:"center",
        opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",
        transition:"all .9s ease",position:"relative" }}>
        <div style={{ position:"absolute",top:-100,left:"50%",transform:"translateX(-50%)",
          width:400,height:400,borderRadius:"50%",
          background:`radial-gradient(circle,${B.blue}14,transparent 70%)`,
          pointerEvents:"none" }}/>

        {/* BIG centered logo — the hero */}
        <div style={{ display:"flex",justifyContent:"center",marginBottom:32 }}>
          <LogoMark height={216} dark={true}/>
        </div>

        <div style={{ display:"inline-flex",alignItems:"center",gap:7,
          background:`${B.purple}28`,border:`1px solid ${B.purple}50`,
          borderRadius:30,padding:"5px 14px",marginBottom:22 }}>
          <span style={{ fontSize:11,color:"#c4a8f0",fontFamily:FM,
            fontWeight:700,letterSpacing:".5px" }}>✦ backed by certified hr professionals</span>
        </div>
        <h1 style={{ fontSize:42,fontWeight:800,color:B.white,lineHeight:1.08,
          letterSpacing:"-.5px",margin:"0 0 16px",maxWidth:340,marginLeft:"auto",marginRight:"auto" }}>
          HR that actually<br/>
          <span style={{ background:`linear-gradient(135deg,${B.blue},#818cf8)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            protects you.
          </span>
        </h1>
        <p style={{ fontSize:16,color:"#7fa8c8",maxWidth:300,
          margin:"0 auto 32px",lineHeight:1.7 }}>
          AI-powered HR tools plus certified professionals — built for businesses
          too small for an HR department.
        </p>
        <button onClick={onGetStarted} style={{ display:"block",width:"100%",maxWidth:320,
          margin:"0 auto 12px",padding:"16px",borderRadius:16,
          background:`linear-gradient(135deg,${B.blue},${B.blueD})`,border:"none",
          color:"#fff",fontFamily:FS,fontSize:16,fontWeight:700,cursor:"pointer",
          boxShadow:`0 6px 24px ${B.blue}50` }}>get started free →</button>
        <button onClick={onGetStarted} style={{ background:"none",border:"none",
          color:"#7fa8c8",fontFamily:FS,fontSize:14,cursor:"pointer",
          textDecoration:"underline",textUnderlineOffset:3 }}>
          already have an account? log in
        </button>
      </div>

      {/* stats */}
      <div style={{ padding:"0 16px 40px",display:"grid",
        gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {stats.map(s=><div key={s.n} style={{ background:"rgba(255,255,255,.05)",
          border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"16px 14px" }}>
          <div style={{ fontSize:28,fontWeight:800,lineHeight:1,marginBottom:6,
            background:`linear-gradient(135deg,${B.blue},#818cf8)`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{s.n}</div>
          <div style={{ fontSize:11,color:"#6a8aaa",lineHeight:1.5 }}>{s.d}</div>
        </div>)}
      </div>

      {/* features */}
      <div style={{ padding:"0 16px 40px" }}>
        <div style={{ fontSize:10,fontFamily:FM,color:B.blue,fontWeight:700,
          letterSpacing:"1.5px",textTransform:"uppercase",
          marginBottom:14,textAlign:"center" }}>everything you need</div>
        {features.map(f=><div key={f.title} style={{ background:"rgba(255,255,255,.04)",
          border:"1px solid rgba(255,255,255,.07)",borderRadius:16,
          padding:"18px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:14 }}>
          <div style={{ width:40,height:40,borderRadius:12,flexShrink:0,
            background:f.color+"22",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:18,color:f.color }}>{f.icon}</div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:B.white,marginBottom:4 }}>{f.title}</div>
            <div style={{ fontSize:13,color:"#6a8aaa",lineHeight:1.6 }}>{f.d}</div>
          </div>
        </div>)}
      </div>

      {/* expert band */}
      <div style={{ margin:"0 16px 40px",background:`linear-gradient(135deg,${B.purple}20,${B.blue}0a)`,
        border:`1px solid ${B.purple}30`,borderRadius:20,padding:"22px 20px" }}>
        <Chip label="✦ human experts · not just ai" color={B.purple}/>
        <h2 style={{ fontSize:22,fontWeight:700,color:B.white,margin:"12px 0 8px",lineHeight:1.2 }}>
          real answers from certified hr professionals.
        </h2>
        <p style={{ fontSize:13,color:"#7fa8c8",lineHeight:1.7,margin:"0 0 16px" }}>
          Our expert network brings decades of combined experience. When AI isn't enough,
          a real professional is a tap away.
        </p>
        <button onClick={onGetStarted} style={{ padding:"12px 20px",borderRadius:12,
          background:`linear-gradient(135deg,${B.purple},#4c1d95)`,border:"none",
          color:"#fff",fontFamily:FS,fontSize:14,fontWeight:700,cursor:"pointer",
          boxShadow:`0 4px 14px ${B.purple}50` }}>meet our experts →</button>
      </div>

      {/* pricing preview */}
      <div style={{ padding:"0 16px 40px" }}>
        <div style={{ fontSize:10,fontFamily:FM,color:B.blue,fontWeight:700,
          letterSpacing:"1.5px",textTransform:"uppercase",
          marginBottom:14,textAlign:"center" }}>simple pricing</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
          {[
            { name:"starter",price:"$0",period:"forever",color:B.fog,
              features:["3 employees","5 docs/month","PTO tracking","Onboarding"] },
            { name:"pro",price:"$39",period:"/mo",color:B.blue,pop:true,
              features:["20 employees","Unlimited docs","PDF export","Risk radar"] },
          ].map(p=><div key={p.name} style={{ background:p.pop?B.blue+"22":"rgba(255,255,255,.05)",
            border:`1px solid ${p.pop?B.blue+"60":"rgba(255,255,255,.08)"}`,
            borderRadius:16,padding:"16px 14px",position:"relative" }}>
            {p.pop && <div style={{ position:"absolute",top:-10,left:12,
              background:`linear-gradient(135deg,${B.blue},${B.blueD})`,
              color:"#fff",fontSize:9,fontWeight:700,fontFamily:FM,
              padding:"3px 10px",borderRadius:20,letterSpacing:"1px" }}>popular</div>}
            <div style={{ fontSize:10,fontWeight:700,color:p.color,fontFamily:FM,
              letterSpacing:"1px",textTransform:"uppercase",marginBottom:6 }}>{p.name}</div>
            <div style={{ fontSize:28,fontWeight:800,color:B.white,lineHeight:1,marginBottom:2 }}>{p.price}</div>
            <div style={{ fontSize:11,color:"#6a8aaa",fontFamily:FM,marginBottom:12 }}>{p.period}</div>
            {p.features.map(ff=><div key={ff} style={{ display:"flex",gap:7,marginBottom:5 }}>
              <span style={{ color:B.green,fontSize:11,fontWeight:700 }}>✓</span>
              <span style={{ fontSize:12,color:"#8faabe" }}>{ff}</span>
            </div>)}
          </div>)}
        </div>
        <div style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",
          borderRadius:16,padding:"16px 14px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:B.purple,fontFamily:FM,
                letterSpacing:"1px",textTransform:"uppercase",marginBottom:4 }}>expert</div>
              <div style={{ fontSize:28,fontWeight:800,color:B.white,lineHeight:1 }}>$99</div>
              <div style={{ fontSize:11,color:"#6a8aaa",fontFamily:FM }}>/mo</div>
            </div>
            <Chip label="✦ best value" color={B.purple} sm/>
          </div>
          {["Everything in Pro","Ask experts anytime","Monthly HR strategy session","Custom templates"].map(ff=><div key={ff} style={{ display:"flex",gap:7,marginBottom:5 }}>
            <span style={{ color:B.green,fontSize:11,fontWeight:700 }}>✓</span>
            <span style={{ fontSize:12,color:"#8faabe" }}>{ff}</span>
          </div>)}
        </div>
      </div>

      {/* final cta */}
      <div style={{ padding:"0 16px 60px",textAlign:"center" }}>
        <h2 style={{ fontSize:28,fontWeight:700,color:B.white,margin:"0 0 10px",lineHeight:1.2 }}>
          ready to stop flying blind?
        </h2>
        <p style={{ color:"#6a8aaa",marginBottom:24,fontSize:14 }}>
          Start free. No credit card. Cancel anytime.
        </p>
        <button onClick={onGetStarted} style={{ display:"block",width:"100%",maxWidth:320,
          margin:"0 auto",padding:"16px",borderRadius:16,
          background:`linear-gradient(135deg,${B.blue},${B.blueD})`,border:"none",
          color:"#fff",fontFamily:FS,fontSize:16,fontWeight:700,cursor:"pointer",
          boxShadow:`0 6px 24px ${B.blue}50` }}>get started free →</button>
        <div style={{ marginTop:20,display:"flex",justifyContent:"center",
          gap:16,flexWrap:"wrap" }}>
          {["🔒 secure","⚡ ai-powered","👩‍💼 expert-reviewed","✕ cancel anytime"].map(b=>(
            <span key={b} style={{ fontSize:11,color:"#4a6080",fontFamily:FS }}>{b}</span>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop:`1px solid rgba(255,255,255,.07)`,
        padding:"28px 24px",textAlign:"center" }}>
        <div style={{ marginBottom:16 }}>
          <LogoMark height={28} dark={true}/>
        </div>
        <div style={{ fontSize:12,color:"#3a5070",fontFamily:FM,marginBottom:10 }}>
          hrcopilot is a product of{" "}
          <span style={{ color:"#4a6585",fontWeight:700 }}>Hayman Investments LLC</span>
        </div>
        <div style={{ display:"flex",justifyContent:"center",gap:20,
          flexWrap:"wrap",marginBottom:14 }}>
          {[["privacy","Privacy Policy"],["terms","Terms of Service"],["contact","Contact Us"]].map(([key,label])=>(
            <span key={key} onClick={()=>setModal(key)} style={{ fontSize:11,color:"#4a6585",fontFamily:FS,
              cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3 }}>{label}</span>
          ))}
        </div>
        <div style={{ fontSize:11,color:"#2e4460",fontFamily:FM }}>
          © 2026 Hayman Investments LLC · All rights reserved
        </div>
      </div>

      {/* Legal modals */}
      {modal && (
        <div style={{ position:"fixed",inset:0,zIndex:500,
          background:"rgba(10,20,40,.85)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"flex-end",justifyContent:"center" }}
          onClick={e=>{ if(e.target===e.currentTarget)setModal(null); }}>
          <div style={{ background:B.white,borderRadius:"24px 24px 0 0",
            width:"100%",maxWidth:600,maxHeight:"85vh",
            display:"flex",flexDirection:"column",
            boxShadow:"0 -8px 40px rgba(0,0,0,.3)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",padding:"22px 24px 16px",
              borderBottom:`1px solid ${B.silver}` }}>
              <div style={{ fontSize:17,fontWeight:700,color:B.ink,fontFamily:FS }}>
                {MODALS[modal].title}
              </div>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",
                fontSize:24,color:B.fog,cursor:"pointer",padding:"0 4px",lineHeight:1 }}>×</button>
            </div>
            <div style={{ overflowY:"auto",padding:"20px 24px 32px" }}>
              <pre style={{ fontFamily:FS,fontSize:13,color:B.soft,
                lineHeight:1.8,whiteSpace:"pre-wrap",margin:0 }}>
                {MODALS[modal].body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── auth screens ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, onBack }) {
  const [mode,setMode]=useState("signup"); // login | signup | setup
  const [form,setForm]=useState({ email:"",password:"",name:"",company:"",state:"",industry:"" });
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const handleLogin=()=>{
    setErr(""); setLoading(true);
    setTimeout(()=>{
      const users=store.get("hrc_users",{});
      const user=users[form.email.toLowerCase()];
      if(!user){ setErr("No account found. Please sign up."); setLoading(false); return; }
      if(user.password!==btoa(form.password)){ setErr("Incorrect password."); setLoading(false); return; }
      store.set("hrc_session",{ email:form.email.toLowerCase(), uid:user.uid });
      onAuth(user);
      setLoading(false);
    },600);
  };

  const handleSignup=()=>{
    setErr("");
    if(!form.email||!form.password){ setErr("Email and password are required."); return; }
    if(form.password.length<6){ setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setTimeout(()=>{
      const users=store.get("hrc_users",{});
      if(users[form.email.toLowerCase()]){ setErr("An account with this email already exists."); setLoading(false); return; }
      const uid="u_"+Date.now();
      const newUser={ uid, email:form.email.toLowerCase(), password:btoa(form.password), name:form.name, setup:false };
      users[form.email.toLowerCase()]=newUser;
      store.set("hrc_users",users);
      store.set("hrc_session",{ email:form.email.toLowerCase(), uid });
      setMode("setup"); setLoading(false);
    },600);
  };

  const handleSetup=()=>{
    if(!form.company||!form.state){ setErr("Company name and state are required."); return; }
    setLoading(true);
    setTimeout(()=>{
      const users=store.get("hrc_users",{});
      const email=store.get("hrc_session").email;
      const user=users[email];
      const updatedUser={ ...user, setup:true, company:form.company, state:form.state, industry:form.industry };
      users[email]=updatedUser;
      store.set("hrc_users",users);
      // seed demo employees
      const empKey=`hrc_emps_${user.uid}`;
      if(!store.get(empKey)){
        store.set(empKey,[
          { id:"e1",name:"Sarah Mitchell",role:"Sales Associate",dept:"Sales",
            start:"2022-03-15",email:"sarah@"+form.company.toLowerCase().replace(/\s/g,"")+".com",
            phone:"555-0101",status:"active",pto:{ bal:8.5,used:3.5,rate:1.5 },
            docs:[{ id:"d1",type:"Written Warning",date:"Apr 18, 2024",note:"Second no-call/no-show in 30 days" }],
            checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"c1_"+i,label:t.label,url:t.url,done:i<4 })) },
          { id:"e2",name:"James Torrez",role:"Warehouse Lead",dept:"Operations",
            start:"2021-07-01",email:"james@"+form.company.toLowerCase().replace(/\s/g,"")+".com",
            phone:"555-0102",status:"active",pto:{ bal:12,used:8,rate:2 },
            docs:[{ id:"d3",type:"Performance Improvement Plan",date:"Apr 12, 2024",note:"Output below threshold 60 days" }],
            checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"c2_"+i,label:t.label,url:t.url,done:true })) },
        ]);
      }
      store.set(`hrc_pto_${user.uid}`,[
        { id:"r1",name:"Sarah Mitchell",dates:"May 5-7",days:3,status:"pending",reason:"Family vacation" },
        { id:"r2",name:"James Torrez",dates:"Apr 28",days:1,status:"approved",reason:"Medical" },
      ]);
      onAuth(updatedUser);
      setLoading(false);
    },600);
  };

  const inp={ width:"100%",padding:"14px 16px",borderRadius:14,
    border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
    color:B.ink,background:B.pearl,boxSizing:"border-box",
    outline:"none",WebkitAppearance:"none",marginBottom:14 };

  if(mode==="setup") return (
    <div style={{ minHeight:"100vh",background:B.bg,display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"24px",fontFamily:FS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <LogoMark height={36}/>
      <div style={{ marginTop:32,width:"100%",maxWidth:380 }}>
        <h2 style={{ fontSize:24,fontWeight:700,color:B.ink,marginBottom:6 }}>set up your account</h2>
        <p style={{ fontSize:14,color:B.soft,marginBottom:24,lineHeight:1.6 }}>Tell us about your business so we can personalize your experience.</p>
        {err && <div style={{ background:"#fef2f2",border:`1px solid ${B.red}20`,borderRadius:10,
          padding:"10px 14px",marginBottom:14,fontSize:13,color:B.red }}>{err}</div>}
        <input placeholder="Company name *" value={form.company} onChange={e=>f("company",e.target.value)} style={inp}/>
        <select value={form.state} onChange={e=>f("state",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
          <option value="">Select your state *</option>
          {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={form.industry} onChange={e=>f("industry",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
          <option value="">Industry (optional)</option>
          {["Construction & Trades","Retail","Restaurant & Food Service","Healthcare","Professional Services","Manufacturing","Transportation","Technology","Real Estate","Other"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <Btn onClick={handleSetup} full disabled={loading}>
          {loading?"setting up...":"finish setup →"}
        </Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",background:B.navy,display:"flex",
      flexDirection:"column",fontFamily:FS,overflow:"hidden",position:"relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{-webkit-appearance:none}`}</style>
      <div style={{ position:"absolute",top:-200,right:-150,width:400,height:400,borderRadius:"50%",
        background:`radial-gradient(circle,${B.blue}18,transparent 70%)`,pointerEvents:"none" }}/>
      <div style={{ position:"absolute",bottom:-100,left:-100,width:300,height:300,borderRadius:"50%",
        background:`radial-gradient(circle,${B.purple}12,transparent 70%)`,pointerEvents:"none" }}/>
      <div style={{ padding:"32px 28px 20px",position:"relative" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <LogoMark height={38} dark={true}/>
          <button onClick={onBack} style={{ background:"none",border:"none",
            color:"rgba(255,255,255,.5)",fontFamily:FS,fontSize:13,cursor:"pointer" }}>← back</button>
        </div>
        <div style={{ marginTop:36 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:7,
            background:`${B.purple}28`,border:`1px solid ${B.purple}50`,
            borderRadius:30,padding:"5px 14px",marginBottom:20 }}>
            <span style={{ fontSize:11,color:"#c4a8f0",fontFamily:FM,fontWeight:700,letterSpacing:".5px" }}>
              ✦ expert-backed hr for small business
            </span>
          </div>
          <h1 style={{ fontSize:36,fontWeight:800,color:B.white,lineHeight:1.1,
            letterSpacing:"-.5px",margin:"0 0 10px" }}>
            {mode==="login"?"welcome back.":"let's get started."}
          </h1>
          <p style={{ fontSize:15,color:"#7fa8c8",lineHeight:1.7,marginBottom:32 }}>
            {mode==="login"
              ?"Log in to your hrcopilot account."
              :"Join thousands of small businesses who use hrcopilot to stay compliant and protected."}
          </p>
        </div>
      </div>
      <div style={{ flex:1,background:B.white,borderRadius:"28px 28px 0 0",
        padding:"28px 24px 40px",position:"relative" }}>
        {err && <div style={{ background:"#fef2f2",border:`1px solid ${B.red}20`,borderRadius:10,
          padding:"10px 14px",marginBottom:16,fontSize:13,color:B.red }}>{err}</div>}
        {mode==="signup" && <input placeholder="Your name" value={form.name}
          onChange={e=>f("name",e.target.value)} style={inp}/>}
        <input placeholder="Email address" value={form.email} type="email"
          onChange={e=>f("email",e.target.value)} style={inp}/>
        <input placeholder="Password" value={form.password} type="password"
          onChange={e=>f("password",e.target.value)} style={inp}/>
        <Btn full onClick={mode==="login"?handleLogin:handleSignup} disabled={loading}>
          {loading?"...":(mode==="login"?"log in →":"create account →")}
        </Btn>
        <div style={{ textAlign:"center",marginTop:18 }}>
          <span style={{ fontSize:14,color:B.soft }}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
          </span>
          <button onClick={()=>{ setMode(mode==="login"?"signup":"login"); setErr(""); }}
            style={{ background:"none",border:"none",color:B.blue,
              fontSize:14,fontWeight:700,cursor:"pointer" }}>
            {mode==="login"?"sign up":"log in"}
          </button>
        </div>
        <div style={{ marginTop:28,padding:"16px",background:B.pearl,
          borderRadius:14,border:`1px solid ${B.silver}` }}>
          <div style={{ fontSize:11,color:B.fog,fontFamily:FM,marginBottom:8,
            textTransform:"uppercase",letterSpacing:".5px" }}>try demo</div>
          <div style={{ fontSize:13,color:B.soft,marginBottom:10 }}>
            Want to explore first? Use the demo account:
          </div>
          <div style={{ fontSize:12,fontFamily:FM,color:B.ink,marginBottom:10 }}>
            demo@gethrcopilot.com / demo1234
          </div>
          <SmBtn v="outline" onClick={()=>{
            f("email","demo@gethrcopilot.com"); f("password","demo1234");
            // auto-create demo account if not exists
            const users=store.get("hrc_users",{});
            if(!users["demo@gethrcopilot.com"]){
              const uid="u_demo";
              users["demo@gethrcopilot.com"]={ uid,email:"demo@gethrcopilot.com",
                password:btoa("demo1234"),name:"Demo User",setup:true,
                company:"Acme Roofing Co.",state:"Michigan",industry:"Construction & Trades" };
              store.set("hrc_users",users);
              store.set(`hrc_emps_${uid}`,[
                { id:"e1",name:"Sarah Mitchell",role:"Sales Associate",dept:"Sales",
                  start:"2022-03-15",email:"sarah@acmeroofing.com",phone:"555-0101",
                  status:"active",pto:{ bal:8.5,used:3.5,rate:1.5 },
                  docs:[{ id:"d1",type:"Written Warning",date:"Apr 18, 2024",note:"Second no-call/no-show in 30 days" },
                        { id:"d2",type:"Commendation",date:"Jan 10, 2024",note:"Exceeded Q4 target by 22%" }],
                  checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"c1_"+i,label:t.label,url:t.url,done:i<4 })) },
                { id:"e2",name:"James Torrez",role:"Warehouse Lead",dept:"Operations",
                  start:"2021-07-01",email:"james@acmeroofing.com",phone:"555-0102",
                  status:"active",pto:{ bal:12,used:8,rate:2 },
                  docs:[{ id:"d3",type:"Performance Improvement Plan",date:"Apr 12, 2024",note:"Output below threshold 60 days" }],
                  checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"c2_"+i,label:t.label,url:t.url,done:true })) },
                { id:"e3",name:"Priya Nair",role:"Office Coordinator",dept:"Admin",
                  start:"2023-01-10",email:"priya@acmeroofing.com",phone:"555-0103",
                  status:"active",pto:{ bal:6,used:2,rate:1.5 },
                  docs:[{ id:"d4",type:"Commendation",date:"Apr 5, 2024",note:"Saved $14,200 in Q1 vendor renegotiation" }],
                  checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"c3_"+i,label:t.label,url:t.url,done:i<3 })) },
              ]);
              store.set(`hrc_pto_u_demo`,[
                { id:"r1",name:"Sarah Mitchell",dates:"May 5-7",days:3,status:"pending",reason:"Family vacation" },
                { id:"r2",name:"James Torrez",dates:"Apr 28",days:1,status:"approved",reason:"Medical" },
                { id:"r3",name:"Priya Nair",dates:"Jun 2-6",days:5,status:"approved",reason:"Wedding" },
              ]);
            }
            setTimeout(()=>{
              store.set("hrc_session",{ email:"demo@gethrcopilot.com",uid:"u_demo" });
              onAuth(users["demo@gethrcopilot.com"]);
            },100);
          }}>use demo account</SmBtn>
        </div>
      </div>
    </div>
  );
}

// ── bottom nav ────────────────────────────────────────────────────────────────
function BottomNav({ active, go }) {
  return <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:100,
    background:B.white,borderTop:`1px solid ${B.silver}`,
    display:"flex",paddingBottom:"env(safe-area-inset-bottom)",
    boxShadow:"0 -4px 20px rgba(13,27,62,.08)" }}>
    {TABS.map(t=>{
      const on=active===t.id;
      return <button key={t.id} onClick={()=>go(t.id)} style={{
        flex:1,padding:"10px 0 8px",border:"none",background:"transparent",
        cursor:"pointer",display:"flex",flexDirection:"column",
        alignItems:"center",gap:3,WebkitTapHighlightColor:"transparent" }}>
        <span style={{ fontSize:17,color:on?B.blue:B.fog,transition:"color .15s" }}>{t.icon}</span>
        <span style={{ fontSize:9,fontFamily:FM,fontWeight:700,
          color:on?B.blue:B.fog,letterSpacing:".3px",textTransform:"uppercase" }}>{t.label}</span>
        {on && <div style={{ width:4,height:4,borderRadius:"50%",background:B.blue,marginTop:-2 }}/>}
      </button>;
    })}
  </div>;
}

// ── app footer ────────────────────────────────────────────────────────────────
function AppFooter() {
  const [modal,setModal]=useState(null);

  const PRIVACY=`PRIVACY POLICY — Last updated April 23, 2026\n\nhrcopilot is a product of Hayman Investments LLC. This Privacy Policy explains how we collect, use, and protect your information.\n\nINFORMATION WE COLLECT\nWe collect information you provide directly: your name, email, company name, state, and any employee data you enter into the platform. We also collect usage data such as features used and pages visited.\n\nHOW WE USE YOUR INFORMATION\nWe use your information to provide and improve the hrcopilot platform, communicate with you about your account, and send product updates you have opted into. We do not sell your personal information to third parties.\n\nDATA STORAGE\nYour data is stored securely using industry-standard encryption. Employee records and HR documents you create are stored per account and are not accessible to other users.\n\nAI PROCESSING\nWhen you use the document generator or Ask Our Experts features, your inputs are sent to Anthropic's API to generate responses. Please do not include sensitive personal identifiers such as Social Security Numbers in prompts.\n\nYOUR RIGHTS\nYou may request access to, correction of, or deletion of your personal data at any time by contacting privacy@gethrcopilot.com.\n\nCONTACT\nprivacy@gethrcopilot.com\nHayman Investments LLC — Michigan, United States`;

  const TERMS=`TERMS OF SERVICE — Last updated April 23, 2026\n\nThese Terms govern your use of hrcopilot, a product of Hayman Investments LLC.\n\nACCEPTANCE\nBy creating an account you agree to these Terms. If you do not agree, do not use the platform.\n\nNOT LEGAL ADVICE\nhrcopilot is not a law firm and does not provide legal advice. Documents generated by the platform are professional drafts intended as starting points. For matters involving termination, discrimination claims, or active legal disputes, consult a licensed employment attorney in your state.\n\nACCEPTABLE USE\nYou agree to use hrcopilot only for lawful business purposes. You may not use the platform to generate documents intended to harass, discriminate against, or harm employees.\n\nSUBSCRIPTION & BILLING\nPaid plans are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. Refunds are not provided for partial months.\n\nLIMITATION OF LIABILITY\nHayman Investments LLC is not liable for any employment-related legal claims arising from use of documents generated by the platform.\n\nCHANGES\nWe may update these Terms at any time. Continued use constitutes acceptance.\n\nCONTACT\nlegal@gethrcopilot.com`;

  const CONTACT=`CONTACT US\n\nWe'd love to hear from you. We typically respond within 1 business day.\n\nGENERAL INQUIRIES\nhello@gethrcopilot.com\n\nSUPPORT\nFor help with your account, documents, or technical issues:\nsupport@gethrcopilot.com\n\nPRIVACY & DATA\nprivacy@gethrcopilot.com\n\nLEGAL\nlegal@gethrcopilot.com\n\nPARTNERSHIPS & PRESS\npartners@gethrcopilot.com\n\nMAILING ADDRESS\nHayman Investments LLC\nMichigan, United States`;

  const MODALS={ privacy:{ title:"Privacy Policy",body:PRIVACY }, terms:{ title:"Terms of Service",body:TERMS }, contact:{ title:"Contact Us",body:CONTACT } };

  return (
    <>
      <div style={{ borderTop:`1px solid ${B.silver}`,marginTop:40,
        padding:"24px 0 32px",textAlign:"center" }}>
        <div style={{ marginBottom:10 }}>
          <LogoMark height={24}/>
        </div>
        <div style={{ fontSize:11,color:B.fog,fontFamily:FM,marginBottom:10 }}>
          a <span style={{ color:B.soft,fontWeight:700 }}>Hayman Investments LLC</span> product
        </div>
        <div style={{ display:"flex",justifyContent:"center",gap:16,
          flexWrap:"wrap",marginBottom:10 }}>
          {[["privacy","Privacy"],["terms","Terms"],["contact","Contact & Help"]].map(([key,label])=>(
            <span key={key} onClick={()=>setModal(key)} style={{
              fontSize:11,color:B.blue,fontFamily:FS,cursor:"pointer",
              textDecoration:"underline",textUnderlineOffset:3 }}>{label}</span>
          ))}
        </div>
        <div style={{ fontSize:10,color:B.fog,fontFamily:FM }}>
          © 2026 Hayman Investments LLC · All rights reserved
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed",inset:0,zIndex:500,
          background:"rgba(13,27,62,.7)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"flex-end",justifyContent:"center" }}
          onClick={e=>{ if(e.target===e.currentTarget)setModal(null); }}>
          <div style={{ background:B.white,borderRadius:"24px 24px 0 0",
            width:"100%",maxWidth:600,maxHeight:"85vh",
            display:"flex",flexDirection:"column",
            boxShadow:"0 -8px 40px rgba(0,0,0,.2)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",
              alignItems:"center",padding:"22px 24px 16px",
              borderBottom:`1px solid ${B.silver}`,flexShrink:0 }}>
              <div style={{ fontSize:17,fontWeight:700,color:B.ink }}>{MODALS[modal].title}</div>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",
                fontSize:24,color:B.fog,cursor:"pointer",lineHeight:1,padding:"0 4px" }}>×</button>
            </div>
            <div style={{ overflowY:"auto",padding:"20px 24px 32px" }}>
              <pre style={{ fontFamily:FS,fontSize:13,color:B.soft,
                lineHeight:1.85,whiteSpace:"pre-wrap",margin:0 }}>
                {MODALS[modal].body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DesktopSidebar({ active, go, user, onLogout, onHome }) {
  const [menu,setMenu]=useState(false);
  return <div style={{ width:260,minHeight:"100vh",background:B.navy,
    display:"flex",flexDirection:"column",flexShrink:0,
    borderRight:`1px solid ${B.navyLight||"#1a2f4a"}`,position:"sticky",top:0,height:"100vh" }}>
    {/* Logo */}
    <div style={{ padding:"28px 24px 22px",borderBottom:`1px solid rgba(255,255,255,.08)` }}>
      <div onClick={onHome} style={{ cursor:"pointer",display:"inline-block" }}>
        <LogoMark height={44} dark={true}/>
      </div>
      <div style={{ marginTop:10,fontSize:10,color:"rgba(255,255,255,.3)",
        fontFamily:FM,letterSpacing:"1.5px",textTransform:"uppercase" }}>
        expert-backed hr platform
      </div>
    </div>
    {/* Company */}
    <div style={{ padding:"14px 20px",borderBottom:`1px solid rgba(255,255,255,.06)` }}>
      <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:FM,
        textTransform:"uppercase",letterSpacing:"1px",marginBottom:4 }}>workspace</div>
      <div style={{ fontSize:14,fontWeight:700,color:B.white,
        fontFamily:FS }}>{user?.company||"your company"}</div>
      <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:FM,
        marginTop:2 }}>{user?.state||""}</div>
    </div>
    {/* Nav */}
    <nav style={{ padding:"12px",flex:1 }}>
      {TABS.map(t=>{
        const on=active===t.id;
        const isExpert=t.id==="expert";
        return <button key={t.id} onClick={()=>go(t.id)} style={{
          width:"100%",textAlign:"left",padding:"11px 14px",
          borderRadius:10,border:"none",cursor:"pointer",marginBottom:3,
          background:on?(isExpert?`${B.purple}25`:`rgba(255,255,255,.1)`):"transparent",
          color:on?B.white:(isExpert?B.purple:"rgba(255,255,255,.5)"),
          fontSize:14,fontFamily:FS,fontWeight:on?700:500,
          transition:"all .15s",display:"flex",alignItems:"center",gap:12,
          borderLeft:on?`3px solid ${isExpert?B.purple:B.blue}`:"3px solid transparent",
          WebkitTapHighlightColor:"transparent" }}>
          <span style={{ fontSize:16,opacity:.85 }}>{t.icon}</span>
          {t.label}
          {isExpert && <span style={{ marginLeft:"auto",fontSize:9,background:B.purple,
            color:"#fff",padding:"2px 7px",borderRadius:4,fontFamily:FM }}>pro</span>}
        </button>;
      })}
    </nav>
    {/* User */}
    <div style={{ padding:"14px 16px 20px",borderTop:`1px solid rgba(255,255,255,.08)` }}>
      <button onClick={()=>setMenu(m=>!m)} style={{ display:"flex",alignItems:"center",
        gap:10,width:"100%",background:"rgba(255,255,255,.06)",
        border:"1px solid rgba(255,255,255,.1)",borderRadius:12,
        padding:"10px 12px",cursor:"pointer",WebkitTapHighlightColor:"transparent" }}>
        <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${B.blue},${B.purple})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"#fff",fontSize:14,fontWeight:700 }}>
          {(user?.name||user?.email||"?")[0].toUpperCase()}
        </div>
        <div style={{ flex:1,textAlign:"left",overflow:"hidden" }}>
          <div style={{ fontSize:13,fontWeight:600,color:B.white,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {user?.name||"Account"}
          </div>
          <div style={{ fontSize:10,color:"rgba(255,255,255,.4)",fontFamily:FM,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {user?.email}
          </div>
        </div>
        <span style={{ color:"rgba(255,255,255,.4)",fontSize:14 }}>⋮</span>
      </button>
      {menu && <>
        <div style={{ position:"fixed",inset:0,zIndex:199 }} onClick={()=>setMenu(false)}/>
        <div style={{ position:"absolute",bottom:80,left:16,right:16,
          background:B.white,border:`1px solid ${B.silver}`,borderRadius:14,
          padding:"8px",boxShadow:"0 8px 32px rgba(13,27,62,.2)",zIndex:200 }}>
          <button onClick={()=>{ go("profile"); setMenu(false); }} style={{ display:"block",width:"100%",
            textAlign:"left",padding:"10px 14px",background:"none",border:"none",
            fontSize:14,color:B.ink,cursor:"pointer",borderRadius:8,fontFamily:FS }}>⚙ account settings</button>
          <button onClick={()=>{ go("pricing"); setMenu(false); }} style={{ display:"block",width:"100%",
            textAlign:"left",padding:"10px 14px",background:"none",border:"none",
            fontSize:14,color:B.purple,cursor:"pointer",borderRadius:8,fontFamily:FS }}>✦ upgrade plan</button>
          <button onClick={()=>{ setMenu(false); onLogout(); }} style={{ display:"block",width:"100%",
            textAlign:"left",padding:"10px 14px",background:"none",border:"none",
            fontSize:14,color:B.red,cursor:"pointer",borderRadius:8,fontFamily:FS }}>→ log out</button>
        </div>
      </>}
    </div>
  </div>;
}

// ── top bar (mobile only) ─────────────────────────────────────────────────────
function TopBar({ user, go, onLogout, onHome }) {
  const [menu,setMenu]=useState(false);
  return <div style={{ position:"sticky",top:0,zIndex:50,
    background:"rgba(240,244,251,.95)",backdropFilter:"blur(12px)",
    WebkitBackdropFilter:"blur(12px)",borderBottom:`1px solid ${B.silver}`,
    padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
    <div onClick={onHome} style={{ cursor:"pointer" }}>
      <LogoMark height={36}/>
    </div>
    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
      <div style={{ fontSize:12,color:B.soft,fontFamily:FM,
        maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
        {user?.company}
      </div>
      <button onClick={()=>setMenu(m=>!m)} style={{ width:36,height:36,borderRadius:"50%",
        background:`linear-gradient(135deg,${B.blue},${B.purple})`,
        border:"none",cursor:"pointer",display:"flex",alignItems:"center",
        justifyContent:"center",color:"#fff",fontSize:15,fontWeight:700 }}>
        {(user?.name||user?.email||"?")[0].toUpperCase()}
      </button>
    </div>
    {menu && <div style={{ position:"fixed",top:64,right:16,background:B.white,
      border:`1px solid ${B.silver}`,borderRadius:16,padding:"8px",
      boxShadow:"0 8px 32px rgba(13,27,62,.15)",zIndex:200,minWidth:200 }}>
      <div style={{ padding:"10px 14px",borderBottom:`1px solid ${B.pearl}`,marginBottom:4 }}>
        <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{user?.name||"Account"}</div>
        <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>{user?.email}</div>
        <div style={{ fontSize:11,color:B.blue,fontFamily:FM }}>{user?.company}</div>
      </div>
      <button onClick={()=>{ go("profile"); setMenu(false); }} style={{ display:"block",width:"100%",
        textAlign:"left",padding:"10px 14px",background:"none",border:"none",
        fontSize:14,color:B.ink,cursor:"pointer",borderRadius:10,fontFamily:FS }}>⚙ account settings</button>
      <button onClick={()=>{ go("pricing"); setMenu(false); }} style={{ display:"block",width:"100%",
        textAlign:"left",padding:"10px 14px",background:"none",border:"none",
        fontSize:14,color:B.purple,cursor:"pointer",borderRadius:10,fontFamily:FS }}>✦ upgrade plan</button>
      <button onClick={()=>{ setMenu(false); onLogout(); }} style={{ display:"block",width:"100%",
        textAlign:"left",padding:"10px 14px",background:"none",border:"none",
        fontSize:14,color:B.red,cursor:"pointer",borderRadius:10,fontFamily:FS }}>→ log out</button>
    </div>}
    {menu && <div style={{ position:"fixed",inset:0,zIndex:199 }} onClick={()=>setMenu(false)}/>}
  </div>;
}

// ── dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, emps, go, setSel }) {
  const totalDocs=emps.reduce((a,e)=>a+e.docs.length,0);
  const gaps=emps.filter(e=>e.checks.some(c=>!c.done));
  const pto=emps.reduce((a,e)=>a+e.pto.bal,0);
  const hr=new Date().getHours();
  const greet=hr<12?"good morning":hr<17?"good afternoon":"good evening";

  return <div style={{ padding:"20px 0 40px" }}>
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:10,fontFamily:FM,color:B.blue,fontWeight:700,
        letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:4 }}>{greet}</div>
      <h1 style={{ fontSize:24,fontWeight:700,color:B.ink,margin:0 }}>
        {user?.company||"your dashboard"}
      </h1>
      <p style={{ color:B.soft,fontSize:14,marginTop:4 }}>Stay protected. Stay organized.</p>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:24 }}>
      {[
        { v:emps.length,    l:"employees",    color:B.blue   },
        { v:totalDocs,      l:"documents",    color:B.green  },
        { v:pto.toFixed(1), l:"pto days",     color:B.amber  },
        { v:gaps.length,    l:"gaps",         color:gaps.length?B.red:B.green },
      ].map(k=><Card key={k.l} sx={{ padding:"16px" }}>
        <div style={{ fontSize:32,fontWeight:800,color:k.color,lineHeight:1 }}>{k.v}</div>
        <div style={{ fontSize:11,color:B.soft,fontFamily:FM,marginTop:4,
          textTransform:"uppercase",letterSpacing:".5px" }}>{k.l}</div>
      </Card>)}
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:16 }}>
    <Card sx={{ marginBottom:0 }}>
      <div style={{ fontSize:11,fontFamily:FM,color:B.fog,fontWeight:700,
        textTransform:"uppercase",letterSpacing:".8px",marginBottom:14 }}>quick actions</div>
      {[
        { label:"generate a document",    tab:"documents", color:B.blue,   icon:"◧" },
        { label:"check compliance risks", tab:"risks",     color:B.amber,  icon:"◉" },
        { label:"manage pto requests",    tab:"pto",       color:B.green,  icon:"◷" },
        { label:"ask our hr experts",     tab:"expert",    color:B.purple, icon:"✦", pro:true },
      ].map(a=><button key={a.label} onClick={()=>go(a.tab)} style={{
        display:"flex",alignItems:"center",gap:12,width:"100%",
        padding:"13px 14px",borderRadius:14,border:`1px solid ${B.silver}`,
        background:B.pearl,cursor:"pointer",marginBottom:8,textAlign:"left",
        WebkitTapHighlightColor:"transparent" }}>
        <div style={{ width:34,height:34,borderRadius:9,flexShrink:0,
          background:a.color+"18",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:16,color:a.color }}>{a.icon}</div>
        <span style={{ fontSize:14,color:B.ink,fontWeight:600,flex:1 }}>{a.label}</span>
        {a.pro && <Chip label="pro" color={B.purple} sm/>}
        <span style={{ color:B.fog }}>›</span>
      </button>)}
    </Card>
    <Card sx={{ marginBottom:0 }}>
      <div style={{ fontSize:11,fontFamily:FM,color:B.fog,fontWeight:700,
        textTransform:"uppercase",letterSpacing:".8px",marginBottom:14 }}>your team</div>
      {emps.map(e=>{
        const pct=Math.round(e.checks.filter(c=>c.done).length/e.checks.length*100);
        return <button key={e.id} onClick={()=>{ setSel(e); go("employees"); }} style={{
          display:"flex",alignItems:"center",gap:12,width:"100%",
          padding:"11px 0",borderBottom:`1px solid ${B.pearl}`,
          background:"none",border:"none",borderBottom:`1px solid ${B.pearl}`,
          cursor:"pointer",WebkitTapHighlightColor:"transparent" }}>
          <Av name={e.name} size={40}/>
          <div style={{ flex:1,textAlign:"left" }}>
            <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{e.name}</div>
            <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>{e.role}</div>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:5 }}>
              <div style={{ width:60,background:B.silver,borderRadius:3,height:4 }}>
                <div style={{ height:"100%",borderRadius:3,width:`${pct}%`,
                  background:pct===100?B.green:B.blue }}/>
              </div>
              <span style={{ fontSize:10,color:pct===100?B.green:B.soft,
                fontFamily:FM,fontWeight:700 }}>{pct}%</span>
            </div>
          </div>
          <div style={{ textAlign:"right",flexShrink:0 }}>
            <div style={{ fontSize:14,fontWeight:700,color:B.blue }}>{e.pto.bal}d</div>
            <div style={{ fontSize:10,color:B.fog,fontFamily:FM }}>{e.docs.length} docs</div>
          </div>
        </button>;
      })}
      <button onClick={()=>go("employees")} style={{ display:"flex",alignItems:"center",
        justifyContent:"center",gap:8,width:"100%",padding:"13px",
        marginTop:10,borderRadius:14,border:`1.5px dashed ${B.silver}`,
        background:"transparent",cursor:"pointer",color:B.blue,
        fontSize:14,fontFamily:FS,fontWeight:700,
        WebkitTapHighlightColor:"transparent" }}>+ add employee</button>
    </Card>
    </div>
  </div>;
}

// ── document generator ────────────────────────────────────────────────────────
function DocGen({ user, emps, onSave }) {
  const [step,setStep]=useState(1);
  const [emp,setEmp]=useState(null);
  const [dt,setDt]=useState(null);
  const [form,setForm]=useState({ what:"",when:"",prior:"none",context:"" });
  const [out,setOut]=useState("");
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const run=async()=>{
    setLoading(true); setStep(4);
    const apiKey=process.env.REACT_APP_ANTHROPIC_KEY;
    const prompt=`You are a senior HR professional generating a formal ${dt.label} for ${user?.company||"[Company Name]"}.
Employee: ${emp.name} | Role: ${emp.role} | Start Date: ${emp.start}
Document: ${dt.label}
Incident/Reason: ${form.what}
Date: ${form.when||new Date().toLocaleDateString()}
Prior Record: ${form.prior}
Context: ${form.context}
Company: ${user?.company||"[Company Name]"} | State: ${user?.state||""}

Write a complete, professional, legally-defensible document in plain text. Use "${user?.company||"[COMPANY NAME]"}" as the company name throughout. Include company name and date at top, RE: line, 2-3 factual paragraphs, clear expectations/consequences, and signature blocks for employer and employee. Tone: firm, fair, protective of the employer.`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{ "Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true" },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{ role:"user",content:prompt }] })});
      const d=await r.json();
      const text=d.content?.map(b=>b.text||"").join("");
      if(text){ setOut(text); setLoading(false); return; }
    } catch(_){}
    const today=new Date().toLocaleDateString("en-US",{ year:"numeric",month:"long",day:"numeric" });
    setOut(`${user?.company||"[COMPANY NAME]"}
${today}

RE: ${dt.label} — ${emp.name}

Dear ${emp.name},

This ${dt.label} is being issued in connection with the following: ${form.what}

${form.prior==="none"?"This is your first formal written notice regarding this matter.":"Given prior documentation already on file, this matter requires your immediate attention."} ${user?.company||"The company"} takes this situation seriously and expects prompt and sustained corrective action.

${form.context?form.context+"\n\n":""}You are expected to demonstrate immediate improvement. Failure to do so may result in further disciplinary action, up to and including termination of employment.

Please sign below to acknowledge receipt of this document.

___________________________          Date: __________
${emp.name}
${emp.role}, ${user?.company||""}

___________________________          Date: __________
Manager / Authorized Representative
${user?.company||""}

This document has been placed in your personnel file.`);
    setLoading(false);
  };

  const saveDoc=()=>{
    if(saved)return;
    onSave(emp.id,{ id:"d"+Date.now(),type:dt.label,
      date:new Date().toLocaleDateString(),note:form.what.slice(0,70),content:out });
    setSaved(true);
  };

  const pdf=()=>{
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>${dt.label}</title>
    <style>body{font-family:Georgia,serif;max-width:680px;margin:60px auto;line-height:1.9;color:#0d1b3e;font-size:14px}
    h2{font-size:18px;border-bottom:2px solid #1a7af8;padding-bottom:10px;margin-bottom:20px}
    pre{white-space:pre-wrap;font-family:Georgia,serif;line-height:1.9}
    footer{margin-top:48px;border-top:1px solid #e3eaf5;padding-top:14px;text-align:center;font-size:11px;color:#8fa3be}</style>
    </head><body>
    <h2>${user?.company||"hrcopilot"} — ${dt.label}</h2>
    <p style="color:#8fa3be;font-size:12px;font-family:monospace">${emp.name} · ${emp.role} · ${new Date().toLocaleDateString()}</p>
    <pre>${out}</pre>
    <footer>Prepared by hrcopilot · expert-backed hr for small business · review with your attorney for sensitive matters</footer>
    </body></html>`);
    w.document.close(); w.print();
  };

  const reset=()=>{ setStep(1);setEmp(null);setDt(null);
    setForm({what:"",when:"",prior:"none",context:""});setOut("");setSaved(false); };

  const inp={ width:"100%",padding:"13px 14px",borderRadius:12,
    border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
    color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",WebkitAppearance:"none" };

  const Dots=()=><div style={{ display:"flex",justifyContent:"center",gap:6,marginBottom:22 }}>
    {[1,2,3,4].map(s=><div key={s} style={{ width:s===step?24:8,height:8,borderRadius:4,
      transition:"all .3s",background:s<step?B.green:s===step?B.blue:B.silver }}/>)}
  </div>;

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="ai-powered" title="document generator"
      sub="Professional HR documents in 60 seconds."/>
    <Dots/>
    {step===1 && <div>
      <div style={{ fontSize:15,fontWeight:700,color:B.ink,marginBottom:14 }}>who is this for?</div>
      {emps.map(e=><button key={e.id} onClick={()=>{ setEmp(e);setStep(2); }} style={{
        display:"flex",alignItems:"center",gap:14,width:"100%",
        padding:"15px",borderRadius:16,border:`1.5px solid ${B.silver}`,
        background:B.white,cursor:"pointer",marginBottom:10,textAlign:"left",
        WebkitTapHighlightColor:"transparent" }}>
        <Av name={e.name} size={44}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15,fontWeight:700,color:B.ink }}>{e.name}</div>
          <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>{e.role} · {e.docs.length} docs on file</div>
        </div>
        <span style={{ color:B.blue,fontSize:20 }}>›</span>
      </button>)}
    </div>}
    {step===2 && <div>
      <div style={{ fontSize:15,fontWeight:700,color:B.ink,marginBottom:4 }}>document type</div>
      <div style={{ fontSize:13,color:B.soft,marginBottom:16 }}>for <strong>{emp?.name}</strong></div>
      {DOC_TYPES.map(d=><button key={d.id} onClick={()=>{ setDt(d);setStep(3); }} style={{
        display:"flex",alignItems:"center",gap:14,padding:"15px",borderRadius:16,
        border:`1.5px solid ${B.silver}`,background:B.white,cursor:"pointer",
        marginBottom:10,textAlign:"left",WebkitTapHighlightColor:"transparent",width:"100%" }}>
        <div style={{ width:40,height:40,borderRadius:10,flexShrink:0,
          background:d.color+"18",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,color:d.color }}>●</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{d.label}</div>
          <div style={{ fontSize:12,color:B.soft }}>{d.hint}</div>
        </div>
        <span style={{ color:B.blue,fontSize:20 }}>›</span>
      </button>)}
      <button onClick={()=>setStep(1)} style={{ marginTop:8,background:"none",border:"none",
        color:B.blue,cursor:"pointer",fontFamily:FS,fontSize:14,padding:"10px 0" }}>← back</button>
    </div>}
    {step===3 && <div>
      <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
        <Chip label={dt?.label} color={dt?.color}/>
      </div>
      <div style={{ fontSize:13,color:B.soft,marginBottom:20 }}>for <strong>{emp?.name}</strong> at <strong>{user?.company}</strong></div>
      {[
        { k:"what",label:"what happened?",rows:4,ph:"Be specific and factual. Include date, what occurred, and who was present." },
        { k:"when",label:"date of incident",rows:1,ph:"e.g. April 18, 2026" },
        { k:"context",label:"additional context (optional)",rows:3,ph:"Prior conversations, expectations going forward..." },
      ].map(ff=><div key={ff.k} style={{ marginBottom:14 }}>
        <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>{ff.label}</label>
        <textarea value={form[ff.k]} onChange={e=>f(ff.k,e.target.value)}
          placeholder={ff.ph} rows={ff.rows} style={{ ...inp,resize:"vertical" }}/>
      </div>)}
      <div style={{ marginBottom:22 }}>
        <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>prior warnings?</label>
        <select value={form.prior} onChange={e=>f("prior",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
          <option value="none">none — first offense</option>
          <option value="verbal">verbal warning only</option>
          <option value="one">1 written warning</option>
          <option value="multiple">multiple warnings on file</option>
        </select>
      </div>
      <Btn onClick={run} disabled={!form.what} full>generate document →</Btn>
      <button onClick={()=>setStep(2)} style={{ display:"block",width:"100%",marginTop:10,
        background:"none",border:"none",color:B.blue,cursor:"pointer",
        fontFamily:FS,fontSize:14,padding:"10px 0" }}>← back</button>
    </div>}
    {step===4 && (loading
      ? <div style={{ textAlign:"center",padding:"60px 0" }}>
          <div style={{ width:44,height:44,borderRadius:"50%",margin:"0 auto 18px",
            border:`3px solid ${B.silver}`,borderTop:`3px solid ${B.blue}`,
            animation:"spin .8s linear infinite" }}/>
          <div style={{ fontSize:15,color:B.soft }}>drafting your document...</div>
          <div style={{ fontSize:12,color:B.blue,fontFamily:FM,marginTop:5 }}>branded for {user?.company}</div>
        </div>
      : <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div>
              <div style={{ fontSize:15,fontWeight:700,color:B.ink }}>ready</div>
              <Chip label="✓ generated" color={B.green} sm/>
            </div>
            <SmBtn onClick={reset} v="outline">new doc</SmBtn>
          </div>
          <pre style={{ background:B.pearl,border:`1px solid ${B.silver}`,borderRadius:14,
            padding:16,fontFamily:FM,fontSize:11.5,color:B.ink,
            whiteSpace:"pre-wrap",lineHeight:1.9,maxHeight:340,overflowY:"auto",marginBottom:12 }}>{out}</pre>
          <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap" }}>
            <SmBtn onClick={()=>navigator.clipboard?.writeText(out)}>copy</SmBtn>
            <SmBtn onClick={saveDoc} disabled={saved} v="primary">{saved?"✓ saved":"save to file"}</SmBtn>
            <SmBtn onClick={pdf} v="outline">export pdf</SmBtn>
          </div>
          <div style={{ padding:"10px 12px",background:"#fffbeb",border:`1px solid ${B.amber}28`,borderRadius:10 }}>
            <div style={{ fontSize:11,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>
              ⚠ review with your attorney before use for sensitive matters.
            </div>
          </div>
        </div>
    )}
  </div>;
}

// ── employees ─────────────────────────────────────────────────────────────────
function Employees({ emps, sel, setSel, onAdd, onEdit, onDelete, onToggle }) {
  const [view,setView]=useState("list");
  const [showAdd,setShowAdd]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const [showDel,setShowDel]=useState(false);
  const [activeResource,setActiveResource]=useState(null);
  const blank={ name:"",role:"",dept:"",start:"",email:"",phone:"",status:"active" };
  const [form,setForm]=useState(blank);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  // Always get fresh data from emps array by ID — prevents ghost state
  const e = emps.find(em=>em.id===sel?.id) || emps[0];

  const submitAdd=()=>{
    if(!form.name||!form.role){ return; }
    onAdd({ id:"e"+Date.now(),pto:{ bal:0,used:0,rate:1 },docs:[],
      checks:ONBOARD_TEMPLATE.map((t,i)=>({ id:"nc"+i,label:t.label,url:t.url,done:false })),...form });
    setForm(blank); setShowAdd(false);
  };

  const submitEdit=()=>{
    if(!form.name||!form.role){ return; }
    onEdit({ ...e,...form });
    setShowEdit(false);
  };

  if(view==="detail"&&sel) return <div style={{ padding:"20px 20px 100px" }}>
    <button onClick={()=>setView("list")} style={{ background:"none",border:"none",
      color:B.blue,cursor:"pointer",fontFamily:FS,fontSize:14,padding:"0 0 14px",
      display:"flex",alignItems:"center",gap:5 }}>← people</button>
    <Card sx={{ marginBottom:14 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
        <Av name={e.name} size={52}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20,fontWeight:700,color:B.ink }}>{e.name}</div>
          <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>{e.role} · {e.dept}</div>
          <Chip label={e.status} color={B.green} sm/>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          <SmBtn onClick={()=>{ setForm({ name:e.name,role:e.role,dept:e.dept||"",start:e.start,email:e.email,phone:e.phone,status:e.status }); setShowEdit(true); }}>edit</SmBtn>
          <SmBtn v="danger" onClick={()=>setShowDel(true)}>delete</SmBtn>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {[{ l:"email",v:e.email },{ l:"phone",v:e.phone },{ l:"started",v:e.start },{ l:"pto",v:`${e.pto.bal} days` }].map(ff=><div key={ff.l} style={{ background:B.pearl,borderRadius:9,padding:"10px 12px" }}>
          <div style={{ fontSize:9,fontWeight:700,color:B.fog,fontFamily:FM,letterSpacing:".8px",textTransform:"uppercase",marginBottom:2 }}>{ff.l}</div>
          <div style={{ fontSize:13,fontWeight:600,color:B.ink,wordBreak:"break-all" }}>{ff.v}</div>
        </div>)}
      </div>
    </Card>
    <Card sx={{ marginBottom:14 }}>
      <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:12 }}>document history</div>
      {e.docs.length===0 && <div style={{ color:B.fog,fontSize:13 }}>no documents yet.</div>}
      {e.docs.map(doc=>{
        const dt2=DOC_TYPES.find(d=>d.label===doc.type)||{ color:B.fog };
        return <div key={doc.id} style={{ display:"flex",alignItems:"flex-start",gap:10,
          padding:"11px 0",borderBottom:`1px solid ${B.pearl}` }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:dt2.color,flexShrink:0,marginTop:4 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:600,color:B.ink }}>{doc.type}</div>
            <div style={{ fontSize:12,color:B.soft,marginTop:1 }}>{doc.note}</div>
          </div>
          <div style={{ fontSize:10,color:B.fog,fontFamily:FM,flexShrink:0 }}>{doc.date}</div>
        </div>;
      })}
    </Card>
    <Card>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div style={{ fontSize:13,fontWeight:700,color:B.ink }}>onboarding checklist</div>
        <Chip label={`${Math.round(e.checks.filter(c=>c.done).length/e.checks.length*100)}%`}
          color={e.checks.every(c=>c.done)?B.green:B.blue} sm/>
      </div>
      {e.checks.map(item=>{
        const res=ONBOARD_RESOURCES[item.label];
        const open=activeResource===item.id;
        return (
          <div key={item.id}>
            <div style={{ display:"flex",alignItems:"center",gap:12,
              padding:"11px 0",borderBottom:open?"none":`1px solid ${B.pearl}` }}>
              <div onClick={(ev)=>{ ev.stopPropagation(); ev.preventDefault(); onToggle(e.id,item.id); }}
                style={{ width:28,height:28,borderRadius:8,flexShrink:0,
                  border:`2px solid ${item.done?B.green:B.silver}`,
                  background:item.done?B.green:"transparent",
                  cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",transition:"all .2s",userSelect:"none" }}>
                {item.done && <span style={{ color:"#fff",fontSize:13,fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontSize:14,flex:1,color:item.done?B.soft:B.ink,
                textDecoration:item.done?"line-through":"none" }}>{item.label}</span>
              <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    onClick={ev=>ev.stopPropagation()}
                    style={{ fontSize:11,color:B.blue,fontFamily:FM,textDecoration:"none",
                      padding:"3px 8px",borderRadius:6,border:`1px solid ${B.blue}30`,
                      background:`${B.blue}08` }}>form ↗</a>
                )}
                {res && (
                  <button onClick={()=>setActiveResource(open?null:item.id)}
                    style={{ fontSize:11,color:open?B.white:B.purple,fontFamily:FM,
                      padding:"3px 8px",borderRadius:6,cursor:"pointer",
                      border:`1px solid ${B.purple}40`,
                      background:open?B.purple:`${B.purple}08`,
                      WebkitTapHighlightColor:"transparent" }}>
                    {open?"▲ hide":"guide ✦"}
                  </button>
                )}
              </div>
            </div>
            {open && res && (
              <div style={{ background:B.pearl,borderRadius:12,padding:16,
                marginBottom:8,border:`1px solid ${B.silver}` }}>
                <div style={{ fontSize:11,fontWeight:700,color:B.blue,fontFamily:FM,
                  textTransform:"uppercase",letterSpacing:".5px",marginBottom:6 }}>why this matters</div>
                <p style={{ fontSize:13,color:B.ink,lineHeight:1.7,marginBottom:12 }}>{res.why}</p>
                {res.warning && (
                  <div style={{ background:"#fffbeb",border:`1px solid ${B.amber}30`,
                    borderRadius:8,padding:"10px 12px",marginBottom:12 }}>
                    <div style={{ fontSize:12,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>⚠ {res.warning}</div>
                  </div>
                )}
                {res.tips && <>
                  <div style={{ fontSize:11,fontWeight:700,color:B.soft,fontFamily:FM,
                    textTransform:"uppercase",letterSpacing:".5px",marginBottom:6 }}>best practices</div>
                  {res.tips.map((t,i)=>(
                    <div key={i} style={{ display:"flex",gap:8,marginBottom:5 }}>
                      <span style={{ color:B.green,fontSize:12,fontWeight:700,flexShrink:0 }}>✓</span>
                      <span style={{ fontSize:13,color:B.soft,lineHeight:1.5 }}>{t}</span>
                    </div>
                  ))}
                </>}
                {res.handbookSections && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:B.soft,fontFamily:FM,
                      textTransform:"uppercase",letterSpacing:".5px",marginBottom:8 }}>required sections</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:4 }}>
                      {res.handbookSections.map((s,i)=>(
                        <div key={i} style={{ fontSize:12,color:B.soft,padding:"3px 0",display:"flex",gap:5 }}>
                          <span style={{ color:B.blue,flexShrink:0 }}>◧</span>{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {res.links && (
                  <div style={{ marginTop:12,display:"flex",gap:8,flexWrap:"wrap" }}>
                    {res.links.map((l,i)=>(
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:12,color:B.blue,textDecoration:"none",
                          padding:"5px 10px",borderRadius:8,
                          border:`1px solid ${B.blue}30`,background:`${B.blue}08` }}>
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
                {res.url && (
                  <div style={{ marginTop:12 }}>
                    <a href={res.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex",alignItems:"center",gap:6,
                        fontSize:13,color:B.white,textDecoration:"none",fontWeight:700,
                        padding:"9px 14px",borderRadius:10,
                        background:`linear-gradient(135deg,${B.blue},${B.blueD})`,
                        boxShadow:`0 2px 8px ${B.blue}40` }}>
                      {res.urlLabel} ↗
                    </a>
                  </div>
                )}
                {res.template && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",
                      alignItems:"center",marginBottom:8 }}>
                      <div style={{ fontSize:11,fontWeight:700,color:B.soft,fontFamily:FM,
                        textTransform:"uppercase",letterSpacing:".5px" }}>sample template</div>
                      <button onClick={()=>navigator.clipboard?.writeText(res.template)}
                        style={{ fontSize:11,color:B.blue,fontFamily:FM,padding:"3px 8px",
                          borderRadius:6,cursor:"pointer",border:`1px solid ${B.blue}30`,
                          background:`${B.blue}08`,WebkitTapHighlightColor:"transparent" }}>
                        copy template
                      </button>
                    </div>
                    <pre style={{ fontSize:11,color:B.soft,fontFamily:FM,lineHeight:1.7,
                      whiteSpace:"pre-wrap",background:B.white,border:`1px solid ${B.silver}`,
                      borderRadius:8,padding:12,maxHeight:220,overflowY:"auto" }}>{res.template}</pre>
                  </div>
                )}
                {/* Notes field — paper trail tracking */}
                <div style={{ marginTop:14,borderTop:`1px solid ${B.silver}`,paddingTop:12 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:B.soft,fontFamily:FM,
                    textTransform:"uppercase",letterSpacing:".5px",marginBottom:6 }}>
                    your notes
                  </div>
                  <textarea
                    value={item.note||""}
                    onChange={ev=>onToggle(e.id,item.id,"note",ev.target.value)}
                    placeholder={`e.g. "Signed copy in physical file, cabinet 2" or "Completed ${new Date().toLocaleDateString()}"`}
                    rows={2}
                    style={{ width:"100%",padding:"10px 12px",borderRadius:8,
                      border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:13,
                      color:B.ink,background:B.white,resize:"none",
                      outline:"none",boxSizing:"border-box",WebkitAppearance:"none" }}
                  />
                  <div style={{ fontSize:10,color:B.fog,fontFamily:FM,marginTop:4 }}>
                    Notes are saved automatically. Use this to track physical document location.
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </Card>
    {showEdit && <Modal title="edit employee" onClose={()=>setShowEdit(false)}>
      {[{ k:"name",l:"Full Name",req:true },{ k:"role",l:"Job Title",req:true },
        { k:"dept",l:"Department" },{ k:"start",l:"Start Date",t:"date" },
        { k:"email",l:"Email",t:"email" },{ k:"phone",l:"Phone" }].map(ff=><Input key={ff.k}
        label={ff.l} value={form[ff.k]||""} onChange={v=>f(ff.k,v)} type={ff.t||"text"} required={ff.req}/>)}
      <Btn full onClick={submitEdit}>save changes</Btn>
    </Modal>}
    {showDel && <Modal title="delete employee?" onClose={()=>setShowDel(false)}>
      <p style={{ fontSize:14,color:B.soft,marginBottom:20,lineHeight:1.6 }}>
        This will permanently delete {e.name} and all their documents. This cannot be undone.
      </p>
      <div style={{ display:"flex",gap:10 }}>
        <Btn v="ghost" onClick={()=>setShowDel(false)} sx={{ flex:1 }}>cancel</Btn>
        <Btn v="danger" onClick={()=>{ onDelete(e.id); setView("list"); setShowDel(false); }} sx={{ flex:1 }}>delete</Btn>
      </div>
    </Modal>}
  </div>;

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="team management" title="people"/>
    {emps.map(em=>{
      const p2=Math.round(em.checks.filter(c=>c.done).length/em.checks.length*100);
      return <button key={em.id} onClick={()=>{ setSel(em);setView("detail"); }} style={{
        display:"flex",alignItems:"center",gap:12,width:"100%",
        padding:"14px",borderRadius:16,border:`1px solid ${B.silver}`,
        background:B.white,cursor:"pointer",marginBottom:10,textAlign:"left",
        WebkitTapHighlightColor:"transparent" }}>
        <Av name={em.name} size={46}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15,fontWeight:700,color:B.ink }}>{em.name}</div>
          <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>{em.role}</div>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:5 }}>
            <div style={{ width:50,background:B.silver,borderRadius:3,height:4 }}>
              <div style={{ height:"100%",borderRadius:3,width:`${p2}%`,background:p2===100?B.green:B.blue }}/>
            </div>
            <span style={{ fontSize:10,color:p2===100?B.green:B.soft,fontFamily:FM,fontWeight:700 }}>{p2}%</span>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontSize:14,fontWeight:700,color:B.blue }}>{em.pto.bal}d</div>
          <div style={{ fontSize:10,color:B.fog,fontFamily:FM }}>{em.docs.length} docs</div>
        </div>
      </button>;
    })}
    <button onClick={()=>setShowAdd(true)} style={{ display:"flex",alignItems:"center",
      justifyContent:"center",gap:8,width:"100%",padding:"15px",borderRadius:16,
      border:`1.5px dashed ${B.blue}`,background:`${B.blue}08`,cursor:"pointer",
      color:B.blue,fontSize:15,fontFamily:FS,fontWeight:700,marginTop:4,
      WebkitTapHighlightColor:"transparent" }}>+ add employee</button>
    {showAdd && <Modal title="add employee" onClose={()=>setShowAdd(false)}>
      {[{ k:"name",l:"Full Name",req:true },{ k:"role",l:"Job Title",req:true },
        { k:"dept",l:"Department" },{ k:"start",l:"Start Date",t:"date" },
        { k:"email",l:"Work Email",t:"email" },{ k:"phone",l:"Phone" }].map(ff=><Input key={ff.k}
        label={ff.l} value={form[ff.k]||""} onChange={v=>f(ff.k,v)} type={ff.t||"text"} required={ff.req}/>)}
      <Btn full onClick={submitAdd}>add employee →</Btn>
    </Modal>}
  </div>;
}

// ── pto ───────────────────────────────────────────────────────────────────────
function PTO({ emps, reqs, setReqs, onUpdatePTO }) {
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({ name:"",dates:"",days:"",reason:"" });
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const sc={ pending:B.amber,approved:B.green,denied:B.red };

  const approve=(id)=>{
    const req=reqs.find(r=>r.id===id);
    if(req){ onUpdatePTO(req.name,-req.days); }
    setReqs(p=>p.map(x=>x.id===id?{...x,status:"approved"}:x));
  };
  const deny=(id)=>setReqs(p=>p.map(x=>x.id===id?{...x,status:"denied"}:x));

  const submitAdd=()=>{
    if(!form.name||!form.dates||!form.days)return;
    setReqs(p=>[...p,{ id:"r"+Date.now(),...form,days:Number(form.days),status:"pending" }]);
    setForm({ name:"",dates:"",days:"",reason:"" }); setShowAdd(false);
  };

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="time off" title="pto tracker" sub="Balances, accrual, and approvals."/>
    {emps.map(e=>{
      const tot=e.pto.bal+e.pto.used;
      return <Card key={e.id} sx={{ marginBottom:12,padding:"16px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
          <Av name={e.name} size={34}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{e.name}</div>
            <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>{e.role}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <span style={{ fontSize:26,fontWeight:800,color:B.blue,lineHeight:1 }}>{e.pto.bal}</span>
            <span style={{ fontSize:11,color:B.fog,marginLeft:3 }}>days</span>
          </div>
        </div>
        <div style={{ background:B.pearl,borderRadius:5,height:6,overflow:"hidden" }}>
          <div style={{ height:"100%",borderRadius:5,transition:"width .5s",
            width:`${Math.min(100,e.pto.bal/Math.max(tot,1)*100)}%`,
            background:`linear-gradient(90deg,${B.blue},${B.purple})` }}/>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:B.fog,fontFamily:FM,marginTop:5 }}>
          <span>{e.pto.used} used</span><span>{e.pto.rate}d/mo accrual</span>
        </div>
      </Card>;
    })}
    <Card sx={{ marginTop:8 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div style={{ fontSize:13,fontWeight:700,color:B.ink }}>requests</div>
        <SmBtn v="primary" onClick={()=>setShowAdd(true)}>+ log request</SmBtn>
      </div>
      {reqs.length===0 && <div style={{ color:B.fog,fontSize:13,textAlign:"center",padding:"20px 0" }}>no requests yet.</div>}
      {reqs.map(r=><div key={r.id} style={{ padding:"13px 0",borderBottom:`1px solid ${B.pearl}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:r.status==="pending"?10:0 }}>
          <Av name={r.name} size={32}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>{r.name}</div>
            <div style={{ fontSize:12,color:B.soft,fontFamily:FM }}>{r.dates} · {r.days}d · {r.reason}</div>
          </div>
          <Chip label={r.status} color={sc[r.status]} sm/>
        </div>
        {r.status==="pending" && <div style={{ display:"flex",gap:8,marginLeft:42 }}>
          <SmBtn v="green" onClick={()=>approve(r.id)}>approve</SmBtn>
          <SmBtn onClick={()=>deny(r.id)}>deny</SmBtn>
        </div>}
      </div>)}
    </Card>
    {showAdd && <Modal title="log pto request" onClose={()=>setShowAdd(false)}>
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>employee</label>
        <select value={form.name} onChange={e=>f("name",e.target.value)} style={{ width:"100%",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",WebkitAppearance:"none" }}>
          <option value="">select employee</option>
          {emps.map(e=><option key={e.id} value={e.name}>{e.name}</option>)}
        </select>
      </div>
      <Input label="dates" value={form.dates} onChange={v=>f("dates",v)} placeholder="e.g. May 5-7"/>
      <Input label="number of days" value={form.days} onChange={v=>f("days",v)} type="number" placeholder="3"/>
      <Input label="reason" value={form.reason} onChange={v=>f("reason",v)} placeholder="e.g. Family vacation"/>
      <Btn full onClick={submitAdd}>submit request →</Btn>
    </Modal>}
  </div>;
}

// ── risk radar ────────────────────────────────────────────────────────────────
function RiskRadar({ emps, go, setSel }) {
  const [dismissed,setDismissed]=useState(()=>store.get("hrc_dismissed",[]));
  const active=RISK_ITEMS.filter(r=>!dismissed.includes(r.id));
  const high=active.filter(r=>r.sev==="high").length;
  const incomplete=emps.filter(e=>e.checks.some(c=>!c.done));

  const dismiss=(id)=>{
    const next=[...dismissed,id];
    setDismissed(next); store.set("hrc_dismissed",next);
  };

  const goToEmployee=(emp)=>{
    setSel(emp);
    go("employees");
  };

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="compliance" title="risk radar" sub="Know your exposure before it becomes a lawsuit."/>

    {/* Score cards */}
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20 }}>
      <Card sx={{ padding:"18px 16px",borderLeft:`4px solid ${B.red}` }}>
        <div style={{ fontSize:36,fontWeight:800,color:B.red,lineHeight:1 }}>{high}</div>
        <div style={{ fontSize:10,color:B.soft,fontFamily:FM,marginTop:4,
          textTransform:"uppercase",letterSpacing:".5px" }}>high severity</div>
        <div style={{ fontSize:11,color:B.red,marginTop:3 }}>act immediately</div>
      </Card>
      <Card sx={{ padding:"18px 16px",borderLeft:`4px solid ${B.amber}` }}>
        <div style={{ fontSize:36,fontWeight:800,color:B.amber,lineHeight:1 }}>
          {active.filter(r=>r.sev==="medium").length}
        </div>
        <div style={{ fontSize:10,color:B.soft,fontFamily:FM,marginTop:4,
          textTransform:"uppercase",letterSpacing:".5px" }}>medium severity</div>
        <div style={{ fontSize:11,color:B.amber,marginTop:3 }}>address this month</div>
      </Card>
      <Card sx={{ padding:"18px 16px",borderLeft:`4px solid ${B.green}` }}>
        <div style={{ fontSize:36,fontWeight:800,color:B.green,lineHeight:1 }}>
          {RISK_ITEMS.length-active.length}
        </div>
        <div style={{ fontSize:10,color:B.soft,fontFamily:FM,marginTop:4,
          textTransform:"uppercase",letterSpacing:".5px" }}>resolved</div>
        <div style={{ fontSize:11,color:B.green,marginTop:3 }}>keep it up</div>
      </Card>
      <Card sx={{ padding:"18px 16px",borderLeft:`4px solid ${B.purple}` }}>
        <div style={{ fontSize:36,fontWeight:800,color:B.purple,lineHeight:1 }}>
          {incomplete.length}
        </div>
        <div style={{ fontSize:10,color:B.soft,fontFamily:FM,marginTop:4,
          textTransform:"uppercase",letterSpacing:".5px" }}>onboard gaps</div>
        <div style={{ fontSize:11,color:B.purple,marginTop:3 }}>employees at risk</div>
      </Card>
    </div>

    {/* Open risks */}
    <Card sx={{ marginBottom:16 }}>
      <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:14 }}>open compliance risks</div>
      {active.length===0 && (
        <div style={{ textAlign:"center",padding:"28px 0" }}>
          <div style={{ fontSize:28,marginBottom:8 }}>🎉</div>
          <div style={{ fontSize:15,fontWeight:700,color:B.green }}>all risks resolved!</div>
          <div style={{ fontSize:13,color:B.soft,marginTop:4 }}>Your business is well protected. Keep it up.</div>
        </div>
      )}
      {active.map(r=>(
        <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,
          padding:"14px 0",borderBottom:`1px solid ${B.pearl}` }}>
          <div style={{ width:10,height:10,borderRadius:"50%",flexShrink:0,
            background:r.sev==="high"?B.red:B.amber }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,fontWeight:600,color:B.ink,lineHeight:1.4 }}>{r.label}</div>
            <div style={{ fontSize:11,color:r.sev==="high"?B.red:B.amber,
              fontFamily:FM,marginTop:2 }}>{r.sev} severity</div>
          </div>
          <SmBtn v="primary" onClick={()=>dismiss(r.id)}>mark resolved</SmBtn>
        </div>
      ))}
    </Card>

    {/* Onboarding gaps — now clickable */}
    {incomplete.length>0 && (
      <Card>
        <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:10 }}>
          onboarding gaps
        </div>
        <div style={{ padding:"12px 14px",background:"#fef2f2",
          border:`1px solid ${B.red}20`,borderRadius:10,marginBottom:14,
          display:"flex",alignItems:"flex-start",gap:10 }}>
          <span style={{ fontSize:16,flexShrink:0 }}>⚠</span>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:B.red,marginBottom:2 }}>
              immediate legal liability
            </div>
            <div style={{ fontSize:12,color:B.red,fontFamily:FM,lineHeight:1.6 }}>
              I-9 errors carry fines up to $27,000 per employee. Missing safety training
              creates OSHA liability. Click any employee below to fix gaps now.
            </div>
          </div>
        </div>
        {incomplete.map(e=>{
          const open=e.checks.filter(c=>!c.done);
          const hasI9=open.some(c=>c.label.includes("I-9"));
          return (
            <div key={e.id} style={{ padding:"14px 0",borderBottom:`1px solid ${B.pearl}` }}>
              <button onClick={()=>goToEmployee(e)} style={{
                display:"flex",alignItems:"center",gap:12,width:"100%",
                background:`linear-gradient(135deg,${B.red}08,${B.red}03)`,
                border:`1px solid ${B.red}20`,borderRadius:12,
                padding:"12px 14px",cursor:"pointer",textAlign:"left",
                WebkitTapHighlightColor:"transparent",marginBottom:8 }}>
                <Av name={e.name} size={38}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:B.ink,marginBottom:2 }}>
                    {e.name}
                  </div>
                  <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>{e.role}</div>
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <Chip label={`${open.length} open`} color={B.red} sm/>
                  {hasI9 && <div style={{ fontSize:10,color:B.red,fontFamily:FM,
                    marginTop:4,fontWeight:700 }}>⚠ I-9 missing</div>}
                </div>
                <span style={{ color:B.blue,fontSize:18,flexShrink:0 }}>→</span>
              </button>
              <div style={{ paddingLeft:14 }}>
                {open.map(c=>(
                  <div key={c.id} style={{ display:"flex",alignItems:"center",gap:8,
                    padding:"4px 0" }}>
                    <span style={{ color:B.red,fontSize:12,fontWeight:700,flexShrink:0 }}>✕</span>
                    <span style={{ fontSize:12,color:B.red,fontFamily:FM }}>{c.label}</span>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer"
                        onClick={ev=>ev.stopPropagation()}
                        style={{ fontSize:10,color:B.blue,textDecoration:"none",
                          padding:"2px 6px",borderRadius:4,
                          border:`1px solid ${B.blue}30`,background:`${B.blue}08`,
                          flexShrink:0 }}>form ↗</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <button onClick={()=>go("employees")} style={{ display:"flex",
          alignItems:"center",justifyContent:"center",gap:8,width:"100%",
          padding:"12px",marginTop:10,borderRadius:12,
          border:`1.5px solid ${B.blue}`,background:`${B.blue}08`,
          cursor:"pointer",color:B.blue,fontSize:14,fontFamily:FS,fontWeight:700,
          WebkitTapHighlightColor:"transparent" }}>
          → fix all onboarding gaps in people
        </button>
      </Card>
    )}
  </div>;
}

// ── ask experts ───────────────────────────────────────────────────────────────
function Experts({ user }) {
  const [q,setQ]=useState("");
  const [ans,setAns]=useState("");
  const [loading,setLoading]=useState(false);
  const [asked,setAsked]=useState(false);

  const examples=[
    "Can I fire someone who is on FMLA leave?",
    "My employee won't sign a write-up. What now?",
    "What do I need before terminating for performance?",
    "An employee is threatening to sue. What do I do?",
    "Can I require repayment of training costs?",
  ];

  const ask=async(query)=>{
    const q2=query||q; if(!q2.trim())return;
    setLoading(true); setAsked(true); setAns("");
    const apiKey=process.env.REACT_APP_ANTHROPIC_KEY;
    const p=`You are a senior HR professional in the hrcopilot expert network with deep expertise in HR compliance, employee relations, and small business HR strategy. A small business owner needs practical HR guidance. Their company is "${user?.company||"a small business"}" in ${user?.state||"the US"}${user?.industry?", in the "+user.industry+" industry":""}.

Question: ${q2}

Give a thorough, direct, practical answer that:
- Addresses this specific question immediately and directly
- Gives clear actionable steps the owner can take
- Notes any important legal considerations
- Flags when an employment attorney is genuinely necessary
- Is personalized to their business context where relevant

Tone: warm, authoritative, like advice from a trusted senior HR colleague. Prose paragraphs only — no bullet points or headers. Write 3-4 solid paragraphs.`;
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":apiKey,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user",content:p }]
        })});
      const d=await r.json();
      if(d.error){ throw new Error(d.error.message); }
      const text=d.content?.map(b=>b.text||"").join("");
      if(text){ setAns(text); setLoading(false); return; }
    } catch(err){ console.log("API error:",err); }
    // Smart fallback — uses the actual question
    const fallbacks={
      "fmla":        `Navigating terminations while an employee is on FMLA leave is one of the trickiest situations in small business HR, and the answer hinges on one thing: documentation.\n\nThe FMLA protects the leave itself — not the employee from all discipline or termination. If you have a legitimate, well-documented business reason that existed before the leave began, and you would have taken the same action regardless of the leave, you're in a defensible position. The courts and the DOL look very carefully at timing, however. A termination that happens during or immediately after protected leave, without a clear paper trail predating it, will look retaliatory even when it isn't.\n\nBefore taking any action, make sure every performance issue or policy violation is documented in writing, that the decision predates the leave, and that you'd make the same call if this employee had never taken FMLA. If all three are true, consult your employment attorney before the meeting — a 30-minute call now is far cheaper than defending a retaliation claim later.`,
      "terminate":   `Terminating an employee for performance requires a clear, documented paper trail — and most small business owners don't build it until it's too late.\n\nBefore you terminate, you need at minimum: written documentation of the specific performance issues with dates, evidence that the employee was clearly informed of expectations and where they fell short, records of any prior warnings or corrective conversations, and proof that you gave them a reasonable opportunity to improve. A Performance Improvement Plan isn't always legally required, but it dramatically strengthens your position.\n\nAt ${user?.company||"your company"} in ${user?.state||"your state"}, at-will employment means you generally can terminate without cause — but "at-will" doesn't protect you from discrimination or retaliation claims. Make sure the reason is legitimate, consistent with how you've treated other employees in similar situations, and has nothing to do with any protected characteristic. When in doubt, run it by an employment attorney before the meeting.`,
      "write":       `When an employee refuses to sign a write-up, it feels like a standoff — but it doesn't have to derail the process.\n\nFirst, understand that the signature is an acknowledgment of receipt, not an agreement with the contents. Make sure you've communicated that clearly to the employee. Many people refuse because they think signing means they're admitting guilt. Clarify that the document simply confirms they received and read it.\n\nIf they still refuse, have them note their objection in writing, or have a witness note the refusal on the document itself. Write something like "Employee declined to sign — witnessed by [Name] on [Date]." This protects you just as well legally. File it in their personnel record and move forward with the disciplinary process as planned. Their refusal to sign does not invalidate the warning.`,
      "lawsuit":     `If an employee is threatening to sue, your first move is to stop talking and start documenting — right now.\n\nDo not have any further conversations with this employee about the underlying dispute without HR support or legal counsel present. Anything you say can and will be used against you. Preserve everything: emails, texts, performance reviews, timesheets, disciplinary records, and any relevant communications. Do not delete anything, even if you think it's unhelpful to your case.\n\nContact an employment attorney today — not next week. Many offer free initial consultations and can quickly assess your exposure. Check whether you have Employment Practices Liability Insurance (EPLI), which covers exactly this situation. If you don't have it, this is a good reminder to get it after this is resolved. The faster you get professional guidance, the better your position.`,
      "default":     `That's a great question and one we hear from small business owners regularly. The answer depends on a few key factors specific to your situation.\n\nThe most important thing in almost every HR situation is documentation. Whatever the issue — whether it's performance, attendance, conflict, or compliance — having a clear written record of what happened, when, what was communicated, and what steps were taken will protect ${user?.company||"your business"} enormously. Courts, the DOL, and the EEOC all look first at the paper trail.\n\nFor ${user?.state||"your state"} specifically, employment laws can vary significantly from federal minimums, so it's worth knowing your state-specific requirements around termination, leave, and wage laws. If this situation involves potential discrimination, harassment, FMLA, or a threatened lawsuit, I'd strongly recommend a consultation with a local employment attorney before taking action. A brief call now is always cheaper than defending a claim later.\n\nIf you'd like more specific guidance, try asking a more detailed version of your question — the more context you give us about the situation, the more precise our guidance can be.`
    };
    const q2lower=q2.toLowerCase();
    let answer=fallbacks.default;
    if(q2lower.includes("fmla")||q2lower.includes("leave")&&q2lower.includes("fire")||q2lower.includes("leave")&&q2lower.includes("terminat")) answer=fallbacks.fmla;
    else if(q2lower.includes("terminat")||q2lower.includes("fire")||q2lower.includes("let go")||q2lower.includes("performance")) answer=fallbacks.terminate;
    else if(q2lower.includes("sign")||q2lower.includes("write-up")||q2lower.includes("writeup")||q2lower.includes("written warning")) answer=fallbacks.write;
    else if(q2lower.includes("sue")||q2lower.includes("lawsuit")||q2lower.includes("lawyer")||q2lower.includes("legal threat")) answer=fallbacks.lawsuit;
    setAns(answer);
    setLoading(false);
  };

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="expert guidance" title="ask our experts" sub="Certified HR professionals. Real answers."/>
    <div style={{ background:`linear-gradient(135deg,${B.navy},#162545)`,
      borderRadius:20,padding:"20px",marginBottom:18 }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
        <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>✦</div>
        <div>
          <Chip label="certified hr professionals" color={B.purple}/>
          <div style={{ fontSize:15,fontWeight:700,color:B.white,marginTop:6 }}>our expert network</div>
        </div>
      </div>
      <p style={{ fontSize:13,color:"#7fa8c8",margin:0,lineHeight:1.7 }}>
        Decades of combined experience. When AI isn't enough, a real professional is a tap away.
        {user?.state && ` Familiar with ${user.state} employment law.`}
      </p>
    </div>
    <Card sx={{ marginBottom:14 }}>
      <div style={{ fontSize:14,fontWeight:700,color:B.ink,marginBottom:10 }}>what's your question?</div>
      <textarea value={q} onChange={e=>setQ(e.target.value)}
        placeholder="e.g. An employee is threatening to sue over their termination. What should I do right now?"
        rows={4} style={{ width:"100%",padding:"13px 14px",borderRadius:12,
          border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,
          color:B.ink,background:B.pearl,resize:"none",outline:"none",
          boxSizing:"border-box",WebkitAppearance:"none" }}/>
      <Btn onClick={()=>ask()} disabled={!q.trim()} full v="purple" sx={{ marginTop:10 }}>ask the experts →</Btn>
    </Card>
    {!asked && <Card>
      <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:10 }}>common questions</div>
      {examples.map(ex=><button key={ex} onClick={()=>{ setQ(ex); ask(ex); }} style={{
        display:"flex",alignItems:"center",gap:10,width:"100%",
        padding:"12px 0",borderBottom:`1px solid ${B.pearl}`,
        background:"none",border:"none",borderBottom:`1px solid ${B.pearl}`,
        cursor:"pointer",textAlign:"left",WebkitTapHighlightColor:"transparent" }}>
        <span style={{ color:B.purple,flexShrink:0 }}>✦</span>
        <span style={{ fontSize:14,color:B.ink }}>{ex}</span>
      </button>)}
    </Card>}
    {asked && <Card sx={{ borderLeft:`4px solid ${B.purple}` }}>
      {loading
        ? <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 0" }}>
            <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,
              border:`3px solid ${B.silver}`,borderTop:`3px solid ${B.purple}`,
              animation:"spin .8s linear infinite" }}/>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:B.ink }}>on it...</div>
              <div style={{ fontSize:11,color:B.soft,fontFamily:FM }}>drawing on expert experience</div>
            </div>
          </div>
        : <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0,
                background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>✦</div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:B.ink }}>expert response</div>
                <div style={{ fontSize:10,color:B.purple,fontFamily:FM }}>hrcopilot expert network</div>
              </div>
            </div>
            <div style={{ fontSize:14,color:B.ink,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{ans}</div>
            <div style={{ marginTop:14,padding:"10px 12px",background:"#fffbeb",border:`1px solid ${B.amber}28`,borderRadius:10 }}>
              <div style={{ fontSize:11,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>
                ⚠ general hr guidance only. employment law varies by state. consult an attorney for active legal threats.
              </div>
            </div>
            <button onClick={()=>{ setAsked(false);setQ("");setAns(""); }} style={{ marginTop:12,
              background:"none",border:"none",color:B.blue,cursor:"pointer",fontFamily:FS,fontSize:13,padding:"8px 0" }}>
              ask another →
            </button>
          </div>}
    </Card>}
  </div>;
}

// ── pricing ───────────────────────────────────────────────────────────────────
// ── handbook generator ────────────────────────────────────────────────────────
function HandbookGenerator({ user }) {
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({
    companyType:"", size:"", state:user?.state||"", industry:user?.industry||"",
    atWill:true, remoteWork:false, overtime:true,
    ptoType:"accrual", ptoDays:"10", sickDays:"5",
    benefits:"", dress:"business casual", probation:"90",
    extraPolicies:"",
  });
  const [handbook,setHandbook]=useState("");
  const [loading,setLoading]=useState(false);
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const generate=async()=>{
    setLoading(true); setStep(3);
    const apiKey=process.env.REACT_APP_ANTHROPIC_KEY;
    const prompt=`You are a senior HR professional with 30 years of experience creating a comprehensive, legally-sound Employee Handbook for a small business.

COMPANY PROFILE:
- Company: ${user?.company||"[Company Name]"}
- State: ${form.state}
- Industry: ${form.industry||"General Business"}
- Size: ${form.size} employees
- Type: ${form.companyType}

POLICIES TO INCLUDE:
- At-will employment: ${form.atWill?"Yes":"No"}
- Remote/hybrid work: ${form.remoteWork?"Yes - include remote work policy":"No"}
- Overtime eligible: ${form.overtime?"Yes - FLSA non-exempt":"Exempt positions"}
- PTO: ${form.ptoDays} days/year, ${form.ptoType} basis
- Sick leave: ${form.sickDays} days/year
- Probationary period: ${form.probation} days
- Dress code: ${form.dress}
- Benefits offered: ${form.benefits||"To be determined"}
- Additional policies needed: ${form.extraPolicies||"None specified"}

Write a complete, professional Employee Handbook in plain text. Include ALL of the following sections:
1. Welcome & Company Mission Statement
2. At-Will Employment Statement (if applicable)
3. Equal Employment Opportunity Policy
4. Anti-Harassment & Anti-Discrimination Policy
5. Code of Conduct & Professional Standards
6. Work Schedule & Attendance Policy
7. PTO, Sick Leave & Holiday Policy
8. ${form.remoteWork?"Remote & Hybrid Work Policy":"Workplace Policies"}
9. FMLA & Leave of Absence Policy
10. Pay, Overtime & Expense Policy
11. Performance Review Process
12. Progressive Discipline Policy
13. Termination & Separation Policy
14. Workplace Safety Policy (OSHA)
15. Drug & Alcohol-Free Workplace Policy
16. Confidentiality & Data Privacy Policy
17. Technology & Device Usage Policy
18. Social Media Policy
19. Complaint & Grievance Procedure
20. Employee Acknowledgment & Signature Page

Make each section substantive and specific to ${user?.company||"this company"} in ${form.state}. Use professional HR language. Include ${form.state}-specific requirements where applicable. This handbook should be immediately usable with minimal customization.`;

    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,
          "anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
          messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      const text=d.content?.map(b=>b.text||"").join("");
      if(text){ setHandbook(text); setLoading(false); return; }
    } catch(_){}

    // Fallback handbook
    setHandbook(`${user?.company||"[COMPANY NAME]"} EMPLOYEE HANDBOOK
${form.state} | Effective ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — WELCOME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to ${user?.company||"[Company Name]"}. We are glad you are here. This handbook outlines our policies, expectations, and the benefits available to you as a member of our team. Please read it carefully and keep it as a reference throughout your employment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — AT-WILL EMPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${form.atWill?`Employment at ${user?.company||"[Company Name]"} is at-will. This means that either you or the Company may terminate the employment relationship at any time, with or without cause, and with or without notice. Nothing in this handbook creates a contract of employment or alters the at-will nature of employment.`:"Employment terms are governed by your individual employment agreement."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — EQUAL EMPLOYMENT OPPORTUNITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${user?.company||"[Company Name]"} is an equal opportunity employer. We do not discriminate on the basis of race, color, religion, sex, national origin, age, disability, genetic information, sexual orientation, gender identity, or any other characteristic protected by federal, state, or local law. This policy applies to all aspects of employment including hiring, promotion, compensation, and termination.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — ANTI-HARASSMENT POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Company prohibits harassment of any kind, including sexual harassment. Harassment includes unwelcome conduct based on any protected characteristic that creates a hostile, intimidating, or offensive work environment. Any employee who experiences or witnesses harassment should report it immediately to their supervisor or to ownership. All reports will be investigated promptly and confidentially. Retaliation against anyone who reports harassment in good faith is strictly prohibited.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — PTO & LEAVE POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-time employees are eligible for ${form.ptoDays} days of paid time off per year, accrued on a ${form.ptoType} basis. Sick leave: ${form.sickDays} days per year. PTO requests must be submitted in advance and are subject to manager approval. Unused PTO is governed by ${form.state} state law.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — PROGRESSIVE DISCIPLINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Company uses progressive discipline to address performance and conduct issues: (1) Verbal Warning, (2) Written Warning, (3) Final Written Warning or Performance Improvement Plan, (4) Termination. The Company reserves the right to skip steps based on the severity of the conduct. Documentation of all disciplinary actions will be maintained in the employee's personnel file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — ACKNOWLEDGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I acknowledge that I have received, read, and understand the ${user?.company||"[Company Name]"} Employee Handbook. I understand this handbook is not a contract of employment. I agree to comply with all policies herein.

Employee Signature: ___________________________ Date: ___________
Printed Name: ________________________________
Job Title: ____________________________________

[COMPLETE HANDBOOK — Deploy API key to generate the full 20-section version]`);
    setLoading(false);
  };

  const inp={ width:"100%",padding:"12px 14px",borderRadius:12,
    border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:14,
    color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",
    WebkitAppearance:"none" };

  const Dots=()=><div style={{ display:"flex",justifyContent:"center",gap:6,marginBottom:20 }}>
    {[1,2,3].map(s=><div key={s} style={{ width:s===step?28:8,height:8,borderRadius:4,
      transition:"all .3s",background:s<step?B.green:s===step?B.purple:B.silver }}/>)}
  </div>;

  return (
    <div style={{ padding:"20px 20px 40px" }}>
      <div style={{ background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
        borderRadius:20,padding:"24px 22px",marginBottom:24,
        display:"flex",alignItems:"center",gap:16 }}>
        <div style={{ fontSize:36 }}>📋</div>
        <div>
          <div style={{ fontSize:11,color:"#c4a8f0",fontFamily:FM,
            fontWeight:700,letterSpacing:"1px",marginBottom:4 }}>CONCIERGE FEATURE</div>
          <div style={{ fontSize:20,fontWeight:700,color:B.white,lineHeight:1.2 }}>
            AI handbook generator
          </div>
          <div style={{ fontSize:13,color:"#c4a8f0",marginTop:4,lineHeight:1.5 }}>
            A complete, customized employee handbook in minutes.
            Reviewed by our certified HR professionals.
          </div>
        </div>
      </div>

      <Dots/>

      {step===1 && (
        <div>
          <SectionHead title="about your company" sub="We'll customize every policy to your specific situation."/>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>
              company type *
            </label>
            <select value={form.companyType} onChange={e=>f("companyType",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              <option value="">select type</option>
              {["LLC","S-Corporation","C-Corporation","Sole Proprietorship","Partnership","Non-profit"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>number of employees *</label>
            <select value={form.size} onChange={e=>f("size",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              <option value="">select size</option>
              {["1-5","6-10","11-20","21-50","51-100"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>state *</label>
            <select value={form.state} onChange={e=>f("state",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              <option value="">select state</option>
              {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>industry</label>
            <select value={form.industry} onChange={e=>f("industry",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              <option value="">select industry</option>
              {["Construction & Trades","Retail","Restaurant & Food Service","Healthcare","Professional Services","Manufacturing","Transportation","Technology","Real Estate","Other"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Btn full onClick={()=>setStep(2)} disabled={!form.companyType||!form.size||!form.state}>
            next: policy preferences →
          </Btn>
        </div>
      )}

      {step===2 && (
        <div>
          <SectionHead title="policy preferences" sub="We'll write each policy based on your answers."/>

          {/* Toggle policies */}
          {[
            { key:"atWill",    label:"At-will employment",      hint:"Recommended for most states" },
            { key:"remoteWork",label:"Remote / hybrid work policy", hint:"Include if any employees work remotely" },
            { key:"overtime",  label:"Non-exempt / overtime eligible", hint:"Required if paying hourly employees overtime" },
          ].map(p=>(
            <div key={p.key} style={{ display:"flex",alignItems:"center",gap:14,
              padding:"14px 0",borderBottom:`1px solid ${B.pearl}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:600,color:B.ink }}>{p.label}</div>
                <div style={{ fontSize:12,color:B.soft,marginTop:2 }}>{p.hint}</div>
              </div>
              <div onClick={()=>f(p.key,!form[p.key])} style={{
                width:44,height:24,borderRadius:12,cursor:"pointer",
                background:form[p.key]?B.blue:B.silver,
                position:"relative",transition:"background .2s",flexShrink:0 }}>
                <div style={{ position:"absolute",top:3,
                  left:form[p.key]?20:3,width:18,height:18,
                  borderRadius:"50%",background:B.white,
                  transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
              </div>
            </div>
          ))}

          <div style={{ marginTop:16,marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>pto days per year</label>
            <input type="number" value={form.ptoDays} onChange={e=>f("ptoDays",e.target.value)}
              style={inp} min="0" max="30"/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>sick days per year</label>
            <input type="number" value={form.sickDays} onChange={e=>f("sickDays",e.target.value)}
              style={inp} min="0" max="30"/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>dress code</label>
            <select value={form.dress} onChange={e=>f("dress",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              {["business formal","business casual","smart casual","casual","uniform required","industry-specific PPE"].map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>probationary period (days)</label>
            <select value={form.probation} onChange={e=>f("probation",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              {["30","60","90","180"].map(d=><option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>
              additional policies or notes (optional)
            </label>
            <textarea value={form.extraPolicies} onChange={e=>f("extraPolicies",e.target.value)}
              placeholder="e.g. We have a no-smoking policy, tip-sharing policy, vehicle use policy..."
              rows={3} style={{ ...inp,resize:"vertical" }}/>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <Btn v="ghost" onClick={()=>setStep(1)}>← back</Btn>
            <Btn v="purple" full onClick={generate}>generate my handbook →</Btn>
          </div>
        </div>
      )}

      {step===3 && (
        loading ? (
          <div style={{ textAlign:"center",padding:"60px 0" }}>
            <div style={{ width:48,height:48,borderRadius:"50%",margin:"0 auto 20px",
              border:`3px solid ${B.silver}`,borderTop:`3px solid ${B.purple}`,
              animation:"spin .8s linear infinite" }}/>
            <div style={{ fontSize:16,fontWeight:700,color:B.ink,marginBottom:6 }}>
              writing your handbook...
            </div>
            <div style={{ fontSize:13,color:B.soft,lineHeight:1.7,maxWidth:280,margin:"0 auto" }}>
              Our AI is drafting a complete, {form.state}-specific employee handbook
              tailored to {user?.company||"your company"}.
              This takes about 30 seconds.
            </div>
            <div style={{ marginTop:20,display:"flex",flexDirection:"column",
              gap:6,alignItems:"center" }}>
              {["Drafting EEO & harassment policies...","Writing PTO & leave policies...","Adding progressive discipline section...","Customizing for "+form.state+" law..."].map((m,i)=>(
                <div key={i} style={{ fontSize:12,color:B.purple,fontFamily:FM,
                  opacity:.7+i*.1 }}>{m}</div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background:`linear-gradient(135deg,${B.green}18,${B.green}08)`,
              border:`1px solid ${B.green}30`,borderRadius:16,
              padding:"16px 18px",marginBottom:18,
              display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ fontSize:24 }}>🎉</div>
              <div>
                <div style={{ fontSize:15,fontWeight:700,color:B.green }}>handbook ready!</div>
                <div style={{ fontSize:12,color:B.soft,marginTop:2 }}>
                  {user?.company} · {form.state} · {form.size} employees · {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
              <SmBtn onClick={()=>navigator.clipboard?.writeText(handbook)} v="outline">copy all</SmBtn>
              <SmBtn onClick={()=>{
                const w=window.open("","_blank");
                w.document.write(`<html><head><title>${user?.company||"Company"} Employee Handbook</title>
                <style>body{font-family:Georgia,serif;max-width:800px;margin:60px auto;line-height:1.9;color:#0d1b3e;font-size:14px}
                pre{white-space:pre-wrap;font-family:Georgia,serif}
                h1{font-size:24px;border-bottom:3px solid #1a7af8;padding-bottom:12px}
                footer{margin-top:48px;border-top:1px solid #e3eaf5;padding-top:14px;text-align:center;font-size:11px;color:#8fa3be}</style>
                </head><body>
                <h1>${user?.company||"[Company Name]"} — Employee Handbook</h1>
                <pre>${handbook}</pre>
                <footer>Generated by hrcopilot · a Hayman Investments LLC product · Have your attorney review before distributing</footer>
                </body></html>`);
                w.document.close(); w.print();
              }} v="primary">print / save PDF</SmBtn>
              <SmBtn onClick={()=>setStep(1)}>start over</SmBtn>
            </div>

            <pre style={{ background:B.pearl,border:`1px solid ${B.silver}`,
              borderRadius:14,padding:20,fontFamily:FM,fontSize:11.5,
              color:B.ink,whiteSpace:"pre-wrap",lineHeight:1.9,
              maxHeight:500,overflowY:"auto",marginBottom:14 }}>{handbook}</pre>

            <div style={{ padding:"12px 14px",background:"#fffbeb",
              border:`1px solid ${B.amber}28`,borderRadius:10 }}>
              <div style={{ fontSize:12,color:B.amber,fontFamily:FM,lineHeight:1.6 }}>
                ⚠ This handbook is an AI-generated draft based on your inputs.
                It should be reviewed by a licensed employment attorney or certified HR professional
                before distribution to employees. State and local laws change frequently.
                hrcopilot Concierge includes expert review — contact us at hello@gethrcopilot.com.
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function Pricing({ go }) {
  const plans=[
    { name:"starter",price:"$0",  period:"forever",color:B.fog,
      desc:"Try it free. No card needed.",
      features:["up to 3 employees","5 ai documents/month","pto tracking","onboarding checklists with guides"],
      cta:"current plan",v:"ghost" },
    { name:"pro",    price:"$39", period:"/month", color:B.blue,pop:true,
      desc:"Everything a growing small business needs.",
      features:["up to 20 employees","unlimited ai documents","pdf export & document vault",
        "full onboarding toolkit","pto approvals","risk radar","priority support"],
      cta:"upgrade to pro",v:"primary" },
    { name:"expert", price:"$99", period:"/month", color:B.purple,
      desc:"AI plus real human experts.",
      features:["everything in pro","unlimited employees","ask experts — anytime",
        "monthly hr strategy session","custom document templates","compliance alerts"],
      cta:"get expert access",v:"purple" },
    { name:"concierge",price:"$299",period:"/month",color:B.amber,
      desc:"Your dedicated HR partner.",
      features:["everything in expert","AI handbook generator ✦","expert handbook review & certification",
        "dedicated hr consulting hours","policy drafting","hiring support","crisis response"],
      cta:"contact us",v:"ghost" },
  ];
  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="pricing" title="hr that pays for itself."
      sub="One lawsuit costs $85k+ to defend. hrcopilot pays for itself the first time you use it."/>

    {/* Handbook generator callout */}
    <div style={{ background:`linear-gradient(135deg,${B.purple},#4c1d95)`,
      borderRadius:20,padding:"22px",marginBottom:20,position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",right:-40,top:-40,width:160,height:160,
        borderRadius:"50%",background:"rgba(255,255,255,.05)" }}/>
      <div style={{ fontSize:11,color:"#c4a8f0",fontFamily:FM,fontWeight:700,
        letterSpacing:"1px",marginBottom:6 }}>NEW · CONCIERGE EXCLUSIVE</div>
      <div style={{ fontSize:20,fontWeight:700,color:B.white,marginBottom:8,lineHeight:1.2 }}>
        📋 AI Employee Handbook Generator
      </div>
      <div style={{ fontSize:13,color:"#c4a8f0",lineHeight:1.7,marginBottom:16 }}>
        Answer 10 questions. Get a complete, state-specific employee handbook
        — 20 sections, fully customized, reviewed by our certified HR professionals.
        A $500–1,500 value. Included in Concierge.
      </div>
      <button onClick={()=>go("handbook")} style={{ padding:"11px 20px",borderRadius:12,
        background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",
        color:B.white,fontFamily:FS,fontSize:14,fontWeight:700,cursor:"pointer" }}>
        try the generator →
      </button>
    </div>

    {plans.map(p=><div key={p.name} style={{ background:p.pop?B.navy:B.white,
      border:p.pop?"none":`1.5px solid ${B.silver}`,borderRadius:20,padding:"22px",
      marginBottom:14,boxShadow:p.pop?`0 8px 32px ${B.blue}22`:"none",position:"relative" }}>
      {p.pop && <div style={{ position:"absolute",top:-11,left:20,
        background:`linear-gradient(135deg,${B.blue},${B.blueD})`,
        color:"#fff",fontSize:9,fontWeight:700,fontFamily:FM,
        padding:"4px 12px",borderRadius:20,letterSpacing:"1px" }}>most popular</div>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:p.color,fontFamily:FM,
            letterSpacing:"1px",textTransform:"uppercase",marginBottom:4 }}>{p.name}</div>
          <div style={{ fontSize:13,color:p.pop?"#7fa8c8":B.soft }}>{p.desc}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:30,fontWeight:800,color:p.pop?B.white:B.ink,lineHeight:1 }}>{p.price}</span>
          <div style={{ fontSize:11,color:p.pop?B.fog:B.soft,fontFamily:FM }}>{p.period}</div>
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        {p.features.map(ff=><div key={ff} style={{ display:"flex",alignItems:"flex-start",gap:8,marginBottom:7 }}>
          <span style={{ color:ff.includes("✦")?B.purple:B.green,fontSize:12,fontWeight:700,flexShrink:0 }}>
            {ff.includes("✦")?"✦":"✓"}
          </span>
          <span style={{ fontSize:13,color:p.pop?"#c8d8ee":B.ink,lineHeight:1.4,
            fontWeight:ff.includes("✦")?700:400 }}>{ff.replace(" ✦","")}</span>
        </div>)}
      </div>
      <Btn v={p.v} full onClick={()=>p.name==="concierge"?go("handbook"):go("dashboard")}>{p.cta}</Btn>
    </div>)}
  </div>;
}

// ── profile / settings ────────────────────────────────────────────────────────
function Profile({ user, onUpdate, onLogout, go }) {
  const [form,setForm]=useState({ company:user?.company||"",state:user?.state||"",industry:user?.industry||"",name:user?.name||"" });
  const [saved,setSaved]=useState(false);
  const f=(k,v)=>{ setForm(p=>({...p,[k]:v})); setSaved(false); };

  const save=()=>{
    const users=store.get("hrc_users",{});
    const email=user.email;
    users[email]={ ...users[email],...form };
    store.set("hrc_users",users);
    onUpdate({ ...user,...form });
    setSaved(true);
  };

  return <div style={{ padding:"20px 20px 100px" }}>
    <SectionHead label="account" title="settings"/>
    <Card sx={{ marginBottom:14 }}>
      <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:14 }}>business profile</div>
      <Input label="Your Name" value={form.name} onChange={v=>f("name",v)}/>
      <Input label="Company Name" value={form.company} onChange={v=>f("company",v)}/>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>State</label>
        <select value={form.state} onChange={e=>f("state",e.target.value)} style={{ width:"100%",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",WebkitAppearance:"none" }}>
          <option value="">Select state</option>
          {["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={{ display:"block",fontSize:13,fontWeight:700,color:B.soft,marginBottom:7 }}>Industry</label>
        <select value={form.industry} onChange={e=>f("industry",e.target.value)} style={{ width:"100%",padding:"13px 14px",borderRadius:12,border:`1.5px solid ${B.silver}`,fontFamily:FS,fontSize:15,color:B.ink,background:B.pearl,boxSizing:"border-box",outline:"none",WebkitAppearance:"none" }}>
          <option value="">Select industry</option>
          {["Construction & Trades","Retail","Restaurant & Food Service","Healthcare","Professional Services","Manufacturing","Transportation","Technology","Real Estate","Other"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {saved && <div style={{ padding:"10px 14px",background:"#f0fdf4",border:`1px solid ${B.green}30`,borderRadius:10,marginBottom:14,fontSize:13,color:B.green }}>✓ saved successfully</div>}
      <Btn full onClick={save}>save changes</Btn>
    </Card>
    <Card sx={{ marginBottom:14 }}>
      <div style={{ fontSize:13,fontWeight:700,color:B.ink,marginBottom:4 }}>account</div>
      <div style={{ fontSize:13,color:B.soft,marginBottom:14 }}>{user?.email}</div>
      <Btn v="outline" full onClick={()=>go("pricing")}>upgrade plan ✦</Btn>
    </Card>
    <Btn v="danger" full onClick={onLogout}>log out</Btn>
  </div>;
}

// ── root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(()=>{
    const session=store.get("hrc_session");
    if(!session)return null;
    const users=store.get("hrc_users",{});
    return users[session.email]||null;
  });
  const [tab,setTab]=useState("dashboard");
  const [sel,setSel]=useState(null);

  const uid=user?.uid;

  const [emps,setEmps]=useState(()=> uid?store.get(`hrc_emps_${uid}`,[]):[]);
  const [reqs,setReqs]=useState(()=> uid?store.get(`hrc_pto_${uid}`,[]):[]);

  useEffect(()=>{ if(uid){ store.set(`hrc_emps_${uid}`,emps); } },[emps,uid]);
  useEffect(()=>{ if(uid){ store.set(`hrc_pto_${uid}`,reqs); } },[reqs,uid]);

  const go=useCallback(t=>setTab(t),[]);

  const onAuth=(u)=>{
    setUser(u);
    setEmps(store.get(`hrc_emps_${u.uid}`)||[]);
    setReqs(store.get(`hrc_pto_${u.uid}`)||[]);
    setTab("dashboard");
  };

  const onLogout=()=>{
    store.del("hrc_session");
    setUser(null); setEmps([]); setReqs([]);
  };

  const onUpdate=(u)=>setUser(u);

  const onSaveDoc=(eid,doc)=>setEmps(es=>es.map(e=>e.id===eid?{...e,docs:[...e.docs,doc]}:e));
  const onToggle=(eid,cid,field="done",val=null)=>setEmps(es=>es.map(e=>e.id===eid
    ?{...e,checks:e.checks.map(c=>c.id===cid
      ?field==="done"?{...c,done:!c.done}:{...c,[field]:val}
      :c)}
    :e));
  const onAdd=(emp)=>setEmps(es=>[...es,emp]);
  const onEdit=(emp)=>setEmps(es=>es.map(e=>e.id===emp.id?emp:e));
  const onDelete=(id)=>setEmps(es=>es.filter(e=>e.id!==id));
  const onUpdatePTO=(name,delta)=>setEmps(es=>es.map(e=>e.name===name?{...e,pto:{...e.pto,bal:Math.max(0,e.pto.bal+delta)}}:e));

  const [showAuth,setShowAuth]=useState(false);
  const [showLanding,setShowLanding]=useState(false);

  const goHome=()=>setShowLanding(true);
  const goApp=()=>setShowLanding(false);

  if(!user && !showAuth) return <Landing onGetStarted={()=>setShowAuth(true)}/>;
  if(!user) return <AuthScreen onAuth={(u)=>{ setShowLanding(false); onAuth(u); }} onBack={()=>setShowAuth(false)}/>;
  if(showLanding) return <Landing onGetStarted={()=>{ setShowLanding(false); setTab("dashboard"); }}/>

  return <div style={{ display:"flex",minHeight:"100vh",background:B.bg,fontFamily:FS }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      button{-webkit-tap-highlight-color:transparent}
      button:active:not(:disabled){transform:scale(.97)}
      @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      ::-webkit-scrollbar{width:5px}
      ::-webkit-scrollbar-thumb{background:#c8d8ee;border-radius:3px}
      textarea,select,input{-webkit-appearance:none;appearance:none}
      textarea:focus,select:focus,input:focus{border-color:${B.blue}!important;box-shadow:0 0 0 3px ${B.blue}18!important;outline:none}
      html{-webkit-text-size-adjust:100%}
      .desktop-sidebar{display:flex}
      .mobile-topbar{display:none}
      .mobile-bottomnav{display:none}
      .main-content{padding:40px 48px 40px;width:100%;overflow-y:auto}
      @media(max-width:768px){
        .desktop-sidebar{display:none}
        .mobile-topbar{display:flex}
        .mobile-bottomnav{display:flex}
        .main-content{padding:20px 20px 100px;max-width:100%}
      }
    `}</style>

    {/* Desktop sidebar */}
    <div className="desktop-sidebar">
      <DesktopSidebar active={tab} go={go} user={user} onLogout={onLogout} onHome={goHome}/>
    </div>

    {/* Main area */}
    <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
      {/* Mobile topbar */}
      <div className="mobile-topbar" style={{ flexDirection:"column" }}>
        <TopBar user={user} go={go} onLogout={onLogout} onHome={goHome}/>
      </div>

      {/* Content */}
      <div className="main-content">
        {tab==="dashboard" && <Dashboard user={user} emps={emps} go={go} setSel={setSel}/>}
        {tab==="documents" && <DocGen user={user} emps={emps} onSave={onSaveDoc}/>}
        {tab==="employees" && <Employees emps={emps} sel={sel} setSel={setSel} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle}/>}
        {tab==="pto"       && <PTO emps={emps} reqs={reqs} setReqs={setReqs} onUpdatePTO={onUpdatePTO}/>}
        {tab==="risks"     && <RiskRadar emps={emps} go={go} setSel={setSel}/>}
        {tab==="expert"    && <Experts user={user}/>}
        {tab==="handbook"  && <HandbookGenerator user={user}/>}
        {tab==="pricing"   && <Pricing go={go}/>}
        {tab==="profile"   && <Profile user={user} onUpdate={onUpdate} onLogout={onLogout} go={go}/>}
        <AppFooter/>
      </div>

      {/* Mobile bottom nav */}
      <div className="mobile-bottomnav">
        <BottomNav active={tab} go={go}/>
      </div>
    </div>
  </div>;
}
