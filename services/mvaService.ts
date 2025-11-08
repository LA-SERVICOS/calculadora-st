import { NFeProduct, CalculationResult, ProductOriginType } from '../types';

// NCMs from Decreto 27.987/2005 with special MVA logic based on origin
const produtosAlimenticiosNCMs = [
  '19021100', '19021900', '19059010', '19059020', '19059090', '19053100',
  '19023000', '19052010'
];

// MVA table for "produtos alimentícios" based on origin
// Simplified from Decreto 27.987/2005 Art. 7
const mvaEspecialTable: Record<ProductOriginType, number> = {
  'signataria': 35, // Protocolo ICMS 50/2005
  'nao_signataria_sul_sudeste': 45, // Regiões Sul e Sudeste
  'nao_signataria_outros': 30, // Regiões Norte, Nordeste, Centro-Oeste
  'exterior': 35, // Exterior
};

// Check if a product has special MVA rules
export const isSpecialNCM = (ncm: string): boolean => {
  return produtosAlimenticiosNCMs.includes(ncm);
};

// MVA data extracted from Tabela_NCM.pdf
// mva4 -> Aliquota 4%, mva7 -> Aliquota 7%, mva12 -> Aliquota 12%
// FIX: Removed duplicate NCM entries ('39174090', '40169300', '40169990') from the object below to resolve "multiple properties with the same name" error.
const mvaTable: Record<string, { mva4: number; mva7: number; mva12: number; mvaOriginal: number }> = {
    "12074090": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "19021900": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "19052010": { mva4: 56.98, mva7: 45, mva12: 43.9, mvaOriginal: 30 },
    "19053100": { mva4: 56.98, mva7: 52.08, mva12: 43.9, mvaOriginal: 30 },
    "19053200": { mva4: 75.09, mva7: 45, mva12: 60.5, mvaOriginal: 45 },
    "19059010": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "19059020": { mva4: 56.98, mva7: 45, mva12: 43.9, mvaOriginal: 30 },
    "19059090": { mva4: 56.98, mva7: 45, mva12: 43.9, mvaOriginal: 30 },
    "21050010": { mva4: 105.28, mva7: 98.87, mva12: 88.18, mvaOriginal: 70 },
    "21069090": { mva4: 105.28, mva7: 98.87, mva12: 88.18, mvaOriginal: 70 },
    "22011000": { mva4: 189.81, mva7: 140, mva12: 165.66, mvaOriginal: 140 },
    "27101932": { mva4: 109.45, mva7: 102.9, mva12: 92, mvaOriginal: 73.45 },
    "29362940": { mva4: 70.67, mva7: 65.34, mva12: 56.45, mvaOriginal: 41.34 },
    "32081010": { mva4: 63.02, mva7: 57.92, mva12: 49.43, mvaOriginal: 35 },
    "32091010": { mva4: 63.02, mva7: 57.92, mva12: 49.43, mvaOriginal: 35 },
    "32149000": { mva4: 70.26, mva7: 64.94, mva12: 56.08, mvaOriginal: 41 },
    "33049990": { mva4: 59.13, mva7: 54.16, mva12: 45.87, mvaOriginal: 31.78 },
    "33051000": { mva4: 65.29, mva7: 60.12, mva12: 51.51, mvaOriginal: 36.88 },
    "33059000": { mva4: 83.2, mva7: 77.47, mva12: 67.93, mvaOriginal: 51.71 },
    "33061000": { mva4: 63.34, mva7: 58.24, mva12: 49.73, mvaOriginal: 35.27 },
    "33072010": { mva4: 81.1, mva7: 75.44, mva12: 66, mvaOriginal: 49.97 },
    "33072090": { mva4: 82.88, mva7: 77.17, mva12: 67.64, mvaOriginal: 51.45 },
    "34011190": { mva4: 88.11, mva7: 82.23, mva12: 72.44, mvaOriginal: 55.78 },
    "39161000": { mva4: 89.58, mva7: 83.66, mva12: 73.79, mvaOriginal: 57 },
    "39169090": { mva4: 89.58, mva7: 83.66, mva12: 73.79, mvaOriginal: 57 },
    "39172100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39172300": { mva4: 64.23, mva7: 59.09, mva12: 50.54, mvaOriginal: 36 },
    "39173229": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39173290": { mva4: 64.23, mva7: 59.09, mva12: 50.54, mvaOriginal: 36 },
    "39173900": { mva4: 64.23, mva7: 59.09, mva12: 50.54, mvaOriginal: 36 },
    "39174090": { mva4: 64.23, mva7: 59.09, mva12: 50.54, mvaOriginal: 36 },
    "39191020": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39199090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39201010": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "39201099": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "39205100": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "39206100": { mva4: 84.75, mva7: 78.98, mva12: 69.35, mvaOriginal: 53 },
    "39209200": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "39209990": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "39219019": { mva4: 84.75, mva7: 78.98, mva12: 69.36, mvaOriginal: 53 },
    "39229000": { mva4: 79.92, mva7: 74.3, mva12: 64.93, mvaOriginal: 49 },
    "39233090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39241000": { mva4: 108.53, mva7: 102.01, mva12: 91.15, mvaOriginal: 72.69 },
    "39249000": { mva4: 117.36, mva7: 110.57, mva12: 99.25, mvaOriginal: 80 },
    "39259090": { mva4: 76.3, mva7: 70.79, mva12: 61.61, mvaOriginal: 46 },
    "39263000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "39269010": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "39269090": { mva4: 70.67, mva7: 65.34, mva12: 56.45, mvaOriginal: 41.34 },
    "40081100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40091100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40091290": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40092210": { mva4: 105.28, mva7: 98.87, mva12: 88.18, mvaOriginal: 70 },
    "40093100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40094100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40094290": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40103100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40103200": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40103300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40103500": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40103900": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40118090": { mva4: 59.4, mva7: 54.42, mva12: 46.11, mvaOriginal: 32 },
    "40119090": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "40129010": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "40129090": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "40139000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "40149090": { mva4: 108.53, mva7: 102.01, mva12: 91.15, mvaOriginal: 72.69 },
    "40161010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40161090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40169300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "40169990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "45049000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "48239099": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "68129990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "68138110": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "68138190": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "68138910": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "69120000": { mva4: 120.98, mva7: 114.08, mva12: 102.57, mvaOriginal: 83 },
    "70071100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "70071900": { mva4: 73.89, mva7: 68.45, mva12: 59.4, mvaOriginal: 44 },
    "70091000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "72171090": { mva4: 73.89, mva7: 68.45, mva12: 59.4, mvaOriginal: 44 },
    "73049090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73071100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73071910": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73071920": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73071990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73072100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73072200": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73072300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73072900": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73079100": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73079200": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73079900": { mva4: 65.43, mva7: 60.26, mva12: 51.65, mvaOriginal: 37 },
    "73089010": { mva4: 99.25, mva7: 93.02, mva12: 82.64, mvaOriginal: 65 },
    "73121090": { mva4: 73.89, mva7: 68.45, mva12: 59.4, mvaOriginal: 44 },
    "73151100": { mva4: 142.72, mva7: 135.13, mva12: 122.49, mvaOriginal: 101 },
    "73151210": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73151290": { mva4: 142.72, mva7: 135.13, mva12: 122.49, mvaOriginal: 101 },
    "73181100": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73181500": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73181600": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73181900": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73182100": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73182200": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73182400": { mva4: 82.34, mva7: 76.64, mva12: 67.14, mvaOriginal: 51 },
    "73182900": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73202010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73202090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73209000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "73261900": { mva4: 117.36, mva7: 110.57, mva12: 99.25, mvaOriginal: 80 },
    "73269090": { mva4: 119.51, mva7: 112.65, mva12: 101.22, mvaOriginal: 81.78 },
    "74122000": { mva4: 60.6, mva7: 55.58, mva12: 47.22, mvaOriginal: 33 },
    "74152100": { mva4: 95.62, mva7: 89.51, mva12: 79.32, mvaOriginal: 62 },
    "76090000": { mva4: 66.64, mva7: 61.43, mva12: 52.75, mvaOriginal: 38 },
    "76109000": { mva4: 66.64, mva7: 61.43, mva12: 52.75, mvaOriginal: 38 },
    "76161000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "82055900": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "82142000": { mva4: 89.4, mva7: 83.48, mva12: 73.62, mvaOriginal: 56.85 },
    "83012000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "83014000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "83016000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "83017000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "83023000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "83079000": { mva4: 95.62, mva7: 89.51, mva12: 79.32, mvaOriginal: 62 },
    "83111000": { mva4: 93.21, mva7: 87.17, mva12: 77.11, mvaOriginal: 60 },
    "84099114": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099115": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099117": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099120": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099140": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099190": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099915": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099929": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099959": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099979": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84099999": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84122190": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84122900": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84123110": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84129080": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84133010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84133030": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84133090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84135010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84136011": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84137090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84145910": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84145990": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84146000": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84149020": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84149033": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84149039": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84151011": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84151019": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84158190": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84158290": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84158300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84182100": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84183000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84184000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84185090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84189900": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84212300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84212990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84213100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84219910": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84219999": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84243010": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84314390": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84314922": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84314929": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84331100": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84339090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84433111": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84433299": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84439199": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84439923": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84439933": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84439990": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84716052": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84716053": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84717040": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "84733041": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84733042": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84733049": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84733090": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "84811000": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84812019": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84812090": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84813000": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84814000": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818011": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818021": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818092": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818095": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818097": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84818099": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84819010": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47 },
    "84819090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84821010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84821090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84822010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84822090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84823000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84824000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84825010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84825090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84828000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84829119": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84829120": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84829910": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84829990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84831020": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84831050": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84831090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84833010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84833029": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84833090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84834010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84834090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84835010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84835090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84836090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84839000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84841000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84842000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84849000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85013210": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85044010": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20.00 },
    "85044021": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85044022": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85044029": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85044030": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85044060": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85044090": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85045000": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "85112010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85114000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85115010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85118030": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85119000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85122011": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85122023": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85123000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85129000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85171300": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "85171800": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85176241": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "85176255": { mva4: 90.48, mva7: 57.74, mva12: 74.61, mvaOriginal: 57.74 },
    "85176259": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85177110": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85258929": { mva4: 90.48, mva7: 84.53, mva12: 74.61, mvaOriginal: 57.74 },
    "85272100": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85272900": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85286200": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85287119": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "85287200": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85291019": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85311090": { mva4: 97.36, mva7: 91.19, mva12: 80.91, mvaOriginal: 63.44 },
    "85354090": { mva4: 76.3, mva7: 70.79, mva12: 61.61, mvaOriginal: 46 },
    "85361000": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "85365090": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "85366990": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "85369030": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "85369090": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "85389010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85392190": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "85395200": { mva4: 97.64, mva7: 91.46, mva12: 81.17, mvaOriginal: 63.67 },
    "85414121": { mva4: 83.27, mva7: 77.54, mva12: 68, mvaOriginal: 51.77 },
    "85414300": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85423190": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85437039": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "85443000": { mva4: 70.26, mva7: 64.94, mva12: 56.08, mvaOriginal: 41 },
    "85444200": { mva4: 70.26, mva7: 64.94, mva12: 56.08, mvaOriginal: 41 },
    "85444900": { mva4: 70.26, mva7: 64.94, mva12: 56.08, mvaOriginal: 41 },
    "85479000": { mva4: 94.55, mva7: 88.47, mva12: 78.34, mvaOriginal: 61.11 },
    "87043190": { mva4: 56.98, mva7: 52.08, mva12: 43.9, mvaOriginal: 30 },
    "87082100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87082919": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87082999": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87083011": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87083019": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87083090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87084090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87085019": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87085099": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87087090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87088000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089200": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089300": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089412": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089482": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089490": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089910": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87169090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90251990": { mva4: 90.48, mva7: 57.74, mva12: 74.61, mvaOriginal: 57.74 },
    "90261019": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90262010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90262090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90268000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90269090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90292010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90299090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90303390": { mva4: 87.5, mva7: 81.64, mva12: 71.87, mvaOriginal: 55.27 },
    "90308990": { mva4: 84.67, mva7: 78.9, mva12: 69.28, mvaOriginal: 52.93 },
    "90321010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90321090": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90322000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90328929": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90328981": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90328982": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90328989": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "90328990": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "94012000": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "94017100": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "94051093": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "94051190": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "94051990": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "94054200": { mva4: 59.4, mva7: 54.42, mva12: 46.11, mvaOriginal: 32 },
    "94056100": { mva4: 83.55, mva7: 77.81, mva12: 68.25, mvaOriginal: 52 },
    "94059200": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "94059900": { mva4: 81.13, mva7: 75.47, mva12: 66.04, mvaOriginal: 50 },
    "96099000": { mva4: 71.03, mva7: 65.68, mva12: 56.77, mvaOriginal: 41.68 },
    "96190000": { mva4: 44.91, mva7: 40.38, mva12: 32.83, mvaOriginal: 20 },
    "96200000": { mva4: 108.53, mva7: 102.01, mva12: 91.15, mvaOriginal: 72.69 },
    "48181000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "48182000": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "48183000": { mva4: 90.48, mva7: 84.53, mva12: 74.61, mvaOriginal: 57.74 },
    "48185000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "48211000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "56012190": { mva4: 80.71, mva7: 75.06, mva12: 65.65, mvaOriginal: 49.65 },
    "56031290": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "61159500": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "62101000": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63025300": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63026000": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63029300": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63039200": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63049100": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "63079010": { mva4: 82.07, mva7: 76.38, mva12: 66.9, mvaOriginal: 50.78 },
    "70181090": { mva4: 94.09, mva7: 88.03, mva12: 77.93, mvaOriginal: 60.75 },
    "84099116": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84149031": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84149034": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84185010": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84241000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84242000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84248229": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84248990": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "84254200": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "84289090": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "84529099": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84798999": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "84818093": { mva4: 77.51, mva7: 71.96, mva12: 62.72, mvaOriginal: 47.00 },
    "85177900": { mva4: 75.09, mva7: 69.62, mva12: 60.50, mvaOriginal: 45.00 },
    "85258913": { mva4: 75.09, mva7: 69.62, mva12: 60.50, mvaOriginal: 45.00 },
    "85392200": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "85394900": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "85399090": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "87087010": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87089483": { mva4: 107.43, mva7: 100.95, mva12: 90.15, mvaOriginal: 71.78 },
    "87141000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90029090": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90049020": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90069110": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90069190": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90069900": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90109090": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90138090": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "90248029": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "91031000": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "91052100": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "91059900": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "91139090": { mva4: 104.07, mva7: 97.7, mva12: 87.09, mvaOriginal: 69.29 },
    "94052900": { mva4: 72.68, mva7: 67.28, mva12: 58.29, mvaOriginal: 43 },
    "94054100": { mva4: 59.4, mva7: 54.42, mva12: 46.11, mvaOriginal: 32 },
    "95045000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "95067000": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "95069100": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "95069900": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "96032100": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
    "96032900": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96033000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96034010": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96034090": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96035000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96039000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96050000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96151100": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96151900": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96162000": { mva4: 85.96, mva7: 80.15, mva12: 70.47, mvaOriginal: 54 },
    "96170010": { mva4: 75.09, mva7: 69.62, mva12: 60.5, mvaOriginal: 45 },
};

