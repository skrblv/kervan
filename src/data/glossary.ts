import type {
  ColourCode,
  CordCode,
  DecorationMethod,
  FabricCode,
  FinishCode,
  FitCode,
  GarmentCode,
  HoodPanelCode,
  Lang,
  NeckLabelCode,
  PackingCode,
  PlacementCode,
  PocketCode,
  SeamCode,
} from '../types/spec'
import type { PomCode } from './measurements'

export type Term = Record<Lang, string>

export const GLOSSARY_META = {
  version: 'g0.4',
  /** Honest status: in the pilot every term is reviewed by workshop staff before use. */
  reviewNote: 'Demo glossary. In the pilot, terms are reviewed by workshop staff before use.',
}

export const LANGUAGES: { code: Lang; label: string; locale: string }[] = [
  { code: 'ru', label: 'Русский', locale: 'ru-RU' },
  { code: 'ky', label: 'Кыргызча', locale: 'ky-KG' },
  { code: 'kk', label: 'Қазақша', locale: 'kk-KZ' },
  { code: 'tr', label: 'Türkçe', locale: 'tr-TR' },
  { code: 'en', label: 'English', locale: 'en-GB' },
]

type GlossaryCode =
  | GarmentCode
  | FitCode
  | FabricCode
  | ColourCode
  | HoodPanelCode
  | PocketCode
  | FinishCode
  | CordCode
  | SeamCode
  | DecorationMethod
  | PlacementCode
  | NeckLabelCode
  | PackingCode
  | 'HOOD-LINED'
  | 'HOOD-UNLINED'
  | 'NECK-CREW-RIB'

