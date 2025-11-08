import { NFeData, NFeProduct } from '../types';

const getTagValue = (element: Element | null, tagName: string): string => {
  if (!element) return '';
  const tag = element.querySelector(tagName);
  return tag?.textContent || '';
};

const getTagFloatValue = (element: Element | null, tagName: string): number => {
  return parseFloat(getTagValue(element, tagName) || '0');
};

export const parseNFeXML = (xmlString: string): NFeData => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Erro ao analisar o XML. Verifique o formato do arquivo.');
  }

  const infNFe = xmlDoc.querySelector('infNFe');
  if (!infNFe) {
    throw new Error('Tag <infNFe> não encontrada no XML.');
  }

  const emitter = {
    name: getTagValue(infNFe, 'emit > xNome'),
    cnpj: getTagValue(infNFe, 'emit > CNPJ'),
    uf: getTagValue(infNFe, 'emit > enderEmit > UF'),
  };

  const recipient = {
    name: getTagValue(infNFe, 'dest > xNome'),
    cnpj: getTagValue(infNFe, 'dest > CNPJ'),
    uf: getTagValue(infNFe, 'dest > enderDest > UF'),
  };

  const icmsTot = infNFe.querySelector('total > ICMSTot');
  const totals = {
    products: getTagFloatValue(icmsTot, 'vProd'),
    totalNF: getTagFloatValue(icmsTot, 'vNF'),
    frete: getTagFloatValue(icmsTot, 'vFrete'),
    despesas: getTagFloatValue(icmsTot, 'vOutro'),
  };
  
  const numeroNF = getTagValue(infNFe, 'ide > nNF');

  const products: NFeProduct[] = [];
  const detElements = infNFe.querySelectorAll('det');
  detElements.forEach((det, index) => {
    const prod = det.querySelector('prod');
    const imposto = det.querySelector('imposto');
    const icmsEl = imposto?.querySelector('ICMS');
    
    const icmsContent = icmsEl ? (icmsEl.children[0] ?? null) : null;
    
    if (prod && icmsContent) {
      // Prioritize item-level freight/expenses, but if not present, apportion from total
      let vFreteItem = getTagFloatValue(prod, 'vFrete');
      let vOutroItem = getTagFloatValue(prod, 'vOutro');
      const vProdItem = getTagFloatValue(prod, 'vProd');

      if (totals.products > 0) {
        if (vFreteItem === 0 && totals.frete > 0) {
            vFreteItem = (vProdItem / totals.products) * totals.frete;
        }
        if (vOutroItem === 0 && totals.despesas > 0) {
            vOutroItem = (vProdItem / totals.products) * totals.despesas;
        }
      }

      const product: NFeProduct = {
        id: index,
        code: getTagValue(prod, 'cProd'),
        name: getTagValue(prod, 'xProd'),
        ncm: getTagValue(prod, 'NCM'),
        cest: getTagValue(prod, 'CEST'),
        cfop: getTagValue(prod, 'CFOP'),
        quantity: getTagFloatValue(prod, 'qCom'),
        unitValue: getTagFloatValue(prod, 'vUnCom'),
        totalValue: vProdItem,
        ipi: getTagFloatValue(imposto, 'IPI > IPITrib > vIPI'),
        frete: vFreteItem,
        despesas: vOutroItem,
        desconto: getTagFloatValue(prod, 'vDesc'),
        segmento: '', // Will be filled automatically
        situacaoTributaria: '', // User input
        icms: {
          cst: getTagValue(icmsContent, 'CST'),
          baseCalculo: getTagFloatValue(icmsContent, 'vBC'),
          aliquota: getTagFloatValue(icmsContent, 'pICMS'),
          valor: getTagFloatValue(icmsContent, 'vICMS'),
        },
      };
      products.push(product);
    }
  });

  return { numeroNF, emitter, recipient, totals, products };
};