// Determines the applicable MVA percentage for a given product.
const getMVA = (product: NFeProduct): number => {
  const aliquota = Math.round(product.icms.aliquota);

  // Rule for Autopeças segment (CEST starts with '01' OR NCM starts with '8413' OR NCM is '45049000')
  const isAutopeças = (product.cest && product.cest.startsWith('01')) || 
                      (product.ncm && product.ncm.startsWith('8413')) ||
                      (product.ncm === '45049000');

  if (isAutopeças) {
    switch (aliquota) {
      case 4:
        return 107.43;
      case 7:
        return 100.95;
      case 12:
        return 90.15;
      default: // Covers aliquota 0 and others
        return 71.78;
    }
  }

  // Rule for Materiais de Construção segment (CEST starts with '10')
  if (product.cest && product.cest.startsWith('10')) {
    switch (aliquota) {
        case 4:
            return 82.34;
        case 7:
            return 76.64;
        case 12:
            return 67.14;
        default: // Covers aliquota 0 and others
            return 51.00;
    }
  }

  // Rule for special NCMs based on origin (Decreto 27.987/2005 Art. 7)
  if (isSpecialNCM(product.ncm) && product.originType) {
    return mvaEspecialTable[product.originType];
  }

  // General rule based on NCM and ICMS rate from the PDF table
  const mvaData = mvaTable[product.ncm];
  if (mvaData) {
    switch (aliquota) {
      case 4:
        return mvaData.mva4;
      case 7:
        return mvaData.mva7;
      case 12:
        return mvaData.mva12;
      default:
        // If ICMS rate is not 4, 7, or 12 (e.g., intrastate operation),
        // we use mvaOriginal.
        return mvaData.mvaOriginal;
    }
  }

  // Default MVA if NCM not found.
  return 0;
};

