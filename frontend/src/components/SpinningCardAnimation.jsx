

// import { useState, useEffect, useRef } from 'react';

// export default function SpinningCardAnimation({
//   siteName,
//   bedType,
//   totalArea,
//   applicants = [],
//   winners = [],
//   results = [],
//   summary,
//   onComplete,
// }) {
//   const [phase, setPhase] = useState('loading'); // 'loading' | 'spinning' | 'revealed'
//   const [tickActive, setTickActive] = useState(false);
//   const [skipped, setSkipped] = useState(false);
//   const [currentIdDisplay, setCurrentIdDisplay] = useState('EMP-?????');

//   const audioCtxRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Fixed Data Binding: Read directly from your flat schema layout fields
//   const featuredWinner = winners[0];

//   useEffect(() => {
//     if (summary && winners.length > 0 && applicants.length > 0) {
//       setPhase('spinning');
//     }
//   }, [summary, winners, applicants]);

//   useEffect(() => {
//     if (phase === 'spinning' && !skipped) {
//       const timer = setTimeout(() => {
//         setPhase('revealed');
//       }, 4000); 
//       return () => clearTimeout(timer);
//     }
//   }, [phase, skipped]);

//   useEffect(() => {
//     if (phase !== 'spinning' || skipped) return;

//     const interval = setInterval(() => {
//       if (applicants.length > 0) {
//         const randApp = applicants[Math.floor(Math.random() * applicants.length)];
//         // Fallback checks to catch whatever identifier field is populated
//         setCurrentIdDisplay(randApp.idCode || randApp.employeeId || 'EMP-?????');
//       }
//     }, 60);

//     const stopTimeout = setTimeout(() => {
//       clearInterval(interval);
//       if (featuredWinner) {
//         setCurrentIdDisplay(featuredWinner.applicant?.idCode || featuredWinner.idCode || 'EMP-?????');
//       }
//     }, 3200);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(stopTimeout);
//     };
//   }, [phase, applicants, featuredWinner, skipped]);

//   useEffect(() => {
//     if (phase !== 'spinning' || skipped) return;

//     let delay = 60;
//     let timer;

//     const tick = () => {
//       try {
//         const audioCtx =
//           audioCtxRef.current ||
//           new (window.AudioContext || window.webkitAudioContext)();
//         audioCtxRef.current = audioCtx;
//         if (audioCtx.state === 'suspended') {
//           audioCtx.resume();
//         }
//         const osc = audioCtx.createOscillator();
//         const gain = audioCtx.createGain();
//         osc.connect(gain);
//         gain.connect(audioCtx.destination);

//         osc.frequency.setValueAtTime(900, audioCtx.currentTime);
//         osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);

//         gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
//         gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

//         osc.start();
//         osc.stop(audioCtx.currentTime + 0.03);
//       } catch (e) {
//         // blocked audio
//       }

//       setTickActive(true);
//       setTimeout(() => setTickActive(false), 50);

//       delay = delay * 1.14; 
//       if (delay < 700) {
//         timer = setTimeout(tick, delay);
//       }
//     };

//     timer = setTimeout(tick, delay);
//     return () => clearTimeout(timer);
//   }, [phase, skipped]);

//   // Celebratory HTML5 Canvas Confetti Burst Engine
//   useEffect(() => {
//     if (phase !== 'revealed' || !canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     let animationFrameId;

//     const resizeCanvas = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     const colors = ['#d4af37', '#95298E', '#731d6e', '#f43f5e', '#ffffff'];
//     const particles = [];

//     for (let i = 0; i < 150; i++) {
//       particles.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height - canvas.height,
//         r: Math.random() * 6 + 4,
//         d: Math.random() * canvas.height,
//         color: colors[Math.floor(Math.random() * colors.length)],
//         tilt: Math.random() * 10 - 5,
//         tiltAngleIncremental: Math.random() * 0.07 + 0.02,
//         tiltAngle: 0,
//       });
//     }

