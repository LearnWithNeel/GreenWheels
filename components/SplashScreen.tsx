"use client";
import { useEffect, useState, useRef } from "react";

const SPLASH_KEY = "gw-splash-seen";

export default function SplashScreen() {
    const [show, setShow] = useState(false);
    const [exitStyle, setExitStyle] = useState<React.CSSProperties>({});
    const [bgFade, setBgFade] = useState(false);
    const logoRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const seen = localStorage.getItem(SPLASH_KEY);
        if (!seen) {
            // Hide navbar elements — splash will animate them in
            const navIcon = document.getElementById("navbar-logo-icon");
            const navText = document.getElementById("navbar-logo-text");
            if (navIcon) navIcon.style.opacity = "0";
            if (navText) {
                navText.style.opacity = "0";
                navText.style.transform = "translateX(-20px)";
                navText.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            }
            document.body.classList.add("splash-active");
            setShow(true);
        } else {
            // Returning visitor — make sure page is always visible
            document.documentElement.style.visibility = "visible";
            document.documentElement.style.background = "";
        }
    }, []);

    useEffect(() => {
        if (!show) return;

        // After build animation completes — start exit
        const t1 = setTimeout(() => {
            if (!logoRef.current) return;

            // Get splash logo center position
            const rect = logoRef.current.getBoundingClientRect();
            const fromX = rect.left + rect.width / 2;
            const fromY = rect.top + rect.height / 2;

            // Get exact navbar logo icon position
            const navIcon = document.getElementById("navbar-logo-icon");
            let toX = 34;
            let toY = 28;

            if (navIcon) {
                const navRect = navIcon.getBoundingClientRect();
                toX = navRect.left + navRect.width / 2;
                toY = navRect.top + navRect.height / 2;
            }

            // Scale factor — navbar icon is 36px, splash logo is 420px
            const scale = 36 / 420;

            // Translation needed
            const tx = toX - fromX;
            const ty = toY - fromY;

            setExitStyle({
                transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)",
                transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                transformOrigin: "center center",
            });

            // Fade background simultaneously
            setBgFade(true);

        }, 2200);

        // Show navbar logo icon when splash lands
        const t2 = setTimeout(() => {
            const navIcon = document.getElementById("navbar-logo-icon");
            if (navIcon) navIcon.style.opacity = "1";
        }, 3000);

        // Show navbar text sliding from left
        const t3 = setTimeout(() => {
            const navText = document.getElementById("navbar-logo-text");
            if (navText) {
                navText.style.opacity = "1";
                navText.style.transform = "translateX(0)";
            }
        }, 3200);

        // Hide splash and show page
        const t4 = setTimeout(() => {
            // CRITICAL — restore visibility
            document.documentElement.style.visibility = "visible";
            document.documentElement.style.background = "";
            document.body.classList.remove("splash-active");
            setShow(false);
            localStorage.setItem(SPLASH_KEY, "true");
        }, 3400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, [show]);

    if (!show) return null;

    return (
        <div
            id="gw-splash"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "#021a0e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: bgFade ? "opacity 0.5s ease 0.6s" : "none",
                opacity: bgFade ? 0 : 1,
            }}>
            <svg
                ref={logoRef}
                style={{
                    transformOrigin: "center center",
                    ...exitStyle,
                }}
                width="420" height="460"
                viewBox="0 0 500 460"
                xmlns="http://www.w3.org/2000/svg">

                <defs>
                    <clipPath id="sc2">
                        <circle cx="250" cy="220" r="200" />
                    </clipPath>
                    <style>{`
            .s2-bg     { animation: scaleIn  0.5s ease-out 0.2s both; transform-origin:250px 220px; }
            .s2-scene  { animation: fadeIn   0.5s ease-out 0.6s both; }
            .s2-bolt   { animation: boltZap  0.4s cubic-bezier(0.34,1.56,0.64,1) 1.1s both; transform-origin:250px 270px; }
            .s2-banner { animation: bannerIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 1.5s both; transform-origin:250px 380px; }
            .s2-ticks  { animation: fadeIn   0.3s ease-out 1.8s both; }
            @keyframes scaleIn  { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
            @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
            @keyframes boltZap  { from{opacity:0;transform:scale(0) rotate(-15deg)} to{opacity:1;transform:scale(1) rotate(0)} }
            @keyframes bannerIn { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
          `}</style>
                </defs>

                {/* BG */}
                <g className="s2-bg">
                    <circle cx="250" cy="220" r="224" fill="#1a0a00" />
                    <circle cx="250" cy="220" r="216" fill="#0f2d0f" />
                    <circle cx="250" cy="220" r="208" fill="#1a0a00" />
                    <circle cx="250" cy="220" r="200" fill="#0a1f0a" />
                </g>

                {/* Ticks */}
                <g className="s2-ticks" stroke="#a3e635" strokeWidth="1.5" opacity="0.6">
                    <line x1="250" y1="18" x2="250" y2="32" />
                    <line x1="250" y1="408" x2="250" y2="422" />
                    <line x1="48" y1="220" x2="34" y2="220" />
                    <line x1="452" y1="220" x2="466" y2="220" />
                    <line x1="109" y1="79" x2="99" y2="69" />
                    <line x1="391" y1="79" x2="401" y2="69" />
                    <line x1="109" y1="361" x2="99" y2="371" />
                    <line x1="391" y1="361" x2="401" y2="371" />
                </g>

                {/* Scene */}
                <g className="s2-scene" clipPath="url(#sc2)">
                    <rect x="50" y="20" width="400" height="200" fill="#0a1f0a" />
                    <circle cx="160" cy="80" r="1.5" fill="#a3e635" opacity="0.8" />
                    <circle cx="200" cy="60" r="1" fill="#fff" opacity="0.6" />
                    <circle cx="300" cy="70" r="1.5" fill="#a3e635" opacity="0.7" />
                    <circle cx="380" cy="90" r="1" fill="#fff" opacity="0.5" />
                    <circle cx="340" cy="45" r="1" fill="#a3e635" opacity="0.6" />
                    <circle cx="250" cy="88" r="42" fill="#1a4a1a" />
                    <circle cx="250" cy="88" r="34" fill="#14532d" />
                    <circle cx="250" cy="88" r="26" fill="#15803d" />
                    <circle cx="250" cy="88" r="18" fill="#4ade80" />
                    <circle cx="250" cy="88" r="10" fill="#a3e635" />
                    <g stroke="#a3e635" strokeWidth="1.5" opacity="0.4">
                        <line x1="250" y1="46" x2="250" y2="36" />
                        <line x1="280" y1="58" x2="288" y2="50" />
                        <line x1="292" y1="88" x2="304" y2="88" />
                        <line x1="220" y1="58" x2="212" y2="50" />
                        <line x1="208" y1="88" x2="196" y2="88" />
                    </g>
                    <path d="M50,208 L110,148 L160,188 L210,128 L260,173 L310,118 L360,168 L420,143 L450,208 Z" fill="#0f3d1f" />
                    <path d="M50,222 L120,172 L180,208 L240,168 L300,203 L360,168 L420,198 L450,222 Z" fill="#14532d" opacity="0.8" />
                    <rect x="50" y="222" width="400" height="190" fill="#1a3a1a" />
                    <path d="M50,252 L180,238 L320,238 L450,252 L450,412 L50,412 Z" fill="#1a1a1a" />
                    <path d="M50,265 L190,251 L310,251 L450,265" fill="none" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="15 12" opacity="0.5" />
                    <rect x="100" y="192" width="8" height="55" fill="#2d4a2d" />
                    <ellipse cx="104" cy="185" rx="18" ry="24" fill="#15803d" />
                    <ellipse cx="104" cy="172" rx="13" ry="18" fill="#16a34a" />
                    <ellipse cx="104" cy="163" rx="8" ry="12" fill="#4ade80" />
                    <rect x="130" y="205" width="6" height="40" fill="#2d4a2d" />
                    <ellipse cx="133" cy="198" rx="14" ry="19" fill="#15803d" />
                    <rect x="392" y="192" width="8" height="55" fill="#2d4a2d" />
                    <ellipse cx="396" cy="185" rx="18" ry="24" fill="#15803d" />
                    <ellipse cx="396" cy="172" rx="13" ry="18" fill="#16a34a" />
                    <ellipse cx="396" cy="163" rx="8" ry="12" fill="#4ade80" />
                    <rect x="364" y="205" width="6" height="40" fill="#2d4a2d" />
                    <ellipse cx="367" cy="198" rx="14" ry="19" fill="#15803d" />
                    <ellipse cx="250" cy="300" rx="88" ry="10" fill="#000" opacity="0.4" />
                    <rect x="168" y="256" width="164" height="42" rx="7" fill="#1a4a2a" />
                    <path d="M198,256 C202,223 222,213 250,213 C278,213 298,223 302,256 Z" fill="#15803d" />
                    <path d="M168,271 L332,271" fill="none" stroke="#0f2d0f" strokeWidth="1.2" />
                    <path d="M202,254 C204,232 216,220 232,218 L232,254 Z" fill="#0d4a3a" opacity="0.9" />
                    <path d="M298,254 C296,232 284,220 268,218 L268,254 Z" fill="#0d4a3a" opacity="0.9" />
                    <path d="M234,218 L266,218 L266,254 L234,254 Z" fill="#0a3d30" opacity="0.9" />
                    <rect x="218" y="270" width="12" height="3" rx="1.5" fill="#a3e635" />
                    <rect x="270" y="270" width="12" height="3" rx="1.5" fill="#a3e635" />
                    <ellipse cx="170" cy="264" rx="6" ry="4" fill="#a3e635" opacity="0.9" />
                    <ellipse cx="330" cy="264" rx="6" ry="4" fill="#a3e635" opacity="0.9" />
                    <ellipse cx="170" cy="264" rx="3" ry="2" fill="#fff" opacity="0.7" />
                    <ellipse cx="330" cy="264" rx="3" ry="2" fill="#fff" opacity="0.7" />
                    <rect x="330" y="254" width="11" height="8" rx="1.5" fill="#052e16" stroke="#a3e635" strokeWidth="0.8" />
                    <circle cx="335" cy="258" r="2.5" fill="#a3e635" />
                    <circle cx="205" cy="300" r="24" fill="#0a0a0a" />
                    <circle cx="205" cy="300" r="19" fill="#1a1a1a" />
                    <circle cx="205" cy="300" r="13" fill="#14532d" />
                    <circle cx="205" cy="300" r="7" fill="#a3e635" />
                    <circle cx="205" cy="300" r="4" fill="#052e16" />
                    <line x1="205" y1="287" x2="205" y2="293" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="205" y1="307" x2="205" y2="313" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="192" y1="300" x2="198" y2="300" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="212" y1="300" x2="218" y2="300" stroke="#a3e635" strokeWidth="1.5" />
                    <circle cx="295" cy="300" r="24" fill="#0a0a0a" />
                    <circle cx="295" cy="300" r="19" fill="#1a1a1a" />
                    <circle cx="295" cy="300" r="13" fill="#14532d" />
                    <circle cx="295" cy="300" r="7" fill="#a3e635" />
                    <circle cx="295" cy="300" r="4" fill="#052e16" />
                    <line x1="295" y1="287" x2="295" y2="293" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="295" y1="307" x2="295" y2="313" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="282" y1="300" x2="288" y2="300" stroke="#a3e635" strokeWidth="1.5" />
                    <line x1="302" y1="300" x2="308" y2="300" stroke="#a3e635" strokeWidth="1.5" />
                </g>

                {/* Bolt */}
                <g className="s2-bolt" clipPath="url(#sc2)">
                    <polygon points="270,198 242,248 256,248 228,308 272,244 256,244 280,198" fill="#15803d" opacity="0.35" />
                    <polygon points="268,196 240,246 254,246 226,306 270,242 254,242 278,196" fill="#a3e635" />
                    <polygon points="263,196 252,218 256,218 246,240" fill="#fff" opacity="0.3" />
                </g>

                {/* Banner */}
                <g className="s2-banner">
                    <polygon points="50,358 118,344 118,390 50,404" fill="#14532d" />
                    <polygon points="50,358 36,381 50,404" fill="#0f3d1f" />
                    <polygon points="450,358 382,344 382,390 450,404" fill="#14532d" />
                    <polygon points="450,358 464,381 450,404" fill="#0f3d1f" />
                    <rect x="118" y="338" width="264" height="52" rx="4" fill="#15803d" />
                    <rect x="118" y="338" width="264" height="4" fill="#4ade80" opacity="0.4" />
                    <text x="250" y="372" fontFamily="Georgia,serif" fontSize="24" fontWeight="bold" fill="#a3e635" textAnchor="middle" letterSpacing="2">GREENWHEELS</text>
                    <rect x="175" y="394" width="150" height="24" rx="3" fill="#052e16" />
                    <text x="250" y="411" fontFamily="Georgia,serif" fontSize="11" fontWeight="bold" fill="#4ade80" textAnchor="middle" letterSpacing="3">EV RETROFIT</text>
                </g>

            </svg>
        </div>
    );
}