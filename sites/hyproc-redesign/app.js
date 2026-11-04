/* Hyproc Shipping Company — site bilingue FR / EN (routage par hash, #/en/... pour l'anglais) */

let LANG='fr';
const T=(fr,en)=>LANG==='en'?en:fr;
const R=(p='')=>'#/'+(LANG==='en'?'en/':'')+p;
const IMG='assets/img/';
const img=(f,alt='')=>`<img src="${f.startsWith('assets/')?f:IMG+f}" alt="${alt}" loading="lazy" onerror="this.style.display='none'">`;
const fmt=n=>n.toLocaleString(LANG==='en'?'en-GB':'fr-FR');
const dec=n=>String(n).replace('.',LANG==='en'?'.':',');
const pad=n=>String(n).padStart(2,'0');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const arrow=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const H2=t=>`<h2 style="font-size:clamp(28px,3.2vw,40px);margin:14px 0 20px">${t}</h2>`;

/* ---------- Icons ---------- */
const ICONS={
  lng:'<path d="M12 2s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/><path d="M12 18a3 3 0 01-3-3"/>',
  lpg:'<rect x="6" y="4" width="12" height="17" rx="5"/><path d="M9 4V2h6v2"/>',
  oil:'<path d="M3 17h18l-2 4H5z"/><path d="M6 17V9h12v8"/><path d="M9 9V5h6v4"/>',
  road:'<path d="M4 21L9 3M20 21L15 3M12 6v2M12 11v2M12 16v2"/>',
  anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0014 0M8 11h8"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  leaf:'<path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5"/>',
  ship:'<path d="M2 20c2 1 4 1 6 0s4-1 6 0 4 1 6 0"/><path d="M4 17l-1-4h18l-1 4"/><path d="M7 13V8h10v5M12 8V4"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  users:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/>',
  mega:'<path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/>',
  star:'<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  monitor:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  file:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
  ext:'<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>'
};
const ic=(k,s=24)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

/* ---------- Data ---------- */
const TYPES={lng:['GNL','LNG'],lpg:['GPL','LPG'],bit:['Bitumier','Bitumen carrier'],oil:['Pétrolier / Chimiquier','Oil / chemical tanker']};
const tl=k=>T(...TYPES[k]);
const FLEET=[
  {n:'Ougarta',t:'lng',cls:'Lloyd’s Register',cap:171800,prop:'27 780 kW',l:291.5,grt:'112 867',nrt:'35 325',dwt:'94 575',crew:32,img:'ougarta2.jpg'},
  {n:'Tessala',t:'lng',cls:'Lloyd’s Register',cap:171800,prop:'27 780 kW',l:291.5,grt:'112 867',nrt:'35 325',dwt:'94 575',crew:32,img:'tessala2.jpg'},
  {n:'Lalla Fatma N’Soumer',t:'lng',cls:'Bureau Veritas',cap:145445,prop:'ST / 26 496 kW',l:289.5,grt:'118 363',nrt:'35 508',dwt:'80 920',crew:31,img:'lfn.jpg',jv:'ANGTC'},
  {n:'Cheikh Bouamama',t:'lng',cls:'Bureau Veritas',cap:75500,prop:'ST / 13 500 kW',l:220,grt:'53 500',nrt:'16 050',dwt:'44 250',crew:28,img:'assets/cheikh-bouamama.jpg',jv:'SLTC'},
  {n:'Cheikh El Mokrani',t:'lng',cls:'Bureau Veritas',cap:75500,prop:'ST / 13 500 kW',l:220,grt:'53 500',nrt:'16 050',dwt:'44 250',crew:28,img:'mokrani.jpg',jv:'MLTC'},
  {n:'Berga II',t:'lpg',cls:'Lloyd’s Register',cap:35000,prop:'DM / 9 960 kW',l:174.2,grt:'23 059',nrt:'6 917',dwt:'22 450',crew:32,img:'berga2.jpg'},
  {n:'Rhourd El Farès',t:'lpg',cls:'Lloyd’s Register',cap:35000,prop:'DM / 9 960 kW',l:174.2,grt:'23 059',nrt:'6 914',dwt:'22 450',crew:32,img:'relfares.jpg'},
  {n:'Rhourd El Adra',t:'lpg',cls:'Bureau Veritas',cap:22500,prop:'DM / 7 280 kW',l:156,grt:'16 800',nrt:'5 100',dwt:'19 400',crew:30,img:'radra.jpg'},
  {n:'Rhourd El Hamra',t:'lpg',cls:'Bureau Veritas',cap:22500,prop:'DM / 7 280 kW',l:156,grt:'16 800',nrt:'5 100',dwt:'19 400',crew:30,img:'rhamra.jpg'},
  {n:'Hassi Berkine',t:'lpg',cls:'Bureau Veritas',cap:13000,prop:'DM / 4 920 kW',l:146.2,grt:'12 293',nrt:'3 687',dwt:'9 500',crew:23,img:'hassiberkine2.jpg'},
  {n:'Hassi Touareg',t:'lpg',cls:'Bureau Veritas',cap:13000,prop:'DM / 4 920 kW',l:146.2,grt:'12 293',nrt:'3 687',dwt:'9 500',crew:23,img:'hassitouareg.jpg'},
  {n:'Ain Zeft',t:'bit',cls:'Germanischer Lloyd',cap:4577,prop:'DM / 2 880 kW',l:108.5,grt:'4 243',nrt:'1 273',dwt:'4 999',crew:17,img:'azeft.jpg'},
  {n:'Ras Tomb',t:'bit',cls:'Germanischer Lloyd',cap:4577,prop:'DM / 2 880 kW',l:108.5,grt:'4 243',nrt:'1 273',dwt:'4 999',crew:17,img:'rtomb.jpg'},
  {n:'In Ecker',t:'oil',cls:'Bureau Veritas',cap:46500,prop:'DM / 8 590 kW',l:183.06,grt:'26 371',nrt:'10 176',dwt:'39 971',crew:24,img:'inecker.jpg'}
];
const MAXCAP=171800;

const FIG={years:[2023,2024,2025],total:[23473,25056,25721],rows:[
  [['Transport GPL','LPG shipping'],[10090,11604,10595]],
  [['Transport GNL','LNG shipping'],[7948,7617,7512]],
  [['Produits raffinés','Refined products'],[3697,4060,5745]],
  [['Shipmanagement','Ship management'],[1305,1357,1421]],
  [['Consignation','Ship agency'],[356,338,355]],
  [['Prestations CAP-HYPROC','CAP-HYPROC services'],[77,78,92]]]};

const MODULES=[['Préparation aux inspections VETTING','Vetting inspection preparation'],['Hygiène alimentaire','Food hygiene'],['AmosII — Basic','AmosII — Basic'],['AmosII — Avancé','AmosII — Advanced'],['Problem analysis within organization','Problem analysis within organization'],['Techniques de communication','Communication techniques'],['QMS HYPROC (système intégré)','Hyproc QMS (integrated system)'],['High Voltage','High Voltage'],['La veille maritime','Maritime watchkeeping'],['Maîtrise de la SOLAS','Mastering SOLAS'],['Maîtrise de la MARPOL','Mastering MARPOL'],['Gestion des certificats à bord','Managing certificates on board'],['Contrôle PSC','Port State Control'],['Le matelotage','Seamanship'],['Gestion des risques','Risk management'],['MS Excel — Perfectionnement','MS Excel — Advanced'],['MS Word — Perfectionnement','MS Word — Advanced'],['MS PowerPoint — Perfectionnement','MS PowerPoint — Advanced'],['MS Outlook — Perfectionnement','MS Outlook — Advanced']];

const AGENCIES=[
  [['Hyproc Agent — Direction','Hyproc Agent — Head office'],'3 Rue Abdeslam Takarli, El-Biar, Alger — BP 201','+213 23 06 98 07','dra@hyproc.dz',['Pilotage des agences','Agency management']],
  [['Agence d’Arzew','Arzew agency'],'01, Boulevard Émir Abdelkader, 31200 Arzew, Oran','+213 41 79 22 39','arzew-agency@hyproc.dz',['Arzew, Béthioua, Oran, Mostaganem, Ghazaouet','Arzew, Béthioua, Oran, Mostaganem, Ghazaouet']],
  [['Agence d’Alger','Algiers agency'],'Lotissement J8 n°154, Hay El Hayat, Kouba, Alger','+213 23 80 44 26','alger-agency@hyproc.com',['Port d’Alger','Port of Algiers']],
  [['Agence de Béjaïa','Béjaïa agency'],'Immeuble Ziani, 4ᵉ étage, Rue Ahmed Boumeda, Cité Tobal — BP 311/R','+213 34 12 74 18','bejaia-agency@hyproc.com',['Port de Béjaïa','Port of Béjaïa']],
  [['Agence de Skikda','Skikda agency'],'Bd Houari Boumediene, BT 10, 1ᵉʳ étage — BP 213, 21000 Skikda','+213 38 70 13 75','skikda-agency@hyproc.dz',['Skikda, Annaba','Skikda, Annaba']]];

const SITES=[
  [['Siège social','Head office'],['Siège administratif','Administrative headquarters'],'Zhun USTO — BP 7200 Es-Seddikia, 31000 Oran','+213 41 82 15 15','+213 41 82 18 18','contact@hyproc.dz'],
  [['Division opérationnelle','Operations division'],['Arzew','Arzew'],'BP 60 Zone Industrielle Arzew, 31200 Oran','+213 41 79 38 55','+213 41 79 34 45','contact@hyproc.dz'],
  [['Centre de formation','Training centre'],['CAP Hyproc','CAP Hyproc'],'Zone Extension Touristique, 27000 Sablette, Mostaganem','+213 45 42 01 01','+213 45 42 02 19','cap.schooling@hyproc.dz']];

const NEWS_CATS={qhse:['Qualité & sécurité','Quality & safety'],formation:['Formation','Training'],groupe:['Groupe Sonatrach','Sonatrach Group'],social:['Engagement social','Community'],sante:['Santé','Health'],evenement:['Événement','Event'],publication:['Publication','Publication']};
const NEWS=[
  ['31122024.jpg','2024-12-31','qhse','Renouvellement du Document of Compliance (DOC) — Code ISM','ISM Code Document of Compliance (DOC) renewed'],
  ['13062022.jpg','2022-06-13','groupe','Rencontre sur le Code d’éthique avec les filiales du Groupe Sonatrach','Code of Ethics meeting with Sonatrach Group subsidiaries'],
  ['07062022.jpg','2022-06-07','groupe','Le Président Directeur Général de Sonatrach rend visite au CAP-HYPROC à Mostaganem','Sonatrach’s Chairman & CEO visits CAP-HYPROC in Mostaganem'],
  ['02062022.jpg','2022-06-02','social','Cérémonie en l’honneur des enfants des travailleurs lauréats du baccalauréat (sessions 2020 et 2021)','Ceremony honouring employees’ children who passed the baccalaureate (2020 and 2021)'],
  ['01062022.jpg','2022-06-01','qhse','Exercice d’évacuation sanitaire par hélicoptère à Tarragone avec le MRCC local','Helicopter medical evacuation drill in Tarragona with the local MRCC'],
  ['31052022.jpg','2022-05-31','publication','Bulletin Hyproc — 1er trimestre 2022','Hyproc Bulletin — Q1 2022'],
  ['13042022.jpg','2022-04-13','formation','Formation combinée « Strait and Canal Transit » (SCT) & « Homme de barre »','Combined “Strait and Canal Transit” (SCT) and helmsman training'],
  ['28032022.jpg','2022-03-28','qhse','Audit externe ISM de la compagnie','Company external ISM audit'],
  ['07032022.jpg','2022-03-07','qhse','Certification ISO 9001:2015','ISO 9001:2015 certification'],
  ['20122021.jpg','2021-12-20','evenement','Journée BV Marine & Offshore North Africa','BV Marine & Offshore North Africa day'],
  ['19122021.jpg','2021-12-19','sante','Journée de sensibilisation à la vaccination anti COVID-19 — Oran','COVID-19 vaccination awareness day — Oran'],
  ['08122021.jpg','2021-12-08','sante','Journée de sensibilisation à la vaccination anti COVID-19 — Arzew','COVID-19 vaccination awareness day — Arzew'],
  ['13102021.jpg','2021-10-13','formation','Reprise des formations en présentiel','In-person training resumes'],
  ['23052021.png','2021-05-23','qhse','Exercices d’urgence de sécurité à bord du pétrolier « In Ecker »','Emergency safety drills aboard the tanker In Ecker'],
  ['Parcours_de_formation_Communication_de_crise.jpg','2021','formation','Parcours de formation « Communication de crise »','“Crisis communication” training path'],
  ['Integration_de_la_solution_Moodle_par_le_CAP.jpg','2021','formation','Intégration de la solution Moodle par le CAP','CAP adopts the Moodle e-learning platform'],
  ['Formation_Full_Ecdis_sur_les_simulateurs_du_CAP.jpg','2021','formation','Formation Full ECDIS sur les simulateurs du CAP','Full ECDIS training on the CAP simulators'],
  ['Don_au_foyer_des_personnes_agees_Affak.jpg','2021','social','Don au foyer pour personnes âgées « Affak »','Donation to the Affak home for the elderly'],
  ['Partenariat_Hyproc_Naftal.jpg','2021','groupe','Partenariat Hyproc – Naftal','Hyproc – Naftal partnership'],
  ['07092020.jpg','2020-09-07','social','Don d’équipements médicaux aux hôpitaux EHU d’Oran et EPH d’El Mohgoun','Medical equipment donated to the EHU Oran and EPH El Mohgoun hospitals'],
  ['21082020.jpg','2020-08-21','publication','Qui sont les principaux exportateurs mondiaux de GNL ?','Who are the world’s leading LNG exporters?'],
  ['20082020.jpg','2020-08-20','social','Don à l’Association d’aide aux enfants cancéreux','Donation to the association supporting children with cancer'],
  ['25062020_2.jpg','2020-06-25','sante','COVID-19 : Hyproc met en place des mesures drastiques','COVID-19: Hyproc puts strict measures in place'],
  ['02042020.jpg','2020-04-02','sante','COVID-19 : message du Président Directeur Général','COVID-19: a message from the Chairman & CEO']];