/**
 * Main calculation function. It determines the MVA and then calculates the ICMS-ST.
 * @param product The product data.
 * @returns The calculated ST base, value, and the MVA applied.
 */
export const calculate = (product: NFeProduct): CalculationResult => {
  let mvaPercent: number;
  let icmsAliquotaInterna = 20.50; // Default rate

  // Specific rule for "panettone" with 12% ICMS
  if (
    product.ncm === '19052010' &&
    product.cest === '1705200' &&
    product.icms.aliquota === 12 &&
    product.name.toLowerCase().includes('panettone')
  ) {
    mvaPercent = 35;
    icmsAliquotaInterna = 12.00;
  } else {
    // Fallback to general lookup for all other products and conditions
    mvaPercent = getMVA(product);
  }

  const valorDePartida =
    product.totalValue +
    product.ipi +
    product.frete +
    product.despesas -
    product.desconto;

  let baseCalculoST = 0;
  
  // Specific rule for MVA 0% and "NORMAL" tax situation
  if (mvaPercent === 0 && product.situacaoTributaria.toUpperCase() === 'NORMAL') {
    baseCalculoST = (valorDePartida - product.icms.valor) / 0.795;
  } else {
    // Standard calculation with MVA
    baseCalculoST = valorDePartida * (1 + mvaPercent / 100);
  }

  const valorICMSST = (baseCalculoST * (icmsAliquotaInterna / 100)) - product.icms.valor;

  return {
    baseCalculoST: baseCalculoST > 0 ? baseCalculoST : 0,
    valorICMSST: valorICMSST > 0 ? valorICMSST : 0,
    mvaAplicada: mvaPercent,
    aliquotaInterna: icmsAliquotaInterna,
  };
};