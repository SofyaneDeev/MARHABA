export type Phrase = {
  category: string;
  english: string;
  /** Darija written the way it sounds ("3" is the deep throat "a"). */
  darija: string;
  arabic: string;
  tip?: string;
};

export const phrases: Phrase[] = [
  { category: 'Basics', english: 'Hello (peace be upon you)', darija: 'Salam alaykum', arabic: 'السلام عليكم', tip: 'The standard greeting. The reply is “Wa alaykum salam”.' },
  { category: 'Basics', english: 'How are you?', darija: 'Labas?', arabic: 'لاباس؟', tip: 'Answer “Labas, l-hamdulillah” (fine, thank God).' },
  { category: 'Basics', english: 'Thank you', darija: 'Shukran', arabic: 'شكرا' },
  { category: 'Basics', english: 'Thank you very much', darija: 'Shukran bezzaf', arabic: 'شكرا بزاف' },
  { category: 'Basics', english: 'Please', darija: '3afak', arabic: 'عفاك' },
  { category: 'Basics', english: 'Yes / No', darija: 'Iyeh / La', arabic: 'إيه / لا' },
  { category: 'Basics', english: 'Excuse me / Sorry', darija: 'Smeh li', arabic: 'سمح لي' },
  { category: 'Basics', english: 'Goodbye', darija: 'Bslama', arabic: 'بسلامة' },
  { category: 'Shopping', english: 'How much is this?', darija: 'Bshhal hada?', arabic: 'بشحال هادا؟' },
  { category: 'Shopping', english: "It's too expensive", darija: 'Ghali bezzaf', arabic: 'غالي بزاف' },
  { category: 'Shopping', english: 'Lower the price a little, please', darija: 'Nqes shwiya 3afak', arabic: 'نقص شوية عفاك' },
  { category: 'Shopping', english: "I'm just looking", darija: 'Ghir kanshouf', arabic: 'غير كانشوف', tip: 'Polite and useful in the souks.' },
  { category: 'Shopping', english: 'No, thank you', darija: 'La, shukran', arabic: 'لا شكرا' },
  { category: 'Getting around', english: 'Where is…?', darija: 'Fin kayn…?', arabic: 'فين كاين…؟' },
  { category: 'Getting around', english: 'Use the meter, please', darija: 'Dir l-compteur 3afak', arabic: 'دير الكونتور عفاك', tip: 'Petit taxis in cities should use the meter.' },
  { category: 'Getting around', english: 'Stop here', darija: 'Wqef hna', arabic: 'وقف هنا' },
  { category: 'Getting around', english: 'Left / Right', darija: 'Liser / Limen', arabic: 'ليسر / ليمن' },
  { category: 'Getting around', english: 'Straight ahead', darija: 'Nishan', arabic: 'نيشان' },
  { category: 'Food', english: 'Water', darija: 'Lma', arabic: 'الما' },
  { category: 'Food', english: 'Without sugar', darija: 'Bla sukkar', arabic: 'بلا سكر', tip: 'Mint tea is served very sweet by default.' },
  { category: 'Food', english: 'Delicious!', darija: 'Bnin!', arabic: 'بنين' },
  { category: 'Food', english: 'The bill, please', darija: 'L-hsab 3afak', arabic: 'الحساب عفاك' },
  { category: 'Emergency', english: 'Help me!', darija: '3teqni!', arabic: 'عتقني' },
  { category: 'Emergency', english: 'I need a doctor', darija: 'Khassni tbib', arabic: 'خاصني طبيب' },
  { category: 'Emergency', english: 'Call the police', darija: '3eyyet 3la l-bulis', arabic: 'عيط على البوليس' },
  { category: 'Emergency', english: "I'm lost", darija: 'Tlft', arabic: 'تلفت' },
  { category: 'Emergency', english: 'Pharmacy', darija: 'Farmasyan', arabic: 'فرماسيان' },
];

export const phraseCategories = ['All', ...new Set(phrases.map((p) => p.category))];

export function filterPhrases(category: string, query: string): Phrase[] {
  const q = query.trim().toLowerCase();
  return phrases.filter(
    (p) =>
      (category === 'All' || p.category === category) &&
      (!q || `${p.english} ${p.darija} ${p.category} ${p.tip ?? ''}`.toLowerCase().includes(q)),
  );
}
