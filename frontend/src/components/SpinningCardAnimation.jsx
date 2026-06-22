// import { useState, useEffect, useRef } from 'react';

// // Professional Spinning Card Animation Component
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
//   const [startSlide, setStartSlide] = useState(false);
//   const [tickActive, setTickActive] = useState(false);
//   const [confetti, setConfetti] = useState([]);
//   const [skipped, setSkipped] = useState(false);
//   const [rotation, setRotation] = useState(180); // Starts on card back (180deg)
//   const [currentIdDisplay, setCurrentIdDisplay] = useState('EMP-?????');

//   const audioCtxRef = useRef(null);

//   const featuredWinner = winners[0]?.applicant;
//   const winnerHouse = winners[0]?.house;

//   // Initialize once summary and data are available
//   useEffect(() => {
//     if (summary && winners.length > 0 && applicants.length > 0) {
//       setPhase('spinning');

//       // Start the Y-axis spin: rotate from 180 to 2340 degrees (6 full spins)
//       const spinTimeout = setTimeout(() => {
//         setStartSlide(true);
//         setRotation(2340);
//       }, 100);
//       return () => clearTimeout(spinTimeout);
//     }
//   }, [summary, winners, applicants]);

//   // Transition from spinning to revealed phase
//   useEffect(() => {
//     if (phase === 'spinning' && startSlide && !skipped) {
//       const timer = setTimeout(() => {
//         setPhase('revealed');
//         triggerConfetti();
//       }, 4000); // 3.8s transition + 200ms buffer
//       return () => clearTimeout(timer);
//     }
//   }, [phase, startSlide, skipped]);

//   // Cycle employee IDs while spinning
//   useEffect(() => {
//     if (phase !== 'spinning' || skipped) return;

//     const interval = setInterval(() => {
//       if (applicants.length > 0) {
//         const randApp = applicants[Math.floor(Math.random() * applicants.length)];
//         setCurrentIdDisplay(randApp.employeeId);
//       }
//     }, 60);

//     // Lock onto winner ID slightly before the card stops spinning
//     const stopTimeout = setTimeout(() => {
//       clearInterval(interval);
//       if (featuredWinner) {
//         setCurrentIdDisplay(featuredWinner.employeeId);
//       }
//     }, 3200);

//     return () => {
//       clearInterval(interval);
//       clearTimeout(stopTimeout);
//     };
//   }, [phase, applicants, featuredWinner, skipped]);

//   // Synthesize ticking sound that decelerates as card spins
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

//         // Click click sound frequency curve
//         osc.frequency.setValueAtTime(900, audioCtx.currentTime);
//         osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);

//         gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
//         gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

//         osc.start();
//         osc.stop(audioCtx.currentTime + 0.03);
//       } catch (e) {
//         // audio blocked
//       }

//       setTickActive(true);
//       setTimeout(() => setTickActive(false), 50);

//       delay = delay * 1.14; // decelerate click speed by 14%
//       if (delay < 700) {
//         timer = setTimeout(tick, delay);
//       }
//     };

//     timer = setTimeout(tick, delay);
//     return () => {
//       clearTimeout(timer);
//     };
//   }, [phase, skipped]);

//   const triggerConfetti = () => {
//     // Brand Colors: Purple (149 41 142), Gold (179 141 50) + celebratory colors
//     const colors = [
//       'rgba(149, 41, 142, 1)', // Brand Purple
//       'rgba(179, 141, 50, 1)',  // Brand Gold
//       '#ffffff',                // White
//       '#ffe89c',                // Light Gold
//       '#f5c2f0',                // Light Purple
//     ];

//     const newConfetti = Array.from({ length: 80 }).map((_, i) => {
//       const angle = Math.random() * Math.PI * 2;
//       const distance = 80 + Math.random() * 260;
//       const dx = Math.cos(angle) * distance;
//       const dy = Math.sin(angle) * distance - 60;
//       const rot = Math.random() * 720 - 360;
//       const size = 5 + Math.random() * 8;
//       const delay = Math.random() * 0.2;

//       return {
//         id: i,
//         dx: `${dx}px`,
//         dy: `${dy}px`,
//         rot: `${rot}deg`,
//         size: `${size}px`,
//         color: colors[Math.floor(Math.random() * colors.length)],
//         shape: Math.random() > 0.5 ? 'circle' : 'rect',
//         delay: `${delay}s`,
//       };
//     });
//     setConfetti(newConfetti);
//   };