export const GLOSSARY: Record<GlossaryCode, Term> = {
  'GAR-HOODIE': { en: 'Hoodie', ru: 'Худи', ky: 'Худи', kk: 'Худи', tr: 'Kapüşonlu sweatshirt' },
  'GAR-SWEAT': { en: 'Sweatshirt', ru: 'Свитшот', ky: 'Свитшот', kk: 'Свитшот', tr: 'Sweatshirt' },

  'FIT-REG': { en: 'Regular fit', ru: 'Прямой силуэт', ky: 'Түз силуэт', kk: 'Тік силуэт', tr: 'Normal kalıp' },
  'FIT-RLX': { en: 'Relaxed fit', ru: 'Свободный силуэт', ky: 'Эркин силуэт', kk: 'Еркін силуэт', tr: 'Rahat kalıp' },
  'FIT-OVR': {
    en: 'Oversized fit, dropped shoulder',
    ru: 'Оверсайз, спущенное плечо',
    ky: 'Оверсайз, түшүрүлгөн ийин',
    kk: 'Оверсайз, түсірілген иық',
    tr: 'Oversize kalıp, düşük omuz',
  },

  'FLEECE-3T-280': {
    en: '3-thread fleece, brushed back, 280 g/m²',
    ru: 'Футер трёхнитка с начёсом, 280 г/м²',
    ky: 'Үч жиптүү футер, ичи түктүү, 280 г/м²',
    kk: 'Үш жіпті футер, іші түкті, 280 г/м²',
    tr: '3 iplik şardonlu, 280 g/m²',
  },
  'FLEECE-3T-320': {
    en: '3-thread fleece, brushed back, 320 g/m²',
    ru: 'Футер трёхнитка с начёсом, 320 г/м²',
    ky: 'Үч жиптүү футер, ичи түктүү, 320 г/м²',
    kk: 'Үш жіпті футер, іші түкті, 320 г/м²',
    tr: '3 iplik şardonlu, 320 g/m²',
  },
  'FLEECE-3T-400': {
    en: '3-thread fleece, brushed back, heavy, 400 g/m²',
    ru: 'Футер трёхнитка с начёсом, плотный, 400 г/м²',
    ky: 'Үч жиптүү футер, ичи түктүү, калың, 400 г/м²',
    kk: 'Үш жіпті футер, іші түкті, қалың, 400 г/м²',
    tr: '3 iplik şardonlu, kalın, 400 g/m²',
  },
  'TERRY-2T-260': {
    en: '2-thread loopback terry, unbrushed, 260 g/m²',
    ru: 'Футер двухнитка петля, без начёса, 260 г/м²',
    ky: 'Эки жиптүү футер, ичи илмектүү, түксүз, 260 г/м²',
    kk: 'Екі жіпті футер, іші ілмекті, түксіз, 260 г/м²',
    tr: '2 iplik, şardonsuz, 260 g/m²',
  },

  'CLR-BLK': { en: 'Black', ru: 'Чёрный', ky: 'Кара', kk: 'Қара', tr: 'Siyah' },
  'CLR-MLK': { en: 'Milk', ru: 'Молочный', ky: 'Сүт түстүү', kk: 'Сүт түсті', tr: 'Ekru' },
  'CLR-GRM': { en: 'Grey melange', ru: 'Серый меланж', ky: 'Боз меланж', kk: 'Сұр меланж', tr: 'Gri melanj' },
  'CLR-NVY': { en: 'Navy', ru: 'Тёмно-синий', ky: 'Кочкул көк', kk: 'Қою көк', tr: 'Lacivert' },
  'CLR-FOR': { en: 'Forest green', ru: 'Тёмно-зелёный', ky: 'Кочкул жашыл', kk: 'Қою жасыл', tr: 'Koyu yeşil' },
  'CLR-SND': { en: 'Sand', ru: 'Песочный', ky: 'Кум түстүү', kk: 'Құм түсті', tr: 'Kum beji' },

  'HOOD-2P': {
    en: 'Two-panel hood',
    ru: 'Капюшон из двух частей',
    ky: 'Эки бөлүктүү капюшон',
    kk: 'Екі бөлікті капюшон',
    tr: 'İki parçalı kapüşon',
  },
  'HOOD-3P': {
    en: 'Three-panel hood',
    ru: 'Капюшон из трёх частей',
    ky: 'Үч бөлүктүү капюшон',
    kk: 'Үш бөлікті капюшон',
    tr: 'Üç parçalı kapüşon',
  },
  'HOOD-LINED': {
    en: 'lined in body fabric',
    ru: 'с подкладкой из основной ткани',
    ky: 'негизги кездемеден астары бар',
    kk: 'негізгі матадан астары бар',
    tr: 'ana kumaştan astarlı',
  },
  'HOOD-UNLINED': { en: 'single layer', ru: 'в один слой', ky: 'бир катмар', kk: 'бір қабат', tr: 'tek kat' },
  'NECK-CREW-RIB': {
    en: 'Crew neck, 1×1 rib band',
    ru: 'Горловина: рибана 1×1',
    ky: 'Моюн оюгу: рибана 1×1',
    kk: 'Мойын ойығы: рибана 1×1',
    tr: 'Bisiklet yaka, 1×1 ribana',
  },

  'PKT-KANGAROO': { en: 'Kangaroo pocket', ru: 'Карман-кенгуру', ky: 'Кенгуру чөнтөк', kk: 'Кенгуру қалта', tr: 'Kanguru cep' },
  'PKT-NONE': { en: 'No pocket', ru: 'Без кармана', ky: 'Чөнтөксүз', kk: 'Қалтасыз', tr: 'Cepsiz' },

  'RIB-1X1': {
    en: 'Cuffs and hem: 1×1 rib',
    ru: 'Манжеты и низ: рибана 1×1',
    ky: 'Жең учу жана этек: рибана 1×1',
    kk: 'Жең ұшы мен етек: рибана 1×1',
    tr: 'Manşet ve bel: 1×1 ribana',
  },
  'RIB-2X2': {
    en: 'Cuffs and hem: 2×2 rib',
    ru: 'Манжеты и низ: кашкорсе 2×2',
    ky: 'Жең учу жана этек: кашкорсе 2×2',
    kk: 'Жең ұшы мен етек: кашкорсе 2×2',
    tr: 'Manşet ve bel: 2×2 kaşkorse',
  },
  'HEM-SELF-CS': {
    en: 'Self-fabric hem and cuffs, coverstitched',
    ru: 'Низ и рукава подогнуты, распошивальный шов',
    ky: 'Этек жана жең учу бүктөлүп, распошивалка менен тигилген',
    kk: 'Етек пен жең ұшы бүктеліп, распошивалкамен тігілген',
    tr: 'Etek ve kol ucu kendinden kıvrık, reçme dikiş',
  },

  'CORD-FLAT-EYE': {
    en: 'Flat drawcord, metal eyelets',
    ru: 'Плоский шнур, металлические люверсы',
    ky: 'Жалпак боо, металл люверстер',
    kk: 'Жалпақ бау, металл люверстер',
    tr: 'Yassı kordon, metal kuşgözü',
  },
  'CORD-NONE': { en: 'No drawcord', ru: 'Без шнура', ky: 'Боосуз', kk: 'Баусыз', tr: 'Kordonsuz' },

  'SEAM-OL-CS': {
    en: 'Overlocked seams, coverstitched hems',
    ru: 'Швы оверлок, подгибка распошивальным швом',
    ky: 'Тигиштер оверлок менен, бүктөмө распошивалка менен',
    kk: 'Тігістер оверлокпен, бүктеме распошивалкамен',
    tr: 'Overlok dikiş, reçme baskı',
  },
  'SEAM-FLAT': {
    en: 'Flatlock seams',
    ru: 'Плоские швы (флэтлок)',
    ky: 'Жалпак тигиштер (флэтлок)',
    kk: 'Жалпақ тігістер (флэтлок)',
    tr: 'Flatlock (yassı) dikiş',
  },

  'DEC-NONE': { en: 'No decoration', ru: 'Без нанесения', ky: 'Жасалгасыз', kk: 'Безендірусіз', tr: 'Baskı ve nakış yok' },
  'DEC-DTF': { en: 'DTF transfer print', ru: 'DTF-печать', ky: 'DTF басма', kk: 'DTF баспа', tr: 'DTF baskı' },
  'DEC-SCREEN': { en: 'Screen print', ru: 'Шелкография', ky: 'Шелкография', kk: 'Шелкография', tr: 'Serigrafi baskı' },
  'DEC-EMB': { en: 'Machine embroidery', ru: 'Машинная вышивка', ky: 'Машина сайма', kk: 'Машина кестесі', tr: 'Makine nakışı' },

  'POS-FRONT-CENTER': {
    en: 'Front, centre',
    ru: 'Перед, по центру',
    ky: 'Алды, ортосунда',
    kk: 'Алды, ортасында',
    tr: 'Ön, ortada',
  },
  'POS-LEFT-CHEST': {
    en: 'Left chest',
    ru: 'Левая сторона груди',
    ky: 'Көкүрөктүн сол жагы',
    kk: 'Кеуденің сол жағы',
    tr: 'Sol göğüs',
  },
  'POS-BACK-CENTER': {
    en: 'Back, centre',
    ru: 'Спинка, по центру',
    ky: 'Арты, ортосунда',
    kk: 'Арқасы, ортасында',
    tr: 'Sırt, ortada',
  },

  'LBL-NECK-PRINT': {
    en: 'Printed neck label',
    ru: 'Печатная этикетка на горловине',
    ky: 'Моюнга басылган этикетка',
    kk: 'Мойынға басылған заттаңба',
    tr: 'Yaka içi baskılı etiket',
  },
  'LBL-NECK-WOVEN': {
    en: 'Woven neck label',
    ru: 'Тканая этикетка на горловине',
    ky: 'Моюндагы токулган этикетка',
    kk: 'Мойындағы тоқыма заттаңба',
    tr: 'Yaka içi dokuma etiket',
  },
  'LBL-NECK-NONE': {
    en: 'No neck label',
    ru: 'Без этикетки на горловине',
    ky: 'Моюнда этикетка жок',
    kk: 'Мойында заттаңба жоқ',
    tr: 'Yaka etiketi yok',
  },

  'PACK-POLY-10': {
    en: 'Folded, individual polybag, 10 per carton',
    ru: 'Сложено, индивидуальный пакет, 10 шт. в коробке',
    ky: 'Бүктөлгөн, ар бири өз пакетинде, кутуда 10 даана',
    kk: 'Бүктелген, әрқайсысы жеке пакетте, қорапта 10 дана',
    tr: 'Katlanmış, tekli poşet, kolide 10 adet',
  },
  'PACK-BULK': {
    en: 'Folded, no bags, packed in cartons',
    ru: 'Сложено, без пакетов, в коробках',
    ky: 'Бүктөлгөн, пакетсиз, кутуларда',
    kk: 'Бүктелген, пакетсіз, қораптарда',
    tr: 'Katlanmış, poşetsiz, kolide',
  },
}