//     const drawConfetti = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       particles.forEach((p, index) => {
//         p.tiltAngle += p.tiltAngleIncremental;
//         p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
//         p.x += Math.sin(p.tiltAngle);
//         p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

//         ctx.beginPath();
//         ctx.lineWidth = p.r;
//         ctx.strokeStyle = p.color;
//         ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
//         ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
//         ctx.stroke();

//         if (p.y > canvas.height) {
//           particles[index] = {
//             ...p,
//             x: Math.random() * canvas.width,
//             y: -20,
//             tilt: Math.random() * 10 - 5,
//           };
//         }
//       });

//       animationFrameId = requestAnimationFrame(drawConfetti);
//     };

//     drawConfetti();

//     return () => {
//       window.removeEventListener('resize', resizeCanvas);
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, [phase]);

//   const handleSkip = () => {
//     setSkipped(true);
//     setPhase('revealed');
//     if (featuredWinner) {
//       setCurrentIdDisplay(featuredWinner.applicant?.idCode || featuredWinner.idCode || 'EMP-?????');
//     }
//   };

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         zIndex: 9999,
//         background: 'rgba(248, 250, 252, 0.97)', 
//         backdropFilter: 'blur(20px)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontFamily: "'Inter', sans-serif",
//       }}
//       className={phase === 'revealed' ? 'animate-screen-shake' : ''}
//     >
//       {/* Confetti canvas layer */}
//       {phase === 'revealed' && (
//         <canvas
//           ref={canvasRef}
//           style={{
//             position: 'absolute',
//             inset: 0,
//             pointerEvents: 'none',
//             zIndex: 5,
//           }}
//         />
//       )}

//       {/* Decorative Brand Ambient Blur Orbs */}
//       <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#95298E]/8 blur-[130px] pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#d4af37]/12 blur-[130px] pointer-events-none" />

//       <div className="w-full max-w-4xl mx-4 p-6 relative flex flex-col items-center text-center text-slate-800">
        
//         {/* Skip Animation control */}
//         {phase !== 'revealed' && (
//           <button
//             onClick={handleSkip}
//             className="absolute top-0 right-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all z-[60]"
//           >
//             Skip Animation ⏭
//           </button>
//         )}

//         {/* Header Metadata block */}
//         <div className="space-y-1 mb-10">
//           <span className="text-xs font-black text-[#95298E] uppercase tracking-[0.3em] block animate-pulse">
//             • LIVE VERIFIED POOL DRAW •
//           </span>
//           <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
//             {siteName || 'Asset Lottery Draw'}
//           </h2>
//           <p className="text-slate-500 text-sm font-semibold tracking-wide">
//             {bedType} Bed · {totalArea}m² Configuration
//           </p>
//         </div>

//         {/* PHASE 1: PREPARATION LOADING SPIN */}
//         {phase === 'loading' && (
//           <div className="flex flex-col items-center justify-center space-y-6 py-12">
//             <div className="relative w-20 h-20">
//               <div className="absolute inset-0 rounded-full border-4 border-t-[#d4af37] border-[#95298E]/20 animate-spin" />
//               <div className="absolute inset-2 rounded-full border-4 border-b-[#95298E] border-[#d4af37]/20 animate-spin-reverse" />
//             </div>
//             <div className="space-y-1">
//               <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Preparing Ballot Pool</h4>
//               <p className="text-xs text-[#95298E] font-medium animate-pulse">Aligning target parameters...</p>
//             </div>
//           </div>
//         )}

