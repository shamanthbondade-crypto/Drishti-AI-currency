import{j as e}from"./index-nx-jpscq.js";const c={none:"p-0",sm:"p-3",md:"p-4",lg:"p-6"},m=({children:d,onClick:r,header:s,icon:t,padding:o="md",className:i=""})=>{const a=!!r,n=e.jsxs(e.Fragment,{children:[(s||t)&&e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[t&&e.jsx("span",{className:"text-cyan-400 flex-shrink-0","aria-hidden":"true",children:t}),s&&e.jsx("div",{className:"font-semibold text-white text-lg",children:s})]}),d]}),l=`
    rounded-2xl
    bg-[#0f2347]/80 border border-white/10
    transition-all duration-200
    ${c[o]}
    ${a?"cursor-pointer hover:bg-[#152d5a]/90 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/5 active:scale-[0.98]":""}
    ${i}
  `;return a?e.jsx("button",{type:"button",onClick:r,className:`${l} w-full text-left`,tabIndex:0,children:n}):e.jsx("div",{className:l,children:n})};export{m as C};
