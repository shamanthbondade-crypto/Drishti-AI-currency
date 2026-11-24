import{c as y,b as h,a as p,j as e,N as f}from"./index-CoS1Hx9A.js";import{A as g,b as j}from"./VoiceCommandBar-JJXPe1hD.js";import{E as m,H as v}from"./house-D_P5AMOV.js";import{c as b,V as w,C as N,a as k}from"./Button-BB_R0rna.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=b("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=b("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),C=({title:t,showBack:n=!1,compact:a=!1})=>{const s=y(),{settings:c,updateSettings:d}=h(),{speak:l,triggerHaptic:x}=p(),i=c.accessibilityMode==="voice",r=()=>{const o=i?"visual":"voice";d({accessibilityMode:o,highContrast:o==="visual",largeText:o==="visual"}),x("selection"),l(o==="voice"?"Switched to Voice Mode for blind users.":"Switched to Visual Mode for low-vision users.")};return e.jsxs("header",{className:`
        relative flex items-center justify-between
        ${a?"py-3 px-4":"py-5 px-4"}
        transition-all duration-300 border-b border-cyan-500/10
      `,children:[e.jsx("div",{className:"w-12 flex items-center",children:n&&e.jsx("button",{type:"button",onClick:()=>s(-1),className:`
              p-2 rounded-xl
              text-white/80 hover:text-white
              hover:bg-white/10 active:bg-white/20
              transition-colors duration-200
              min-w-[48px] min-h-[48px]
              flex items-center justify-center
            `,"aria-label":"Go back to previous screen",children:e.jsx(g,{className:"w-6 h-6","aria-hidden":"true"})})}),e.jsxs("div",{className:"flex items-center justify-center gap-2 select-none flex-1 text-center",children:[!a&&e.jsxs("div",{className:"relative",children:[e.jsx(m,{className:"w-7 h-7 text-cyan-400","aria-hidden":"true"}),e.jsx("div",{className:"absolute inset-0 blur-md bg-cyan-400/30 rounded-full"})]}),e.jsx("h1",{className:`
            font-extrabold tracking-wide
            bg-gradient-to-r from-cyan-400 to-teal-400
            bg-clip-text text-transparent
            ${a?"text-lg":"text-xl"}
          `,children:t||"DRISHTI AI"})]}),e.jsx("div",{className:"w-auto flex items-center justify-end",children:e.jsx("button",{type:"button",onClick:r,"aria-label":`Accessibility mode is currently ${i?"Voice Mode for blind users":"Visual Mode for low-vision users"}. Tap to switch mode.`,className:`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-black transition-all min-h-[44px] border ${i?"bg-cyan-500/20 text-cyan-300 border-cyan-400/50 hover:bg-cyan-500/30":"bg-yellow-400/20 text-yellow-300 border-yellow-400/50 hover:bg-yellow-400/30"}`,children:i?e.jsxs(e.Fragment,{children:[e.jsx(w,{className:"w-3.5 h-3.5","aria-hidden":"true"}),e.jsx("span",{children:"VOICE"})]}):e.jsxs(e.Fragment,{children:[e.jsx(m,{className:"w-3.5 h-3.5","aria-hidden":"true"}),e.jsx("span",{children:"VISUAL"})]})})})]})},M=[{to:"/home",label:"Home",icon:v},{to:"/history",label:"History",icon:S}],I=[{to:"/settings",label:"Settings",icon:V},{to:"/help",label:"Help",icon:k}];function u({to:t,label:n,icon:a}){return e.jsx(f,{to:t,end:t==="/home",className:({isActive:s})=>`relative flex flex-col items-center justify-center
         min-w-[60px] min-h-[56px] py-2 px-2 rounded-xl transition-colors duration-200
         ${s?"text-cyan-400":"text-white/50 hover:text-white/80"}`,"aria-label":n,children:({isActive:s})=>e.jsxs(e.Fragment,{children:[s&&e.jsx("span",{className:"absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 to-teal-400","aria-hidden":"true"}),e.jsx(a,{className:`w-5 h-5 transition-transform duration-200 ${s?"scale-110":""}`,"aria-hidden":"true"}),e.jsx("span",{className:"text-[10px] mt-0.5 font-medium",children:n})]})})}const $=()=>e.jsx("nav",{className:"fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 backdrop-blur-xl bg-[#0a1633]/90","aria-label":"Main navigation",children:e.jsxs("div",{className:"max-w-lg mx-auto flex items-center justify-around",children:[M.map(t=>e.jsx(u,{...t},t.to)),e.jsx(f,{to:"/scan","aria-label":"Scan currency note",className:"relative flex flex-col items-center justify-center -mt-5 mx-1",children:({isActive:t})=>e.jsx("span",{className:`
                w-14 h-14 rounded-full flex items-center justify-center
                bg-gradient-to-br from-cyan-400 to-teal-500
                shadow-lg shadow-cyan-400/40
                transition-all duration-200
                ${t?"ring-4 ring-cyan-400/50 scale-105":"hover:scale-105 active:scale-95"}
              `,children:e.jsx(N,{className:"w-7 h-7 text-gray-950","aria-hidden":"true"})})}),I.map(t=>e.jsx(u,{...t},t.to))]})}),z=({children:t,title:n,showNav:a=!0,showBack:s=!1,onCaptureRequested:c})=>{const{settings:d}=h(),{highContrast:l,largeText:x,accessibilityMode:i}=d,r=i==="visual";return e.jsxs("div",{className:`
        min-h-screen bg-[#0a1633] text-white selection:bg-cyan-500 selection:text-black
        ${l||r?"contrast-125 font-medium":""}
        ${x||r?"text-lg":"text-base"}
      `,children:[e.jsx("a",{href:"#main-content",className:"sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-cyan-400 focus:text-navy-950 focus:font-extrabold focus:rounded-xl",children:"Skip to main content"}),e.jsxs("div",{className:"max-w-lg mx-auto flex flex-col min-h-screen relative",children:[e.jsx(C,{title:n,showBack:s,compact:!!n}),e.jsx("main",{id:"main-content",role:"main",className:`
            flex-1 px-4 ${a?"pb-36":"pb-8"} pt-3
            animate-[fadeSlideIn_0.25s_ease-out_forwards]
          `,children:t}),a&&e.jsxs(e.Fragment,{children:[e.jsx(j,{onCaptureRequested:c}),e.jsx($,{})]})]}),e.jsx("style",{children:`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `})]})};export{S as C,z as L,V as S};
