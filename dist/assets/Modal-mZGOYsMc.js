import{c as h}from"./Button-B_ZVgc1G.js";import{r,j as t}from"./index-BxwK9udU.js";import{X as y}from"./VoiceCommandBar-DZ0WiCIv.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=h("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]),w=({open:o,onClose:s,title:i,children:f,className:x=""})=>{const n=r.useRef(null),c=r.useRef(null),d=r.useCallback(e=>{if(e.key!=="Tab"||!n.current)return;const a=n.current.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');if(a.length===0)return;const u=a[0],m=a[a.length-1];e.shiftKey?document.activeElement===u&&(e.preventDefault(),m.focus()):document.activeElement===m&&(e.preventDefault(),u.focus())},[]),l=r.useCallback(e=>{e.key==="Escape"&&s(),d(e)},[s,d]);return r.useEffect(()=>(o&&(c.current=document.activeElement,document.addEventListener("keydown",l),document.body.style.overflow="hidden",requestAnimationFrame(()=>{var a;const e=(a=n.current)==null?void 0:a.querySelector('button, [tabindex]:not([tabindex="-1"])');e==null||e.focus()})),()=>{var e;document.removeEventListener("keydown",l),document.body.style.overflow="",(e=c.current)==null||e.focus()}),[o,l]),o?t.jsxs("div",{className:"fixed inset-0 z-[100] flex items-end sm:items-center justify-center","aria-hidden":"true",children:[t.jsx("div",{className:"absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]",onClick:s}),t.jsxs("div",{ref:n,role:"dialog","aria-modal":"true","aria-label":i||"Dialog",className:`
          relative z-10 w-full max-w-lg
          bg-[#0f2347] border border-white/10 rounded-t-2xl sm:rounded-2xl
          shadow-2xl shadow-black/40
          animate-[slideUp_0.3s_ease-out]
          ${x}
        `,children:[t.jsxs("div",{className:"flex items-center justify-between p-4 border-b border-white/10",children:[i&&t.jsx("h2",{className:"text-lg font-semibold text-white",children:i}),t.jsx("button",{onClick:s,className:`
              ml-auto p-2 rounded-xl
              text-white/60 hover:text-white hover:bg-white/10
              transition-colors duration-200
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
            `,"aria-label":"Close dialog",children:t.jsx(y,{className:"w-5 h-5"})})]}),t.jsx("div",{className:"p-4",children:f})]}),t.jsx("style",{children:`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `})]}):null};export{w as M,k as T};