const fdate=d=>d.length===4?d:new Date(d+'T12:00:00').toLocaleDateString(LANG==='en'?'en-GB':'fr-FR',{day:'numeric',month:'long',year:'numeric'});

const BULLETINS={2025:[2,3],2024:[1,2,3,4],2023:[1,2,3,4],2022:[1,2,3,4],2021:[1,2,3,4],2020:[1,2,3]};
const RETROS=[2025,2024,2023,2022,2021,2020,2019,2018,2017];

const KINDS={ao:['Appel d’offres','Call for tenders'],prequalif:['Pré-qualification','Pre-qualification'],shortlist:['Short list','Shortlist'],prorogation:['Prorogation','Deadline extension'],attribution:['Attribution','Award'],infructuosite:['Infructuosité','Unsuccessful'],annulation:['Annulation','Cancellation']};
const DEPTS={MO:'Marine Operations','C&O':'C&O',IT:'IT',CMPI:'CMPI',ADM:'Administration',PMD:'PMD',CAP:'CAP Hyproc',DAMG:'DAMG',CCE:'CCE',HR:['RH','HR']};
const deptLabel=d=>d?(Array.isArray(DEPTS[d])?T(...DEPTS[d]):DEPTS[d]||d):T('Autres','Other');

const CBT_PKGS=['Cyber Security Awareness','Ex Basic International','Galley','High Voltage','Incident Investigation','Safety Officer','Third Party Inspection','Voyage Planning'];

/* ---------- Navigation ---------- */
const NAV=()=>[
  {t:T('Accueil','Home'),h:'',sec:''},
  {t:T('La compagnie','Company'),sec:'compagnie',items:[
    [T('Présentation','Overview'),'compagnie',T('Identité, historique, organisation','Identity, history, organisation')],
    [T('Activités','Activities'),'compagnie/activites',T('GNL, GPL, raffinés, bitume, consignation','LNG, LPG, refined products, bitumen, agency')],
    [T('Chiffres clés','Key figures'),'compagnie/chiffres',T('Chiffre d’affaires 2023 – 2025','Revenue 2023 – 2025')],
    [T('Agences','Agencies'),'compagnie/agences',T('Arzew, Alger, Béjaïa, Skikda','Arzew, Algiers, Béjaïa, Skikda')]]},
  {t:T('Flotte','Fleet'),h:'flotte',sec:'flotte'},
  {t:T('Ressources','Resources'),sec:'ressources',items:[
    [T('Personnel','People'),'ressources',T('1 594 collaborateurs','1,594 employees')],
    [T('Flotte','Fleet'),'flotte',T('14 navires en propriété et partenariat','14 owned and partnership vessels')]]},
  {t:T('Qualité','Quality'),sec:'qualite',items:[
    [T('Système QMS','QMS system'),'qualite',T('ISM, ISPS, MLC 2006, audits','ISM, ISPS, MLC 2006, audits')],
    [T('Politique QHSE','QHSE policy'),'qualite/politique-qhse',T('Qualité, santé, sécurité, environnement','Quality, health, safety, environment')],
    [T('Politique de communication','Communication policy'),'qualite/communication',T('Objectifs, moyens, engagements','Objectives, means, commitments')]]},
  {t:T('Filiales & JV','Subsidiaries & JV'),h:'filiales',sec:'filiales'},
  {t:'CAP Hyproc',sec:'cap',items:[
    [T('Le centre de formation','The training centre'),'cap',T('Simulateurs, CBT, modules, accueil','Simulators, CBT, courses, facilities')],
    ['CBT Online','cap/cbt-online',T('Formation en ligne Seagull','Seagull e-learning')]]},
  {t:T('Informations','News & info'),sec:'informations',items:[
    [T('Publications','Publications'),'informations/publications',T('Actualités et bulletins Hyproc News','News and Hyproc News bulletins')],
    [T('Appels d’offres','Tenders'),'informations/appels-offres',T('Avis et consultations','Notices and consultations')],
    [T('Recrutement','Careers'),'informations/recrutement',T('Annonces et candidatures','Openings and applications')],
    [T('Rapport de gestion','Management report'),'informations/rapport',T('Résultats annuels','Annual results')],
    [T('Contacts','Contacts'),'contact',T('Sièges, agences, centre de formation','Offices, agencies, training centre')]]}
];

/* ---------- Shared bits ---------- */
const pageHero=(crumb,title,lead,bg,extra='')=>`
<section class="phero">${bg?`<div class="bg" style="background-image:url('${bg.startsWith('assets/')?bg:IMG+bg}')"></div>`:''}
  <div class="wrap">
    <div class="crumbs"><a href="${R()}">${T('Accueil','Home')}</a><span>/</span><span>${crumb}</span></div>
    <h1>${title}</h1><p>${lead}</p>${extra}
  </div>
</section>`;
const subnav=(items,cur)=>`<nav class="subnav"><div class="wrap">${items.map(([t,p])=>`<a href="${R(p)}" class="${p===cur?'on':''}">${t}</a>`).join('')}</div></nav>`;
const CO_SUB=()=>[[T('Présentation','Overview'),'compagnie'],[T('Activités','Activities'),'compagnie/activites'],[T('Chiffres clés','Key figures'),'compagnie/chiffres'],[T('Agences','Agencies'),'compagnie/agences']];
const Q_SUB=()=>[[T('Système QMS','QMS system'),'qualite'],[T('Politique QHSE','QHSE policy'),'qualite/politique-qhse'],[T('Politique de communication','Communication policy'),'qualite/communication']];
const I_SUB=()=>[[T('Publications','Publications'),'informations/publications'],[T('Appels d’offres','Tenders'),'informations/appels-offres'],[T('Recrutement','Careers'),'informations/recrutement'],[T('Rapport de gestion','Management report'),'informations/rapport'],[T('Contacts','Contacts'),'contact']];
const CAP_SUB=()=>[[T('Le centre','The centre'),'cap'],['CBT Online','cap/cbt-online']];
const requestLink=(kind,ref)=>R('contact')+'?sujet='+kind+'&ref='+encodeURIComponent(ref.slice(0,160));

const ctaBand=()=>`
<section class="s"><div class="wrap"><div class="band rv">
  <div><h2>${T('Un projet de transport, une consultation, une formation ?','A shipping project, a tender, a training need?')}</h2><p>${T('Nos équipes à Oran, Arzew et Mostaganem vous répondent.','Our teams in Oran, Arzew and Mostaganem are here to help.')}</p></div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;position:relative"><a href="${R('contact')}" class="btn btn-flame">${T('Nous contacter','Contact us')} ${arrow}</a><a href="${R('informations/appels-offres')}" class="btn btn-ghost">${T('Appels d’offres','Tenders')}</a></div>
</div></div></section>`;

const shipCard=(s,i)=>`
<button class="card hover ship rv" data-ship="${i}">
  <div class="img">${img(s.img,s.n)}<span class="tag">${tl(s.t)}</span></div>
  <div class="body">
    <h3>${s.n}</h3>
    <div class="specs"><div><b>${fmt(s.cap)}</b>m³</div><div><b>${dec(s.l)}</b>m ${T('LHT','LOA')}</div><div><b>${s.crew}</b>${T('équipage','crew')}</div></div>
    <div class="cap-bar"><i style="width:${Math.max(4,s.cap/MAXCAP*100)}%"></i></div>
  </div>
</button>`;
const newsCard=(n,i)=>`
<button class="card hover news-card rv" data-news="${i}">
  <div class="img">${img('news/'+n[0],'')}</div>
  <div class="body"><span class="tag">${T(...NEWS_CATS[n[2]])}</span><time>${fdate(n[1])}</time><h3>${T(n[3],n[4])}</h3></div>
</button>`;

/* ---------- Pages ---------- */
const P={};

const SLIDES=()=>[
  {bg:'assets/cheikh-bouamama.jpg',pos:'center 62%',k:T('Filiale du Groupe Sonatrach','A Sonatrach Group company'),tab:T('La compagnie','The company'),
   h:T('Acheminer l’énergie <em>algérienne</em> vers le monde.','Carrying <em>Algerian</em> energy to the world.'),
   p:T('Depuis plus de 44 ans, Hyproc Shipping Company transporte le GNL, le GPL, les produits raffinés, chimiques et le bitume — en trafic international comme en cabotage national.','For more than 44 years, Hyproc Shipping Company has carried LNG, LPG, refined products, chemicals and bitumen — on international routes and along the Algerian coast.'),
   c:[[T('Découvrir la flotte','Explore the fleet'),'flotte'],[T('Qui sommes-nous ?','About us'),'compagnie']],cap:T('Méthanier Cheikh Bouamama — 75 500 m³','LNG carrier Cheikh Bouamama — 75,500 m³')},
  {bg:IMG+'slide1.jpg',k:T('Transport de GNL','LNG shipping'),tab:T('Flotte GNL','LNG fleet'),
   h:T('<em>640 045 m³</em> de capacité GNL au service de l’export.','<em>640,045 m³</em> of LNG capacity serving exports.'),
   p:T('Cinq méthaniers chargent aux terminaux d’Arzew et de Skikda à destination des clients de Sonatrach en Méditerranée et au-delà.','Five LNG carriers load at the Arzew and Skikda terminals for Sonatrach’s customers across the Mediterranean and beyond.'),
   c:[[T('Nos activités','Our activities'),'compagnie/activites'],[T('Fiches navires','Vessel data'),'flotte']],cap:T('Terminaux d’Arzew & Skikda','Arzew & Skikda terminals')},
  {bg:IMG+'slide2.jpg',k:T('Consignation & shipmanagement','Ship agency & management'),tab:T('Escales','Port calls'),
   h:T('Près de <em>2 000 escales</em> prises en charge chaque année.','Nearly <em>2,000 port calls</em> handled every year.'),
   p:T('Hyproc Agent pilote quatre agences portuaires certifiées ISO 9001:2015 à Arzew, Alger, Béjaïa et Skikda.','Hyproc Agent runs four ISO 9001:2015-certified port agencies in Arzew, Algiers, Béjaïa and Skikda.'),
   c:[[T('Nos agences','Our agencies'),'compagnie/agences'],[T('Nous contacter','Contact us'),'contact']],cap:T('4 agences · 9 ports desservis','4 agencies · 9 ports served')},
  {bg:IMG+'slide3.jpg',k:T('CAP Hyproc · Mostaganem','CAP Hyproc · Mostaganem'),tab:T('Formation','Training'),
   h:T('Former les gens de mer aux <em>standards internationaux</em>.','Training seafarers to <em>international standards</em>.'),
   p:T('Simulateurs passerelle Classe A, laboratoires CBT et un catalogue de modules construit sur les exigences PSC et Vetting.','Class A bridge simulators, CBT labs and a course catalogue built around PSC and Vetting requirements.'),
   c:[[T('Découvrir le CAP','Discover CAP'),'cap'],[T('Nos ressources','Our people'),'ressources']],cap:T('Simulateurs DNVGL-ST-0033 Classe A','DNVGL-ST-0033 Class A simulators')}];
const chev=d=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="${d?'M9 6l6 6-6 6':'M15 6l-6 6 6 6'}"/></svg>`;

P.home=()=>{const S=SLIDES();return `
<section class="hero" id="hero">
  <div class="slides">${S.map((x,i)=>`<div class="${i?'':'on'}" style="background-image:url('${x.bg}');--pos:${x.pos||'center'}"></div>`).join('')}</div>
  <div class="hero-cap"><span></span><em style="font-style:normal" id="hcap">${S[0].cap}</em></div>
  <div class="wrap">
    <div class="hero-copy">${S.map((x,i)=>`
      <article class="${i?'':'on'}" aria-hidden="${i?'true':'false'}">
        <span class="eyebrow">${x.k}</span>
        ${i?`<h2 class="h1like">${x.h}</h2>`:`<h1>${x.h}</h1>`}
        <p class="lead">${x.p}</p>
        <div class="ctas"><a href="${R(x.c[0][1])}" class="btn btn-flame">${x.c[0][0]} ${arrow}</a><a href="${R(x.c[1][1])}" class="btn btn-ghost">${x.c[1][0]}</a></div>
      </article>`).join('')}</div>
    <div class="hero-ctrl">
      <div class="prog" id="prog">${S.map((x,i)=>`<button class="${i?'':'on'}" aria-label="${x.tab}"><i></i><b>${pad(i+1)}</b>${x.tab}</button>`).join('')}</div>
      <div class="arrows">
        <button id="hprev" aria-label="${T('Précédent','Previous')}">${chev(0)}</button>
        <span class="count"><b id="hcur">01</b> / ${pad(S.length)}</span>
        <button id="hnext" aria-label="${T('Suivant','Next')}">${chev(1)}</button>
      </div>
    </div>
  </div>
