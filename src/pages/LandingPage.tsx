import { useMemo } from "react";
import { Link } from "react-router-dom";

const STYLES = `
.lp{--bg-top:#1a6b46;--bg-mid:#0c3a25;--bg-deep:#072017;--emerald:#34d27e;--leaf:#5ce08a;
  --moss:#7bbf8a;--sage:#a7cf9b;--gold:#ffd76b;--cream:#f4f9f0;--muted:#bcd9c4;--bug:#e0392b;
  --amber:#ffb45c;--coral:#ff8a5b;--lilac:#cdb0ff;--card:rgba(255,255,255,.055);
  --card-line:rgba(124,191,138,.28);--display:'Cormorant Garamond',Georgia,serif;--body:'Inter',system-ui,sans-serif;
  font-family:var(--body);color:var(--cream);line-height:1.6;position:relative;min-height:100vh;overflow-x:hidden;
  background:radial-gradient(120% 80% at 80% -10%,rgba(255,215,107,.22),transparent 55%),
    linear-gradient(180deg,var(--bg-top) 0%,var(--bg-mid) 45%,var(--bg-deep) 100%);background-attachment:fixed;}
.lp *{box-sizing:border-box;margin:0;padding:0}
.lp .wrap{max-width:1140px;margin:0 auto;padding:0 24px;position:relative;z-index:3}
.lp .atmosphere{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.lp .sun{position:absolute;top:-90px;right:-60px;width:340px;height:340px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,224,140,.55),rgba(255,215,107,.10) 60%,transparent 72%);animation:lpSun 9s ease-in-out infinite}
@keyframes lpSun{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.07);opacity:1}}
.lp .pollen{position:absolute;bottom:-10px;width:6px;height:6px;border-radius:50%;
  background:radial-gradient(circle,#fff6d6,rgba(255,246,214,.2));box-shadow:0 0 8px rgba(255,238,170,.6);animation:lpDrift linear infinite}
@keyframes lpDrift{0%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:.9}90%{opacity:.7}100%{transform:translateY(-105vh) translateX(40px);opacity:0}}
.lp .butterfly{position:absolute;width:26px;height:22px;z-index:2}
.lp .butterfly .wing{position:absolute;top:0;width:13px;height:22px;border-radius:60% 60% 50% 50%;opacity:.92;transform-origin:right center;animation:lpFlap .35s ease-in-out infinite alternate}
.lp .butterfly .wing.l{left:0}
.lp .butterfly .wing.r{right:0;transform-origin:left center;animation-name:lpFlapR}
.lp .butterfly::after{content:"";position:absolute;left:11px;top:3px;width:4px;height:16px;border-radius:3px;background:#3a2a12}
@keyframes lpFlap{from{transform:rotateY(0) scaleX(1)}to{transform:rotateY(60deg) scaleX(.45)}}
@keyframes lpFlapR{from{transform:rotateY(0) scaleX(1)}to{transform:rotateY(-60deg) scaleX(.45)}}
.lp .bfly-a{animation:lpFlyA 22s linear infinite}
.lp .bfly-b{animation:lpFlyB 28s linear infinite}
.lp .bfly-c{animation:lpFlyC 25s linear infinite}
.lp .bfly-a .wing{background:linear-gradient(160deg,var(--amber),var(--coral))}
.lp .bfly-b .wing{background:linear-gradient(160deg,var(--lilac),#9b6fd4)}
.lp .bfly-c .wing{background:linear-gradient(160deg,#ffe08a,var(--amber))}
@keyframes lpFlyA{0%{transform:translate(-8vw,72vh) rotate(8deg)}25%{transform:translate(28vw,40vh) rotate(-6deg)}50%{transform:translate(58vw,60vh) rotate(10deg)}75%{transform:translate(82vw,28vh) rotate(-8deg)}100%{transform:translate(108vw,46vh) rotate(6deg)}}
@keyframes lpFlyB{0%{transform:translate(106vw,30vh) rotate(-8deg)}30%{transform:translate(64vw,58vh) rotate(8deg)}60%{transform:translate(34vw,22vh) rotate(-6deg)}100%{transform:translate(-10vw,52vh) rotate(8deg)}}
@keyframes lpFlyC{0%{transform:translate(20vw,108vh) rotate(6deg)}40%{transform:translate(48vw,52vh) rotate(-8deg)}70%{transform:translate(76vw,70vh) rotate(8deg)}100%{transform:translate(40vw,-12vh) rotate(-6deg)}}
.lp .vine{position:fixed;left:0;bottom:0;width:100%;height:120px;z-index:2;pointer-events:none}
.lp .ladybug{position:absolute;bottom:18px;width:22px;height:18px;animation:lpCrawl linear infinite}
.lp .ladybug .body{position:absolute;inset:0;border-radius:55% 55% 50% 50%;background:radial-gradient(circle at 50% 120%,#ff6a5a,var(--bug));overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.lp .ladybug .body::before{content:"";position:absolute;left:50%;top:0;width:2px;height:100%;background:#2a0d0a;transform:translateX(-50%)}
.lp .ladybug .head{position:absolute;left:50%;top:-4px;width:9px;height:7px;border-radius:50%;background:#1c0a08;transform:translateX(-50%)}
.lp .ladybug .s{position:absolute;width:4px;height:4px;border-radius:50%;background:#2a0d0a}
.lp .ladybug .s1{left:3px;top:5px}.lp .ladybug .s2{right:3px;top:5px}.lp .ladybug .s3{left:5px;bottom:3px}.lp .ladybug .s4{right:5px;bottom:3px}
@keyframes lpCrawl{0%{transform:translateX(-40px) translateY(0)}50%{transform:translateX(50vw) translateY(-3px)}100%{transform:translateX(102vw) translateY(0)}}
.lp .lb-1{animation-duration:34s}
.lp .lb-2{animation-duration:46s;animation-delay:-12s;bottom:46px}
.lp .meadow{position:fixed;left:0;bottom:0;width:100%;height:90px;z-index:1;pointer-events:none;display:flex;align-items:flex-end;gap:2.6vw;padding:0 2vw;background:linear-gradient(180deg,transparent,rgba(7,32,23,.65))}
.lp .sprout{position:relative;width:6px;background:linear-gradient(180deg,var(--leaf),var(--emerald));border-radius:6px 6px 0 0;transform-origin:bottom center;animation:lpGrow 3.2s ease-out both,lpSway 5s ease-in-out infinite}
.lp .sprout::before,.lp .sprout::after{content:"";position:absolute;width:16px;height:9px;border-radius:0 80% 0 80%;background:var(--moss);bottom:55%}
.lp .sprout::before{left:-13px;transform:rotate(-18deg)}
.lp .sprout::after{right:-13px;transform:rotate(18deg) scaleX(-1)}
@keyframes lpGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes lpSway{0%,100%{rotate:-2deg}50%{rotate:2deg}}
.lp header.hero{padding:108px 0 92px;text-align:center;position:relative;z-index:3}
.lp .eyebrow{font-size:.78rem;letter-spacing:.42em;text-transform:uppercase;color:var(--leaf);font-weight:600;opacity:0;animation:lpFadeUp .8s .1s both}
.lp h1{font-family:var(--display);font-weight:500;font-size:clamp(2.7rem,7vw,5.4rem);line-height:1.02;margin:18px auto 0;max-width:13ch;letter-spacing:-.5px;background:linear-gradient(180deg,#fff,#cdeccf);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:0;animation:lpFadeUp .9s .22s both}
.lp h1 em{font-style:italic;color:var(--gold);-webkit-text-fill-color:var(--gold)}
.lp .lede{max-width:54ch;margin:26px auto 0;font-size:1.16rem;color:var(--muted);opacity:0;animation:lpFadeUp .9s .36s both}
.lp .price-pill{display:inline-flex;align-items:center;gap:10px;margin-top:30px;padding:9px 20px;border-radius:999px;background:rgba(255,215,107,.12);border:1px solid rgba(255,215,107,.4);color:var(--gold);font-weight:600;font-size:.92rem;opacity:0;animation:lpFadeUp .9s .48s both}
.lp .price-pill b{font-size:1.05rem}
.lp .cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:30px;opacity:0;animation:lpFadeUp .9s .6s both}
.lp .btn{font-weight:600;font-size:1rem;padding:15px 30px;border-radius:999px;cursor:pointer;text-decoration:none;display:inline-block;transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
.lp .btn-primary{background:linear-gradient(135deg,var(--leaf),var(--emerald));color:#06281a;box-shadow:0 10px 30px rgba(52,210,126,.35)}
.lp .btn-primary:hover{transform:translateY(-2px);box-shadow:0 16px 40px rgba(52,210,126,.5)}
.lp .btn-ghost{background:transparent;color:var(--cream);border:1px solid rgba(167,207,155,.45)}
.lp .btn-ghost:hover{background:rgba(167,207,155,.12);transform:translateY(-2px)}
.lp .members-note{margin-top:14px;font-size:.85rem;color:var(--muted);opacity:0;animation:lpFadeUp .9s .72s both}
@keyframes lpFadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.lp section{padding:74px 0;position:relative;z-index:3}
.lp .sec-eyebrow{font-size:.74rem;letter-spacing:.36em;text-transform:uppercase;color:var(--leaf);font-weight:600;text-align:center}
.lp .sec-title{font-family:var(--display);font-weight:500;font-size:clamp(2rem,4.5vw,3.1rem);text-align:center;margin-top:10px;color:var(--cream)}
.lp .sec-sub{text-align:center;color:var(--muted);max-width:50ch;margin:14px auto 0}
.lp .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:46px}
.lp .card{background:var(--card);border:1px solid var(--card-line);border-radius:20px;padding:26px 22px;backdrop-filter:blur(6px);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
.lp .card:hover{transform:translateY(-6px);border-color:var(--leaf);box-shadow:0 18px 40px rgba(0,0,0,.28)}
.lp .card .ico{font-size:1.7rem;line-height:1}
.lp .card h3{font-family:var(--display);font-weight:600;font-size:1.4rem;margin-top:14px;color:var(--cream)}
.lp .card p{font-size:.95rem;color:var(--muted);margin-top:8px}
.lp .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:46px;counter-reset:step}
.lp .step{position:relative;padding:30px 22px 26px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--card-line)}
.lp .step::before{counter-increment:step;content:"0" counter(step);font-family:var(--display);font-size:2.4rem;color:var(--gold);opacity:.5;line-height:1}
.lp .step h4{font-family:var(--display);font-size:1.35rem;margin-top:8px;color:var(--cream)}
.lp .step p{font-size:.92rem;color:var(--muted);margin-top:6px}
.lp .ethos{max-width:760px;margin:0 auto;text-align:center}
.lp .ethos p{font-family:var(--display);font-size:clamp(1.3rem,2.8vw,1.9rem);line-height:1.5;color:#e7f5e9;font-style:italic}
.lp .ethos .tags{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px}
.lp .tag{font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--leaf);border:1px solid var(--card-line);padding:7px 14px;border-radius:999px}
.lp .final{text-align:center;background:radial-gradient(120% 120% at 50% 0%,rgba(52,210,126,.16),transparent 60%);border:1px solid var(--card-line);border-radius:28px;padding:60px 28px;margin:30px 0 0}
.lp .final h2{font-family:var(--display);font-weight:500;font-size:clamp(2.1rem,5vw,3.4rem);color:var(--cream)}
.lp .final p{color:var(--muted);margin-top:12px}
.lp footer{text-align:center;padding:46px 0 130px;color:var(--muted);font-size:.85rem;position:relative;z-index:3}
@media(max-width:900px){.lp .grid{grid-template-columns:repeat(2,1fr)}.lp .steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.lp .grid,.lp .steps{grid-template-columns:1fr}.lp header.hero{padding:84px 0 70px}}
@media (prefers-reduced-motion: reduce){.lp *{animation:none!important;transition:none!important}.lp .sprout{transform:scaleY(1)}}
`;