//         {/* PHASE 2: HIGH-SPEED ACTIVE ROTATING SPINNER WHEEL */}
//         {phase === 'spinning' && (
//           <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in w-full">
//             <div className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px]">
//               {/* Golden Outer Ring Frame */}
//               <div style={{
//                 position: 'absolute', inset: 0, borderRadius: '50%',
//                 border: `6px solid #d4af37`,
//                 boxShadow: `0 15px 50px rgba(212, 175, 55, 0.35)`,
//                 zIndex: 1
//               }} />
//               {/* Accelerated Circular Wheel Rotation */}
//               <div 
//                 style={{
//                   position: 'absolute', inset: 12, borderRadius: '50%',
//                   background: `conic-gradient(from 0deg, #95298E, #b93cb2, #d4af37, #b93cb2, #95298E, #b93cb2, #d4af37, #95298E)`,
//                   boxShadow: 'inset 0 0 30px rgba(0,0,0,0.15)',
//                   animation: 'spin-wheel 0.75s linear infinite'
//                 }} 
//               />
//               {/* Central Identity Readout Core */}
//               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full border-4 border-[#95298E] shadow-xl flex flex-col items-center justify-center text-slate-900 z-10 p-2">
//                 <span className="text-2xl mb-0.5">🎰</span>
//                 <span className="text-xs font-mono font-black text-[#95298E] tracking-tight truncate max-w-full">
//                   {currentIdDisplay}
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-1">
//               <p className="text-[#95298E] text-lg font-black tracking-wider uppercase animate-pulse">
//                 Computing Selection Matrices...
//               </p>
//               <p className="text-slate-400 text-xs font-mono font-bold">
//                 Shuffling entries safely at maximum bandwidth
//               </p>
//             </div>
//           </div>
//         )}

//         {/* PHASE 3: STAGGERED CHAMPIONSHIP SUCCESS REVEAL CONTAINER */}
//         {phase === 'revealed' && (
//           <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-[0_30px_70px_rgba(149,41,141,0.12)] animate-stagger-boom space-y-6 relative overflow-hidden z-20">
            
//             {/* Crown Winner Card Display */}
//             <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-[#d4af37] rounded-2xl p-6 shadow-md max-w-md mx-auto text-center space-y-4 relative z-10">
//               <span className="text-[10px] uppercase tracking-[0.3em] text-[#95298E] font-black block">
//                 ★ Primary Drawn Winner ★
//               </span>
//               <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#95298E] to-[#d4af37] flex items-center justify-center mx-auto shadow-md animate-bounce-subtle">
//                 <span className="text-3xl">🏆</span>
//               </div>
//               <div>
//                 <h4 className="text-2xl font-black text-slate-900 leading-snug tracking-tight">
//                   {featuredWinner?.username || 'Allocated Winner'}
//                 </h4>
//                 <span className="text-sm font-mono text-[#95298E] font-black tracking-widest block mt-0.5 bg-slate-100 py-1 px-3 rounded-lg max-w-max mx-auto border border-slate-200/50">
//                   {currentIdDisplay}
//                 </span>
//               </div>
//               <div className="w-full h-[1px] bg-slate-200 my-2" />
//               <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-center shadow-inner">
//                 <span className="text-[9px] uppercase text-slate-400 tracking-[0.15em] block font-bold mb-0.5">
//                   Assigned Property Coordinates
//                 </span>
//                 <span className="text-base font-black text-emerald-600 block">
//                   {featuredWinner?.houseNumber ? `Apt ${featuredWinner.houseNumber}` : 'Pending Assignment'}
//                 </span>
//                 {featuredWinner && (
//                   <span className="text-xs text-slate-500 block font-semibold">
//                     Floor {featuredWinner.floor ?? '—'} ({featuredWinner.area || totalArea}m²)
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Parallel Records Dashboard Area */}
//             {winners.length > 1 && (
//               <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-inner relative z-10">
//                 <div className="text-[11px] font-black text-[#95298E] uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 flex justify-between">
//                   <span>Additional Pool Winners</span>
//                   <span className="text-white bg-[#95298E] px-2 py-0.5 rounded-full text-[10px]">+{winners.length - 1} records</span>
//                 </div>
//                 <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
//                   {winners.slice(1).map((w, idx) => (
//                     <div key={w.id || idx} className="flex items-center justify-between bg-white p-2 rounded-xl text-xs border border-slate-200/60 shadow-sm">
//                       <div className="truncate pr-2">
//                         <span className="font-bold text-slate-800">{w.username}</span>
//                         <span className="font-mono text-[#d4af37] ml-2 font-bold">({w.applicant?.idCode || w.idCode || '—'})</span>
//                       </div>
//                       <span className="text-emerald-600 font-black shrink-0 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] border border-emerald-100">
//                         Apt {w.houseNumber}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Control button actions */}
//             <div className="pt-2 relative z-10">
//               <button
//                 type="button"
//                 onClick={onComplete}
//                 className="w-full py-3.5 bg-gradient-to-r from-[#95298E] to-[#731d6e] hover:from-[#aa35a3] hover:to-[#882483] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99]"
//               >
//                 Complete Draw Run
//               </button>
//             </div>
//           </div>
//         )}