export const POM_TERMS: Record<PomCode, Term> = {
  'POM-CHEST': {
    en: 'Chest width, 2 cm below armhole (½)',
    ru: 'Ширина по груди, 2 см ниже проймы (½)',
    ky: 'Көкүрөк туурасы, колтуктан 2 см төмөн (½)',
    kk: 'Кеуде ені, қолтықтан 2 см төмен (½)',
    tr: 'Göğüs genişliği, koltuk altından 2 cm aşağı (½)',
  },
  'POM-LENGTH': {
    en: 'Body length from HPS',
    ru: 'Длина изделия от ВТП',
    ky: 'Узундугу, ийиндин эң бийик чекитинен',
    kk: 'Ұзындығы, иықтың ең биік нүктесінен',
    tr: 'Boy, omuz en üst noktasından',
  },
  'POM-SHOULDER': { en: 'Shoulder width', ru: 'Ширина плеч', ky: 'Ийин туурасы', kk: 'Иық ені', tr: 'Omuz genişliği' },
  'POM-SLEEVE': {
    en: 'Sleeve length from shoulder point',
    ru: 'Длина рукава от плечевой точки',
    ky: 'Жеңдин узундугу, ийин чекитинен',
    kk: 'Жең ұзындығы, иық нүктесінен',
    tr: 'Kol boyu, omuz ucundan',
  },
  'POM-HEM': {
    en: 'Hem width, relaxed (½)',
    ru: 'Ширина низа в свободном состоянии (½)',
    ky: 'Этектин туурасы, тартылбаган (½)',
    kk: 'Етек ені, созылмаған (½)',
    tr: 'Etek genişliği, serbest (½)',
  },
  'POM-CUFF': {
    en: 'Cuff width, relaxed (½)',
    ru: 'Ширина манжеты в свободном состоянии (½)',
    ky: 'Жең учунун туурасы (½)',
    kk: 'Жең ұшының ені (½)',
    tr: 'Manşet genişliği, serbest (½)',
  },
  'POM-HOOD-H': {
    en: 'Hood height from HPS',
    ru: 'Высота капюшона от ВТП',
    ky: 'Капюшондун бийиктиги',
    kk: 'Капюшон биіктігі',
    tr: 'Kapüşon yüksekliği',
  },
  'POM-HOOD-W': {
    en: 'Hood width (½)',
    ru: 'Ширина капюшона (½)',
    ky: 'Капюшондун туурасы (½)',
    kk: 'Капюшон ені (½)',
    tr: 'Kapüşon genişliği (½)',
  },
  'POM-NECK': {
    en: 'Neck width, seam to seam',
    ru: 'Ширина горловины',
    ky: 'Моюн оюгунун туурасы',
    kk: 'Мойын ойығының ені',
    tr: 'Yaka genişliği',
  },
}

