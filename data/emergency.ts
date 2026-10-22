export type EmergencyNumber = {
  number: string;
  service: string;
  when: string;
  primary?: boolean;
};

export const emergencyNumbers: EmergencyNumber[] = [
  { number: '19', service: 'Police', when: 'In cities and towns', primary: true },
  { number: '15', service: 'Ambulance & fire', when: 'Civil protection', primary: true },
  { number: '112', service: 'Emergency (mobile)', when: 'From any mobile phone' },
  { number: '177', service: 'Gendarmerie', when: 'Outside cities and on the road' },
];

export const emergencyTips: { title: string; text: string }[] = [
  { title: 'Night pharmacy', text: 'Every pharmacy door shows the “pharmacie de garde” on duty tonight. Hotel and riad staff also know it.' },
  { title: 'Lost passport', text: 'Report it at the nearest police station first, then contact your embassy in Rabat (most embassies are there).' },
  { title: 'Tourist police', text: 'Big cities like Marrakech and Fes have a Brigade Touristique near the main squares. Ask for “la police touristique”.' },
  { title: 'Say it in Darija', text: '“3teqni!” means “Help me!”. “Khassni tbib” means “I need a doctor”.' },
];
