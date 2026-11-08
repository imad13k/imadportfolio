// Builds the five pages of the Karaz Hana site from one shared header and footer:  node build.js
// Edit the page contents below, then run it again. The output is plain static HTML.
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
// Changes on every build, so browsers fetch updated styles and scripts instead of an old copy
const V = Date.now().toString(36);

const IG = 'https://www.instagram.com/karaz.hana/';
const FB = 'https://www.facebook.com/profile.php?id=61574172396909';
const TT = 'https://www.tiktok.com/@hanane.kara';
const MAIL = 'hanane.kaitri@gmail.com';

const icon = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15Z"/></svg>',
  tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.8 2.3 4.6 5 5"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  brush: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 3 9 12l3 3 9-9a2.1 2.1 0 0 0-3-3Z"/><path d="M9 12c-2.5 0-4 1.6-4 4 0 1.5-1 2.5-2 3 3.5 1 7-.5 7-3.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
  cake: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M5 20v-7h14v7M5 16c2 1 3-1 5 0s3-1 5 0 3-1 4 0M12 9V6M12 4v.01"/></svg>',
  friends: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.4 1.4-4 3-4s3 1.6 3 4"/></svg>',
  ring: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="15" r="6"/><path d="m9 5 3-2 3 2-3 4Z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>',
  wave: '<svg class="wave" viewBox="0 0 84 12" aria-hidden="true"><path d="M2 6c5-5 9-5 14 0s9 5 14 0 9-5 14 0 9 5 14 0 9-5 14 0 9 5 10 1" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
};

const PAGES = [
  ['index.html', 'Accueil'],
  ['ateliers.html', 'Ateliers'],
  ['aquarelles-personnalisees.html', 'Aquarelles personnalisées'],
  ['boutique.html', 'Boutique'],
  ['contact.html', 'Contact'],
];

