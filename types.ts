export interface NFeEmitter {
  name: string;
  cnpj: string;
  uf: string;
}

export interface NFeRecipient {
  name: string;
  cnpj: string;
  uf: string;
}

export interface NFeTotals {
  products: number;
  totalNF: number;
  frete: number;
  despesas: number;
}

export interface NFeICMS {
  cst: string;
  baseCalculo: number;
  aliquota: number;
  valor: number;
}

export type ProductOriginType = 'signataria' | 'nao_signataria_sul_sudeste' | 'nao_signataria_outros' | 'exterior';

export interface NFeProduct {
  id: number;
  code: string;
  name: string;
  ncm: string;
  cest: string;
  cfop: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  ipi: number;
  frete: number;
  despesas: number;
  desconto: number;
  segmento: string;
  situacaoTributaria: string;
  icms: NFeICMS;
  originType?: ProductOriginType;
  
  // Calculation results
  mvaAplicada?: number;
  baseCalculoST?: number;
  valorICMSST?: number;
  aliquotaInterna?: number;
}

export interface NFeData {
  numeroNF: string;
  emitter: NFeEmitter;
  recipient: NFeRecipient;
  totals: NFeTotals;
  products: NFeProduct[];
}

export interface CalculationResult {
  baseCalculoST: number;
  valorICMSST: number;
  mvaAplicada: number;
  aliquotaInterna: number;
}