//   const handleSkip = () => {
//     setSkipped(true);
//     setPhase('revealed');
//     if (featuredWinner) {
//       setCurrentIdDisplay(featuredWinner.employeeId);
//     }
//     triggerConfetti();
//   };

//   const cardWidth = 160;
//   const cardHeight = 230;

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         zIndex: 50,
//         background: 'rgba(0, 0, 0, 0.45)', // Translucent background, leaving page visible
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontFamily: "'Inter', sans-serif",
//       }}
//     >
//       {/* Popcard container */}
//       <div
//         className="w-full max-w-sm mx-4 bg-gradient-to-br from-[#120516] via-black to-[#0c040d] border border-[#95298E]/50 rounded-2xl p-6 shadow-[0_20px_50px_rgba(149,41,142,0.3)] text-white relative overflow-hidden flex flex-col items-center"
//         style={{
//           animation: 'popcard-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
//         }}
//       >
//         {/* Skip Button (visible during spinning/prep) */}
//         {phase !== 'revealed' && (
//           <button
//             onClick={handleSkip}
//             className="absolute top-4 right-4 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg transition-all z-[60]"
//           >
//             Skip ⏭
//           </button>
//         )}

//         {/* Phase 1: Loading state */}
//         {phase === 'loading' && (
//           <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
//             <div className="relative w-16 h-16">
//               <div className="absolute inset-0 rounded-full border-4 border-t-[#B38D32] border-[#95298E]/20 animate-spin" />
//               <div className="absolute inset-1.5 rounded-full border-4 border-b-[#95298E] border-[#B38D32]/20 animate-spin-reverse" />
//             </div>
//             <div className="space-y-1">
//               <h2 className="text-base font-bold tracking-wide text-white uppercase">
//                 Preparing Ballot
//               </h2>
//               <p className="text-xs text-[#B38D32]/80 animate-pulse font-medium">
//                 Mixing candidate tickets...
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Phase 2 & 3 content */}
//         {phase !== 'loading' && (
//           <div className="w-full flex flex-col items-center">
//             {/* Header info */}
//             <div className="text-center mb-4">
//               <span className="text-[10px] font-bold text-[#B38D32] uppercase tracking-[0.25em] block mb-1">
//                 Ballot Draw
//               </span>
//               <h3 className="text-lg font-extrabold text-white tracking-wide uppercase truncate max-w-[280px]">
//                 {siteName || 'Lottery'}
//               </h3>
//             </div>

//             {/* 3D Spin Card Area */}
//             <div
//               className="flex items-center justify-center my-4 relative"
//               style={{ perspective: 1000 }}
//             >
//               {/* Confetti Explosion Layer */}
//               {phase === 'revealed' && (
//                 <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
//                   {confetti.map((c) => (
//                     <div
//                       key={c.id}
//                       className="absolute pointer-events-none"
//                       style={{
//                         width: c.size,
//                         height: c.shape === 'circle' ? c.size : `${parseInt(c.size) * 1.5}px`,
//                         borderRadius: c.shape === 'circle' ? '50%' : '2px',
//                         backgroundColor: c.color,
//                         left: '50%',
//                         top: '50%',
//                         marginLeft: `-${parseInt(c.size) / 2}px`,
//                         marginTop: `-${parseInt(c.size) / 2}px`,
//                         '--dx': c.dx,
//                         '--dy': c.dy,
//                         '--rot': c.rot,
//                         animation: `confetti-burst 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) ${c.delay} forwards`,
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}

//               {/* Card Container */}
//               <div
//                 style={{
//                   width: `${cardWidth}px`,
//                   height: `${cardHeight}px`,
//                   transformStyle: 'preserve-3d',
//                   transform: `rotateY(${rotation}deg)`,
//                   transition:
//                     startSlide && !skipped
//                       ? 'transform 3.8s cubic-bezier(0.15, 0.85, 0.2, 1)'
//                       : 'none',
//                   animation:
//                     phase === 'revealed'
//                       ? 'card-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
//                       : 'none',
//                 }}
//                 className="relative"
//               >
//                 {/* CARD FRONT (Revealed info) */}
//                 <div
//                   className="absolute inset-0 w-full h-full rounded-xl p-4 flex flex-col justify-between border-2 border-[#B38D32] bg-gradient-to-br from-[#1b0a1c] via-[#09020a] to-[#000000] text-white shadow-[0_0_20px_rgba(179,141,50,0.4)]"
//                   style={{
//                     backfaceVisibility: 'hidden',
//                   }}
//                 >
//                   <div className="flex flex-col items-center text-center">
//                     <span className="text-[9px] uppercase tracking-[0.2em] text-[#B38D32] font-black">
//                       ★ Winner ★
//                     </span>
//                     <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#95298E] to-[#B38D32] flex items-center justify-center mt-3 shadow-md">
//                       <span className="text-xl">🏠</span>
//                     </div>
//                     <h4 className="text-sm font-bold text-white mt-3 leading-tight truncate w-full px-1">
//                       {featuredWinner?.fullName || 'Winner Name'}
//                     </h4>
//                     <span className="text-[11px] font-mono text-[#B38D32] mt-0.5 font-bold">
//                       {currentIdDisplay}
//                     </span>
                    