function layout({ file, title, description, body }) {
  const nav = PAGES.map(([f, label]) => `<a href="${f}"${f === file ? ' aria-current="page"' : ''}>${label}</a>`).join('\n        ');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="theme-color" content="#FBF3E6">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="assets/img/perso-1.webp">
<link rel="icon" href="assets/img/illu-rose.png" type="image/png">
<link rel="preload" href="fonts/fraunces-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="assets/style.css?v=${V}">
<script src="assets/head.js?v=${V}"></script>
</head>
<body>
<div class="intro" id="intro" aria-hidden="true">
  <div class="bloom"><img class="line" src="assets/img/illu-rosetrait.png" alt=""><img class="fill" src="assets/img/illu-rose-digitale.png" alt="" style="inset:8% 6%;width:88%;height:84%;object-fit:contain"></div>
  <p class="word">Karaz <span>Hana</span></p>
  <p class="sub">Artiste aquarelliste</p>
</div>
<a class="skip" href="#main">Aller au contenu</a>

<header class="hdr" id="hdr">
  <div class="hdr-in">
    <a class="brand" href="index.html" aria-label="Karaz Hana — accueil"><img src="assets/img/illu-rose.png" alt="" width="40" height="40"><b>Karaz <span>Hana</span></b></a>
    <nav class="nav" id="nav" aria-label="Navigation principale">
        ${nav}
    </nav>
    <div class="hdr-social">
      <a class="icon-btn" href="${IG}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
      <a class="icon-btn" href="${TT}" target="_blank" rel="noopener" aria-label="TikTok">${icon.tt}</a>
    </div>
    <a class="btn btn-pink cta" href="aquarelles-personnalisees.html#commande">Commander</a>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="nav"><span class="sr">Menu</span><i></i><i></i><i></i></button>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="ftr scallop-top">
  <div class="wrap">
    <div class="ftr-grid">
      <div>
        <a class="brand" href="index.html"><img src="assets/img/illu-rose.png" alt="" width="40" height="40"><b>Karaz Hana</b></a>
        <p>Aquarelliste sensible à la beauté du monde naturel. Commandes personnalisées, œuvres uniques et ateliers ouverts à tous, depuis Tlemcen.</p>
        <div class="socials">
          <a class="icon-btn" href="${IG}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
          <a class="icon-btn" href="${FB}" target="_blank" rel="noopener" aria-label="Facebook">${icon.fb}</a>
          <a class="icon-btn" href="${TT}" target="_blank" rel="noopener" aria-label="TikTok">${icon.tt}</a>
          <a class="icon-btn" href="mailto:${MAIL}" aria-label="E-mail">${icon.mail}</a>
        </div>
      </div>
      <div>
        <h4>Pages</h4>
        <ul>${PAGES.map(([f, label]) => `<li><a href="${f}">${label}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Écrire</h4>
        <ul><li><a href="mailto:${MAIL}">${MAIL}</a></li><li><a href="contact.html">Formulaire de contact</a></li><li><a href="aquarelles-personnalisees.html#commande">Commander une aquarelle</a></li></ul>
      </div>
    </div>
    <div class="ftr-copy"><span>© <span data-year>2026</span> Karaz Hana</span><span>Tlemcen, Algérie</span></div>
  </div>
</footer>

<dialog class="lightbox" id="lightbox" aria-label="Agrandissement">
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-btn lb-prev" type="button" aria-label="Photo précédente">‹</button>
  <button class="lb-btn lb-next" type="button" aria-label="Photo suivante">›</button>
  <button class="lb-btn lb-close" type="button" aria-label="Fermer">×</button>
</dialog>
<script src="assets/main.js?v=${V}" defer></script>
</body>
</html>
`;
}

const img = (name, alt, attrs = '') => `<img src="assets/img/${name}.webp" alt="${alt}" loading="lazy" decoding="async"${attrs}>`;
const tile = (name, alt, group, caption = '') => `<button class="tile" type="button" data-lb="${group}"${caption ? ` data-caption="${caption}"` : ''}>${img(name, alt)}</button>`;

// ====================================================================== ACCUEIL
const accueil = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-left" data-stagger>
      <div class="card fact-card pop">
        <span class="big">✿</span>
        <span class="card-label">Écologue de formation</span>
        <small>Spécialisée en écologie végétale</small>
        <div class="pills"><span class="pill">Aquarelle</span><span class="pill sage">Nature</span><span class="pill butter">Tlemcen</span></div>
        <div class="bar"><i></i></div>
      </div>
      <div class="card player pinkc pop">
        <div class="cover">${img('perso-1', 'Aquarelle personnalisée offerte en cadeau')}</div>
        <h3>Prochain atelier</h3>
        <p>De nouvelles dates arrivent très bientôt</p>
        <div class="controls">
          <a href="ateliers.html#galerie" aria-label="Voir les ateliers passés">${icon.prev}</a>
          <a class="play" href="ateliers.html" aria-label="Découvrir les ateliers">${icon.play}</a>
          <a href="${IG}" target="_blank" rel="noopener" aria-label="Être prévenu sur Instagram">${icon.next}</a>
        </div>
        <div class="bar"><i></i></div>
      </div>
    </div>

    <div class="hero-center">
      <span class="wc pink" style="width:520px;height:520px;left:-150px;top:-170px"></span>
      <span class="wc butter soft" style="width:460px;height:460px;right:-130px;bottom:-170px"></span>
      <span class="wc sage soft" style="width:300px;height:300px;left:22%;bottom:-90px"></span>
      <span class="spark" style="left:6%;top:9%">+</span><span class="spark s2" style="left:46%;top:14%">+</span><span class="spark s3" style="right:8%;bottom:16%">+</span>
      <span class="dots" style="left:8%;bottom:12%"></span><span class="dots" style="right:6%;top:10%"></span>
      <div class="hero-title reveal">
        <h1 class="hello">Salut, je suis <em>Hanane !</em></h1>
        <span class="name-pill">Karaz Hana</span>
        <p>Aquarelliste sensible à la beauté du monde naturel.</p>
        <div class="pills" style="margin-top:16px"><a class="btn btn-wine" href="contact.html">Contactez-moi ${icon.arrow}</a></div>
      </div>
      <div class="hero-photo pop" style="--d:.2s">
        <div class="arch">${img('hana-portrait', 'Portrait de Hanane, Karaz Hana, en train de peindre', ' fetchpriority="high" loading="eager"')}</div>
        <img class="rose float" src="assets/img/illu-rose-digitale.png" alt="">
        <img class="rose-line" src="assets/img/illu-rosepartie.png" alt="">
      </div>
    </div>

    <div class="hero-side">
      <span class="side-tab"><b>01.</b>Mon univers</span>
      <a class="fab" href="${IG}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
      <a class="fab sage" href="contact.html" aria-label="Écrire un message">${icon.mail}</a>
      <a class="fab butter" href="aquarelles-personnalisees.html#commande" aria-label="Commander une aquarelle">${icon.brush}</a>
    </div>
  </div>

  <div class="wrap about-grid">
    <div class="card lined reveal">
      <span class="kicker">Mon histoire</span>
      <p style="margin-top:14px">Ma créativité naît de l'observation de la nature, de ses formes délicates et de ses couleurs changeantes. Ce lien est aussi scientifique : écologue de formation, spécialisée en écologie végétale, j'ai transformé cette passion en langage visuel à travers l'aquarelle.</p>
      <p>Installée dans une petite ville au nord de l'Algérie, je peins pour donner des couleurs à vos souvenirs et à vos rêves, et inviter à la contemplation du vivant.</p>
      <p>Au fil des années, j'ai développé un style personnel, délicat et organique. Je réalise des commandes personnalisées, crée des œuvres uniques et propose des ateliers ouverts à tous les âges.</p>
      <p>Prenez le temps de découvrir mon univers. Et si une œuvre vous touche ou qu'une idée vous traverse l'esprit, <a href="contact.html">écrivez-moi</a> 💛</p>
      <p class="sign">~ K.H</p>
    </div>
    <div class="card sagec status-card reveal" style="--d:.1s">
      <div>
        <span class="card-label">Ce que je propose</span>
        <div class="pills" style="margin-top:14px"><span class="pill">Commandes personnalisées</span><span class="pill sage">Œuvres uniques</span><span class="pill butter">Ateliers tous âges</span><span class="pill">Collaborations</span></div>
      </div>
      <div class="status-row"><span class="live-dot"></span><div><b>Commandes ouvertes</b><br><small>Paiement à la livraison</small></div></div>
      <a class="btn btn-wine" href="aquarelles-personnalisees.html#commande">Commander mon aquarelle ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="sec band-pink scallop-top scallop-bottom" id="portfolio">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Portfolio</span>
      <h2 class="display reveal">Aquarelles <em>personnalisées</em></h2>
      ${icon.wave}
    </div>
    <div class="arches" data-stagger>
      <a class="arch-item reveal" href="aquarelles-personnalisees.html"><div class="arch">${img('perso-1', 'Aquarelle personnalisée offerte, avec son ruban')}</div><h3>Un cadeau unique</h3><p>Emballée avec soin</p></a>
      <a class="arch-item reveal" href="aquarelles-personnalisees.html"><div class="arch">${img('perso-2', 'Coucher de soleil sur la mer en aquarelle')}</div><h3>Coucher de soleil</h3><p>Couleurs chaudes</p></a>
      <a class="arch-item reveal" href="aquarelles-personnalisees.html"><div class="arch">${img('perso-3', 'Aquarelle encadrée d\’un paysage de voyage')}</div><h3>Souvenir de voyage</h3><p>Encadrée</p></a>
      <a class="arch-item reveal" href="aquarelles-personnalisees.html"><div class="arch">${img('perso-4', 'Aquarelle encadrée d\’un paysage désertique')}</div><h3>Paysage du sud</h3><p>Sur commande</p></a>
    </div>
    <p class="center" style="margin-top:40px"><a class="btn btn-wine" href="aquarelles-personnalisees.html">Aquarelles personnalisées ${icon.arrow}</a></p>
  </div>
</section>

<section class="sec" id="collaborations">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker reveal">Collaborations</span>
      <h2 class="display reveal">Projets <em>artistiques</em></h2>
      <p class="lead reveal" style="margin-top:16px">J'aime profondément travailler avec des personnes et des projets qui résonnent avec mes valeurs. Chaque collaboration est pour moi une rencontre humaine autant qu'artistique. J'accorde beaucoup d'importance à l'écoute, à la compréhension de l'univers de l'autre, et à la création d'images qui ont du sens.</p>
    </div>
    <div class="projects">
      <article class="project">
        <div class="p-media reveal">
          <figure><button type="button" data-lb="livre" data-caption="Couverture — Je ne sais pas danser">${img('livre-couverture', 'Couverture du livre Je ne sais pas danser')}</button></figure>
          <figure><button type="button" data-lb="livre" data-caption="Croquis complet">${img('livre-croquis', 'Croquis complet de la couverture')}</button></figure>
          <figure><button type="button" data-lb="livre" data-caption="Couverture de côté">${img('livre-cote', 'Le livre vu de côté')}</button></figure>
        </div>
        <div class="p-text reveal">
          <span class="tagline">Illustration de couverture</span>
          <h3>Je ne sais pas danser</h3>
          <p class="with">avec Nourhène Zeyneb Fateh</p>
          <p>Nourhène m'a confié l'illustration de la couverture de son livre avec une grande liberté créative. En découvrant son univers et les émotions qui traversent son récit, une image s'est dessinée comme une évidence.</p>
          <div class="more" id="more-livre"><div>
            <p>La composition finale met en scène une silhouette féminine fragile, presque portée par le vent, tenant un bouquet démesuré ; métaphore des émotions intenses et multiples qui traversent le personnage principal.</p>
            <p>Chaque fleur, chaque couleur, a été choisie pour sa symbolique, créant un bouquet narratif qui évoque tour à tour l'amour, la perte, la résilience et l'espoir. Le personnage avance en équilibre sur un fil aux motifs inspirés du henné, rappel discret de l'ancrage aux origines au cœur du tumulte intérieur.</p>
            <p>L'aquarelle, par sa transparence et sa légèreté, m'a permis de suggérer ces états émotionnels avec douceur, laissant au lecteur la liberté d'y projeter sa propre sensibilité.</p>
          </div></div>
          <div class="p-acts"><button class="read-more" type="button" aria-expanded="false" aria-controls="more-livre">Lire plus</button><a class="btn btn-line" href="https://www.fnac.com/a21993090/Nourhene-Zeyneb-Fateh-Je-ne-sais-pas-danser" target="_blank" rel="noopener">Découvrir l'ouvrage ${icon.ext}</a></div>
        </div>
      </article>

      <article class="project">
        <div class="p-media reveal">
          <figure><button type="button" data-lb="collab" data-caption="Collaboration commerciale">${img('collab-1', 'Panier en osier au soleil, sujet de la collaboration')}</button></figure>
          <figure><button type="button" data-lb="collab" data-caption="Le panier et ses aquarelles">${img('collab-2', 'Le panier posé près des aquarelles')}</button></figure>
          <figure><button type="button" data-lb="collab" data-caption="L'aquarelle du panier">${img('collab-3', 'Aquarelle du panier de pique-nique')}</button></figure>
        </div>
        <div class="p-text reveal">
          <span class="tagline">Photos panier</span>
          <h3>Collaborations commerciales</h3>
          <p class="with">Mise en valeur de produits et marques à travers mon univers visuel</p>
          <p>Je réalise également des collaborations commerciales avec des créateurs et marques, où mon univers visuel vient mettre en valeur leurs produits ou projets.</p>
          <div class="more" id="more-collab"><div>
            <p>Ces collaborations me permettent d'explorer de nouveaux horizons créatifs tout en apportant une touche artistique et personnelle à chaque projet.</p>
          </div></div>
          <div class="p-acts"><button class="read-more" type="button" aria-expanded="false" aria-controls="more-collab">Lire plus</button><a class="btn btn-line" href="https://www.instagram.com/reels/DNivpzCs0TY/" target="_blank" rel="noopener">Découvrir la vidéo ${icon.ext}</a></div>
        </div>
      </article>

      <article class="project">
        <div class="p-media reveal">
          <figure><button type="button" data-lb="expo" data-caption="Exposition Café Habana">${img('expo-1', 'Hanane devant une de ses aquarelles exposées au Café Habana')}</button></figure>
          <figure><button type="button" data-lb="expo" data-caption="Exposition Café Habana">${img('expo-2', 'Hanane souriante à côté d\’une aquarelle de fleurs')}</button></figure>
          <figure><button type="button" data-lb="expo" data-caption="Exposition Café Habana">${img('expo-3', 'Aquarelle encadrée sur un mur de briques')}</button></figure>
        </div>
        <div class="p-text reveal">
          <span class="tagline">Photos de l'expo</span>
          <h3>Série d'aquarelles de voyage</h3>
          <p class="with">Exposition Café Habana</p>
          <p>Cette exposition est née d'une rencontre touchante. Sensible aux aquarelles issues de mes carnets de voyage, la propriétaire du Café Habana m'a proposé de créer une série inspirée de leurs destinations favorites.</p>
          <div class="more" id="more-expo"><div>
            <p>J'ai ainsi réalisé six aquarelles originales, pensées comme des fenêtres ouvertes sur l'ailleurs, puis organisé une exposition pour accompagner leur installation dans le lieu.</p>
            <p>Aujourd'hui, ces œuvres font partie de l'atmosphère du café et sont proposées à la vente, prolongeant l'expérience du voyage à travers la couleur.</p>
          </div></div>
          <div class="p-acts"><button class="read-more" type="button" aria-expanded="false" aria-controls="more-expo">Lire plus</button></div>
        </div>
      </article>

      <article class="project">
        <div class="p-media reveal">
          <figure><button type="button" data-lb="album" data-caption="the last time our eyes met">${img('album-1', 'Aquarelle d\’un couple dans un champ sous un ciel nuageux')}</button></figure>
          <figure><button type="button" data-lb="album" data-caption="L'aquarelle encadrée">${img('album-2', 'L\’aquarelle de la pochette encadrée')}</button></figure>
          <figure><button type="button" data-lb="album" data-caption="Rendu final">${img('album-3', 'Rendu final de la pochette sur un mur')}</button></figure>
        </div>
        <div class="p-text reveal">
          <span class="tagline">Projet musical</span>
          <h3>the last time our eyes met</h3>
          <p class="with">un projet lofi de Anes L.</p>
          <p>J'ai réalisé l'aquarelle accompagnant the last time our eyes met, un projet musical aux sonorités lofi douces et introspectives de Anes L.</p>
          <div class="more" id="more-album"><div>
            <p>Une collaboration fondée sur la confiance et la liberté, qui m'a menée vers une composition simple et épurée, pensée comme le prolongement visuel de l'atmosphère du morceau.</p>
          </div></div>
          <div class="p-acts"><button class="read-more" type="button" aria-expanded="false" aria-controls="more-album">Lire plus</button><a class="btn btn-line" href="https://open.spotify.com/intl-fr/album/3n46Dp8L14wXlUqn9zwAud" target="_blank" rel="noopener">Écouter le morceau ${icon.ext}</a></div>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="sec band cta-band scallop-top">
  <span class="wc pink soft" style="width:620px;height:620px;left:50%;top:50%;margin:-310px 0 0 -310px;mix-blend-mode:screen;--o:.22"></span>
  <img class="rose-l float" src="assets/img/illu-rose-digitale.png" alt="">
  <img class="rose-r" src="assets/img/illu-rosetrait-white.png" alt="">
  <div class="wrap">
    <span class="kicker reveal" style="color:var(--butter)">Une idée ?</span>
    <h2 class="display reveal" style="margin:14px 0 18px">Et si une œuvre <em style="color:var(--pink)">vous touche…</em></h2>
    <p class="lead reveal" style="margin:0 auto">Une question, une commande, un projet de collaboration : écrivez-moi, je vous réponds avec plaisir.</p>
    <p class="reveal" style="margin-top:28px"><a class="btn btn-butter" href="contact.html">Contactez-moi ${icon.arrow}</a></p>
    <p class="sign reveal">~ K.H</p>
  </div>
</section>`;

// ====================================================================== ATELIERS
const quotes = [
  ["Franchement, j'ai participé à trois ateliers et c'était vraiment magnifique. Je ne regrette absolument pas. J'adore l'ambiance, ta méthode, les ateliers en plein air et surtout ta gentillesse avec tout le monde.", 'Participante'],
  ["J'ai participé à pas mal d'ateliers et je dirais que à chaque fois je passe un excellent moment. Je fais de nouvelles connaissances et j'apprends beaucoup côté aquarelle. C'est un moment de pure bonheur et de tranquillité.", 'Participante'],
  ["Très bonne découverte, je suis de nature une personne très fermée à la nouveauté et pourtant ton atelier m'a directement donné envie de m'inscrire et depuis je me suis réconcilié avec l'aventure et l'inconnu.", 'Participant'],
  ["I've loved all 3 workshops I attended with you. You're always very helpful in explaining everything and I can't wait to learn more!", 'Participante'],
  ["C'est une belle découverte pour moi, une escapade de la routine, rencontrer des gens et surtout s'exprimer par la peinture 🥰", 'Participante'],
  ["J'adore tes ateliers et toi aussi t'es une personne incroyable &lt;3", 'Participante'],
  ["Je te félicite pour ce concept, bon courage et continue à faire de l'art ✨", 'Participant'],
];
const ateliers = `
<section class="phero">
  <span class="wc butter soft" style="width:520px;height:520px;left:-220px;top:-160px"></span>
  <span class="wc pink soft" style="width:380px;height:380px;left:34%;bottom:-200px"></span>
  <span class="spark" style="left:4%;top:16%">+</span><span class="spark s2" style="left:48%;top:8%">+</span><span class="spark s3" style="right:6%;bottom:12%">+</span>
  <div class="wrap phero-grid">
    <div>
      <span class="kicker reveal">Ateliers d'aquarelle</span>
      <h1 class="display reveal">Moments de <em>création</em></h1>
      <p class="lead reveal">Les ateliers d'aquarelle que je propose sont généralement à thème.</p>
      <p class="lead reveal">Je prépare des séances légères et accessibles, où vous découvrez de nouvelles techniques tout en explorant des sujets inspirants.</p>
      <div class="card player next pinkc pop" style="--d:.2s">
        <div class="cover">${img('valentine-4', 'Table d\’atelier avec palettes et pinceaux')}</div>
        <div>
          <span class="card-label">Prochain atelier</span>
          <h3>De nouveaux ateliers arrivent très bientôt…</h3>
          <p>Je prépare actuellement de nouvelles sessions de création. Restez connectés pour découvrir les prochaines thématiques et dates !</p>
          <div class="controls">
            <a href="#galerie" aria-label="Voir la galerie">${icon.prev}</a>
            <a class="play" href="${IG}" target="_blank" rel="noopener" aria-label="Voir les annonces sur Instagram">${icon.play}</a>
            <a href="#participer" aria-label="Comment participer">${icon.next}</a>
          </div>
        </div>
      </div>
    </div>
    <div class="phero-art pop" style="--d:.15s">
      <div class="arch">${img('pleinair-4', 'Participants qui peignent en plein air autour d\’une table', ' loading="eager"')}</div>
      <img class="rose float" src="assets/img/illu-rose-digitale.png" alt="">
    </div>
  </div>
</section>

<section class="sec band-sage scallop-top scallop-bottom">
  <div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
    <div class="card lined reveal">
      <span class="kicker">Le principe</span>
      <p style="margin-top:14px">En plein air ou dans un café littéraire, ce sont des moments de plaisir, de détente et de créativité, que je partage avec des participants de tous niveaux.</p>
      <p style="margin-top:12px">Pour l'instant, les ateliers ont lieu à Tlemcen, mais j'aimerais beaucoup en proposer dans d'autres villes.</p>
      <div class="pills" style="margin-top:16px"><span class="pill">Tous niveaux</span><span class="pill sage">Plein air</span><span class="pill butter">Café littéraire</span></div>
    </div>
    <div class="card winec reveal" style="--d:.1s">
      <span class="kicker" style="color:var(--butter)">Lieux partenaires</span>
      <h3 class="display" style="font-size:30px;margin:14px 0 10px">Vous êtes un café, un lieu culturel ou un espace créatif ?</h3>
      <p>Vous aimeriez accueillir un atelier ? Parlons-en.</p>
      <p style="margin-top:20px"><a class="btn btn-butter" href="contact.html">Discutons de votre projet ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="sec" id="galerie">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker reveal">Galerie des ateliers</span>
      <h2 class="display reveal">Créer au milieu de la <em>nature</em></h2>
      ${icon.wave}
    </div>
    <div class="tabs reveal" role="tablist" aria-label="Thèmes des ateliers">
      <button role="tab" id="tab-pa" aria-controls="p-pa" aria-selected="true">Plein air</button>
      <button role="tab" id="tab-or" aria-controls="p-or" aria-selected="false" tabindex="-1">Octobre Rose</button>
      <button role="tab" id="tab-va" aria-controls="p-va" aria-selected="false" tabindex="-1">Valentine</button>
    </div>
    <div class="panel show" id="p-pa" role="tabpanel" aria-labelledby="tab-pa">
      <p class="tab-intro">Atelier en plein air · créer au milieu de la nature, là où tout commence.</p>
      <div class="masonry">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => tile(`pleinair-${n}`, 'Atelier en plein air', 'pa', 'Atelier en plein air')).join('\n        ')}
      </div>
    </div>
    <div class="panel" id="p-or" role="tabpanel" aria-labelledby="tab-or" hidden>
      <p class="tab-intro">Octobre Rose · des aquarelles roses pour sensibiliser au cancer du sein.</p>
      <div class="masonry">
        ${[1, 2, 3, 4, 5].map((n) => tile(`octobre-${n}`, 'Atelier Octobre Rose', 'or', 'Atelier Octobre Rose')).join('\n        ')}
      </div>
    </div>
    <div class="panel" id="p-va" role="tabpanel" aria-labelledby="tab-va" hidden>
      <p class="tab-intro">Valentine · des cartes et des cœurs peints pour la Saint-Valentin.</p>
      <div class="masonry">
        ${[1, 2, 3, 4, 5, 6].map((n) => tile(`valentine-${n}`, 'Atelier de la Saint-Valentin', 'va', 'Atelier Valentine')).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="sec band-pink scallop-top scallop-bottom" id="participer">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Comment participer ?</span>
      <h2 class="display reveal">Un à deux ateliers <em>par mois</em></h2>
      <p class="lead reveal" style="margin-top:14px">Les places partent vite à chaque nouvelle annonce !</p>
    </div>
    <div class="steps two" data-stagger>
      <div class="card lined step reveal"><span class="num">01.</span><h3>Suivez-moi sur Instagram</h3><p>Vous verrez les nouvelles dates en premier.</p><p style="margin-top:16px"><a class="btn btn-pink" href="${IG}" target="_blank" rel="noopener">${icon.ig.replace('<svg', '<svg style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2"')} @karaz.hana</a></p></div>
      <div class="card lined step reveal"><span class="num">02.</span><h3>Réservez votre place</h3><p>Une fois l'annonce faite, revenez ici ou écrivez-moi pour réserver votre place.</p><p style="margin-top:16px"><a class="btn btn-wine" href="contact.html">Réserver ${icon.arrow}</a></p></div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Sur mesure</span>
      <h2 class="display reveal">Un atelier <em>rien que pour vous</em></h2>
      <p class="lead reveal" style="margin-top:14px">Envie d'un moment créatif unique ? Je crée des ateliers sur mesure pour vos occasions spéciales.</p>
    </div>
    <div class="occasions" data-stagger>
      <div class="card occ reveal"><div class="ic">${icon.cake}</div><h3>Anniversaire</h3><p>Célébrez avec un atelier créatif mémorable entre proches.</p></div>
      <div class="card occ reveal"><div class="ic">${icon.friends}</div><h3>Entre amis</h3><p>Un moment de partage et de créativité pour renforcer vos liens.</p></div>
      <div class="card occ reveal"><div class="ic">${icon.ring}</div><h3>EVJF / EVG</h3><p>Une activité originale pour fêter les futurs mariés.</p></div>
    </div>
    <div class="pills center reveal" style="justify-content:center;margin-top:28px"><span class="pill">Team building</span><span class="pill sage">Retraite bien-être</span><span class="pill butter">Événement d'entreprise</span><span class="pill">…et bien plus encore, tout est possible !</span></div>
    <p class="center reveal" style="margin-top:30px"><a class="btn btn-wine" href="contact.html">Discutons de votre projet ${icon.arrow}</a></p>
  </div>
</section>

<section class="sec band-sage scallop-top">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Témoignages</span>
      <h2 class="display reveal">Leurs mots, ma source <em>d'inspiration</em></h2>
    </div>
  </div>
  <div class="quotes" tabindex="0" aria-label="Témoignages (survolez pour mettre en pause)">
    <div class="quotes-track">
      ${quotes.map(([q, who]) => `<figure class="card lined quote-card"><span class="mark" aria-hidden="true">“</span><blockquote><p>${q}</p></blockquote><small>${who}</small></figure>`).join('\n      ')}
    </div>
  </div>
</section>`;

// ====================================================================== AQUARELLES PERSONNALISÉES
const commandes = [
  ['commande-1', 'Couple dansant sur la plage, aquarelle'],
  ['commande-2', 'Aquarelle encadrée d\’une scène de bord de mer'],
  ['commande-3', 'Paysage de côte et de fleurs en aquarelle'],
  ['commande-4', 'Bouquet de fleurs blanches encadré'],
  ['commande-5', 'Détail d\’un bouquet de fleurs blanches'],
  ['commande-6', 'Couple dansant sur la plage, encadré'],
  ['commande-7', 'Détail du couple dansant sur la plage'],
  ['commande-8', 'Coucher de soleil sur la mer, cadre en bois'],
  ['commande-9', 'Coucher de soleil sur la mer, petit format'],
];
const perso = `
<section class="phero">
  <span class="wc coral soft" style="width:480px;height:480px;left:-200px;top:-140px"></span>
  <span class="wc butter soft" style="width:360px;height:360px;left:40%;bottom:-190px"></span>
  <span class="spark" style="left:5%;top:14%">+</span><span class="spark s2" style="right:44%;top:10%">+</span><span class="spark s3" style="right:4%;bottom:20%">+</span>
  <div class="wrap phero-grid">
    <div>
      <span class="kicker reveal">Aquarelles sur-mesure</span>
      <h1 class="display reveal">Transformez vos souvenirs en <em>aquarelle unique</em></h1>
      <p class="quote reveal">« Chaque histoire mérite ses couleurs »</p>
      <p class="lead reveal">Je transforme vos mots, vos rêves, vos photos ou vos souvenirs en illustrations inspirées de vos émotions.</p>
      <p class="lead reveal">Une création originale, personnalisée, que vous ne trouverez nulle part ailleurs.</p>
      <div class="acts reveal"><a class="btn btn-wine" href="#commande">Commander mon aquarelle ${icon.arrow}</a><a class="btn btn-line" href="#commandes">Voir les commandes</a></div>
    </div>
    <div class="phero-art pop" style="--d:.15s">
      <div class="arch">${img('perso-1', 'Aquarelle personnalisée emballée avec un ruban', ' loading="eager"')}</div>
      <img class="rose float" src="assets/img/illu-rose-digitale.png" alt="">
    </div>
  </div>
</section>

<section class="sec band-pink scallop-top scallop-bottom" id="commandes">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Galerie</span>
      <h2 class="display reveal">Vos commandes <em>en couleurs</em></h2>
      <p class="lead reveal" style="margin-top:14px">Une photo, une scène de vie, une histoire racontée… découvrez comment j'ai réinterprété vos souvenirs en aquarelles florales et minimalistes.</p>
    </div>
    <div class="masonry">
      ${commandes.map(([n, alt]) => tile(n, alt, 'cmd')).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap phero-grid">
    <div class="p-media reveal" style="grid-template-columns:1fr 1fr;grid-template-rows:1fr">
      <figure style="grid-row:auto"><button type="button" data-lb="rec" data-caption="Recette illustrée">${img('recette-1', 'Recette illustrée encadrée')}</button></figure>
      <figure><button type="button" data-lb="rec" data-caption="Cake maison, recette illustrée">${img('recette-2', 'Recette du cake maison illustrée à l\’aquarelle')}</button></figure>
    </div>
    <div>
      <span class="kicker reveal">Voir aussi</span>
      <h2 class="display reveal" style="margin:12px 0 16px">Vos recettes <em>illustrées</em></h2>
      <p class="lead reveal">Transformez votre plat préféré ou une recette de famille en une aquarelle pleine de charme, à accrocher dans la cuisine ou à offrir.</p>
      <p class="lead reveal" style="margin-top:12px">Un souvenir gourmand qui immortalise vos saveurs préférées à travers le temps.</p>
      <p class="reveal" style="margin-top:24px"><a class="btn btn-pink" href="#commande">Passer commande ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="sec band-sage scallop-top scallop-bottom">
  <div class="wrap">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Comment ça marche ?</span>
      <h2 class="display reveal">Trois étapes, <em>une œuvre</em></h2>
    </div>
    <div class="steps" data-stagger>
      <div class="card lined step reveal"><span class="num">01.</span><h3>Partagez votre idée</h3><p>Décrivez-moi ce que vous aimeriez (un souvenir, une photo, un cadeau spécial…). Racontez-moi les détails qui comptent.</p></div>
      <div class="card lined step reveal"><span class="num">02.</span><h3>On valide ensemble</h3><p>Je reviens vers vous pour proposer un format et un devis adapté à vos envies, et confirmer votre commande.</p></div>
      <div class="card lined step reveal"><span class="num">03.</span><h3>L'œuvre prend vie</h3><p>Je réalise votre aquarelle avec soin. Le paiement se fait à la livraison, une fois votre création reçue.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="commande">
  <div class="wrap" style="max-width:860px">
    <div class="sec-head center" style="position:relative"><span class="wc butter soft" style="width:280px;height:280px;left:50%;top:-70px;margin-left:-140px;z-index:-1"></span>
      <span class="kicker reveal">Commençons votre histoire</span>
      <h2 class="display reveal">Remplissez le <em>formulaire</em></h2>
      ${icon.wave}
    </div>
    <div class="card reveal">
      <form class="form" data-mail="Commande d'aquarelle personnalisée" data-footer="Je joins mes photos d'inspiration à cet e-mail." novalidate>
        <div class="row">
          <label>Prénom *<input name="prenom" autocomplete="given-name" required data-label="Prénom"></label>
          <label>Nom *<input name="nom" autocomplete="family-name" required data-label="Nom"></label>
        </div>
        <div class="row">
          <label>Bureau de livraison (wilaya) *<select id="wilaya" name="wilaya" required data-label="Wilaya" data-subject><option value="">Sélectionnez votre wilaya</option></select></label>
          <label>Numéro de téléphone *<input name="tel" type="tel" autocomplete="tel" required data-label="Téléphone"></label>
        </div>
        <label>Adresse complète *<input name="adresse" autocomplete="street-address" required data-label="Adresse"></label>
        <label>Décrivez votre histoire * <small>Le plus de détails possible</small><textarea name="histoire" rows="6" required data-label="Mon histoire"></textarea></label>
        <p class="form-note">📎 Photos d'inspiration ou de référence : ajoutez-les en pièce jointe dans l'e-mail qui va s'ouvrir (paysages, personnes, objets…).</p>
        <p class="form-error" role="alert" hidden>Merci de remplir les champs marqués d'une étoile.</p>
        <p><button class="btn btn-wine" type="submit">Valider ma demande ${icon.arrow}</button></p>
      </form>
      <div class="form-done" hidden tabindex="-1">
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="m15 27 7 7 15-15"/></svg>
        <h3>Votre demande est prête</h3>
        <p>Votre messagerie s'est ouverte avec votre demande : ajoutez vos photos et envoyez. Rien ne s'est ouvert ? Écrivez à <a href="mailto:${MAIL}">${MAIL}</a>.</p>
        <button class="btn btn-line" type="button" data-again>Nouvelle demande</button>
      </div>
    </div>
  </div>
</section>`;

// ====================================================================== BOUTIQUE
const boutique = `
<section class="soon">
  <span class="wc sage soft" style="width:520px;height:520px;left:-160px;top:6%"></span>
  <span class="wc coral soft" style="width:440px;height:440px;right:-140px;bottom:4%"></span>
  <span class="spark" style="left:12%;top:20%">+</span><span class="spark s2" style="right:16%;top:26%">+</span><span class="spark s3" style="left:22%;bottom:18%">+</span>
  <span class="dots" style="right:12%;bottom:22%"></span>
  <div class="wrap">
    <div class="jar pop"><img src="assets/img/illu-rose-digitale.png" alt=""></div>
    <span class="kicker reveal">Boutique</span>
    <h1 class="display reveal">La boutique est <em>en travaux</em></h1>
    <p class="lead reveal" style="margin:0 auto">Nous préparons de nouvelles pépites pour vous. Revenez très vite pour découvrir nos prochaines créations !</p>
    <div class="pills reveal" style="justify-content:center;margin-top:28px;gap:12px"><a class="btn btn-wine" href="aquarelles-personnalisees.html">Commander une aquarelle ${icon.arrow}</a><a class="btn btn-line" href="${IG}" target="_blank" rel="noopener">Suivre sur Instagram ${icon.ext}</a></div>
    <p class="reveal" style="margin-top:30px;font:500 italic 26px/1 var(--display);color:var(--rose)">~ Karaz Hana</p>
  </div>
</section>`;

// ====================================================================== CONTACT
const contact = `
<section class="phero" style="padding-bottom:30px">
  <span class="wc blush" style="width:520px;height:520px;right:-160px;top:-180px"></span>
  <span class="wc sage soft" style="width:360px;height:360px;left:-150px;bottom:-160px"></span>
  <span class="spark" style="left:6%;top:18%">+</span><span class="spark s2" style="right:10%;top:12%">+</span>
  <div class="wrap">
    <span class="kicker reveal">Échangeons</span>
    <h1 class="display reveal">Parlons de votre <em>projet</em></h1>
    <p class="lead reveal">Une question sur un atelier, une commande en cours, ou simplement l'envie de discuter aquarelle ? Je suis à votre écoute.</p>
  </div>
</section>
<section class="sec" style="padding-top:20px">
  <div class="wrap contact-grid">
    <div class="contact-cards" data-stagger>
      <div class="card pinkc mail-card reveal">
        <span class="card-label">Restons en contact</span>
        <p style="margin:14px 0 6px;color:var(--muted)">E-mail</p>
        <a href="mailto:${MAIL}">${MAIL}</a>
      </div>
      <div class="card sagec reveal">
        <span class="card-label">Suivez mon travail</span>
        <p style="margin-top:10px;color:var(--muted)">Coulisses, inspirations et nouvelles créations… Retrouvez-moi sur les réseaux.</p>
        <div class="soc-list">
          <a href="${IG}" target="_blank" rel="noopener"><span class="icon-btn">${icon.ig}</span>Instagram · @karaz.hana</a>
          <a href="${TT}" target="_blank" rel="noopener"><span class="icon-btn">${icon.tt}</span>TikTok · @hanane.kara</a>
          <a href="${FB}" target="_blank" rel="noopener"><span class="icon-btn">${icon.fb}</span>Facebook</a>
        </div>
      </div>
      <div class="reveal" style="position:relative;max-width:220px;margin:6px auto 0"><img class="float" src="assets/img/illu-rose-digitale.png" alt=""></div>
    </div>
    <div class="card reveal" style="--d:.1s">
      <h2 class="display" style="font-size:clamp(28px,3vw,38px);margin-bottom:20px">Envoyez-moi un <em>message</em></h2>
      <form class="form" data-mail="Message depuis le site" novalidate>
        <div class="row">
          <label>Votre nom *<input name="nom" autocomplete="name" required data-label="Nom"></label>
          <label>Votre e-mail *<input name="email" type="email" autocomplete="email" required data-label="E-mail"></label>
        </div>
        <label>Sujet *<select name="sujet" required data-label="Sujet" data-subject>
          <option value="">Choisissez un sujet…</option>
          <option>Question sur ma commande (Boutique)</option>
          <option>Aquarelles personnalisées (Atelier privé)</option>
          <option>Proposition de collaboration / Partenariat</option>
          <option>Exposition / Stand (votre événement)</option>
          <option>Autre</option>
        </select></label>
        <label>Votre message *<textarea name="message" rows="6" required data-label="Message"></textarea></label>
        <p class="form-error" role="alert" hidden>Merci d'indiquer votre nom, un e-mail valide, un sujet et votre message.</p>
        <p><button class="btn btn-wine" type="submit">Envoyer le message ${icon.arrow}</button></p>
        <p class="form-note">L'envoi ouvre votre messagerie avec le message prêt à partir vers ${MAIL}.</p>
      </form>
      <div class="form-done" hidden tabindex="-1">
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="m15 27 7 7 15-15"/></svg>
        <h3>Votre message est prêt</h3>
        <p>Votre messagerie s'est ouverte : il ne reste qu'à l'envoyer. Rien ne s'est ouvert ? Écrivez à <a href="mailto:${MAIL}">${MAIL}</a>.</p>
        <button class="btn btn-line" type="button" data-again>Nouveau message</button>
      </div>
    </div>
  </div>
</section>`;

const DESC = {
  index: "Karaz Hana, aquarelliste à Tlemcen : aquarelles personnalisées, œuvres uniques, collaborations artistiques et ateliers d'aquarelle ouverts à tous.",
  ateliers: "Ateliers d'aquarelle à thème à Tlemcen, en plein air ou en café littéraire, pour tous les niveaux. Ateliers sur mesure pour vos occasions.",
  perso: 'Transformez vos souvenirs, photos et histoires en aquarelle unique. Commande personnalisée, paiement à la livraison partout en Algérie.',
  boutique: 'La boutique Karaz Hana arrive bientôt : de nouvelles créations en aquarelle.',
  contact: 'Contactez Karaz Hana, aquarelliste : commandes, ateliers, collaborations et expositions.',
};
const files = [
  { file: 'index.html', title: 'Karaz Hana | Artiste aquarelliste', description: DESC.index, body: accueil },
  { file: 'ateliers.html', title: "Ateliers d'aquarelle | Karaz Hana", description: DESC.ateliers, body: ateliers },
  { file: 'aquarelles-personnalisees.html', title: 'Aquarelles personnalisées | Karaz Hana', description: DESC.perso, body: perso },
  { file: 'boutique.html', title: 'Boutique | Karaz Hana', description: DESC.boutique, body: boutique },
  { file: 'contact.html', title: 'Contact | Karaz Hana', description: DESC.contact, body: contact },
];
for (const f of files) fs.writeFileSync(path.join(OUT, f.file), layout(f));
console.log('built', files.map((f) => f.file).join(', '));