/** Language names as written in each language (used for care-label lists). */
export const LANGUAGE_NAMES: Record<Lang, Term> = {
  ru: { en: 'Russian', ru: 'русский', ky: 'орусча', kk: 'орысша', tr: 'Rusça' },
  ky: { en: 'Kyrgyz', ru: 'кыргызский', ky: 'кыргызча', kk: 'қырғызша', tr: 'Kırgızca' },
  kk: { en: 'Kazakh', ru: 'казахский', ky: 'казакча', kk: 'қазақша', tr: 'Kazakça' },
  tr: { en: 'Turkish', ru: 'турецкий', ky: 'түркчө', kk: 'түрікше', tr: 'Türkçe' },
  en: { en: 'English', ru: 'английский', ky: 'англисче', kk: 'ағылшынша', tr: 'İngilizce' },
}

/** Fixed passport wording. Values that vary are passed in, never concatenated from free text. */
export interface PassportText {
  title: string
  style: string
  version: string
  status: string
  draft: string
  locked: string
  template: string
  issued: string
  language: string
  sizes: string
  drawing: string
  front: string
  back: string
  materials: string
  bodyFabric: string
  composition: string
  colours: string
  trims: string
  construction: string
  measurements: string
  pom: string
  tolerance: string
  baseSize: string
  decoration: string
  method: string
  placement: string
  artworkSize: string
  offset: (cm: number) => string
  inks: (n: number) => string
  labelsPacking: string
  careLabel: (languages: string) => string
  inspection: string
  sampleLine: (n: number, lot: number, letter: string) => string
  critical: string
  measureCheck: string
  reference: (size: string) => string
  clarifications: string
  founderAnswer: string
  footer: (glossaryVersion: string) => string
  compositionOf: (cotton: number, polyester: number) => string
}