const FEATURES = [
  ["🃏", "Daily Oracle", "Three living decks — Herb, Forest, and Wild Meadow. 99 cards, a fresh draw each day."],
  ["🔢", "Angel Numbers", "Type any number 1–999 and read its message. All 999 decoded — the meaning, the action, the affirmation."],
  ["🌿", "Your Living Garden", "Every draw drops a seed. Water it with practice and watch it grow from sprout to full bloom."],
  ["🎵", "Frequency Tones", "The CymaTones library — chakras, colors, vitamins, Bach flowers, immune support. Listen as you tend."],
  ["📖", "Greenhouse Journal", "A daily prompt, a mood, a few honest words. Each entry plants a journal seed in your beds."],
  ["🎨", "Art Easel", "Six calm, green-themed games — coloring, mandalas, mosaics, watercolor meadows. Pure unwind."],
  ["🦊", "Shadowmoss", "A wandering garden spirit who pauses beside your seeds and speaks an I AM truth, just for you."],
  ["✨", "Sky of Stars", "Pin the readings and affirmations that move you as stars — your own constellation of becoming."],
];

const STEPS = [
  ["Draw", "Pull a card or enter a number. Receive a message made for today."],
  ["Plant", "Your reading drops a seed into the matching garden bed."],
  ["Tend", "Journal, listen to a tone, return tomorrow. Tending is the magic."],
  ["Bloom", "Over days, the seed grows. Your garden becomes a record of your becoming."],
];

