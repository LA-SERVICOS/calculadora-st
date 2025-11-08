const CEST_SEGMENTOS: Record<string, string> = {
  '01': 'Autopeças',
  '02': 'Bebidas Alcoólicas, exceto Cerveja e Chope',
  '03': 'Cervejas, Chopes, Refrigerantes, Águas e Outras Bebidas',
  '04': 'Cigarros e Outros Produtos Derivados do Fumo',
  '05': 'Cimentos',
  '06': 'Combustíveis e Lubrificantes',
  '07': 'Energia Elétrica',
  '08': 'Ferramentas',
  '09': 'Lâmpadas, Reatores e "Starter"',
  '10': 'Materiais de Construção e Congêneres',
  '11': 'Materiais de Limpeza',
  '12': 'Materiais Elétricos',
  '13': 'Medicamentos de Uso Humano e Outros Produtos Farmacêuticos',
  '14': 'Papéis, Plásticos, Produtos Cerâmicos e Vidros',
  '16': 'Pneumáticos, Câmaras de Ar e Protetores de Borracha',
  '17': 'Produtos Alimentícios',
  '19': 'Produtos de Papelaria',
  '20': 'Produtos de Perfumaria e de Higiene Pessoal e Cosméticos',
  '21': 'Produtos Eletrônicos, Eletroeletrônicos e Eletrodomésticos',
  '22': 'Rações para Animais Domésticos',
  '23': 'Sorvetes e Preparados para Fabricação de Sorvetes em Máquinas',
  '24': 'Tintas e Vernizes',
  '25': 'Veículos Automotores',
  '26': 'Veículos de Duas e Três Rodas Motorizados',
  '28': 'Venda de Mercadorias pelo Sistema Porta a Porta',
};

export const getSegmentoByCest = (cest: string): string => {
  if (!cest || cest.length < 2) {
    return 'Antecipação';
  }
  const cestPrefix = cest.substring(0, 2);
  return CEST_SEGMENTOS[cestPrefix] || 'Antecipação';
};