//       </div>

//       <style>{`
//         @keyframes spin-wheel {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         @keyframes screen-jolt {
//           0%, 100% { transform: translate(0, 0); }
//           10%, 30%, 50% { transform: translate(-3px, 2px); }
//           20%, 40%, 60% { transform: translate(3px, -2px); }
//           70% { transform: translate(-1px, 1px); }
//           80% { transform: translate(1px, -1px); }
//         }
//         .animate-screen-shake {
//           animation: screen-jolt 0.4s ease-out both;
//         }

//         @keyframes championship-boom {
//           0% { transform: scale(0.4); opacity: 0; filter: brightness(2) blur(4px); }
//           45% { transform: scale(1.12); opacity: 0.9; filter: brightness(1.5); }
//           60% { transform: scale(0.96); opacity: 0.95; }
//           80% { transform: scale(1.04); opacity: 1; filter: brightness(1); }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         .animate-stagger-boom {
//           animation: championship-boom 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
//         }

//         @keyframes spin-reverse {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(-360deg); }
//         }
//         .animate-spin-reverse {
//           animation: spin-reverse 1.5s linear infinite;
//         }
//         .animate-bounce-subtle {
//           animation: bounce-subtle 1.5s ease-in-out infinite;
//         }
//         @keyframes bounce-subtle {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-6px); }
//         }
//       `}</style>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from 'react';

