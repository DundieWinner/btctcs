export interface Curator {
  name: string;
  github: string;
  x?: string; // Optional X handle
}

export interface Company {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  description?: string;
  curators: Curator[];
}

export const companies: Company[] = [
  {
    id: 'h100',
    name: 'H100',
    displayName: 'H100 Company Dashboard',
    emoji: '🏢',
    curators: [
      {
        name: 'DunderHodl',
        github: 'DundieWinner',
        x: 'DunderHodl'
      }
    ]
  },
  {
    id: 'lqwd',
    name: 'LQWD',
    displayName: 'LQWD Company Dashboard',
    emoji: '💧',
    curators: [
      {
        name: 'DunderHodl',
        github: 'DundieWinner',
        x: 'DunderHodl'
      }
    ]
  },
  {
    id: 'metaplanet',
    name: 'Metaplanet',
    displayName: 'Metaplanet Company Dashboard',
    emoji: '🌎',
    curators: [
      {
        name: 'DunderHodl',
        github: 'DundieWinner',
        x: 'DunderHodl'
      }
    ]
  },
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find(company => company.id === id);
};

export const getCompanyByName = (name: string): Company | undefined => {
  return companies.find(company => company.name.toLowerCase() === name.toLowerCase());
};