</section>

<section class="kpis"><div class="wrap"><div class="grid g4">
  ${[['cal','var(--green-500)',44,'',T('ans d’expérience','years of experience'),T('Depuis la SNTM-HYPROC, 1982','Since SNTM-HYPROC, 1982')],
     ['ship','var(--red)',14,'',T('navires gérés','vessels managed'),T('5 GNL · 6 GPL · 2 bitumiers · 1 pétrolier','5 LNG · 6 LPG · 2 bitumen · 1 tanker')],
     ['lng','var(--blue)',640045,'m³',T('capacité GNL','LNG capacity'),T('Plus de 410 M m³ de GNL livrés','Over 410 million m³ of LNG delivered')],
     ['anchor','var(--green-500)',2000,'',T('escales par an','port calls a year'),T('4 agences de consignation','4 ship agencies')]]
    .map(([k,c,n,u,l,sub],i)=>`<div class="kpi rv" style="--c:${c}"><div class="k-ico">${ic(k,22)}</div>
      <b><span data-count="${n}" ${i===3?'data-pre="~"':''}>0</span>${u?`<small>${u}</small>`:''}</b>
      <span class="k-lbl">${l}</span><span class="k-sub">${sub}</span></div>`).join('')}
</div></div></section>

<section class="s"><div class="wrap split">
  <div class="rv">
    <span class="eyebrow">${T('Qui sommes-nous','About us')}</span>
    <h2 style="font-size:clamp(30px,3.6vw,46px);margin:14px 0 20px">${T('Un maillon décisif de la chaîne gaz algérienne.','A key link in Algeria’s gas chain.')}</h2>
    <div class="prose">
      <p>${T('Pionnière dans le transport de GNL, Hyproc capitalise plus de 44 ans d’expérience et cumule plus de 410 millions de m³ de GNL livrés dans le monde, à travers plus de 4 500 voyages.','A pioneer of LNG shipping, Hyproc draws on more than 44 years of experience and has delivered over 410 million m³ of LNG worldwide across more than 4,500 voyages.')}</p>
      <p>${T('Le transport maritime de GNL représente l’activité principale de la compagnie et contribue à la valorisation du gaz naturel algérien exporté.','LNG shipping is the company’s core business and helps add value to Algeria’s natural gas exports.')}</p>
    </div>
    <a href="${R('compagnie')}" class="more">${T('Présentation complète','Full company overview')} ${arrow}</a>
  </div>
  <div class="media rv">${img('siege-presentation.jpg','')}
    <div class="badge"><b>${T('40 Mds DA','DZD 40 bn')}</b><span>${T('de capital social','share capital')}</span></div></div>
</div></section>