export default function SpinningCardAnimation({
  siteName,
  bedType,
  totalArea,
  applicants = [],
  winners = [],
  results = [],
  summary,
  onComplete,
}) {
  const [phase, setPhase] = useState('loading'); // 'loading' | 'spinning' | 'revealed'
  const [tickActive, setTickActive] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [currentIdDisplay, setCurrentIdDisplay] = useState('EMP-?????');

  const audioCtxRef = useRef(null);
  const canvasRef = useRef(null);

  const featuredWinner = winners[0];

  useEffect(() => {
    if (summary && winners.length > 0 && applicants.length > 0) {
      setPhase('spinning');
    }
  }, [summary, winners, applicants]);

  // Spinning execution phase configured for exactly 15 seconds
  useEffect(() => {
    if (phase === 'spinning' && !skipped) {
      const timer = setTimeout(() => {
        setPhase('revealed');
      }, 15000); 
      return () => clearTimeout(timer);
    }
  }, [phase, skipped]);

  useEffect(() => {
    if (phase !== 'spinning' || skipped) return;

    const interval = setInterval(() => {
      if (applicants.length > 0) {
        const randApp = applicants[Math.floor(Math.random() * applicants.length)];
        setCurrentIdDisplay(randApp.idCode || randApp.employeeId || 'EMP-?????');
      }
    }, 60);

    const stopTimeout = setTimeout(() => {
      clearInterval(interval);
      if (featuredWinner) {
        setCurrentIdDisplay(featuredWinner.applicant?.idCode || featuredWinner.idCode || 'EMP-?????');
      }
    }, 14200);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
    };
  }, [phase, applicants, featuredWinner, skipped]);

  useEffect(() => {
    if (phase !== 'spinning' || skipped) return;

    let delay = 60;
    let timer;

    const tick = () => {
      try {
        const audioCtx =
          audioCtxRef.current ||
          new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (e) {
        // blocked audio
      }

      setTickActive(true);
      setTimeout(() => setTickActive(false), 50);

      delay = delay * 1.032; 
      if (delay < 700) {
        timer = setTimeout(tick, delay);
      }
    };

    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [phase, skipped]);

  // Celebratory HTML5 Canvas Confetti Burst Engine
  useEffect(() => {
    if (phase !== 'revealed' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#d4af37', '#95298E', '#731d6e', '#f43f5e', '#ffffff'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
      });
    }

    const drawConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        if (p.y > canvas.height) {
          particles[index] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
          };
        }
      });

      animationFrameId = requestAnimationFrame(drawConfetti);
    };

    drawConfetti();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase]);

  const handleSkip = () => {
    setSkipped(true);
    setPhase('revealed');
    if (featuredWinner) {
      setCurrentIdDisplay(featuredWinner.applicant?.idCode || featuredWinner.idCode || 'EMP-?????');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(248, 250, 252, 0.98)', 
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
      className={phase === 'revealed' ? 'animate-screen-shake' : ''}
    >
      {phase === 'revealed' && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#95298E]/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#d4af37]/12 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-4 p-4 relative flex flex-col items-center text-center text-slate-800 max-h-screen overflow-y-auto">
        
        {phase !== 'revealed' && (
          <button
            onClick={handleSkip}
            className="absolute top-0 right-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all z-[60]"
          >
            Skip Animation ⏭
          </button>
        )}

        <div className="space-y-1 mb-6">
          <span className="text-xs font-black text-[#95298E] uppercase tracking-[0.3em] block animate-pulse">
            • LIVE VERIFIED POOL DRAW •
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            {siteName || 'Asset Lottery Draw'}
          </h2>
          <p className="text-slate-500 text-xs font-semibold tracking-wide">
            {bedType} Bed · {totalArea}m² Configuration
          </p>
        </div>

        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-t-[#d4af37] border-[#95298E]/20 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-b-[#95298E] border-[#d4af37]/20 animate-spin-reverse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Preparing Ballot Pool</h4>
              <p className="text-xs text-[#95298E] font-medium animate-pulse">Aligning target parameters...</p>
            </div>
          </div>
        )}

        {phase === 'spinning' && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in w-full py-6">
            <div className="relative w-[280px] h-[340px] md:w-[380px] md:h-[380px]">
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `6px solid #d4af37`,
                boxShadow: `0 15px 50px rgba(212, 175, 55, 0.35)`,
                zIndex: 1
              }} />
              <div 
                style={{
                  position: 'absolute', inset: 12, borderRadius: '50%',
                  background: `conic-gradient(from 0deg, #95298E, #b93cb2, #d4af37, #b93cb2, #95298E, #b93cb2, #d4af37, #95298E)`,
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.15)',
                  animation: 'spin-wheel 0.5s linear infinite'
                }} 
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full border-4 border-[#95298E] shadow-xl flex flex-col items-center justify-center text-slate-900 z-10 p-2">
                <span className="text-xl mb-0.5">🎰</span>
                <span className="text-xs font-mono font-black text-[#95298E] tracking-tight truncate max-w-full">
                  {currentIdDisplay}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[#95298E] text-base font-black tracking-wider uppercase animate-pulse">
                Computing Selection Matrices...
              </p>
              <p className="text-slate-400 text-xs font-mono font-bold">
                Shuffling entries safely at maximum bandwidth
              </p>
            </div>
          </div>
        )}

        {phase === 'revealed' && (
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-[0_30px_70px_rgba(149,41,141,0.12)] animate-stagger-boom flex flex-col lg:flex-row gap-6 items-stretch relative overflow-hidden z-20 max-h-[75vh]">
            
            {/* Left side: Champion Card */}
            <div className="lg:w-1/3 bg-gradient-to-br from-white to-slate-50 border-2 border-[#d4af37] rounded-2xl p-4 shadow-sm text-center flex flex-col justify-between space-y-4 relative z-10 shrink-0">
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#95298E] font-black block mb-2">
                  ★ Primary Winner ★
                </span>
                <div className="w-12 h-16 rounded-full bg-gradient-to-tr from-[#95298E] to-[#d4af37] flex items-center justify-center mx-auto shadow-md animate-bounce-subtle mb-2">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 leading-tight tracking-tight truncate px-1">
                  {featuredWinner?.username || 'Allocated Winner'}
                </h4>
                <span className="text-xs font-mono text-[#95298E] font-black tracking-widest block mt-1 bg-slate-100 py-1 px-2 rounded-lg max-w-max mx-auto border border-slate-200/50">
                  {currentIdDisplay}
                </span>
              </div>

              <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-center shadow-inner mt-2">
                <span className="text-[9px] uppercase text-slate-400 tracking-[0.15em] block font-bold mb-0.5">
                  Assigned Unit Coordinates
                </span>
                <span className="text-sm font-black text-emerald-600 block">
                  {featuredWinner?.houseNumber ? `Apt ${featuredWinner.houseNumber}` : 'Pending Assignment'}
                </span>
                {featuredWinner && (
                  <span className="text-[11px] text-slate-500 block font-semibold">
                    Floor {featuredWinner.floor ?? '—'} ({featuredWinner.area || totalArea}m²)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="w-full py-3 bg-gradient-to-r from-[#95298E] to-[#731d6e] hover:from-[#aa35a3] hover:to-[#882483] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] mt-2 shrink-0"
              >
                Complete Draw Run
              </button>
            </div>

            {/* Right side: Excel Grid View for Up to 20 Winners */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner flex flex-col relative z-10 overflow-hidden min-h-[300px]">
              <div className="text-[11px] font-black text-[#95298E] uppercase tracking-widest mb-3 border-b border-slate-200 pb-1.5 flex justify-between items-center shrink-0">
                <span>Roster Breakdown (Top 20 Winners)</span>
                <span className="bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                  Total Allocations: {winners.length}
                </span>
              </div>
              
              <div className="overflow-auto flex-1 rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <th className="p-2 border-r border-slate-200 w-10 text-center">#</th>
                      <th className="p-2 border-r border-slate-200">Applicant ID</th>
                      <th className="p-2 border-r border-slate-200">Full Name</th>
                      <th className="p-2">Assigned Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.slice(0, 20).map((w, idx) => (
                      <tr 
                        key={w.id || idx} 
                        className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors ${idx === 0 ? 'bg-amber-50/40' : ''}`}
                      >
                        <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-400 tabular-nums bg-slate-50/50">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#95298E]">
                          {w.applicant?.idCode || w.idCode || '—'}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-medium text-slate-700 truncate max-w-[140px]">
                          {w.username || '—'}
                        </td>
                        <td className="p-2 text-emerald-600 font-black tabular-nums">
  {/* Check both the flat property and the nested relation safely */}
  Block {w.block || w.house?.block || '—'} 
  <span className="text-slate-400 font-medium font-sans text-[10px] ml-1">
    HouseN {w.houseNumber || w.house?.houseNumber || '—'} (Flr {w.floor ?? w.house?.floor ?? '—'})
  </span>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {winners.length > 20 && (
                <div className="text-[10px] text-center text-slate-400 font-bold pt-2 shrink-0">
                  ✦ and {winners.length - 20} more winners can be viewed/exported within the Results menu dashboard.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes spin-wheel {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes screen-jolt {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50% { transform: translate(-3px, 2px); }
          20%, 40%, 60% { transform: translate(3px, -2px); }
          70% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
        .animate-screen-shake {
          animation: screen-jolt 0.4s ease-out both;
        }

        @keyframes championship-boom {
          0% { transform: scale(0.4); opacity: 0; filter: brightness(2) blur(4px); }
          45% { transform: scale(1.03); opacity: 0.9; filter: brightness(1.2); }
          60% { transform: scale(0.98); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; filter: brightness(1); }
        }
        .animate-stagger-boom {
          animation: championship-boom 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.15) both;
        }

        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 1.5s ease-in-out infinite;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}