//                     <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B38D32]/40 to-transparent my-2" />

//                     <div className="space-y-0.5 w-full bg-white/5 p-2 rounded-lg border border-white/5">
//                       <span className="text-[8px] uppercase text-slate-400 tracking-[0.1em] block">
//                         Assigned
//                       </span>
//                       <span className="text-xs font-extrabold text-emerald-400 block truncate">
//                         {winnerHouse
//                           ? `Blk ${winnerHouse.blockNumber} · Apt ${winnerHouse.houseNumber}`
//                           : 'Pending House'}
//                       </span>
//                       <span className="text-[9px] text-slate-300 block">
//                         {winnerHouse
//                           ? `Flr ${winnerHouse.floorNumber} (${winnerHouse.totalArea} m²)`
//                           : ''}
//                       </span>
//                     </div>
//                   </div>

//                   <span className="text-[8px] text-slate-500 font-mono text-center border-t border-slate-800 pt-1 block">
//                     BALLOT SECURED
//                   </span>
//                 </div>

//                 {/* CARD BACK (Spinning / Initial Back face) */}
//                 <div
//                   className="absolute inset-0 w-full h-full rounded-xl p-4 flex flex-col items-center justify-center border-2 border-[#95298E] bg-gradient-to-br from-[#000000] via-[#100315] to-[#1e1026] text-white shadow-[0_0_15px_rgba(149,41,142,0.3)]"
//                   style={{
//                     backfaceVisibility: 'hidden',
//                     transform: 'rotateY(180deg)',
//                   }}
//                 >
//                   <div className="absolute inset-2 rounded-lg border border-[#B38D32]/10 flex flex-col items-center justify-center p-2 text-center">
//                     <div className="w-10 h-10 rounded-full border border-dashed border-[#B38D32]/30 flex items-center justify-center animate-spin-slow">
//                       <span className="text-lg text-[#B38D32]">?</span>
//                     </div>
//                     <span className="text-[11px] font-mono text-[#B38D32] mt-4 font-bold tracking-wider">
//                       {currentIdDisplay}
//                     </span>
//                     <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">
//                       Ballot ID
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Revealed Phase Winners Summary & Button */}
//             {phase === 'revealed' && (
//               <div className="w-full flex flex-col items-center space-y-4 animate-fade-in mt-2">
//                 {/* Secondary Winners Scroll list */}
//                 {winners.length > 1 && (
//                   <div className="w-full bg-black/60 border border-[#95298E]/25 rounded-xl p-3 text-xs max-h-32 overflow-y-auto">
//                     <div className="text-[10px] font-bold text-[#B38D32] uppercase mb-1.5 tracking-wider">
//                       Other Winners ({winners.length - 1})
//                     </div>
//                     <div className="space-y-1">
//                       {winners.slice(1).map((w) => (
//                         <div
//                           key={w.id}
//                           className="flex items-center justify-between bg-white/5 p-1.5 rounded border border-white/5 text-[11px]"
//                         >
//                           <div className="truncate pr-2">
//                             <span className="font-semibold text-slate-200">
//                               {w.applicant?.fullName}
//                             </span>
//                             <span className="font-mono text-[#B38D32] ml-1">
//                               ({w.applicant?.employeeId})
//                             </span>
//                           </div>
//                           <span className="text-emerald-400 font-medium shrink-0">
//                             Blk {w.house?.blockNumber}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={onComplete}
//                   className="w-full py-2.5 px-4 bg-[#95298E] hover:bg-[#85227e] text-white rounded-xl text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(149,41,142,0.3)]"
//                 >
//                   Complete & Close
//                 </button>
//               </div>
//             )}

