// Fertial catalogue shared by the homepage, product pages and the quote builder.
// Nutrient figures come only from the product names/sheets Fertial publishes.
window.FERTIAL_PRODUCTS = [
  { id: 'tsp', n: 'TSP', full: 'Triple superphosphate', f: 'phosphate', img: 'shop-01.jpg', c: '#2bb04a', npk: null,
    d: 'Engrais phosphaté simple, riche en phosphore pour l\'enracinement et la floraison.', fx: 'Phosphore concentré',
    long: 'Le triple superphosphate apporte du phosphore sous forme concentrée. Il s\'utilise en fumure de fond, avant le semis ou la plantation, pour favoriser l\'enracinement, la floraison et la formation des grains.' },
  { id: 'sulfate-ammonium', n: 'Sulfate d\'ammonium', full: 'Sulfate d\'ammonium', f: 'azote', img: 'shop-02.jpg', c: '#f2c230', npk: null,
    d: 'Apport d\'azote et de soufre, idéal pour les cultures exigeantes en soufre.', fx: 'Azote + soufre',
    long: 'Le sulfate d\'ammonium associe deux éléments essentiels : l\'azote, moteur de la croissance, et le soufre, indispensable à de nombreuses cultures comme le colza, l\'ail ou l\'oignon.' },
  { id: 'npks-04-20-25', n: 'NPKs 04-20-25', full: 'NPK base sulfate', f: 'complexe', img: 'shop-03.jpg', c: '#2f63c9', npk: [4, 20, 25],
    d: 'Engrais complexe ternaire à dominante phosphore-potasse.', fx: 'N 4 · P 20 · K 25',
    long: 'Un engrais complexe pauvre en azote et riche en phosphore et en potasse, adapté à la fumure de fond des cultures qui ont besoin de potasse pour la qualité des fruits et des tubercules.' },
  { id: 'can', n: 'CAN 27', full: 'Calcium ammonitrate', f: 'azote', img: 'shop-04.jpg', c: '#e03a2f', npk: [27, 0, 0],
    d: 'Engrais azoté à 27 % d\'azote, efficace en couverture.', fx: '27 % d\'azote',
    long: 'Le calcium ammonitrate combine azote nitrique, rapidement disponible, et azote ammoniacal, à action plus progressive. Il s\'utilise en couverture pendant la croissance des cultures.' },
  { id: 'ssp', n: 'SSP', full: 'Superphosphate simple', f: 'phosphate', img: 'shop-05.jpg', c: '#b5762c', npk: [0, 20, 0], s: 12,
    d: 'Phosphore et soufre pour les sols carencés.', fx: 'P₂O₅ 20 % · S 12 %',
    long: 'Le superphosphate simple apporte du phosphore et du soufre. Il convient aux sols carencés et aux cultures sensibles au manque de soufre.' },
  { id: 'npkcl-15', n: 'NPKCl 15-15-15', full: 'NPK base chlore', f: 'complexe', img: 'shop-06.jpg', c: '#e03a2f', npk: [15, 15, 15],
    d: 'Engrais complexe équilibré pour la fumure de fond.', fx: 'N 15 · P 15 · K 15',
    long: 'Un engrais équilibré en azote, phosphore et potasse, pour les cultures qui tolèrent le chlore. Il simplifie la fumure de fond en un seul passage.' },
  { id: 'npks-15', n: 'NPKs 15-15-15', full: 'NPK base sulfate', f: 'complexe', img: null, c: '#2f63c9', npk: [15, 15, 15],
    d: 'Engrais complexe équilibré, base sulfate.', fx: 'N 15 · P 15 · K 15',
    long: 'La version base sulfate de l\'engrais équilibré 15-15-15, adaptée aux cultures sensibles au chlore.' },
  { id: 'npks-10', n: 'NPKs 10-10-10', full: 'NPK base sulfate', f: 'complexe', img: null, c: '#2f63c9', npk: [10, 10, 10],
    d: 'Engrais complexe équilibré à dose modérée.', fx: 'N 10 · P 10 · K 10',
    long: 'Un engrais complexe équilibré à concentration modérée, base sulfate, pour un apport régulier des trois éléments majeurs.' },
  { id: 'sulfazote', n: 'Sulfazote 26', full: 'Sulfazote', f: 'azote', img: null, c: '#139a3c', npk: [26, 0, 0],
    d: 'Engrais azoté soufré à 26 % d\'azote.', fx: '26 % d\'azote',
    long: 'Le sulfazote apporte de l\'azote associé à du soufre, pour soutenir la croissance des cultures exigeantes.' },
  { id: 'uan', n: 'UAN 32', full: 'Urée ammonitrate', f: 'liquide', img: null, c: '#139a3c', npk: [32, 0, 0],
    d: 'Solution azotée liquide à 32 % d\'azote, pour la fertigation et la pulvérisation.', fx: '32 % d\'azote · liquide',
    long: 'L\'urée ammonitrate est une solution azotée liquide. Elle s\'applique par pulvérisation ou par fertigation, avec une répartition très homogène sur la parcelle.' },
];
window.FERTIAL_CATS = { azote: 'Azoté', phosphate: 'Phosphaté', complexe: 'Complexe', liquide: 'Liquide' };

// Quote basket stored in the browser: [{ id, qty, unit }]
window.FertialCart = {
  KEY: 'fertial-devis',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  set(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch {} document.dispatchEvent(new Event('cart')); },
  add(id, qty = 1, unit = 't') {
    const list = this.get(), hit = list.find(x => x.id === id);
    if (hit) hit.qty += qty; else list.push({ id, qty, unit });
    this.set(list);
  },
  count() { return this.get().length; },
};