export const PASSPORT_TEXT: Record<Lang, PassportText> = {
  en: {
    title: 'Production Passport',
    style: 'Style',
    version: 'Version',
    status: 'Status',
    draft: 'Draft',
    locked: 'Locked',
    template: 'Template',
    issued: 'Issued',
    language: 'Language',
    sizes: 'Sizes',
    drawing: 'Technical drawing',
    front: 'Front',
    back: 'Back',
    materials: 'Materials',
    bodyFabric: 'Body fabric',
    composition: 'Composition',
    colours: 'Colours',
    trims: 'Trims',
    construction: 'Construction',
    measurements: 'Measurements, cm',
    pom: 'Point of measure',
    tolerance: 'Tol. ±',
    baseSize: 'Base size (sample)',
    decoration: 'Decoration',
    method: 'Method',
    placement: 'Placement',
    artworkSize: 'Artwork size',
    offset: (cm) => `${cm} cm below the neckline seam`,
    inks: (n) => `${n} ink ${n === 1 ? 'colour' : 'colours'}`,
    labelsPacking: 'Labels and packing',
    careLabel: (l) => `Composition and care label in ${l}`,
    inspection: 'Inspection plan',
    sampleLine: (n, lot, letter) => `ISO 2859-1, general level II, code ${letter}: ${n} pieces from a lot of ${lot}`,
    critical: 'Critical defects: none accepted',
    measureCheck: 'Measurements within the tolerances above',
    reference: (s) => `Reference: approved sample, size ${s}`,
    clarifications: 'Clarifications',
    founderAnswer: 'Founder’s answer, as written',
    footer: (v) => `Coded fields are rendered from glossary ${v}; free text is not translated.`,
    compositionOf: (c, p) => (p ? `${c}% cotton, ${p}% polyester` : `${c}% cotton`),
  },
  ru: {
    title: 'Производственный паспорт',
    style: 'Модель',
    version: 'Версия',
    status: 'Статус',
    draft: 'Черновик',
    locked: 'Зафиксирован',
    template: 'Шаблон',
    issued: 'Дата',
    language: 'Язык',
    sizes: 'Размеры',
    drawing: 'Технический эскиз',
    front: 'Перед',
    back: 'Спинка',
    materials: 'Материалы',
    bodyFabric: 'Основная ткань',
    composition: 'Состав',
    colours: 'Цвета',
    trims: 'Фурнитура',
    construction: 'Конструкция и обработка',
    measurements: 'Табель мер, см',
    pom: 'Мерка',
    tolerance: 'Допуск ±',
    baseSize: 'Базовый размер (образец)',
    decoration: 'Нанесение',
    method: 'Способ',
    placement: 'Расположение',
    artworkSize: 'Размер макета',
    offset: (cm) => `${cm} см ниже шва горловины`,
    inks: (n) => `${n} цв.`,
    labelsPacking: 'Этикетки и упаковка',
    careLabel: (l) => `Этикетка состава и ухода: ${l}`,
    inspection: 'План контроля качества',
    sampleLine: (n, lot, letter) => `ISO 2859-1, общий уровень II, код ${letter}: ${n} шт. из партии ${lot} шт.`,
    critical: 'Критические дефекты: не допускаются',
    measureCheck: 'Размеры в пределах допусков табеля мер',
    reference: (s) => `Эталон: утверждённый образец, размер ${s}`,
    clarifications: 'Уточнения',
    founderAnswer: 'Ответ заказчика (как написано)',
    footer: (v) => `Кодированные поля сформированы по глоссарию ${v}; свободный текст не переводится.`,
    compositionOf: (c, p) => (p ? `${c}% хлопок, ${p}% полиэстер` : `${c}% хлопок`),
  },
  ky: {
    title: 'Өндүрүш паспорту',
    style: 'Модель',
    version: 'Версия',
    status: 'Абалы',
    draft: 'Долбоор',
    locked: 'Бекитилген',
    template: 'Шаблон',
    issued: 'Күнү',
    language: 'Тил',
    sizes: 'Өлчөмдөр',
    drawing: 'Техникалык эскиз',
    front: 'Алды',
    back: 'Арты',
    materials: 'Материалдар',
    bodyFabric: 'Негизги кездеме',
    composition: 'Курамы',
    colours: 'Түстөр',
    trims: 'Фурнитура',
    construction: 'Конструкция жана иштетүү',
    measurements: 'Өлчөмдөр таблицасы, см',
    pom: 'Өлчөө чекити',
    tolerance: 'Четтөө ±',
    baseSize: 'Негизги өлчөм (үлгү)',
    decoration: 'Жасалга',
    method: 'Ыкма',
    placement: 'Жайгашуусу',
    artworkSize: 'Макеттин өлчөмү',
    offset: (cm) => `моюн тигишинен ${cm} см төмөн`,
    inks: (n) => `${n} түс`,
    labelsPacking: 'Этикеткалар жана таңгак',
    careLabel: (l) => `Курамы жана кароо этикеткасы: ${l}`,
    inspection: 'Сапатты текшерүү планы',
    sampleLine: (n, lot, letter) => `ISO 2859-1, жалпы деңгээл II, код ${letter}: ${lot} даана партиядан ${n} даана`,
    critical: 'Олуттуу кемчиликтер: жол берилбейт',
    measureCheck: 'Өлчөмдөр жогорудагы четтөөлөрдүн чегинде',
    reference: (s) => `Эталон: бекитилген үлгү, ${s} өлчөмү`,
    clarifications: 'Тактоолор',
    founderAnswer: 'Заказчиктин жообу (жазылгандай)',
    footer: (v) => `Коддолгон талаалар ${v} глоссарийи боюнча түзүлгөн; эркин текст которулбайт.`,
    compositionOf: (c, p) => (p ? `${c}% пахта, ${p}% полиэстер` : `${c}% пахта`),
  },
  kk: {
    title: 'Өндіріс паспорты',
    style: 'Модель',
    version: 'Нұсқа',
    status: 'Күйі',
    draft: 'Жоба',
    locked: 'Бекітілген',
    template: 'Үлгі',
    issued: 'Күні',
    language: 'Тіл',
    sizes: 'Өлшемдер',
    drawing: 'Техникалық эскиз',
    front: 'Алды',
    back: 'Арқасы',
    materials: 'Материалдар',
    bodyFabric: 'Негізгі мата',
    composition: 'Құрамы',
    colours: 'Түстер',
    trims: 'Фурнитура',
    construction: 'Құрылымы және өңдеу',
    measurements: 'Өлшемдер кестесі, см',
    pom: 'Өлшеу нүктесі',
    tolerance: 'Ауытқу ±',
    baseSize: 'Негізгі өлшем (үлгі)',
    decoration: 'Безендіру',
    method: 'Әдіс',
    placement: 'Орналасуы',
    artworkSize: 'Макет өлшемі',
    offset: (cm) => `мойын тігісінен ${cm} см төмен`,
    inks: (n) => `${n} түс`,
    labelsPacking: 'Заттаңба және қаптама',
    careLabel: (l) => `Құрамы мен күтім заттаңбасы: ${l}`,
    inspection: 'Сапаны тексеру жоспары',
    sampleLine: (n, lot, letter) => `ISO 2859-1, жалпы деңгей II, код ${letter}: ${lot} дана партиядан ${n} дана`,
    critical: 'Сыни ақаулар: жол берілмейді',
    measureCheck: 'Өлшемдер жоғарыдағы ауытқулар шегінде',
    reference: (s) => `Эталон: бекітілген үлгі, ${s} өлшемі`,
    clarifications: 'Нақтылаулар',
    founderAnswer: 'Тапсырыс берушінің жауабы (жазылғандай)',
    footer: (v) => `Кодталған өрістер ${v} глоссарийі бойынша жасалған; еркін мәтін аударылмайды.`,
    compositionOf: (c, p) => (p ? `${c}% мақта, ${p}% полиэстер` : `${c}% мақта`),
  },
  tr: {
    title: 'Üretim pasaportu',
    style: 'Model',
    version: 'Sürüm',
    status: 'Durum',
    draft: 'Taslak',
    locked: 'Kilitli',
    template: 'Şablon',
    issued: 'Tarih',
    language: 'Dil',
    sizes: 'Bedenler',
    drawing: 'Teknik çizim',
    front: 'Ön',
    back: 'Arka',
    materials: 'Malzemeler',
    bodyFabric: 'Ana kumaş',
    composition: 'İçerik',
    colours: 'Renkler',
    trims: 'Aksesuar',
    construction: 'Dikim detayları',
    measurements: 'Ölçü tablosu, cm',
    pom: 'Ölçü noktası',
    tolerance: 'Tolerans ±',
    baseSize: 'Ana beden (numune)',
    decoration: 'Baskı ve nakış',
    method: 'Yöntem',
    placement: 'Konum',
    artworkSize: 'Baskı ölçüsü',
    offset: (cm) => `yaka dikişinden ${cm} cm aşağı`,
    inks: (n) => `${n} renk`,
    labelsPacking: 'Etiket ve paketleme',
    careLabel: (l) => `Bileşim ve bakım etiketi: ${l}`,
    inspection: 'Kalite kontrol planı',
    sampleLine: (n, lot, letter) => `ISO 2859-1, genel seviye II, kod ${letter}: ${lot} adetlik partiden ${n} adet`,
    critical: 'Kritik hata: kabul edilmez',
    measureCheck: 'Ölçüler yukarıdaki toleranslar dahilinde',
    reference: (s) => `Referans: onaylı numune, ${s} beden`,
    clarifications: 'Açıklamalar',
    founderAnswer: 'Müşterinin yanıtı (yazıldığı gibi)',
    footer: (v) => `Kodlu alanlar ${v} sözlüğünden üretilir; serbest metin çevrilmez.`,
    compositionOf: (c, p) => (p ? `%${c} pamuk, %${p} polyester` : `%${c} pamuk`),
  },
}

