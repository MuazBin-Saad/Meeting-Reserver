import { useState, useEffect, useCallback } from "react";

const ROOM = { full: "Horizon Conference Room", capacity: 12, floor: "4th Floor" };
const COLORS = ["#3b82f6","#8b5cf6","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899","#14b8a6"];
const gid = () => Math.random().toString(36).slice(2,9);
const pad = (n) => String(n).padStart(2,"0");
const toMins = (t) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const toDisplay = (m) => { const h=Math.floor(m/60)%24,mn=m%60,ap=h>=12?"PM":"AM",hh=h%12||12; return `${hh}:${pad(mn)} ${ap}`; };
const fmtDate = (d) => d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

const INIT = [
  {id:gid(),title:"Product Roadmap Review",organizer:"Sarah Mitchell",attendees:8,start:"09:00",end:"10:00",color:"#3b82f6"},
  {id:gid(),title:"Engineering Standup",organizer:"James Park",attendees:6,start:"10:30",end:"11:00",color:"#8b5cf6"},
  {id:gid(),title:"Client Presentation — Orion Inc.",organizer:"Elena Vasquez",attendees:10,start:"13:00",end:"14:30",color:"#0ea5e9"},
  {id:gid(),title:"UX Design Sprint",organizer:"Mia Chen",attendees:5,start:"15:00",end:"17:00",color:"#10b981"},
];

const TL_START=8*60, TL_END=20*60, TL_RANGE=TL_END-TL_START;
const tlPct=(m)=>`${((m-TL_START)/TL_RANGE)*100}%`;
const HOURS=Array.from({length:13},(_,i)=>i+8);

