import jsPDF from 'jspdf';
// FIX: Changed import to use autoTable as a function to avoid module augmentation issues.
import autoTable from 'jspdf-autotable';
import { NFeData, NFeProduct } from '../types';

// FIX: Removed manual module augmentation for 'jspdf' as it was causing a module resolution error.
// The jspdf-autotable types are handled by using autoTable as a function.

const formatCurrency = (value: number) => {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const generatePdfReport = (nfeData: NFeData, products: NFeProduct[], calculationTotals: any) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  let y = 15;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Análise e Cálculo de ICMS-ST', doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`NF-e: ${nfeData.numeroNF}`, doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 10;
  
  // NFe Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da NF-e', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const halfWidth = doc.internal.pageSize.width / 2;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Emitente:', 14, y);
  doc.text('Destinatário:', halfWidth, y);
  y+=5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(nfeData.emitter.name, 14, y, { maxWidth: halfWidth - 20 });
  const emitterNameLines = doc.splitTextToSize(nfeData.emitter.name, halfWidth - 20);
  const recipientNameLines = doc.splitTextToSize(nfeData.recipient.name, halfWidth - 20);
  const maxLines = Math.max(emitterNameLines.length, recipientNameLines.length);

  doc.text(nfeData.recipient.name, halfWidth, y, { maxWidth: halfWidth - 20 });
  y += (maxLines * 4); // Adjust y based on max lines

  doc.text(`${nfeData.emitter.cnpj} - ${nfeData.emitter.uf}`, 14, y);
  doc.text(`${nfeData.recipient.cnpj} - ${nfeData.recipient.uf}`, halfWidth, y);
  y += 10;
  
  // Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do Cálculo ICMS-ST', 14, y);
  y += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total ICMS-ST a Recolher:', 14, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(formatCurrency(calculationTotals.totalICMSST), 65, y);
  y += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Base de Cálculo ST:', 14, y);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(calculationTotals.totalBaseST), 65, y);
  y += 8;

  // Breakdown by MVA
  doc.setFont('helvetica', 'bold');
  doc.text('Valores por MVA:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  Array.from(calculationTotals.icmsSTByMVA.entries()).sort((a,b) => a[0] - b[0]).forEach(([mva, total]) => {
    doc.text(`- MVA ${Number(mva).toFixed(2)}%:`, 20, y);
    doc.text(formatCurrency(total as number), 55, y);
    y+= 5;
  });
  y += 5;


  // Products Table
  const head = [
    ['#', 'Produto', 'NCM', 'Vlr. Partida', 'MVA %', 'BC ST', 'ICMS-ST']
  ];
  
  const body = products.map((p, index) => {
    const valorDePartida = (p.totalValue || 0) + (p.ipi || 0) + (p.frete || 0) + (p.despesas || 0) - (p.desconto || 0);
    return [
      index + 1,
      p.name,
      p.ncm,
      formatCurrency(valorDePartida),
      `${p.mvaAplicada?.toFixed(2)}%`,
      formatCurrency(p.baseCalculoST || 0),
      formatCurrency(p.valorICMSST || 0),
    ];
  });
  
  // Footer row for totals
   const footer = [
     ['TOTAIS', '', '', 
       formatCurrency(products.reduce((acc, p) => acc + (p.totalValue || 0) + (p.ipi || 0) + (p.frete || 0) + (p.despesas || 0) - (p.desconto || 0), 0)),
       '', 
       formatCurrency(calculationTotals.totalBaseST), 
       formatCurrency(calculationTotals.totalICMSST)]
   ];


  // FIX: Changed to call autoTable as a function, passing the doc instance.
  autoTable(doc, {
    startY: y,
    head: head,
    body: body,
    foot: footer,
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133], fontSize: 8 },
    footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 55 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 15, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' },
    }
  });

  doc.save(`Relatorio_NFe_${nfeData.numeroNF}.pdf`);
};