<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Nos activités','What we do')}</span><h2>${T('Un savoir-faire complet du transport maritime.','End-to-end maritime transport expertise.')}</h2></div>
    <p>${T('Du méthanier au bitumier, de l’escale portuaire au shipmanagement : une offre intégrée au service de Sonatrach, Naftal et de nos partenaires.','From LNG carriers to bitumen tankers, from port calls to ship management: an integrated offer for Sonatrach, Naftal and our partners.')}</p></div>
  <div class="grid g3">${ACTS().map(([k,t,d])=>`<div class="card hover rv"><div class="ico">${ic(k)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="s"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('La flotte','The fleet')}</span><h2>${T('14 navires, une capacité au service de l’export.','14 vessels, built for export.')}</h2></div>
    <a href="${R('flotte')}" class="btn btn-line">${T('Voir toute la flotte','View the whole fleet')} ${arrow}</a></div>
  <div class="grid g3">${FLEET.slice(0,3).map((s,i)=>shipCard(s,i)).join('')}</div>
</div></section>

<section class="s dark"><div class="wrap split">
  <div class="rv">
    <span class="eyebrow">${T('Destinations','Destinations')}</span>
    <h2 style="font-size:clamp(30px,3.6vw,46px);margin:14px 0 18px">${T('Le GNL algérien livré à travers la Méditerranée et au-delà.','Algerian LNG delivered across the Mediterranean and beyond.')}</h2>
    <p style="color:rgba(255,255,255,.72);max-width:50ch">${T('Principaux pays livrés par la flotte GNL de Hyproc.','Main countries served by Hyproc’s LNG fleet.')}</p>
    <div class="dest">${T('Turquie,Espagne,Italie,France,Égypte,Angleterre,Croatie,Pays-Bas,Albanie','Turkey,Spain,Italy,France,Egypt,England,Croatia,Netherlands,Albania').split(',').map(c=>`<span>${c}</span>`).join('')}</div>
  </div>
  <div class="media rv" style="aspect-ratio:5/4">${img('carte.jpg','')}</div>
</div></section>

<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Actualités','News')}</span><h2>${T('Les dernières nouvelles de Hyproc.','Latest from Hyproc.')}</h2></div>
    <a href="${R('informations/publications')}" class="btn btn-line">${T('Toutes les publications','All publications')} ${arrow}</a></div>
  <div class="grid g3">${NEWS.slice(0,3).map((n,i)=>newsCard(n,i)).join('')}</div>
</div></section>

<section class="s"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Explorer','Explore')}</span><h2>${T('Tout Hyproc, en un coup d’œil.','Hyproc at a glance.')}</h2></div></div>
  <div class="grid g3">
    ${[['carre/2-ressources.jpg',T('Nos ressources','Our people'),T('1 594 collaborateurs, dont 902 navigants.','1,594 employees, including 902 seafarers.'),'ressources'],
       ['carre/3-qhse.jpg',T('Qualité & QHSE','Quality & QHSE'),T('ISM, ISPS, MLC 2006 — audité par Bureau Veritas.','ISM, ISPS, MLC 2006 — audited by Bureau Veritas.'),'qualite'],
       ['carre/4-filiales.jpg',T('Filiales & JV','Subsidiaries & JV'),'NSS, ANGTC, MLTC & SLTC.','filiales'],
       ['carre/5-cap.jpg','CAP Hyproc',T('Centre de formation aux métiers de la mer.','Maritime training centre.'),'cap'],
       ['carre/1-compagnie.jpg',T('Appels d’offres','Tenders'),T('Tous les avis et consultations de la compagnie.','All company notices and consultations.'),'informations/appels-offres'],
       ['carre/6-contact.jpg',T('Contacts','Contacts'),T('Sièges, agences et centre de formation.','Offices, agencies and training centre.'),'contact']]
      .map(([f,t,d,h])=>`<a href="${R(h)}" class="tile rv">${img(f,'')}<div class="c"><h3>${t}</h3><p>${d}</p></div></a>`).join('')}
  </div>
</div></section>
${ctaBand()}`};

const ACTS=()=>[['lng',T('Transport de GNL','LNG shipping'),T('Notre cœur de métier : 5 méthaniers chargeant à Arzew et Skikda pour les clients de Sonatrach.','Our core business: 5 LNG carriers loading at Arzew and Skikda for Sonatrach’s customers.')],
  ['lpg',T('Transport de GPL','LPG shipping'),T('6 navires assurant cabotage national et trafic international.','6 vessels serving domestic coastal and international trades.')],
  ['oil',T('Produits raffinés & chimiques','Refined products & chemicals'),T('Transport et affrètement de navires pour les produits pétroliers et chimiques.','Shipping and chartering for petroleum and chemical products.')],
  ['road',T('Bitume','Bitumen'),T('2 navires bitumiers dédiés au transport du bitume.','2 dedicated bitumen carriers.')],
  ['anchor',T('Consignation','Ship agency'),T('4 agences portuaires — près de 2 000 escales prises en charge chaque année.','4 port agencies — nearly 2,000 port calls handled each year.')],
  ['gear',T('Shipmanagement','Ship management'),T('Gestion technique et nautique de navires pour compte de tiers.','Technical and nautical management of vessels for third parties.')]];

P.compagnie=()=>`
${pageHero(T('La compagnie','Company'),T('Une compagnie née de la mer, au service de l’énergie.','A company born of the sea, serving energy.'),T('Filiale à 100% du Groupe Sonatrach, Hyproc SC est un acteur clé de la stratégie de valorisation et de commercialisation des hydrocarbures algériens.','A wholly owned subsidiary of the Sonatrach Group, Hyproc SC plays a key role in marketing and adding value to Algerian hydrocarbons.'),'siege-presentation.jpg')}
${subnav(CO_SUB(),'compagnie')}
<section class="s"><div class="wrap split">
  <div class="prose rv">
    <span class="eyebrow">${T('Identification','Identity')}</span>${H2(T('Un actionnaire, une mission.','One shareholder, one mission.'))}
    <p>${T('Hyproc Shipping Company est une société par actions au capital de <b>40 milliards de dinars</b>, détenu entièrement par la Société de Valorisation des Hydrocarbures (SVH) agissant pour le compte du Groupe Sonatrach.','Hyproc Shipping Company is a joint-stock company with share capital of <b>DZD 40 billion</b>, wholly held by the Société de Valorisation des Hydrocarbures (SVH) on behalf of the Sonatrach Group.')}</p>
    <p>${T('Sonatrach occupe le 2ᵉ rang mondial des exportateurs de GPL et le 7ᵉ rang mondial des exportateurs de GNL. Hyproc s’est imposée comme un maillon décisif de cette chaîne.','Sonatrach is the world’s 2nd-largest LPG exporter and 7th-largest LNG exporter, and Hyproc has become a key link in that chain.')}</p>
    <p>${T('Le siège social est situé à la Zone des Sièges ZHUN-USTO à Oran ; les divisions opérationnelles sont implantées à Arzew, au plus près de la flotte et du personnel navigant.','The head office is in the ZHUN-USTO business district in Oran; operations divisions are based in Arzew, close to the fleet and its crews.')}</p>
  </div>
  <div class="grid g2 rv">
    ${[[T('40 Mds','40 bn'),T('DA de capital','DZD share capital')],['100%',T('Groupe Sonatrach','Sonatrach Group')],['1982',T('Année de création','Year founded')],['14',T('Navires gérés','Vessels managed')]].map(([b,s])=>`<div class="card"><b style="font-family:var(--head);font-size:34px;display:block;letter-spacing:-.03em">${b}</b><span style="color:var(--ink-2)">${s}</span></div>`).join('')}
  </div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Historique','History')}</span><h2>${T('Quatre décennies d’évolution.','Four decades of change.')}</h2></div></div>
  <div class="tl rv">
    <div><b>1982</b><p>${T('Création de la SNTM-HYPROC par le décret n° 82-282 du 14 août 1982.','SNTM-HYPROC is founded by decree no. 82-282 of 14 August 1982.')}</p></div>
    <div><b>1995</b><p>${T('Transformation des statuts en société par actions (SPA).','Becomes a joint-stock company (SPA).')}</p></div>
    <div><b>1997</b><p>${T('Devient filiale à 100% du Groupe Sonatrach, sous tutelle du holding SIP.','Becomes a wholly owned Sonatrach subsidiary under the SIP holding.')}</p></div>
    <div><b>2001</b><p>${T('Intègre le holding Société de Valorisation des Hydrocarbures (SVH).','Joins the Société de Valorisation des Hydrocarbures (SVH) holding.')}</p></div>
    <div><b>2003</b><p>${T('SNTM-HYPROC devient <b>Hyproc Shipping Company</b>.','SNTM-HYPROC becomes <b>Hyproc Shipping Company</b>.')}</p></div>
  </div>
</div></section>
<section class="s"><div class="wrap split">
  <div class="rv"><span class="eyebrow">${T('Organisation','Organisation')}</span>${H2(T('Front office, back office, une seule flotte.','Front office, back office, one fleet.'))}
    <p style="color:var(--ink-2)">${T('Une organisation évolutive axée sur le transport maritime et le shipmanagement. Des unités opérationnelles et de soutien sont implantées à Arzew pour répondre aux besoins des navires.','A flexible organisation focused on shipping and ship management, with operational and support units in Arzew to meet the vessels’ needs.')}</p></div>
  <div class="mods rv" style="margin:0">${['Marine Operations','Finance & Business Control','Tax & Legal','Human Resources','Administration','Audit & Conformity','QHSE','IT'].map(d=>`<span>${d}</span>`).join('')}</div>
</div></section>
${ctaBand()}`;

P.activites=()=>`
${pageHero(T('La compagnie / Activités','Company / Activities'),T('Nos activités','Our activities'),T('Transport maritime des hydrocarbures, des produits chimiques et du bitume, consignation de navires et shipmanagement.','Seaborne transport of hydrocarbons, chemicals and bitumen, ship agency and ship management.'),'slide2.jpg')}
${subnav(CO_SUB(),'compagnie/activites')}
<section class="s"><div class="wrap split">
  <div class="prose rv">
    <span class="eyebrow">${T('Activité principale','Core business')}</span>${H2(T('Le GNL, en volume comme en valeur.','LNG leads in volume and value.'))}
    <p>${T('Le transport du GNL constitue un maillon essentiel de la chaîne gaz et contribue à la valorisation du gaz naturel algérien exporté.','LNG shipping is an essential link in the gas chain and adds value to Algeria’s natural gas exports.')}</p>
    <p>${T('La capacité de transport GNL de la flotte est de <b>640 045 m³</b>, une part importante du tonnage de la flotte marchande algérienne.','The fleet’s LNG capacity is <b>640,045 m³</b>, a significant share of Algeria’s merchant fleet tonnage.')}</p>
    <p>${T('Hyproc assure également l’affrètement de navires transporteurs de produits pétroliers et chimiques pour répondre aux besoins de Sonatrach et Naftal : plusieurs navires sont affrétés chaque exercice pour les produits raffinés et le GPL.','Hyproc also charters petroleum and chemical carriers for Sonatrach and Naftal, with several vessels chartered each year for refined products and LPG.')}</p>
  </div>
  <div class="media rv">${img('carte.jpg','')}<div class="badge"><b>${fmt(640045)} m³</b><span>${T('capacité GNL','LNG capacity')}</span></div></div>
</div></section>
<section class="s alt"><div class="wrap"><div class="grid g3">
  ${ACTS().map(([k,t,d])=>`<div class="card rv"><div class="ico">${ic(k)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
</div></div></section>
${ctaBand()}`;

P.chiffres=()=>`
${pageHero(T('La compagnie / Chiffres clés','Company / Key figures'),T('Chiffres clés','Key figures'),T('Chiffre d’affaires et répartition par activité, en millions de dinars (DZD).','Revenue and breakdown by activity, in millions of dinars (DZD).'),'slide3.jpg')}
${subnav(CO_SUB(),'compagnie/chiffres')}
<section class="s"><div class="wrap">
  <div class="card rv" style="padding:36px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap">
      <div><span style="color:var(--ink-3);font-size:14px">${T('Chiffre d’affaires total','Total revenue')}</span>
        <div class="total"><b id="tot">—</b><span style="color:var(--ink-3)">${T('M DZD','DZD m')}</span><span class="delta" id="delta"></span></div></div>
      <div class="yr" id="yr-tog">${FIG.years.map((y,i)=>`<button data-i="${i}" class="${i===2?'on':''}">${y}</button>`).join('')}</div>
    </div>
    <div class="bars" id="bars"></div>
  </div>
  <div class="stats rv" style="margin-top:28px">
    ${FIG.years.map((y,i)=>`<div><b>${fmt(FIG.total[i])}</b><span>${T('CA','Revenue')} ${y} (${T('M DZD','DZD m')})</span></div>`).join('')}
    <div><b>+${dec(9.6)}%</b><span>${T('Croissance 2023 → 2025','Growth 2023 → 2025')}</span></div>
  </div>
</div></section>
${ctaBand()}`;

P.agences=()=>`
${pageHero(T('La compagnie / Agences','Company / Agencies'),T('Agences de consignation','Ship agencies'),T('Quatre agences pilotées par Hyproc Agent, certifiées ISO 9001:2015 par ALICEF Spa, implantées dans les principaux ports algériens.','Four agencies run by Hyproc Agent, ISO 9001:2015-certified by ALICEF Spa, in Algeria’s main ports.'),'agences.jpg')}
${subnav(CO_SUB(),'compagnie/agences')}
<section class="s"><div class="wrap">
  <div class="stats rv" style="margin-bottom:40px">
    <div><b>4</b><span>${T('agences portuaires','port agencies')}</span></div><div><b>~${fmt(2000)}</b><span>${T('escales par an','port calls a year')}</span></div>
    <div><b>9</b><span>${T('ports desservis','ports served')}</span></div><div><b>ISO 9001</b><span>${T('version 2015','2015 edition')}</span></div></div>
  <div class="grid g3">${AGENCIES.map(([n,a,p,e,ports])=>`
    <div class="card contact-card rv"><span class="tag">${T(...ports)}</span><h3>${T(...n)}</h3>
      <dl><div><dt>${T('Adresse','Address')}</dt><dd>${a}</dd></div><div><dt>${T('Téléphone','Phone')}</dt><dd><a href="tel:${p.replace(/\s/g,'')}">${p}</a></dd></div>
      <div><dt>E-mail</dt><dd><a href="mailto:${e}">${e}</a></dd></div></dl></div>`).join('')}</div>
</div></section>
${ctaBand()}`;

P.flotte=()=>`
${pageHero(T('Flotte','Fleet'),T('Notre flotte','Our fleet'),T('14 navires gérés en toute propriété et en partenariat : méthaniers, gaziers GPL, bitumiers et pétrolier/chimiquier.','14 vessels, owned outright or in partnership: LNG carriers, LPG carriers, bitumen carriers and an oil/chemical tanker.'),'slide1.jpg')}
<section class="s"><div class="wrap">
  <div class="stats rv" style="margin-bottom:48px">
    <div><b>5</b><span>${T('méthaniers GNL','LNG carriers')}</span></div><div><b>6</b><span>${T('transporteurs GPL','LPG carriers')}</span></div>
    <div><b>2</b><span>${T('bitumiers','bitumen carriers')}</span></div><div><b>1</b><span>${T('pétrolier / chimiquier','oil / chemical tanker')}</span></div></div>
  <div class="toolbar">
    <div class="chips" id="fchips">${['all','lng','lpg','bit','oil'].map((t,i)=>`<button class="chip ${i?'':'on'}" data-t="${t}">${t==='all'?T('Tous','All'):tl(t)}<i>${t==='all'?FLEET.length:FLEET.filter(s=>s.t===t).length}</i></button>`).join('')}</div>
    <label class="search">${ic('search',18)}<input id="fsearch" placeholder="${T('Rechercher un navire…','Search for a vessel…')}"></label>
  </div>
  <div class="grid g3" id="fgrid"></div>
  <p style="color:var(--ink-3);font-size:13.5px;margin-top:20px">${T('Cliquez sur un navire pour afficher sa fiche technique complète. La barre indique la capacité relative au plus grand méthanier (171 800 m³).','Select a vessel to see its full specifications. The bar shows capacity relative to the largest LNG carrier (171,800 m³).')}</p>
</div></section>
${ctaBand()}`;

P.ressources=()=>`
${pageHero(T('Ressources / Personnel','Resources / People'),T('Les femmes et les hommes de Hyproc','The people of Hyproc'),T('Une compagnie déterminée à progresser en permanence, avec l’adhésion de son personnel.','A company committed to continuous improvement, together with its people.'),'personnel.jpg')}
<section class="s"><div class="wrap">
  <div class="stats rv"><div><b data-count="1594">0</b><span>${T('employés au total','employees in total')}</span></div><div><b data-count="902">0</b><span>${T('personnel navigant','seafarers')}</span></div>
    <div><b data-count="450">0</b><span>${T('officiers','officers')}</span></div><div><b data-count="692">0</b><span>${T('personnel sédentaire','shore-based staff')}</span></div></div>
  <div class="grid g2" style="margin-top:28px">
    <div class="card rv"><h3>${T('Répartition des effectifs','Workforce breakdown')}</h3>
      <div style="display:flex;height:14px;border-radius:14px;overflow:hidden;margin:22px 0 14px"><i style="width:56.6%;background:var(--green-500)"></i><i style="width:43.4%;background:var(--blue)"></i></div>
      <div class="legend"><span><i style="background:var(--green-500)"></i>${T('Navigants — 902 (57%)','Seafarers — 902 (57%)')}</span><span><i style="background:var(--blue)"></i>${T('Sédentaires — 692 (43%)','Shore-based — 692 (43%)')}</span></div></div>
    <div class="card rv"><h3>${T('Encadrement & mixité','Management & diversity')}</h3>
      <ul class="check" style="margin-top:18px"><li>${T('267 cadres et 154 cadres supérieurs parmi le personnel sédentaire','267 managers and 154 senior managers among shore-based staff')}</li><li>${T('245 femmes au sein du personnel sédentaire','245 women among shore-based staff')}</li><li>${T('29 femmes parmi les officiers navigants','29 women among seagoing officers')}</li></ul></div>
  </div>
</div></section>
<section class="s alt"><div class="wrap split">
  <div class="rv"><span class="eyebrow">${T('Formation','Training')}</span>${H2(T('Des compétences au niveau des standards internationaux.','Skills that meet international standards.'))}
    <p style="color:var(--ink-2)">${T('Le souci permanent de se conformer aux normes internationales a conduit la compagnie à des plans de formation exigeants, déployés au Centre d’Accueil et de Perfectionnement de Mostaganem, réalisé en 2012.','A constant focus on international standards has led to demanding training plans, delivered at the Mostaganem training centre (CAP), opened in 2012.')}</p>
    <a href="${R('cap')}" class="more">${T('Découvrir le CAP Hyproc','Discover CAP Hyproc')} ${arrow}</a></div>
  <div class="media rv">${img('simulateur1.jpg','')}</div>
</div></section>
${ctaBand()}`;

P.qualite=()=>`
${pageHero(T('Qualité','Quality'),T('Qualité, santé, sûreté, sécurité & environnement','Quality, health, security, safety & environment'),T('Un système de management intégré, audité chaque année, pour une flotte admise dans les terminaux des grandes compagnies pétrolières.','An integrated management system, audited every year, keeping the fleet approved at the terminals of the major oil companies.'),'carre/3-qhse.jpg')}
${subnav(Q_SUB(),'qualite')}
<section class="s"><div class="wrap">
  <div class="grid g4">
    ${[['shield',T('Code ISM','ISM Code'),T('Gestion de la sécurité des navires intégrée au QMS.','Ship safety management built into the QMS.')],['lock',T('Code ISPS','ISPS Code'),T('Sûreté des navires et des installations portuaires.','Security of ships and port facilities.')],['heart','MLC 2006',T('Conformité à la convention du travail maritime.','Compliance with the Maritime Labour Convention.')],['leaf','ISO 14001 / 45001',T('Mise à niveau environnementale et santé-sécurité engagée.','Environmental and occupational health & safety upgrade under way.')]]
     .map(([k,t,d])=>`<div class="card rv"><div class="ico">${ic(k)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</div></section>
<section class="s alt"><div class="wrap split">
  <div class="prose rv"><span class="eyebrow">${T('Système QMS','QMS system')}</span>${H2(T('Audité par Bureau Veritas, chaque année.','Audited by Bureau Veritas every year.'))}
    <p>${T('Les confirmations annuelles aux audits externes de Bureau Veritas sont un gage de conformité de la compagnie, engagée à rester au diapason de toute nouvelle norme ou exigence.','Annual confirmation in Bureau Veritas external audits demonstrates the company’s compliance and its commitment to keep pace with every new standard or requirement.')}</p>
    <p>${T('Un système d’évaluation continue des procédures de gestion, de suivi technique et de sécurité à bord permet à la flotte de répondre avec satisfaction aux inspections PSC et Vetting.','Continuous evaluation of management, technical and on-board safety procedures enables the fleet to pass PSC and Vetting inspections.')}</p></div>
  <div class="card rv"><h3>${T('Nos engagements','Our commitments')}</h3><ul class="check" style="margin-top:18px">
    <li>${T('Satisfaire aux inspections PSC et Vetting des terminaux internationaux','Pass PSC and Vetting inspections at international terminals')}</li>
    <li>${T('Évaluer en continu la sécurité et le suivi technique à bord','Continuously assess safety and technical follow-up on board')}</li>
    <li>${T('Adapter l’organisation aux exigences nationales et internationales','Adapt the organisation to national and international requirements')}</li>
    <li>${T('Un système d’information intégré au service de la qualité, de la sécurité, de la santé et de l’environnement','An integrated information system serving quality, safety, health and the environment')}</li></ul>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><a class="btn btn-line" href="${R('qualite/politique-qhse')}">${T('Politique QHSE','QHSE policy')}</a><a class="btn btn-line" href="${R('qualite/communication')}">${T('Politique de communication','Communication policy')}</a></div></div>
</div></section>
${ctaBand()}`;

/* Politique QHSE — transcription de la politique signée (révision n° 12, 24 juillet 2024) */
P.qhse=()=>`
${pageHero(T('Qualité / Politique QHSE','Quality / QHSE policy'),T('Politique qualité, santé, sécurité et environnement','Quality, health, safety and environment policy'),T('En accord avec l’ISM, l’ISPS, la MLC 2006 et les normes ISO 9001, 14001 et 45001.','In line with the ISM and ISPS Codes, MLC 2006 and ISO 9001, 14001 and 45001.'),'carre/3-qhse.jpg',`<div class="policy-head">${['ISM','ISPS','MLC 2006','ISO 9001','ISO 14001','ISO 45001'].map(s=>`<span>${s}</span>`).join('')}</div>`)}
${subnav(Q_SUB(),'qualite/politique-qhse')}
<section class="s"><div class="wrap split" style="align-items:start">
  <div class="prose rv">
    <span class="eyebrow">${T('Notre engagement','Our commitment')}</span>${H2(T('La sécurité, la santé et l’environnement au sommet de nos priorités.','Safety, health and the environment come first.'))}
    <p>${T('Hyproc Shipping Company SPA, outil de transport maritime du Groupe Sonatrach, place la sécurité de son patrimoine et de ses activités, la santé de son personnel ainsi que le respect de l’environnement au sommet de ses priorités. Elle s’engage résolument à conforter sa place dans ce domaine en fournissant des services qui satisfont ou dépassent les exigences de qualité, sûreté, sécurité, santé et protection de l’environnement de ses clients et des autres parties intéressées.','Hyproc Shipping Company SPA, the maritime transport arm of the Sonatrach Group, places the safety of its assets and operations, the health of its people and respect for the environment at the top of its priorities. It is firmly committed to strengthening its position in this field by providing services that meet or exceed the quality, security, safety, health and environmental requirements of its customers and other stakeholders.')}</p>
    <p>${T('L’intégrité dans l’exercice de ses fonctions, le respect des préceptes et des normes internationales ainsi que sa responsabilité vis-à-vis des générations futures en matière de protection de l’environnement constituent le socle de sa démarche.','Integrity in its work, respect for international principles and standards, and its responsibility to future generations for protecting the environment form the foundation of its approach.')}</p>
  </div>
  <div class="grid rv" style="gap:14px">
    <span class="eyebrow">${T('Principaux objectifs','Main objectives')}</span>
    ${[['star',T('Satisfaction','Satisfaction'),T('La satisfaction de ses clients et des autres parties intéressées.','Satisfying customers and other stakeholders.')],
       ['shield',T('Zéro accident, zéro pollution','Zero accidents, zero pollution'),T('Le « zéro accident » et le « zéro pollution de la mer ».','“Zero accidents” and “zero marine pollution”.')],
       ['leaf',T('Sobriété','Efficiency'),T('L’optimisation des déchets et de la consommation d’énergie.','Optimising waste and energy consumption.')]]
      .map(([k,t,d])=>`<div class="card pkg"><div class="ico">${ic(k,22)}</div><div><h3>${t}</h3><p style="font-size:14.5px">${d}</p></div></div>`).join('')}
  </div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Engagements','Commitments')}</span><h2>${T('Quinze engagements pour atteindre nos objectifs.','Fifteen commitments to reach our goals.')}</h2></div>
    <p>${T('L’atteinte de ces objectifs sera concrétisée à travers l’engagement total de la compagnie en :','The company will reach these objectives through its full commitment to:')}</p></div>
  <ol class="commit rv">${QHSE_COMMIT().map(c=>`<li>${c}</li>`).join('')}</ol>
  <div class="sign rv"><div><b>${T('Le Président Directeur Général','Chairman & CEO')}</b><br><span>Adil Cherouati · ${T('Oran, le 24 juillet 2024','Oran, 24 July 2024')}</span></div><span>${T('Révision n° 12','Revision no. 12')}</span></div>
  <p class="rv" style="color:var(--ink-2);margin-top:20px">${T('Hyproc adopte toutes les mesures nécessaires pour que les engagements énoncés ci-dessus se reflètent au quotidien dans la conduite de ses activités.','Hyproc takes every necessary step to ensure these commitments are reflected in its day-to-day operations.')}</p>
</div></section>
${ctaBand()}`;
const QHSE_COMMIT=()=>[
  T('Améliorant continuellement l’efficacité et la performance du Système de Management de la Qualité.','Continually improving the effectiveness and performance of the Quality Management System.'),
  T('Développant le leadership et l’engagement des managers et états-majors, et en impliquant le personnel et ses représentants dans la maîtrise des risques, y compris ceux liés à la santé et la sécurité au travail, par le développement des compétences et une culture HSE fondée sur l’information et la formation.','Developing leadership and commitment among managers and senior officers, and involving staff and their representatives in risk control — including occupational health and safety — through skills development and an HSE culture built on information and training.'),
  T('Donnant la priorité à la santé, la sécurité et au bien-être du personnel ainsi qu’à la protection de l’environnement, par une démarche préventive et l’amélioration continue de l’identification et de l’évaluation des risques.','Prioritising the health, safety and wellbeing of staff and protection of the environment, through a preventive approach and continual improvement of risk identification and assessment.'),
  T('Établissant, promouvant et révisant les objectifs de qualité, sûreté, sécurité, santé et protection de l’environnement.','Setting, promoting and reviewing quality, security, safety, health and environmental objectives.'),
  T('Promouvant des pratiques sûres, saines et respectueuses de l’environnement ainsi qu’un environnement de travail sûr.','Promoting safe, healthy and environmentally sound practices and a safe working environment.'),
  T('Se conformant aux exigences légales et réglementaires, y compris celles du pavillon, de l’État du port, de l’OMI et de l’OIT.','Complying with legal and regulatory requirements, including those of the flag State, port State, IMO and ILO.'),
  T('Exigeant de ses fournisseurs et prestataires externes un excellent niveau de conformité, de responsabilité et de performance.','Requiring a high level of compliance, responsibility and performance from suppliers and contractors.'),
  T('Réduisant son empreinte carbone conformément à la stratégie « Climat » du Groupe Sonatrach, par l’amélioration de sa performance énergétique et opérationnelle et l’utilisation de technologies bas carbone.','Reducing its carbon footprint in line with the Sonatrach Group’s “Climate” strategy, by improving energy and operational performance and using low-carbon technologies.'),
  T('Améliorant ses plans d’urgence et en engageant les moyens adaptés pour une réponse rapide, efficace et intégrée à tout accident majeur.','Improving emergency plans and committing the right resources for a fast, effective and coordinated response to any major accident.'),
  T('Évaluant tous les risques identifiés pour la vie, la santé, les biens et l’environnement, y compris le risque managérial, et en établissant des mesures de protection appropriées.','Assessing all identified risks to life, health, property and the environment, including management risk, and putting appropriate safeguards in place.'),
  T('S’imposant des contrôles stricts de l’application des procédures, à travers des audits et inspections périodiques réglementaires et normatifs.','Enforcing strict controls on procedures through regular regulatory and standards-based audits and inspections.'),
  T('Allouant les ressources nécessaires pour mettre en œuvre sa politique et atteindre ses objectifs QHSE.','Allocating the resources needed to implement the policy and meet its QHSE objectives.'),
  T('Alignant sa politique avec celle du Groupe Sonatrach.','Aligning its policy with that of the Sonatrach Group.'),
  T('Mettant en œuvre, maintenant et communiquant cette politique à tous ses employés et autres parties intéressées.','Implementing, maintaining and communicating this policy to all employees and other stakeholders.')];

/* Politique de communication — transcription du document signé par la Direction générale */
P.communication=()=>`
${pageHero(T('Qualité / Communication','Quality / Communication'),T('Politique de communication','Communication policy'),T('Renforcer le système communicationnel au sein de la compagnie et véhiculer une information claire à toutes les parties intéressées.','Strengthening communication within the company and sharing clear information with all stakeholders.'),'carre/6-contact.jpg')}
${subnav(Q_SUB(),'qualite/communication')}
<section class="s"><div class="wrap split" style="align-items:start">
  <div class="prose rv"><span class="eyebrow">${T('Préambule','Preamble')}</span>${H2(T('Une fonction hautement stratégique.','A highly strategic function.'))}
    <p>${T('Consciente que la communication revêt un caractère hautement stratégique et constitue un support important pour asseoir la politique de la compagnie, tant en son sein que vis-à-vis de l’extérieur, et engagée à mettre en œuvre la stratégie du Groupe Sonatrach, la Direction générale de Hyproc SC a adopté une politique de communication.','Recognising that communication is highly strategic and essential to embedding the company’s policy both internally and externally, and committed to implementing the Sonatrach Group strategy, Hyproc SC’s senior management has adopted a communication policy.')}</p></div>
  <div class="grid g2 rv">
    <div class="card"><div class="ico">${ic('mega')}</div><h3>${T('En interne','Internally')}</h3><p>${T('Renforcer le système communicationnel au sein de la compagnie.','Strengthen communication within the company.')}</p></div>
    <div class="card"><div class="ico">${ic('users')}</div><h3>${T('En externe','Externally')}</h3><p>${T('Véhiculer une information claire à toutes les parties intéressées.','Share clear information with all stakeholders.')}</p></div>
  </div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">1 — ${T('Objectifs','Objectives')}</span><h2>${T('Cinq objectifs fixés par la compagnie.','Five objectives set by the company.')}</h2></div></div>
  <div class="grid g3">
    ${[['users',T('Cohésion sociale','Social cohesion'),T('Développer des mécanismes qui renforcent les contacts entre individus et groupes, autour des objectifs de la compagnie : atouts, défis, changements, promotion de l’emploi féminin et du personnel navigant.','Develop ways to strengthen contact between people and teams around the company’s goals: strengths, challenges, change, and promoting women’s employment and seafaring staff.')],
       ['heart',T('Culture de la solidarité','A culture of solidarity'),T('Sensibiliser le personnel à la contribution de chacun au développement de la compagnie et construire une culture de groupe.','Raise awareness of each employee’s contribution to the company’s growth and build a shared culture.')],
       ['target',T('Rendement & performance','Productivity & performance'),T('Instaurer une communication objective sur la discipline au travail et la rationalisation des coûts.','Communicate objectively on workplace discipline and cost control.')],
       ['shield',T('Culture QHSE & compagnie citoyenne','QHSE culture & corporate citizenship'),T('Vulgariser normes et exigences (codes ISM/ISPS, ISO 9001/14001/45001, Vetting, règlement intérieur, prévention des accidents, environnement, santé au travail) via brochures, dépliants et le magazine Hyproc News.','Explain standards and requirements (ISM/ISPS, ISO 9001/14001/45001, Vetting, internal rules, accident prevention, environment, occupational health) through brochures, leaflets and the Hyproc News magazine.')],
       ['star',T('Image de marque','Brand image'),T('Une communication externe dynamique : relations presse et médias, entités de communication de Sonatrach, sponsoring, journées portes ouvertes, mise à jour du site web, salons et expositions.','Dynamic external communication: press and media relations, Sonatrach communication teams, sponsorship, open days, website updates, trade fairs and exhibitions.')]]
      .map(([k,t,d])=>`<div class="card rv"><div class="ico">${ic(k)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
</div></section>
<section class="s"><div class="wrap split" style="align-items:start">
  <div class="rv"><span class="eyebrow">2 — ${T('Moyens','Means')}</span>${H2(T('Des ressources dédiées à la Cellule de communication.','Dedicated resources for the Communication unit.'))}
    <ul class="check"><li>${T('Un budget pour la couverture des événements, les relations extérieures, la conception de supports, reportages et brochures, et la participation aux expositions.','A budget for event coverage, external relations, materials, reports and brochures, and exhibitions.')}</li>
    <li>${T('La généralisation de l’usage de l’intranet et d’Internet.','Wider use of the intranet and the Internet.')}</li></ul></div>
  <div class="rv"><span class="eyebrow">3 — ${T('Engagements','Commitments')}</span>${H2(T('Trois convictions qui guident notre communication.','Three beliefs that guide how we communicate.'))}
    <div class="grid" style="gap:14px">
      ${[T('Hyproc Shipping Company se veut être une compagnie citoyenne respectueuse de l’environnement.','Hyproc Shipping Company strives to be a responsible company that respects the environment.'),
         T('Sa pérennité dépend de sa crédibilité, de son professionnalisme et de son savoir-faire.','Its future depends on its credibility, professionalism and expertise.'),
         T('Ses potentialités humaines et matérielles lui garantiront crédibilité et compétitivité au service du Groupe Sonatrach.','Its people and assets will secure its credibility and competitiveness in the service of the Sonatrach Group.')]
        .map(q=>`<div class="quote"><p>${q}</p></div>`).join('')}
    </div></div>
</div></section>
${ctaBand()}`;

const JV=[['ANGTC','Algerian Nippon Gas Transport Corporation','Lalla Fatma N’Soumer',['145 500 m³ — réceptionné en 2004','145,500 m³ — delivered in 2004'],'lfn.jpg'],
          ['MLTC','Mediterranean LNG Transport Corporation','Cheikh El Mokrani',['Réceptionné en 2007','Delivered in 2007'],'mokrani.jpg'],
          ['SLTC','Skikda LNG Transport Corporation','Cheikh Bouamama',['Réceptionné en 2008','Delivered in 2008'],'assets/cheikh-bouamama.jpg']];
P.filiales=()=>`
${pageHero(T('Filiales & JV','Subsidiaries & JV'),T('Filiales & joint-ventures','Subsidiaries & joint ventures'),T('Une filiale de services maritimes et trois partenariats méthaniers avec des acteurs japonais de premier plan.','One maritime services subsidiary and three LNG carrier partnerships with leading Japanese companies.'),'carre/4-filiales.jpg')}
<section class="s"><div class="wrap split">
  <div class="rv"><span class="tag f">${T('Filiale à 100%','Wholly owned subsidiary')}</span>
    <h2 style="font-size:clamp(28px,3.2vw,40px);margin:16px 0 8px">Najda Supply & Services</h2>
    <p style="color:var(--ink-3);margin-bottom:20px">${T('Ex-Najda Maghreb Spa — créée en 1993 · Arzew','Formerly Najda Maghreb Spa — founded 1993 · Arzew')}</p>
    <p style="color:var(--ink-2)">${T('Au service des sociétés, administrations, industries, entreprises portuaires et navires, NSS intervient à la fois comme prestataire de services et comme fournisseur.','Serving companies, public bodies, industry, port operators and vessels, NSS acts as both service provider and supplier.')}</p>
    <div class="stats" style="margin-top:28px;grid-template-columns:repeat(2,1fr)"><div><b>${T('30 M','30 m')}</b><span>${T('DA de capital social','DZD share capital')}</span></div><div><b>66</b><span>${T('collaborateurs','employees')}</span></div></div>
    <p style="color:var(--ink-3);font-size:14px;margin-top:16px">Centre Administratif DRIZ Bts B19, B21 & B22 — BP 24, Arzew, Oran 31200 · ${T('Tél.','Tel.')} +213 41 79 21 67</p></div>
  <div class="grid g2 rv">
    <div class="card"><h3>Service provider</h3><ul class="check" style="margin-top:14px;font-size:14px">
      <li>${T('Maintenance des équipements incendie (FFE)','Fire-fighting equipment (FFE) maintenance')}</li><li>${T('Radeaux de sauvetage & équipements de secours','Life rafts & rescue equipment')}</li><li>${T('Prestation 3D (désinfection, dératisation, désinsectisation)','Pest control and disinfection')}</li><li>${T('Soudure, tuyauterie, chaudronnerie','Welding, piping, boilermaking')}</li><li>${T('Transport sur rade (2 vedettes)','Harbour launch service (2 boats)')}</li></ul></div>
    <div class="card"><h3>Procurement</h3><ul class="check" style="margin-top:14px;font-size:14px">
      <li>${T('Équipements de protection individuelle','Personal protective equipment')}</li><li>${T('Avitaillement des navires et bases de vie','Provisioning for ships and camps')}</li><li>${T('Équipements pyrotechniques','Pyrotechnics')}</li><li>${T('Fournitures diverses','General supplies')}</li></ul></div>
  </div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Joint-ventures','Joint ventures')}</span><h2>${T('Trois méthaniers en partenariat.','Three LNG carriers in partnership.')}</h2></div>
    <div style="display:flex;gap:24px;align-items:center"><div class="donut"></div>
      <div class="legend"><span><i style="background:var(--blue)"></i>Sonatrach — 25%</span><span><i style="background:var(--cyan)"></i>Hyproc SC — 25%</span><span><i style="background:var(--flame)"></i>Itochu & MOL — 50%</span></div></div></div>
  <div class="grid g3">${JV.map(([c,f,s,d,im])=>`
    <div class="card ship rv" style="cursor:default"><div class="img">${img(im,s)}<span class="tag">${c}</span></div>
      <div class="body"><p style="font-size:13px;color:var(--ink-3)">${f}</p><h3 style="margin:6px 0 4px">${s}</h3><p style="font-size:14px">${T(...d)}</p></div></div>`).join('')}</div>
</div></section>
${ctaBand()}`;

P.cap=()=>`
${pageHero('CAP Hyproc',T('Centre d’Accueil et de Perfectionnement','Training & Development Centre'),T('À Mostaganem, un espace de formation moderne pour les gens de mer, doté d’outils pédagogiques de pointe.','A modern training centre for seafarers in Mostaganem, equipped with state-of-the-art teaching tools.'),'simulateur2.jpg')}
${subnav(CAP_SUB(),'cap')}
<section class="s"><div class="wrap split">
  <div class="rv"><span class="eyebrow">${T('Simulateurs passerelle','Bridge simulators')}</span>${H2(T('Full mission & cabines, Classe A.','Full mission & cubicles, Class A.'))}
    <p style="color:var(--ink-2);margin-bottom:20px">${T('Acquis en 2016 : un simulateur Full Mission et quatre simulateurs cabine, conformes au standard DNVGL-ST-0033, avec un large choix de navires et de zones de navigation.','Acquired in 2016: one Full Mission simulator and four cubicle simulators to DNVGL-ST-0033, with a wide choice of ship models and navigation areas.')}</p>
    <div class="mods" style="margin:0">${['Ship handling phase 1 & 2','BRM','INS','Passage planning',T('Formations passerelle','Bridge courses')].map(m=>`<span>${m}</span>`).join('')}</div></div>
  <div class="media rv">${img('simulateur1.jpg','')}<div class="badge"><b>1 + 4</b><span>${T('simulateurs Classe A','Class A simulators')}</span></div></div>
</div></section>
<section class="s alt"><div class="wrap split">
  <div class="media rv">${img('cbt1.jpg','')}</div>
  <div class="rv"><span class="eyebrow">Computer Based Training</span>${H2(T('Des cursus complets pour les métiers de la mer.','Complete curricula for maritime careers.'))}
    <ul class="check"><li>${T('Laboratoire CBT dédié et trois laboratoires en projet','A dedicated CBT lab, with three more planned')}</li><li>${T('Packages « Bridge operations » et « Engine operations »','“Bridge operations” and “Engine operations” packages')}</li><li>${T('Certification des formations « distance course », dont ECDIS spécifiques','Certification of distance courses, including type-specific ECDIS')}</li><li>${T('Deux stations ECDIS Furuno — ouvertes aux officiers d’autres compagnies','Two Furuno ECDIS stations — open to officers from other companies')}</li></ul>
    <a class="more" href="${R('cap/cbt-online')}">CBT Online ${arrow}</a></div>
</div></section>
<section class="s"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Modules classiques','Classroom courses')}</span><h2>${T('Un catalogue construit sur les besoins réels.','A catalogue built on real needs.')}</h2></div>
    <p>${T('Modules choisis à partir de l’analyse des besoins en formation et des prescriptions PSC et Vetting de la compagnie.','Courses selected from training-needs analysis and the company’s PSC and Vetting findings.')}</p></div>
  <label class="search rv">${ic('search',18)}<input id="msearch" placeholder="${T(`Filtrer les ${MODULES.length} modules…`,`Filter ${MODULES.length} courses…`)}"></label>
  <div class="mods rv" id="mods"></div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Moyens d’accueil','Facilities')}</span><h2>${T('Hébergement haut standing, en interne ou en externe.','High-standard accommodation, residential or day.')}</h2></div>
    <div><p style="margin-bottom:14px">${T('Formules en prise en charge totale ou en externe.','Full-board or non-residential options.')} · +213 45 42 02 22</p><a href="mailto:cap.schooling@hyproc.dz" class="btn btn-flame">cap.schooling@hyproc.dz</a></div></div>
  <div class="grid g4">${['moyens_01.jpg','moyens_02.jpg','moyens_03.jpg','moyens_04.jpg'].map(f=>`<div class="media rv" style="aspect-ratio:1">${img(f,'')}</div>`).join('')}</div>
</div></section>
${ctaBand()}`;

P.cbt=()=>`
${pageHero('CAP Hyproc / CBT Online','CBT Online',T('Formation en ligne sur la plateforme Seagull e-learning, en complément des stations installées à bord.','Online training on the Seagull e-learning platform, alongside the stations installed on board.'),'cbt2.jpg')}
${subnav(CAP_SUB(),'cap/cbt-online')}
<section class="s"><div class="wrap split" style="align-items:start">
  <div class="rv"><span class="eyebrow">${T('Procédure','How it works')}</span>${H2(T('Se former à distance, en trois étapes.','Learn remotely in three steps.'))}
    <ol class="commit" style="grid-template-columns:1fr">
      <li>${T('Demandez vos identifiants et le mode opératoire Seagull au CAP Hyproc.','Request your login and the Seagull user guide from CAP Hyproc.')}</li>
      <li>${T('Consultez l’emploi du temps du package qui vous concerne.','Check the schedule for your package.')}</li>
      <li>${T('Connectez-vous à la plateforme Seagull pour entamer votre formation en ligne.','Sign in to the Seagull platform to start your online training.')}</li></ol>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
      <a class="btn btn-flame" href="https://stacdn.seagull.no/STA40/Views/LoginScreenView.aspx" target="_blank" rel="noopener">${T('Accéder à la plateforme Seagull','Open the Seagull platform')} ${ic('ext',16)}</a>
      <a class="btn btn-line" href="mailto:cap.schooling@hyproc.dz?subject=${encodeURIComponent('CBT Online')}">${T('Demander le mode opératoire','Request the user guide')}</a></div></div>
  <div class="rv"><span class="eyebrow">Packages</span>${H2(T('Huit packages disponibles.','Eight packages available.'))}
    <div class="grid g2" style="gap:12px">${CBT_PKGS.map(p=>`<a class="card hover pkg" href="mailto:cap.schooling@hyproc.dz?subject=${encodeURIComponent((LANG==='en'?'Schedule — ':'Emploi du temps — ')+p)}"><div class="ico">${ic('monitor',20)}</div><div><h3>${p}</h3><span style="font-size:13px;color:var(--ink-3)">${T('Demander l’emploi du temps','Request the schedule')}</span></div></a>`).join('')}</div></div>
</div></section>
${ctaBand()}`;

P.publications=()=>`
${pageHero(T('Informations / Publications','News & info / Publications'),'Hyproc News',T('Actualités de la compagnie, bulletins trimestriels et rétrospectives annuelles.','Company news, quarterly bulletins and annual reviews.'),'slide2.jpg')}
${subnav(I_SUB(),'informations/publications')}
<section class="s"><div class="wrap">
  <button class="card featured hover rv" data-news="0">
    <div class="img">${img('news/'+NEWS[0][0],'')}</div>
    <div class="body"><span class="tag f">${T('À la une','Featured')}</span><h3>${T(NEWS[0][3],NEWS[0][4])}</h3><time style="color:var(--ink-3)">${fdate(NEWS[0][1])}</time></div>
  </button>
  <div class="toolbar" style="margin-top:48px"><div class="left"><h2 style="font-size:28px">Flash info</h2></div>
    <div class="chips" id="ncats"><button class="chip on" data-c="all">${T('Tout','All')}</button>${Object.keys(NEWS_CATS).map(c=>`<button class="chip" data-c="${c}">${T(...NEWS_CATS[c])}</button>`).join('')}</div></div>
  <div class="grid g3" id="ngrid"></div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Bulletins','Bulletins')}</span><h2>${T('Bulletins trimestriels & rétrospectives.','Quarterly bulletins & annual reviews.')}</h2></div>
    <p>${T('Les bulletins Hyproc News sont disponibles sur demande : choisissez un numéro pour le recevoir par e-mail.','Hyproc News bulletins are available on request: choose an issue to receive it by email.')}</p></div>
  <div class="card rv" style="padding:8px 28px">
    ${Object.keys(BULLETINS).sort((a,b)=>b-a).map(y=>`<div class="bul-year"><b>${y}</b><div class="q">
      ${[1,2,3,4].map(q=>{const ok=BULLETINS[y].includes(q);const lbl=T(`${q===1?'1er':q+'ᵉ'} trimestre`,`Q${q}`);return `<a class="qbtn ${ok?'':'na'}" href="${ok?requestLink('bulletin',`Bulletin Hyproc News — ${lbl} ${y}`):'#'}">${ic('file',16)}${lbl}</a>`}).join('')}
      ${RETROS.includes(+y)?`<a class="qbtn retro" href="${requestLink('bulletin',T('Bulletin Hyproc News — Rétrospective ','Hyproc News — Annual review ')+y)}">${ic('book',16)}${T('Rétrospective','Annual review')}</a>`:''}
    </div></div>`).join('')}
    <div class="bul-year" style="border:0"><b>${T('Avant','Earlier')}</b><div class="q">${[2019,2018,2017].map(y=>`<a class="qbtn retro" href="${requestLink('bulletin',T('Bulletin Hyproc News — Rétrospective ','Hyproc News — Annual review ')+y)}">${ic('book',16)}${T('Rétrospective','Annual review')} ${y}</a>`).join('')}</div></div>
  </div>
</div></section>
${ctaBand()}`;

P.tenders=()=>{
  const years=[...new Set(TENDERS.map(t=>t.y).filter(Boolean))].sort((a,b)=>b-a);
  const depts=[...new Set(TENDERS.map(t=>t.d))].sort((a,b)=>(!a)-(!b)||a.localeCompare(b));
  return `
${pageHero(T('Informations / Appels d’offres','News & info / Tenders'),T('Appels d’offres','Tenders'),T('Avis d’appels d’offres, pré-qualifications, prorogations, attributions et avis d’infructuosité publiés par Hyproc SC.','Calls for tenders, pre-qualifications, extensions, awards and unsuccessful notices published by Hyproc SC.'),'carre/1-compagnie.jpg')}
${subnav(I_SUB(),'informations/appels-offres')}
<section class="s"><div class="wrap">
  <div class="stats rv" style="margin-bottom:36px">
    <div><b>${TENDERS.length}</b><span>${T('avis publiés','notices published')}</span></div>
    <div><b>${TENDERS.filter(t=>t.y===years[0]).length}</b><span>${T('avis en','notices in')} ${years[0]}</span></div>
    <div><b>${TENDERS.filter(t=>t.k==='ao').length}</b><span>${T('appels d’offres','calls for tenders')}</span></div>
    <div><b>${TENDERS.filter(t=>t.k==='prequalif').length}</b><span>${T('pré-qualifications','pre-qualifications')}</span></div></div>
  ${LANG==='en'?`<div class="note rv" style="margin-bottom:22px">${ic('info',18)}<span>Tender notices are published in French, the official language of Hyproc’s procurement procedures.</span></div>`:''}
  <div class="toolbar">
    <label class="search" style="flex:1;max-width:460px">${ic('search',18)}<input id="tq" placeholder="${T('Rechercher (navire, référence, objet…)','Search (vessel, reference, subject…)')}"></label>
    <div class="left">
      <select class="sel" id="ty"><option value="">${T('Toutes les années','All years')}</option>${years.map(y=>`<option>${y}</option>`).join('')}</select>
      <select class="sel" id="td"><option value="*">${T('Tous les services','All departments')}</option>${depts.map(d=>`<option value="${d}">${deptLabel(d)}</option>`).join('')}</select>
    </div>
  </div>
  <div class="chips" id="tk" style="margin-bottom:24px"><button class="chip on" data-k="">${T('Tous','All')}</button>${Object.keys(KINDS).map(k=>`<button class="chip" data-k="${k}">${T(...KINDS[k])}<i>${TENDERS.filter(t=>t.k===k).length}</i></button>`).join('')}</div>
  <p class="result-meta" id="tmeta"></p>
  <div class="tlist" id="tlist"></div>
  <div style="text-align:center;margin-top:28px"><button class="btn btn-line" id="tmore">${T('Afficher plus','Show more')}</button></div>
  <div class="note rv" style="margin-top:36px">${ic('info',18)}<span>${T('Les dossiers et placards publicitaires sont transmis sur demande. Utilisez « Demander le dossier » pour recevoir le document correspondant.','Tender documents and notices are sent on request. Use “Request documents” to receive the relevant file.')}</span></div>
</div></section>
${ctaBand()}`};

P.recrutement=()=>`
${pageHero(T('Informations / Recrutement','News & info / Careers'),T('Rejoindre Hyproc','Join Hyproc'),T('Annonces de recrutement et appels à candidatures de la compagnie.','Job openings and calls for applications.'),'personnel.jpg')}
${subnav(I_SUB(),'informations/recrutement')}
<section class="s"><div class="wrap">
  <div class="card empty rv"><div class="ring">${ic('briefcase',40)}</div>
    <h2>${T('Aucun recrutement en cours','No openings at the moment')}</h2>
    <p>${T('Il n’y a pas d’offre d’emploi ouverte pour le moment. Les prochaines annonces seront publiées sur cette page.','There are no open positions right now. Future openings will be posted on this page.')}</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px">
      <a class="btn btn-flame" href="${R('contact')}?sujet=emploi">${T('Candidature spontanée','Send an open application')} ${arrow}</a>
      <a class="btn btn-line" href="${R('cap')}">${T('Se former au CAP Hyproc','Train at CAP Hyproc')}</a></div></div>
</div></section>
<section class="s alt"><div class="wrap">
  <div class="s-head rv"><div><span class="eyebrow">${T('Pourquoi Hyproc','Why Hyproc')}</span><h2>${T('Une carrière en mer comme à terre.','A career at sea or ashore.')}</h2></div></div>
  <div class="grid g3">
    ${[['ship',T('Navigants','Seafarers'),T('902 marins, dont 450 officiers, sur une flotte de 14 navires GNL, GPL, bitumiers et pétrolier.','902 seafarers, including 450 officers, across a fleet of 14 LNG, LPG, bitumen and oil vessels.')],
       ['users',T('Sédentaires','Shore-based'),T('692 collaborateurs à Oran, Arzew et Mostaganem, dont 421 cadres et cadres supérieurs.','692 staff in Oran, Arzew and Mostaganem, including 421 managers and senior managers.')],
       ['book',T('Formation continue','Continuous training'),T('Simulateurs Classe A, CBT et modules au CAP Hyproc pour progresser tout au long de la carrière.','Class A simulators, CBT and courses at CAP Hyproc to keep developing throughout your career.')]]
      .map(([k,t,d])=>`<div class="card rv"><div class="ico">${ic(k)}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
  </div>
  <div class="note rv" style="margin-top:28px">${ic('info',18)}<span>${T('Appels à communication : les annonces liées aux appels à communication et aux appels à candidatures de prestataires de formation sont également publiées dans la rubrique Appels d’offres.','Calls for communication and for training-provider applications are also published in the Tenders section.')} <a href="${R('informations/appels-offres')}" style="color:var(--blue);font-weight:600">${T('Voir les avis','See notices')}</a></span></div>
</div></section>`;

P.rapport=()=>`
${pageHero(T('Informations / Rapport de gestion','News & info / Management report'),T('Rapport de gestion','Management report'),T('Résultats et faits marquants de l’exercice.','Results and highlights of the financial year.'),'siege-presentation.jpg')}
${subnav(I_SUB(),'informations/rapport')}
<section class="s"><div class="wrap">
  <div class="split">
    <div class="rv"><span class="eyebrow">${T('Exercice 2025','Financial year 2025')}</span>${H2(T('25,7 milliards de dinars de chiffre d’affaires.','DZD 25.7 billion in revenue.'))}
      <p style="color:var(--ink-2)">${T('Le chiffre d’affaires progresse de 9,6% entre 2023 et 2025, porté par le transport de produits raffinés (+55%) et le shipmanagement.','Revenue grew 9.6% between 2023 and 2025, driven by refined products shipping (+55%) and ship management.')}</p>
      <a href="${R('compagnie/chiffres')}" class="more">${T('Détail par activité','Breakdown by activity')} ${arrow}</a></div>
    <div class="stats rv" style="grid-template-columns:repeat(2,1fr)">
      <div><b>${fmt(25721)}</b><span>${T('CA 2025 (M DZD)','2025 revenue (DZD m)')}</span></div>
      <div><b>${fmt(10595)}</b><span>${T('Transport GPL (M DZD)','LPG shipping (DZD m)')}</span></div>
      <div><b>${fmt(7512)}</b><span>${T('Transport GNL (M DZD)','LNG shipping (DZD m)')}</span></div>
      <div><b>${fmt(5745)}</b><span>${T('Produits raffinés (M DZD)','Refined products (DZD m)')}</span></div></div>
  </div>
  <div class="card empty rv" style="margin-top:48px"><div class="ring">${ic('file',40)}</div>
    <h2>${T('Le rapport complet sera publié prochainement','The full report will be published soon')}</h2>
    <p>${T('En attendant sa mise en ligne, le rapport de gestion peut être demandé auprès du siège social.','Until it is published online, the management report can be requested from the head office.')}</p>
    <a class="btn btn-flame" style="margin-top:24px" href="${requestLink('doc',T('Rapport de gestion','Management report'))}">${T('Demander le rapport','Request the report')} ${arrow}</a></div>
</div></section>`;

P.contact=()=>`
${pageHero(T('Contact','Contact'),T('Parlons de votre projet','Let’s talk'),T('Siège à Oran, opérations à Arzew, formation à Mostaganem — et quatre agences portuaires.','Head office in Oran, operations in Arzew, training in Mostaganem — and four port agencies.'),'carre/6-contact.jpg')}
${subnav(I_SUB(),'contact')}
<section class="s"><div class="wrap">
  <div class="grid g3">${SITES.map(([k,n,a,p,f,e])=>`
    <div class="card contact-card rv"><span class="tag">${T(...k)}</span><h3>${T(...n)}</h3><dl>
      <div><dt>${T('Adresse','Address')}</dt><dd>${a}</dd></div>
      <div><dt>${T('Téléphone','Phone')}</dt><dd><a href="tel:${p.replace(/\s/g,'')}">${p}</a></dd></div>
      <div><dt>Fax</dt><dd>${f}</dd></div>
      <div><dt>E-mail</dt><dd><a href="mailto:${e}">${e}</a></dd></div></dl></div>`).join('')}</div>
</div></section>
<section class="s alt"><div class="wrap split" style="align-items:stretch">
  <form class="card form rv" id="cform">
    <span class="eyebrow">${T('Écrivez-nous','Write to us')}</span>
    <div class="grid g2" style="gap:14px"><label>${T('Nom complet','Full name')}<input required name="nom" autocomplete="name"></label><label>${T('Société','Company')}<input name="soc" autocomplete="organization"></label></div>
    <label>${T('Sujet','Subject')}<select name="sujet" id="csujet">
      <option value="info">${T('Information générale','General enquiry')}</option><option value="transport">${T('Transport & affrètement','Shipping & chartering')}</option>
      <option value="cap">${T('Formation CAP Hyproc','CAP Hyproc training')}</option><option value="doc">${T('Demande de document (appel d’offres, rapport)','Document request (tender, report)')}</option>
      <option value="bulletin">${T('Demande de bulletin Hyproc News','Hyproc News bulletin request')}</option><option value="emploi">${T('Candidature / recrutement','Job application')}</option></select></label>
    <label>Message<textarea required name="msg" rows="6" id="cmsg"></textarea></label>
    <button class="btn btn-flame" style="justify-content:center">${T('Préparer l’e-mail','Prepare the email')} ${arrow}</button>
    <p style="font-size:12.5px;color:var(--ink-3)">${T('Le message s’ouvre dans votre messagerie, adressé au service concerné.','The message opens in your email app, addressed to the right team.')}</p>
  </form>
  <div class="rv" style="min-height:360px"><iframe class="map" title="${T('Carte du siège social','Head office map')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Hyproc+Shipping+Company+Oran&output=embed"></iframe></div>
</div></section>`;

/* ---------- Router ---------- */
const ROUTES={'':'home','compagnie':'compagnie','compagnie/activites':'activites','compagnie/chiffres':'chiffres','compagnie/agences':'agences','flotte':'flotte','ressources':'ressources',
  'qualite':'qualite','qualite/politique-qhse':'qhse','qualite/communication':'communication','filiales':'filiales','cap':'cap','cap/cbt-online':'cbt',
  'informations/publications':'publications','informations/appels-offres':'tenders','informations/recrutement':'recrutement','informations/rapport':'rapport','contact':'contact'};
const app=document.getElementById('app'),hdr=document.getElementById('hdr');
let PATH='',QUERY;

function render(){
  let [path,query]=location.hash.replace(/^#\/?/,'').split('?');
  LANG=/^en(\/|$)/.test(path)?'en':'fr';
  path=path.replace(/^en\/?/,'').replace(/\/$/,'');
  const key=ROUTES[path]??'home';
  PATH=ROUTES[path]?path:'';QUERY=new URLSearchParams(query||'');
  document.documentElement.lang=LANG;
  buildChrome();
  app.innerHTML=P[key]();
  document.title=key==='home'?'HYPROC Shipping Company':`${document.querySelector('.phero h1')?.textContent} — HYPROC`;
  scrollTo(0,0);closeDrawer();closeModal();onScroll();
  ({home:initHome,flotte:initFleet,chiffres:initFig,cap:initCap,contact:initContact,publications:initNews,tenders:initTenders})[key]?.();
  document.querySelectorAll('[data-ship]').forEach(b=>b.onclick=()=>openShip(+b.dataset.ship));
  document.querySelectorAll('[data-news]').forEach(b=>b.onclick=()=>openNews(+b.dataset.news));
  initReveal();initCounters();
}

function buildChrome(){
  const nav=NAV(),sec=PATH.split('/')[0];
  const isExt=h=>/^https?:/.test(h);
  document.getElementById('nav').innerHTML=nav.map(n=>n.items
    ?`<li><button aria-haspopup="true" class="${n.sec===sec?'cur':''}" style="${n.sec===sec?'color:inherit':''}">${n.t}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button><div class="dd">${n.items.map(([t,h,d])=>`<a href="${R(h)}"><b>${t}</b><span>${d}</span></a>`).join('')}</div></li>`
    :`<li><a href="${R(n.h)}" class="${n.h===PATH?'active':''}">${n.t}</a></li>`).join('');
  document.getElementById('mnav').innerHTML=nav.map(n=>n.items
    ?`<h5>${n.t}</h5>${n.items.map(([t,h])=>`<a class="m" href="${R(h)}">${t}</a>`).join('')}`
    :`<a class="m" href="${R(n.h)}">${n.t}</a>`).join('')+
    `<a href="${R('contact')}" class="btn btn-flame" style="margin-top:24px;width:100%;justify-content:center">${T('Nous contacter','Contact us')}</a>
     <a href="#/${LANG==='en'?'':'en/'}${PATH}" class="btn btn-line" style="margin-top:10px;width:100%;justify-content:center">${LANG==='en'?'Version française':'English version'}</a>
     <button class="btn btn-line" data-theme-toggle style="margin-top:10px;width:100%;justify-content:center">${T('Mode clair / sombre','Light / dark mode')}</button>`;
  document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.onclick=toggleTheme);
  const fr=document.getElementById('langFr'),en=document.getElementById('langEn');
  fr.href='#/'+PATH;en.href='#/en/'+PATH;fr.className=LANG==='fr'?'on':'';en.className=LANG==='en'?'on':'';
  document.getElementById('brandLink').href=R();
  const cta=document.getElementById('hdrCta');cta.href=R('contact');cta.textContent=T('Nous contacter','Contact us');
  document.getElementById('themeBtn').setAttribute('aria-label',T('Changer de thème','Toggle theme'));
  document.getElementById('footer').innerHTML=footer();
}

const footer=()=>`<div class="wrap">
  <div class="cols">
    <div><span class="brand-txt" style="color:#fff"><b>HYPROC</b><small>Shipping Company</small></span>
      <p style="margin-top:18px;max-width:34ch">${T('Transporteur maritime national d’hydrocarbures, filiale à 100% du Groupe Sonatrach depuis 1997.','Algeria’s national hydrocarbon shipping company, a wholly owned Sonatrach subsidiary since 1997.')}</p>
      <p style="margin-top:18px">Zhun USTO — BP 7200 Es-Seddikia<br>31000 Oran, ${T('Algérie','Algeria')}<br><a href="tel:+21341821515">+213 41 82 15 15</a> · <a href="mailto:contact@hyproc.dz">contact@hyproc.dz</a></p></div>
    ${[[T('La compagnie','Company'),[[T('Présentation','Overview'),'compagnie'],[T('Activités','Activities'),'compagnie/activites'],[T('Chiffres clés','Key figures'),'compagnie/chiffres'],[T('Agences','Agencies'),'compagnie/agences'],[T('Personnel','People'),'ressources']]],
       [T('Explorer','Explore'),[[T('Notre flotte','Our fleet'),'flotte'],[T('Qualité & QHSE','Quality & QHSE'),'qualite'],[T('Politique QHSE','QHSE policy'),'qualite/politique-qhse'],[T('Filiales & JV','Subsidiaries & JV'),'filiales'],['CAP Hyproc','cap'],['CBT Online','cap/cbt-online']]],
       [T('Informations','News & info'),[[T('Publications','Publications'),'informations/publications'],[T('Appels d’offres','Tenders'),'informations/appels-offres'],[T('Recrutement','Careers'),'informations/recrutement'],[T('Rapport de gestion','Management report'),'informations/rapport'],[T('Contacts','Contacts'),'contact']]]]
      .map(([h,ls])=>`<div><h4>${h}</h4><ul>${ls.map(([t,p])=>`<li><a href="${R(p)}">${t}</a></li>`).join('')}</ul></div>`).join('')}
  </div>
  <div class="bottom"><span>© ${new Date().getFullYear()} Hyproc Shipping Company. ${T('Tous droits réservés.','All rights reserved.')}</span><span>${T('Groupe Sonatrach','Sonatrach Group')}</span></div>
</div>`;

/* ---------- Page behaviours ---------- */
function initHome(){
  const S=SLIDES(),hero=document.getElementById('hero'),bgs=[...hero.querySelectorAll('.slides div')],arts=[...hero.querySelectorAll('.hero-copy article')],
        tabs=[...hero.querySelectorAll('#prog button')],cap=document.getElementById('hcap'),cur=document.getElementById('hcur');
  let i=0;
  const go=n=>{n=(n+S.length)%S.length;
    [bgs,arts,tabs].forEach(l=>l[i].classList.remove('on'));arts[i].setAttribute('aria-hidden','true');
    tabs.forEach((t,k)=>t.classList.toggle('seen',k<n));
    i=n;bgs[i].classList.add('on');arts[i].classList.add('on');arts[i].setAttribute('aria-hidden','false');
    // relance l'animation de progression de l'onglet actif
    const f=tabs[i].querySelector('i');tabs[i].classList.add('on');f.style.animation='none';f.offsetWidth;f.style.animation='';
    cap.textContent=S[i].cap;cur.textContent=pad(i+1)};
  tabs.forEach((t,k)=>{t.onclick=()=>go(k);t.querySelector('i').addEventListener('animationend',()=>{if(k===i)go(i+1)})});
  document.getElementById('hprev').onclick=()=>go(i-1);
  document.getElementById('hnext').onclick=()=>go(i+1);
  hero.onmouseenter=()=>hero.classList.add('paused');hero.onmouseleave=()=>hero.classList.remove('paused');
  let x0=null;hero.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
  hero.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(i+(dx<0?1:-1));x0=null});
}
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function initFleet(){
  let type='all',q='';
  const grid=document.getElementById('fgrid');
  const draw=()=>{const list=FLEET.map((s,i)=>[s,i]).filter(([s])=>(type==='all'||s.t===type)&&norm(s.n).includes(q));
    grid.innerHTML=list.length?list.map(([s,i])=>shipCard(s,i)).join(''):`<p style="color:var(--ink-3)">${T('Aucun navire ne correspond.','No matching vessel.')}</p>`;
    grid.querySelectorAll('[data-ship]').forEach(b=>b.onclick=()=>openShip(+b.dataset.ship));initReveal()};
  document.querySelectorAll('#fchips .chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('#fchips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');type=c.dataset.t;draw()});
  document.getElementById('fsearch').oninput=e=>{q=norm(e.target.value);draw()};
  draw();
}
const xBtn=`<button class="x" data-mclose aria-label="${'Close'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
function openModal(html,cls=''){
  const m=document.getElementById('modal');m.className='modal open '+cls;
  document.getElementById('mbox').innerHTML=xBtn+html;document.body.style.overflow='hidden';
  m.querySelectorAll('[data-mclose]').forEach(b=>b.onclick=closeModal);
}
function openShip(i){
  const s=FLEET[i];
  openModal(`<div class="hero-img">${img(s.img,s.n)}</div>
    <div class="inner"><span class="tag">${tl(s.t)}</span>${s.jv?` <span class="tag f">JV ${s.jv}</span>`:''}
      <h2 style="font-size:30px;margin:12px 0 4px">${s.n}</h2><p style="color:var(--ink-3)">${T('Classé','Classed by')} ${s.cls}</p>
      <table>${[[T('Capacité','Capacity'),fmt(s.cap)+' m³'],[T('Propulsion / puissance','Propulsion / power'),s.prop],[T('Longueur hors tout','Length overall'),dec(s.l)+' m'],[T('Jauge brute (GRT)','Gross tonnage (GRT)'),s.grt],[T('Jauge nette (NRT)','Net tonnage (NRT)'),s.nrt],[T('Port en lourd (DWT)','Deadweight (DWT)'),s.dwt+' t'],[T('Équipage','Crew'),s.crew+T(' marins',' seafarers')],[T('Société de classification','Classification society'),s.cls]].map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></div>`);
}
function openNews(i){
  const n=NEWS[i];
  openModal(`<div class="hero-img">${img('news/'+n[0],'')}</div>
    <div class="inner"><span class="tag">${T(...NEWS_CATS[n[2]])}</span><time style="display:block;color:var(--ink-3);margin-top:12px">${fdate(n[1])}</time>
      <h2 style="font-size:26px;margin:6px 0 0">${T(n[3],n[4])}</h2></div>`,'lightbox');
}
function closeModal(){document.getElementById('modal').classList.remove('open');document.body.style.overflow=''}
function initFig(){
  const max=Math.max(...FIG.rows.flatMap(r=>r[1]));
  const draw=y=>{
    if(!document.getElementById('tot'))return;
    document.getElementById('tot').textContent=fmt(FIG.total[y]);
    const dl=document.getElementById('delta');
    if(y){const p=(FIG.total[y]/FIG.total[y-1]-1)*100;dl.textContent=`+${dec(p.toFixed(1))}% vs ${FIG.years[y-1]}`;dl.style.display=''}else dl.style.display='none';
    const b=document.getElementById('bars');
    if(!b.children.length)b.innerHTML=FIG.rows.map(r=>`<div class="bar-row"><span>${T(...r[0])}</span><div class="track"><i style="width:0"></i></div><b></b></div>`).join('');
    [...b.children].forEach((row,k)=>{const v=FIG.rows[k][1][y];row.querySelector('i').style.width=Math.max(.6,v/max*100)+'%';row.querySelector('b').textContent=fmt(v)});
  };
  document.querySelectorAll('#yr-tog button').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('#yr-tog button').forEach(x=>x.classList.remove('on'));btn.classList.add('on');draw(+btn.dataset.i)});
  requestAnimationFrame(()=>draw(2));
}
function initCap(){
  const m=document.getElementById('mods');
  const draw=q=>{const l=MODULES.map(x=>T(...x)).filter(x=>norm(x).includes(q));m.innerHTML=l.length?l.map(x=>`<span>${x}</span>`).join(''):`<span style="border:0;color:var(--ink-3)">${T('Aucun module.','No course found.')}</span>`};
  document.getElementById('msearch').oninput=e=>draw(norm(e.target.value));draw('');
}
function initNews(){
  const g=document.getElementById('ngrid');let cat='all';
  const draw=()=>{g.innerHTML=NEWS.map((n,i)=>[n,i]).filter(([n,i])=>i>0&&(cat==='all'||n[2]===cat)).map(([n,i])=>newsCard(n,i)).join('')||`<p style="color:var(--ink-3)">${T('Aucune actualité dans cette catégorie.','No news in this category.')}</p>`;
    g.querySelectorAll('[data-news]').forEach(b=>b.onclick=()=>openNews(+b.dataset.news));initReveal()};
  document.querySelectorAll('#ncats .chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('#ncats .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');cat=c.dataset.c;draw()});
  draw();
}
function initTenders(){
  const st={q:'',y:'',d:'*',k:'',n:15};
  const list=document.getElementById('tlist'),meta=document.getElementById('tmeta'),more=document.getElementById('tmore');
  const data=TENDERS.map((t,i)=>({...t,i,s:norm(t.t)})).sort((a,b)=>(b.y||0)-(a.y||0)||a.i-b.i);
  const draw=()=>{
    const words=norm(st.q).split(/\s+/).filter(Boolean);
    const res=data.filter(t=>(!st.y||t.y==st.y)&&(st.d==='*'||t.d===st.d)&&(!st.k||t.k===st.k)&&words.every(w=>t.s.includes(w)));
    meta.textContent=T(`${res.length} avis trouvé${res.length>1?'s':''}`,`${res.length} notice${res.length===1?'':'s'} found`);
    list.innerHTML=res.slice(0,st.n).map(t=>`
      <article class="card tender">
        <div class="yr-badge"><span><small>${T('ANNÉE','YEAR')}</small>${t.y||'—'}</span></div>
        <div><div class="meta"><span class="kind ${t.k}">${T(...KINDS[t.k])}</span><span class="dept">${deptLabel(t.d)}</span></div><h3>${esc(t.t)}</h3></div>
        <a class="btn btn-line btn-sm" href="${requestLink('doc',t.t)}">${ic('file',15)} ${T('Demander le dossier','Request documents')}</a>
      </article>`).join('')||`<div class="card empty"><h2 style="font-size:22px">${T('Aucun avis ne correspond','No matching notice')}</h2><p>${T('Essayez d’élargir vos filtres.','Try widening your filters.')}</p></div>`;
    more.style.display=res.length>st.n?'':'none';
  };
  document.getElementById('tq').oninput=e=>{st.q=e.target.value;st.n=15;draw()};
  document.getElementById('ty').onchange=e=>{st.y=e.target.value;st.n=15;draw()};
  document.getElementById('td').onchange=e=>{st.d=e.target.value;st.n=15;draw()};
  document.querySelectorAll('#tk .chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('#tk .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');st.k=c.dataset.k;st.n=15;draw()});
  more.onclick=()=>{st.n+=15;draw()};
  draw();
}
function initContact(){
  const sujet=QUERY.get('sujet'),ref=QUERY.get('ref'),sel=document.getElementById('csujet');
  if(sujet&&sel.querySelector(`option[value="${sujet}"]`))sel.value=sujet;
  if(ref)document.getElementById('cmsg').value=T('Bonjour,\n\nJe souhaite recevoir le document suivant :\n','Hello,\n\nI would like to receive the following document:\n')+ref+'\n\n';
  document.getElementById('cform').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);
    const to=f.get('sujet')==='cap'?'cap.schooling@hyproc.dz':'contact@hyproc.dz';
    const subj=sel.options[sel.selectedIndex].text+' — '+f.get('nom');
    location.href=`mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(f.get('msg')+'\n\n'+f.get('nom')+(f.get('soc')?' — '+f.get('soc'):''))}`};
}

/* ---------- Global UI ---------- */
const drawer=document.getElementById('drawer');
function closeDrawer(){drawer.classList.remove('open')}
document.getElementById('burger').onclick=()=>drawer.classList.add('open');
drawer.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeDrawer);
drawer.addEventListener('click',e=>{if(e.target.closest('a'))closeDrawer()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDrawer()}});

function onScroll(){
  hdr.classList.toggle('solid',scrollY>40||!document.querySelector('.hero,.phero'));
  document.getElementById('totop').classList.toggle('show',scrollY>700);
}
addEventListener('scroll',onScroll,{passive:true});
document.getElementById('totop').onclick=()=>scrollTo({top:0,behavior:'smooth'});

let io;
function initReveal(){
  io?.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv:not(.in)').forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
}
function initCounters(){
  const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;co.unobserve(e.target);
    const el=e.target,to=+el.dataset.count,pre=el.dataset.pre||'',t0=performance.now(),dur=1600;
    const tick=t=>{const p=Math.min(1,(t-t0)/dur),v=Math.round(to*(1-Math.pow(1-p,4)));el.textContent=pre+fmt(v);if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}),{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
}

function toggleTheme(){
  const r=document.documentElement,dark=r.dataset.theme==='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme: dark)').matches);
  r.dataset.theme=dark?'light':'dark';try{localStorage.setItem('hyproc-theme',r.dataset.theme)}catch(e){}
}
try{const t=localStorage.getItem('hyproc-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}
document.getElementById('themeBtn').onclick=toggleTheme;

addEventListener('hashchange',render);
render();