export default function App() {
  const [now, setNow] = useState(new Date());
  const [meetings, setMeetings] = useState(INIT);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({title:"",organizer:"",attendees:2,start:"",end:""});
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(t); },[]);

  const nowMins = now.getHours()*60+now.getMinutes();
  const current = meetings.find(m=>nowMins>=toMins(m.start)&&nowMins<toMins(m.end));
  const allToday = [...meetings].sort((a,b)=>toMins(a.start)-toMins(b.start));
  const upcoming = allToday.filter(m=>toMins(m.end)>nowMins);
  const next = allToday.filter(m=>toMins(m.start)>nowMins)[0];
  const avail = !current;

  const reserve = useCallback(()=>{
    setErr("");
    const {title,organizer,attendees,start,end}=form;
    if(!title.trim()||!organizer.trim()||!start||!end){setErr("Please fill in all fields.");return;}
    const s=toMins(start),e=toMins(end);
    if(e<=s){setErr("End time must be after start.");return;}
    if(Number(attendees)<1||Number(attendees)>ROOM.capacity){setErr(`Attendees: 1–${ROOM.capacity}.`);return;}
    if(meetings.some(m=>{const ms=toMins(m.start),me=toMins(m.end);return s<me&&e>ms;})){setErr("Conflicts with an existing booking.");return;}
    setMeetings(p=>[...p,{id:gid(),title:title.trim(),organizer:organizer.trim(),attendees:Number(attendees),start,end,color:COLORS[meetings.length%COLORS.length]}]);
    setForm({title:"",organizer:"",attendees:2,start:"",end:""});
    setModal(false);
    setOk("Reservation confirmed"); setTimeout(()=>setOk(""),3500);
  },[form,meetings]);

  const del=(id)=>setMeetings(p=>p.filter(m=>m.id!==id));

  return (
    <div style={{
      width:"100vw",height:"100vh",overflow:"hidden",
      background:"linear-gradient(140deg,#070d1a 0%,#0d1b30 55%,#070d1a 100%)",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e2e8f0",
      display:"flex",flexDirection:"column",position:"relative",
    }}>
      {/* subtle grid bg */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(148,163,184,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,0.025) 1px,transparent 1px)",backgroundSize:"52px 52px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-180px",left:"-80px",width:"480px",height:"480px",borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.09) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-120px",right:"-60px",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 65%)",pointerEvents:"none"}}/>

      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 28px",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.07)",position:"relative",zIndex:2}}>
        <div>
          <div style={{fontSize:"22px",fontWeight:"700",color:"#f1f5f9",letterSpacing:"-0.4px",lineHeight:1.1}}>{ROOM.full}</div>
          <div style={{fontSize:"13px",color:"#475569",marginTop:"3px"}}>{ROOM.floor} · {fmtDate(now)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
          {ok&&<span style={{fontSize:"13px",color:"#34d399",background:"rgba(16,185,129,0.12)",padding:"5px 12px",borderRadius:"20px",border:"1px solid rgba(16,185,129,0.25)"}}> ✓ {ok}</span>}
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"34px",fontWeight:"200",letterSpacing:"-1.5px",color:"#f1f5f9",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
              {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}
            </div>
          </div>
          <button onClick={()=>{setModal(true);setErr("");}}
            style={{padding:"12px 22px",borderRadius:"10px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",fontWeight:"700",fontSize:"15px",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0 4px 16px rgba(99,102,241,0.4)"}}>
            + Reserve Room
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 340px",gap:"14px",padding:"14px",overflow:"hidden",minHeight:0,position:"relative",zIndex:1}}>

        {/* LEFT: big status + timeline */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px",overflow:"hidden",minHeight:0}}>

          {/* BIG STATUS BLOCK — only availability mention */}
          <div style={{
            background:avail?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.07)",
            border:`1px solid ${avail?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.22)"}`,
            borderRadius:"16px",padding:"28px 32px",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:"24px",
          }}>
            <div>
              <div style={{fontSize:"56px",fontWeight:"800",letterSpacing:"-1px",color:avail?"#34d399":"#f87171",lineHeight:1}}>
                {avail?"Available":"In Use"}
              </div>
              <div style={{fontSize:"17px",color:"#64748b",marginTop:"8px",fontWeight:"400"}}>
                {avail && next
                  ? <>Next booking: <span style={{color:"#94a3b8",fontWeight:"600"}}>{next.title}</span> at <span style={{color:"#94a3b8",fontWeight:"600"}}>{toDisplay(toMins(next.start))}</span></>
                  : !avail && current
                  ? <><span style={{color:"#94a3b8",fontWeight:"600"}}>{current.title}</span> · ends at <span style={{color:"#94a3b8",fontWeight:"600"}}>{toDisplay(toMins(current.end))}</span></>
                  : "No further meetings scheduled today"
                }
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:"13px",color:"#475569",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"0.08em"}}>Capacity</div>
              <div style={{fontSize:"48px",fontWeight:"700",color:"#f1f5f9",lineHeight:1}}>{ROOM.capacity}</div>
              <div style={{fontSize:"13px",color:"#475569",marginTop:"2px"}}>people</div>
            </div>
          </div>

          {/* TIMELINE */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"16px 20px",flexShrink:0}}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#475569",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"10px"}}>Today · 8 AM – 8 PM</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
              {HOURS.map(h=>(
                <span key={h} style={{fontSize:"10px",color:"#334155",flex:1,textAlign:"center",fontVariantNumeric:"tabular-nums"}}>
                  {h===12?"12p":h>12?`${h-12}p`:`${h}a`}
                </span>
              ))}
            </div>
            <div style={{position:"relative",height:"36px",background:"rgba(10,18,32,0.8)",borderRadius:"8px",overflow:"hidden"}}>
              {HOURS.slice(1,-1).map(h=>(
                <div key={h} style={{position:"absolute",top:0,bottom:0,width:"1px",background:"rgba(148,163,184,0.06)",left:tlPct(h*60)}}/>
              ))}
              {meetings.map(m=>{
                const ms=toMins(m.start),me=toMins(m.end);
                const l=((Math.max(ms,TL_START)-TL_START)/TL_RANGE)*100;
                const w=((Math.min(me,TL_END)-Math.max(ms,TL_START))/TL_RANGE)*100;
                return (
                  <div key={m.id} style={{position:"absolute",top:"4px",bottom:"4px",left:`${l}%`,width:`${Math.max(w,0.4)}%`,background:m.color,borderRadius:"4px",opacity:0.9,display:"flex",alignItems:"center",overflow:"hidden",paddingLeft:"6px",minWidth:"4px"}}>
                    <span style={{fontSize:"9px",color:"#fff",fontWeight:"700",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</span>
                  </div>
                );
              })}
              {nowMins>=TL_START&&nowMins<=TL_END&&(
                <div style={{position:"absolute",top:"-4px",bottom:"-4px",width:"2px",background:"#f43f5e",left:tlPct(nowMins),zIndex:10,boxShadow:"0 0 8px rgba(244,63,94,0.9)"}}/>
              )}
            </div>
          </div>

          {/* SCHEDULE LIST */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"16px 20px",flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#475569",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"12px",flexShrink:0}}>
              Today's Schedule · {allToday.length} {allToday.length===1?"meeting":"meetings"}
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:"8px",minHeight:0}}>
              {allToday.length===0&&<p style={{color:"#334155",fontSize:"14px",margin:0}}>No meetings scheduled today.</p>}
              {allToday.map(m=>{
                const isNow=nowMins>=toMins(m.start)&&nowMins<toMins(m.end);
                const isPast=toMins(m.end)<=nowMins;
                const pct=isNow?Math.round(((nowMins-toMins(m.start))/(toMins(m.end)-toMins(m.start)))*100):0;
                return (
                  <div key={m.id} style={{
                    display:"flex",alignItems:"stretch",gap:"12px",
                    padding:"12px 14px",borderRadius:"10px",
                    background:isNow?"rgba(59,130,246,0.08)":isPast?"rgba(255,255,255,0.02)":"rgba(10,18,32,0.5)",
                    border:`1px solid ${isNow?"rgba(59,130,246,0.25)":"rgba(255,255,255,0.05)"}`,
                    position:"relative",overflow:"hidden",flexShrink:0,
                    opacity:isPast?0.45:1,
                  }}>
                    {isNow&&<div style={{position:"absolute",left:0,bottom:0,height:"2px",width:`${pct}%`,background:m.color,transition:"width 1s linear"}}/>}
                    <div style={{width:"4px",borderRadius:"4px",background:m.color,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                        <span style={{fontSize:"15px",fontWeight:"700",color:isPast?"#475569":"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</span>
                        {isNow&&<span style={{fontSize:"10px",background:"rgba(16,185,129,0.2)",color:"#34d399",padding:"2px 7px",borderRadius:"8px",fontWeight:"700",flexShrink:0}}>LIVE</span>}
                      </div>
                      <div style={{fontSize:"12px",color:"#475569",display:"flex",gap:"12px",flexWrap:"wrap"}}>
                        <span>{toDisplay(toMins(m.start))} – {toDisplay(toMins(m.end))}</span>
                        <span>{m.organizer}</span>
                        <span>{m.attendees} attendees</span>
                      </div>
                    </div>
                    {!isPast&&<button onClick={()=>del(m.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#2d3f52",fontSize:"15px",padding:"0",flexShrink:0,alignSelf:"flex-start",lineHeight:1}}
                      onMouseEnter={e=>e.target.style.color="#f87171"} onMouseLeave={e=>e.target.style.color="#2d3f52"}>✕</button>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Outlook only */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px",overflow:"hidden",minHeight:0}}>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"22px",flex:1,overflow:"hidden",display:"flex",flexDirection:"column",minHeight:0}}>
            <div style={{fontSize:"11px",fontWeight:"600",color:"#475569",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:"18px",flexShrink:0}}>Outlook Calendar</div>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px",flexShrink:0}}>
              <div style={{width:"44px",height:"44px",borderRadius:"10px",background:"#0078d4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",flexShrink:0}}>📆</div>
              <div>
                <div style={{fontSize:"17px",fontWeight:"700",color:"#e2e8f0",lineHeight:1}}>Microsoft 365</div>
                <div style={{fontSize:"12px",color:"#64748b",marginTop:"2px"}}>Calendar integration</div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"22px",flexShrink:0}}>
              {[
                ["Auto-sync bookings to Outlook","Reservations made here appear instantly in your Outlook calendar."],
                ["Send invites to attendees","Attendees receive calendar invites automatically when a room is booked."],
                ["Block Exchange resource","Prevents double-booking via the Exchange room resource calendar."],
                ["Meeting reminders","Attendees get notified before their meeting starts."],
              ].map(([title,desc])=>(
                <div key={title} style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                  <span style={{color:"#3b82f6",fontSize:"15px",marginTop:"1px",flexShrink:0}}>✓</span>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:"600",color:"#cbd5e1",lineHeight:1.2}}>{title}</div>
                    <div style={{fontSize:"11px",color:"#475569",marginTop:"2px",lineHeight:1.4}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={()=>alert("Outlook Setup:\n\n1. Register an app in Azure Active Directory\n2. Grant Calendar.ReadWrite + Place.Read.All permissions\n3. Use Microsoft Graph API /me/events endpoint\n\nDocs: https://learn.microsoft.com/graph/api/user-post-events")}
              style={{width:"100%",padding:"13px",borderRadius:"10px",border:"none",cursor:"pointer",background:"#0078d4",color:"#fff",fontWeight:"700",fontSize:"14px",flexShrink:0,marginTop:"auto"}}>
              Connect Microsoft 365
            </button>
            <p style={{fontSize:"10px",color:"#2d3f52",margin:"10px 0 0",lineHeight:"1.5",flexShrink:0}}>
              Requires Azure AD app registration and IT approval for Calendar.ReadWrite + Place.Read.All permissions.
            </p>
          </div>
        </div>

      </div>

      {/* ── RESERVE MODAL ── */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(8px)"}}>
          <div style={{background:"#0d1b2e",border:"1px solid rgba(148,163,184,0.15)",borderRadius:"20px",padding:"30px",width:"460px",maxWidth:"90vw",boxShadow:"0 28px 70px rgba(0,0,0,0.7)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
              <h2 style={{fontSize:"18px",fontWeight:"700",color:"#f1f5f9",margin:0}}>Reserve {ROOM.full}</h2>
              <button onClick={()=>setModal(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"7px",color:"#94a3b8",cursor:"pointer",fontSize:"15px",padding:"5px 11px",lineHeight:1}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              {[
                {label:"Meeting Title",key:"title",type:"text",placeholder:"e.g. Q3 Planning",cols:2},
                {label:"Organizer",key:"organizer",type:"text",placeholder:"Your name",cols:2},
                {label:"Start Time",key:"start",type:"time",cols:1},
                {label:"End Time",key:"end",type:"time",cols:1},
                {label:`Attendees (max ${ROOM.capacity})`,key:"attendees",type:"number",cols:1},
              ].map(({label,key,type,placeholder,cols})=>(
                <label key={key} style={{display:"block",gridColumn:`span ${cols}`}}>
                  <span style={{fontSize:"11px",color:"#64748b",display:"block",marginBottom:"5px",letterSpacing:"0.04em"}}>{label}</span>
                  <input type={type} placeholder={placeholder||""} value={form[key]}
                    min={key==="attendees"?1:undefined} max={key==="attendees"?ROOM.capacity:undefined}
                    onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    style={{width:"100%",padding:"11px 12px",borderRadius:"9px",background:"rgba(8,14,26,0.9)",border:"1px solid rgba(148,163,184,0.12)",color:"#e2e8f0",fontSize:"14px",outline:"none",boxSizing:"border-box",colorScheme:"dark"}}/>
                </label>
              ))}
            </div>
            {err&&<p style={{color:"#f87171",fontSize:"12px",margin:"12px 0 0"}}>⚠ {err}</p>}
            <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
              <button onClick={reserve} style={{flex:1,padding:"12px",borderRadius:"10px",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",fontWeight:"700",fontSize:"14px"}}>Confirm Reservation</button>
              <button onClick={()=>setModal(false)} style={{padding:"12px 16px",borderRadius:"10px",cursor:"pointer",background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.12)",color:"#94a3b8",fontWeight:"600",fontSize:"13px"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