export default function LandingPage() {
  const sprouts = useMemo(
    () =>
      Array.from({ length: 30 }, () => ({
        height: 24 + Math.random() * 52,
        delay: `${(Math.random() * 1.2).toFixed(2)}s, ${(Math.random() * 2).toFixed(2)}s`,
      })),
    []
  );

  return (
    <div className="lp">
      <style>{STYLES}</style>

      <div className="atmosphere" aria-hidden="true">
        <div className="sun" />
        <div className="butterfly bfly-a"><div className="wing l" /><div className="wing r" /></div>
        <div className="butterfly bfly-b"><div className="wing l" /><div className="wing r" /></div>
        <div className="butterfly bfly-c"><div className="wing l" /><div className="wing r" /></div>
        {[
          { left: "12%", d: "16s", delay: "0s" },
          { left: "28%", d: "21s", delay: "4s" },
          { left: "44%", d: "18s", delay: "8s" },
          { left: "63%", d: "23s", delay: "2s" },
          { left: "78%", d: "17s", delay: "6s" },
          { left: "90%", d: "20s", delay: "10s" },
        ].map((p, i) => (
          <span key={i} className="pollen" style={{ left: p.left, animationDuration: p.d, animationDelay: p.delay }} />
        ))}
      </div>

      <div className="vine" aria-hidden="true">
        {["lb-1", "lb-2"].map((c) => (
          <div key={c} className={`ladybug ${c}`}>
            <div className="head" /><div className="body" />
            <span className="s s1" /><span className="s s2" /><span className="s s3" /><span className="s s4" />
          </div>
        ))}
      </div>
      <div className="meadow" aria-hidden="true">
        {sprouts.map((s, i) => (
          <div key={i} className="sprout" style={{ height: `${s.height}px`, animationDelay: s.delay }} />
        ))}
      </div>

      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">Green · CymaTones</div>
          <h1>Draw a card.<br />Plant a seed.<br />Watch what <em>grows</em>.</h1>
          <p className="lede">
            A living garden that blooms from your daily practice. Pull an oracle, decode an angel number,
            listen to a frequency — and every choice plants something that grows in a garden that's entirely yours.
          </p>
          <div className="price-pill">🌱 <span><b>$8</b> / month · members only</span></div>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/subscribe">Begin — $8/month</Link>
            <Link className="btn btn-ghost" to="/auth">I'm a member</Link>
          </div>
          <div className="members-note">No free tier. The garden opens the moment you join.</div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="sec-eyebrow">What blooms inside</div>
          <h2 className="sec-title">One membership. A whole living world.</h2>
          <p className="sec-sub">Everything below is included — no add-ons, no upsells, no tiers.</p>
          <div className="grid">
            {FEATURES.map(([ico, title, body]) => (
              <div className="card" key={title}>
                <div className="ico">{ico}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sec-eyebrow">How your garden grows</div>
          <h2 className="sec-title">A loop you'll actually keep.</h2>
          <div className="steps">
            {STEPS.map(([title, body]) => (
              <div className="step" key={title}>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap ethos">
          <div className="sec-eyebrow">The thinking behind it</div>
          <p>
            "Frequency, resonance, and the old wisdoms aren't separate from your daily life — they're a
            practice you can tend. Green is where that practice grows roots."
          </p>
          <div className="tags">
            {["Frequencies", "Resonance", "TCM Wisdom", "Bioenergetics", "Ritual"].map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="final">
            <h2>Your garden is waiting to be planted.</h2>
            <p>$8/month. Members only. Cancel anytime.</p>
            <div className="cta-row" style={{ animation: "none", opacity: 1 }}>
              <Link className="btn btn-primary" to="/subscribe">Begin — $8/month</Link>
              <Link className="btn btn-ghost" to="/auth">I'm a member</Link>
            </div>
          </div>
        </div>
      </section>

      <footer>green.cymatones.com — a frequency-based wellness garden · © CymaTones</footer>
    </div>
  );
}