//             {/* Spinning status indicator */}
//             {phase === 'spinning' && (
//               <div className="text-center mt-2">
//                 <span className="text-xs text-slate-400 animate-pulse font-medium block">
//                   Selecting Winner...
//                 </span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes popcard-in {
//           0% { transform: scale(0.92); opacity: 0; }
//           100% { transform: scale(1); opacity: 1; }
//         }

//         @keyframes card-pop {
//           0% { transform: rotateY(0deg) scale(1); }
//           50% { transform: rotateY(0deg) scale(1.1); box-shadow: 0 0 35px rgba(179, 141, 50, 0.7); }
//           100% { transform: rotateY(0deg) scale(1.05); }
//         }

//         @keyframes confetti-burst {
//           0% {
//             transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
//             opacity: 1;
//           }
//           60% {
//             opacity: 1;
//           }
//           100% {
//             transform: translate3d(var(--dx), calc(var(--dy) + 120px), 0) rotate(var(--rot)) scale(0.2);
//             opacity: 0;
//           }
//         }

//         @keyframes spin-reverse {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(-360deg); }
//         }
//         .animate-spin-reverse {
//           animation: spin-reverse 1.5s linear infinite;
//         }

//         .animate-spin-slow {
//           animation: spin-reverse 8s linear infinite;
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

  const featuredWinner = winners[0]?.applicant;
  const winnerHouse = winners[0]?.house;

  useEffect(() => {
    if (summary && winners.length > 0 && applicants.length > 0) {
      setPhase('spinning');
    }
  }, [summary, winners, applicants]);

  useEffect(() => {
    if (phase === 'spinning' && !skipped) {
      const timer = setTimeout(() => {
        setPhase('revealed');
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [phase, skipped]);

  useEffect(() => {
    if (phase !== 'spinning' || skipped) return;

    const interval = setInterval(() => {
      if (applicants.length > 0) {
        const randApp = applicants[Math.floor(Math.random() * applicants.length)];
        setCurrentIdDisplay(randApp.employeeId);
      }
    }, 60);

    const stopTimeout = setTimeout(() => {
      clearInterval(interval);
      if (featuredWinner) {
        setCurrentIdDisplay(featuredWinner.employeeId);
      }
    }, 3200);

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

      delay = delay * 1.14; 
      if (delay < 700) {
        timer = setTimeout(tick, delay);
      }
    };

    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [phase, skipped]);

  const handleSkip = () => {
    setSkipped(true);
    setPhase('revealed');
    if (featuredWinner) {
      setCurrentIdDisplay(featuredWinner.employeeId);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(248, 250, 252, 0.97)', 
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
      className={phase === 'revealed' ? 'animate-screen-shake' : ''}
    >
      {/* Decorative Brand Ambient Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#95298E]/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-[#d4af37]/12 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-4 p-6 relative flex flex-col items-center text-center text-slate-800">
        
        {/* Skip Animation control */}
        {phase !== 'revealed' && (
          <button
            onClick={handleSkip}
            className="absolute top-0 right-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all z-[60]"
          >
            Skip Animation ⏭
          </button>
        )}

        {/* Header Metadata block */}
        <div className="space-y-1 mb-10">
          <span className="text-xs font-black text-[#95298E] uppercase tracking-[0.3em] block animate-pulse">
            • LIVE VERIFIED POOL DRAW •
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
            {siteName || 'Asset Lottery Draw'}
          </h2>
          <p className="text-slate-500 text-sm font-semibold tracking-wide">
            {bedType} · {totalArea}m² Configuration
          </p>
        </div>

        {/* PHASE 1: PREPARATION LOADING SPIN */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-t-[#d4af37] border-[#95298E]/20 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-b-[#95298E] border-[#d4af37]/20 animate-spin-reverse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Preparing Ballot Pool</h4>
              <p className="text-xs text-[#95298E] font-medium animate-pulse">Aligning target parameters...</p>
            </div>
          </div>
        )}

        {/* PHASE 2: HIGH-SPEED ACTIVE ROTATING SPINNER WHEEL */}
        {phase === 'spinning' && (
          <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in w-full">
            <div className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px]">
              {/* Golden Outer Ring Frame */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `6px solid #d4af37`,
                boxShadow: `0 15px 50px rgba(212, 175, 55, 0.35)`,
                zIndex: 1
              }} />
              {/* Accelerated Circular Wheel Rotation */}
              <div 
                style={{
                  position: 'absolute', inset: 12, borderRadius: '50%',
                  background: `conic-gradient(from 0deg, #95298E, #b93cb2, #d4af37, #b93cb2, #95298E, #b93cb2, #d4af37, #95298E)`,
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.15)',
                  animation: 'spin-wheel 0.75s linear infinite' // Speed increased to 0.75s
                }} 
              />
              {/* Central Identity Readout Core */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full border-4 border-[#95298E] shadow-xl flex flex-col items-center justify-center text-slate-900 z-10 p-2">
                <span className="text-2xl mb-0.5">🎰</span>
                <span className="text-xs font-mono font-black text-[#95298E] tracking-tight truncate max-w-full">
                  {currentIdDisplay}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[#95298E] text-lg font-black tracking-wider uppercase animate-pulse">
                Computing Selection Matrices...
              </p>
              <p className="text-slate-400 text-xs font-mono font-bold">
                Shuffling entries safely at maximum bandwidth
              </p>
            </div>
          </div>
        )}

        {/* PHASE 3: STAGGERED CHAMPIONSHIP "BOOM BOOM" SUCCESS REVEAL CONTAINER */}
        {phase === 'revealed' && (
          <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-[0_30px_70px_rgba(149,41,141,0.12)] animate-stagger-boom space-y-6 relative overflow-hidden">
            
            {/* Crown Winner Card Display */}
            <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-[#d4af37] rounded-2xl p-6 shadow-md max-w-md mx-auto text-center space-y-4 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#95298E] font-black block">
                ★ Primary Drawn Winner ★
              </span>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#95298E] to-[#d4af37] flex items-center justify-center mx-auto shadow-md animate-bounce-subtle">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 leading-snug tracking-tight">
                  {featuredWinner?.fullName || 'Allocated Winner'}
                </h4>
                <span className="text-sm font-mono text-[#95298E] font-black tracking-widest block mt-0.5 bg-slate-100 py-1 px-3 rounded-lg max-w-max mx-auto border border-slate-200/50">
                  {currentIdDisplay}
                </span>
              </div>
              <div className="w-full h-[1px] bg-slate-200 my-2" />
              <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-center shadow-inner">
                <span className="text-[9px] uppercase text-slate-400 tracking-[0.15em] block font-bold mb-0.5">
                  Assigned Property Coordinates
                </span>
                <span className="text-base font-black text-emerald-600 block">
                  {winnerHouse ? `Block ${winnerHouse.blockNumber} · Apt ${winnerHouse.houseNumber}` : 'Pending Assignment'}
                </span>
                {winnerHouse && (
                  <span className="text-xs text-slate-500 block font-semibold">
                    Floor {winnerHouse.floorNumber} ({winnerHouse.totalArea}m²)
                  </span>
                )}
              </div>
            </div>

            {/* Parallel Records Dashboard Area */}
            {winners.length > 1 && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left shadow-inner relative z-10">
                <div className="text-[11px] font-black text-[#95298E] uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 flex justify-between">
                  <span>Additional Pool Winners</span>
                  <span className="text-white bg-[#95298E] px-2 py-0.5 rounded-full text-[10px]">+{winners.length - 1} records</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {winners.slice(1).map((w) => (
                    <div key={w.id} className="flex items-center justify-between bg-white p-2 rounded-xl text-xs border border-slate-200/60 shadow-sm">
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800">{w.applicant?.fullName}</span>
                        <span className="font-mono text-[#d4af37] ml-2 font-bold">({w.applicant?.employeeId})</span>
                      </div>
                      <span className="text-emerald-600 font-black shrink-0 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] border border-emerald-100">
                        Blk {w.house?.blockNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Control button actions */}
            <div className="pt-2 relative z-10">
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-3.5 bg-gradient-to-r from-[#95298E] to-[#731d6e] hover:from-[#aa35a3] hover:to-[#882483] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99]"
              >
                Complete Draw Run
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin-wheel {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Initial Screen Shake when Title drops */
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

        /* Dual Staggered Championship Expansion (BOOM BOOM Animation) */
        @keyframes championship-boom {
          0% { transform: scale(0.4); opacity: 0; filter: brightness(2) blur(4px); }
          45% { transform: scale(1.12); opacity: 0.9; filter: brightness(1.5); } /* First Impact Surge */
          60% { transform: scale(0.96); opacity: 0.95; }
          80% { transform: scale(1.04); opacity: 1; filter: brightness(1); }    /* Second Accent Explosion Bounce */
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-stagger-boom {
          animation: championship-boom 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes popcard-in {
          0% { transform: scale(0.96); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}