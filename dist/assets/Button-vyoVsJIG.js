import{r as n,j as i}from"./index-DlhQETyI.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),u=(...e)=>e.filter((a,t,r)=>!!a&&r.indexOf(a)===t).join(" ");/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=n.forwardRef(({color:e="currentColor",size:a=24,strokeWidth:t=2,absoluteStrokeWidth:r,className:o="",children:s,iconNode:c,...d},h)=>n.createElement("svg",{ref:h,...y,width:a,height:a,stroke:e,strokeWidth:r?Number(t)*24/Number(a):t,className:u("lucide",o),...d},[...c.map(([p,x])=>n.createElement(p,x)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=(e,a)=>{const t=n.forwardRef(({className:r,...o},s)=>n.createElement(g,{ref:s,iconNode:a,className:u(`lucide-${m(e)}`,r),...o}));return t.displayName=`${e}`,t};/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=l("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=l("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=l("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=l("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=l("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]),f={primary:`
    bg-gradient-to-r from-cyan-500 to-teal-500
    hover:from-cyan-400 hover:to-teal-400
    active:from-cyan-600 active:to-teal-600
    text-white shadow-lg shadow-cyan-500/20
  `,secondary:`
    bg-[#0f2347] border border-white/10
    hover:bg-[#152d5a] active:bg-[#0a1a3a]
    text-white
  `,danger:`
    bg-red-600 hover:bg-red-500 active:bg-red-700
    text-white shadow-lg shadow-red-600/20
  `,ghost:`
    bg-transparent hover:bg-white/5 active:bg-white/10
    text-white/80 hover:text-white
  `},v={sm:"text-sm px-3 py-1.5 min-h-[36px] rounded-lg gap-1.5",md:"text-base px-5 py-2.5 min-h-[44px] rounded-xl gap-2",lg:"text-lg px-6 py-3 min-h-[48px] rounded-xl gap-2.5",xl:"text-xl px-8 py-4 min-h-[56px] rounded-2xl gap-3"},$=({variant:e="primary",size:a="md",fullWidth:t=!1,loading:r=!1,iconLeft:o,iconRight:s,children:c,disabled:d,className:h="",...p})=>{const x=d||r;return i.jsxs("button",{disabled:x,className:`
        inline-flex items-center justify-center
        font-semibold tracking-wide
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1633]
        disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[48px]
        ${f[e]}
        ${v[a]}
        ${t?"w-full":""}
        ${h}
      `,...p,children:[r?i.jsx(b,{className:"w-5 h-5 animate-spin","aria-hidden":"true"}):o&&i.jsx("span",{className:"flex-shrink-0","aria-hidden":"true",children:o}),i.jsx("span",{children:c}),!r&&s&&i.jsx("span",{className:"flex-shrink-0","aria-hidden":"true",children:s})]})};export{$ as B,k as C,j as M,M as V,C as a,l as c};
