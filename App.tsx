import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { NFeData, NFeProduct, ProductOriginType } from './types';
import { parseNFeXML } from './services/nfeParser';
import { getSegmentoByCest } from './services/cestService';
import { calculate, isSpecialNCM } from './services/mvaService';
import { generatePdfReport } from './services/pdfGenerator';
import { UploadIcon, FileXmlIcon, CalculatorIcon, Spinner, XCircleIcon, DocumentDownloadIcon } from './components/Icons';

const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

function App() {
  const [nfeData, setNfeData] = useState<NFeData | null>(null);
  const [products, setProducts] = useState<NFeProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetState = () => {
    setNfeData(null);
    setProducts([]);
    setIsLoading(false);
    setError(null);
    setFileName(null);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    resetState();
    const file = acceptedFiles[0];
    setFileName(file.name);
    setIsLoading(true);

    try {
      const xmlString = await file.text();
      const parsedData = parseNFeXML(xmlString);
      const productsWithSegment = parsedData.products.map(p => ({
        ...p,
        situacaoTributaria: 'NORMAL', // Default to NORMAL
        segmento: getSegmentoByCest(p.cest),
      }));
      setNfeData(parsedData);
      setProducts(productsWithSegment);
    } catch (err: any) {
      setError(`Erro ao processar arquivo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/xml': ['.xml'], 'text/xml': ['.xml'] },
    multiple: false,
  });

  const handleProductChange = (id: number, field: keyof NFeProduct, value: string | number | ProductOriginType) => {
    setProducts(prevProducts => {
      const changedProduct = prevProducts.find(p => p.id === id);

      if (field === 'originType' && changedProduct) {
        const newOrigin = value as ProductOriginType;
        const { ncm, cest, icms } = changedProduct;
        const aliquota = icms.aliquota;

        return prevProducts.map(p => {
          if (p.ncm === ncm && p.cest === cest && p.icms.aliquota === aliquota) {
            return { ...p, originType: newOrigin };
          }
          return p;
        });
      }

      return prevProducts.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      );
    });
  };

  const handleCalculate = () => {
    if (!products.length) return;
    setError(null);

    const specialProductWithoutOrigin = products.find(p => isSpecialNCM(p.ncm) && !p.originType);
    if (specialProductWithoutOrigin) {
      setError(`Por favor, selecione a origem da mercadoria para o produto "${specialProductWithoutOrigin.name}" (NCM: ${specialProductWithoutOrigin.ncm}).`);
      return;
    }

    const calculatedProducts = products.map(p => {
      const result = calculate(p);
      return { ...p, ...result };
    });
    setProducts(calculatedProducts);
  };
  
  const hasCalculated = products.length > 0 && products[0].hasOwnProperty('valorICMSST');

  const calculationTotals = useMemo(() => {
    const initialTotals = {
      totalBaseST: 0, totalICMSST: 0, totalProdutos: 0, totalIPI: 0,
      totalFrete: 0, totalDespesas: 0, totalDesconto: 0,
      icmsSTByMVA: new Map<number, number>(),
    };

    if (!hasCalculated) {
      return initialTotals;
    }

    return products.reduce((acc, p) => {
      acc.totalBaseST += p.baseCalculoST || 0;
      acc.totalICMSST += p.valorICMSST || 0;
      acc.totalProdutos += p.totalValue || 0;
      acc.totalIPI += p.ipi || 0;
      acc.totalFrete += p.frete || 0;
      acc.totalDespesas += p.despesas || 0;
      acc.totalDesconto += p.desconto || 0;

      const mvaKey = p.mvaAplicada ?? 0;
      const currentMvaTotal = acc.icmsSTByMVA.get(mvaKey) || 0;
      acc.icmsSTByMVA.set(mvaKey, currentMvaTotal + (p.valorICMSST || 0));

      return acc;
    }, initialTotals);
  }, [products, hasCalculated]);
  
  const cfopTotals = useMemo(() => {
    if (!products.length) {
      return new Map<string, number>();
    }

    return products.reduce((acc, p) => {
      const currentTotal = acc.get(p.cfop) || 0;
      acc.set(p.cfop, currentTotal + p.totalValue);
      return acc;
    }, new Map<string, number>());
  }, [products]);

  const handleGeneratePdf = () => {
    if (!nfeData || !hasCalculated) {
      setError("Calcule o ICMS-ST antes de gerar o PDF.");
      return;
    }
    generatePdfReport(nfeData, products, calculationTotals);
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-700">Analisador de NF-e e Calculadora ICMS-ST</h1>
          {nfeData && (
             <button
              onClick={resetState}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
              Limpar
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!nfeData && (
          <div
            {...getRootProps()}
            className={`mt-8 border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4 text-slate-500">
              <UploadIcon className="w-12 h-12" />
              {isLoading ? (
                <p>Processando XML...</p>
              ) : isDragActive ? (
                <p>Solte o arquivo XML aqui...</p>
              ) : (
                <p>Arraste e solte o arquivo XML da NF-e aqui, ou clique para selecionar.</p>
              )}
            </div>
          </div>
        )}

        {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

        {nfeData && (
          <div className="mt-4 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-bold text-slate-600">Emitente</h3>
                  <p>{nfeData.emitter.name}</p>
                  <p className="text-sm text-slate-500">{nfeData.emitter.cnpj} - {nfeData.emitter.uf}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-600">Destinatário</h3>
                  <p>{nfeData.recipient.name}</p>
                  <p className="text-sm text-slate-500">{nfeData.recipient.cnpj} - {nfeData.recipient.uf}</p>
                </div>
                 <div>
                  <h3 className="font-bold text-slate-600">Totais por CFOP</h3>
                  <div className="text-sm text-slate-500 space-y-1">
                    {Array.from(cfopTotals.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([cfop, total]) => (
                        <div key={cfop} className="flex justify-between">
                            <span>{`${cfop}:`}</span>
                            <span className="font-mono">{formatCurrency(total)}</span>
                        </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-slate-600">Nota Fiscal Nº</h3>
                    <p className="text-2xl font-mono">{nfeData.numeroNF}</p>
                    <p className="text-sm text-slate-500">Valor Total: {formatCurrency(nfeData.totals.totalNF)}</p>
                </div>
                 {hasCalculated && (
                    <div className="md:col-span-4 mt-4 border-t pt-4">
                        <p className="text-sm font-medium text-gray-500">Total ICMS-ST a Recolher</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(calculationTotals.totalICMSST)}</p>
                        <div className="text-xs text-gray-500 mt-2 space-y-1 max-w-sm">
                            {Array.from(calculationTotals.icmsSTByMVA.entries()).sort((a,b) => a[0] - b[0]).map(([mva, total]) => (
                            <div key={mva} className="flex justify-between border-b last:border-b-0 py-1">
                                <span>{`Total MVA ${mva.toFixed(2)}%:`}</span>
                                <span className="font-mono">{formatCurrency(total)}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                  {isLoading ? <Spinner className="h-5 w-5" /> : <CalculatorIcon className="h-5 w-5" />}
                  Calcular ICMS-ST
                </button>
                {hasCalculated && (
                  <button
                    onClick={handleGeneratePdf}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <DocumentDownloadIcon className="h-5 w-5" />
                    Gerar Relatório PDF
                  </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                  <tr>
                    <th scope="col" className="px-3 py-3">#</th>
                    <th scope="col" className="px-3 py-3">Produto</th>
                    <th scope="col" className="px-3 py-3">NCM</th>
                    <th scope="col" className="px-3 py-3">CEST</th>
                    <th scope="col" className="px-3 py-3">Segmento</th>
                    <th scope="col" className="px-3 py-3">CFOP</th>
                    <th scope="col" className="px-3 py-3 w-48">Origem Mercadoria</th>
                    <th scope="col" className="px-3 py-3 text-right">Vlr. Prod.</th>
                    <th scope="col" className="px-3 py-3 text-right">Vlr. IPI</th>
                    <th scope="col" className="px-3 py-3 text-right">Vlr. Frete</th>
                    <th scope="col" className="px-3 py-3 text-right">Despesas</th>
                    <th scope="col" className="px-3 py-3 text-right">Desconto</th>
                    <th scope="col" className="px-3 py-3 text-right">Alíq. ICMS</th>
                    <th scope="col" className="px-3 py-3 text-right">Vlr. ICMS</th>
                    <th scope="col" className="px-3 py-3">Sit. Tributária</th>
                    <th scope="col" className="px-3 py-3">ALIQ. INTERNA</th>
                    <th scope="col" className="px-3 py-3">MVA Aplicado (%)</th>
                    <th scope="col" className="px-3 py-3 text-right">Base Cálculo ST</th>
                    <th scope="col" className="px-3 py-3 text-right">Valor ICMS-ST</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr key={p.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-900">{index + 1}</td>
                      <td className="px-3 py-2 max-w-xs truncate" title={p.name}>{p.name}</td>
                      <td className="px-3 py-2 font-mono">{p.ncm}</td>
                      <td className="px-3 py-2 font-mono">{p.cest}</td>
                      <td className="px-3 py-2">{p.segmento}</td>
                      <td className="px-3 py-2 font-mono">{p.cfop}</td>
                       <td className="px-3 py-2">
                        {isSpecialNCM(p.ncm) ? (
                          <select 
                            value={p.originType || ''}
                            onChange={(e) => handleProductChange(p.id, 'originType', e.target.value as ProductOriginType)}
                            className="w-full p-1 border rounded-md text-xs"
                          >
                            <option value="">Selecione...</option>
                            <option value="signataria">Signatária do Prot. 46/2000</option>
                            <option value="nao_signataria_sul_sudeste">Não Signatária (Sul/Sudeste)</option>
                            <option value="nao_signataria_outros">Não Signatária (Outras)</option>
                            <option value="exterior">Exterior</option>
                          </select>
                        ) : 'N/A'}
                       </td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.totalValue)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.ipi)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.frete)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.despesas)}</td>
                      <td className="px-3 py-2 text-right font-mono text-red-500">{formatCurrency(p.desconto)}</td>
                      <td className="px-3 py-2 text-right font-mono">{p.icms.aliquota.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.icms.valor)}</td>
                      <td className="px-3 py-2">
                         <input
                          type="text"
                          value={p.situacaoTributaria}
                          onChange={(e) => handleProductChange(p.id, 'situacaoTributaria', e.target.value)}
                          className="w-24 p-1 border rounded-md"
                        />
                      </td>
                       <td className="px-3 py-2 text-center font-mono">{hasCalculated ? `${p.aliquotaInterna?.toFixed(2)}%` : '-'}</td>
                       <td className="px-3 py-2 text-center font-mono">{hasCalculated ? `${p.mvaAplicada?.toFixed(2)}%` : '-'}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{hasCalculated ? formatCurrency(p.baseCalculoST || 0) : '-'}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-indigo-600">{hasCalculated ? formatCurrency(p.valorICMSST || 0) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                {hasCalculated && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <td colSpan={7} className="px-3 py-3 text-right text-sm">TOTAIS</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalProdutos)}</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalIPI)}</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalFrete)}</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalDespesas)}</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalDesconto)}</td>
                      <td colSpan={5} className="px-3 py-3 text-sm"></td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalBaseST)}</td>
                      <td className="px-3 py-3 text-right text-sm font-mono">{formatCurrency(calculationTotals.totalICMSST)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;