/** Wording of the request card workshops receive in Telegram. */
export interface CardText {
  title: string
  colours: string
  quantity: (n: number) => string
  deadline: (date: string) => string
  delivery: string
  passport: string
  note: string
  quote: string
  ask: string
  decline: string
  cities: Record<'Bishkek' | 'Almaty' | 'Astana' | 'Osh', string>
}

export const CARD_TEXT: Record<'ru' | 'ky', CardText> = {
  ru: {
    title: 'Запрос на расчёт',
    colours: 'Цвета',
    quantity: (n) => `${n} шт.`,
    deadline: (d) => `Готовность до ${d}`,
    delivery: 'Доставка',
    passport: 'Паспорт',
    note: 'Комментарий заказчика',
    quote: 'Дать цену',
    ask: 'Задать вопрос',
    decline: 'Отказаться',
    cities: { Bishkek: 'Бишкек', Almaty: 'Алматы', Astana: 'Астана', Osh: 'Ош' },
  },
  ky: {
    title: 'Баа сурамы',
    colours: 'Түстөр',
    quantity: (n) => `${n} даана`,
    deadline: (d) => `${d} чейин даяр болсун`,
    delivery: 'Жеткирүү',
    passport: 'Паспорт',
    note: 'Заказчиктин комментарийи',
    quote: 'Баа берүү',
    ask: 'Суроо берүү',
    decline: 'Баш тартуу',
    cities: { Bishkek: 'Бишкек', Almaty: 'Алматы', Astana: 'Астана', Osh: 'Ош' },
  },
}
