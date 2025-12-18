import type { MatchingWithDetails } from '@/hooks/useMatchings';

export interface SettlementLineItem {
  matchId: string;
  batchNumber: string;
  farmerRegion: string;
  grade: string;
  targetWeek: string;
  headsMatched: number;
  avgWeight: number | null;
  estimatedKg: number;
  basePricePerKg: number;
  standardPremium: number;
  predictabilityPremium: number;
  volumeConsistencyPremium: number;
  reliabilityPremium: number;
  totalPremium: number;
  totalPricePerKg: number;
  totalAmount: number;
  finalizedAt: string | null;
}

export interface SettlementSummary {
  totalMatches: number;
  totalHeads: number;
  totalEstimatedKg: number;
  totalBaseAmount: number;
  totalPremiumAmount: number;
  totalAmount: number;
  avgPricePerKg: number;
}

const DEFAULT_AVG_WEIGHT = 450; // kg per head estimate

export function prepareSettlementData(matchings: MatchingWithDetails[]): {
  items: SettlementLineItem[];
  summary: SettlementSummary;
} {
  const finalizedMatchings = matchings.filter(
    m => m.status === 'finalized' && (m as any).premium_locked
  );

  const items: SettlementLineItem[] = finalizedMatchings.map(m => {
    const extended = m as any;
    const batch = m.batch as any;
    const avgWeight = batch?.avg_weight || DEFAULT_AVG_WEIGHT;
    const estimatedKg = m.heads_matched * avgWeight;
    const basePricePerKg = extended.base_price_per_kg || 0;
    const totalPricePerKg = extended.total_price_per_kg || basePricePerKg;
    const totalAmount = estimatedKg * totalPricePerKg;

    return {
      matchId: m.id,
      batchNumber: batch?.batch_number || m.batch_id.slice(0, 8),
      farmerRegion: batch?.region || 'Unknown',
      grade: batch?.grade || 'Unknown',
      targetWeek: batch?.target_week || 'Unknown',
      headsMatched: m.heads_matched,
      avgWeight,
      estimatedKg,
      basePricePerKg,
      standardPremium: extended.standard_premium || 0,
      predictabilityPremium: extended.predictability_premium || 0,
      volumeConsistencyPremium: extended.volume_consistency_premium || 0,
      reliabilityPremium: extended.reliability_premium || 0,
      totalPremium: extended.total_premium || 0,
      totalPricePerKg,
      totalAmount,
      finalizedAt: m.finalized_at,
    };
  });

  const totalHeads = items.reduce((sum, i) => sum + i.headsMatched, 0);
  const totalEstimatedKg = items.reduce((sum, i) => sum + i.estimatedKg, 0);
  const totalBaseAmount = items.reduce((sum, i) => sum + i.estimatedKg * i.basePricePerKg, 0);
  const totalPremiumAmount = items.reduce((sum, i) => sum + i.estimatedKg * i.totalPremium, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.totalAmount, 0);

  return {
    items,
    summary: {
      totalMatches: items.length,
      totalHeads,
      totalEstimatedKg,
      totalBaseAmount,
      totalPremiumAmount,
      totalAmount,
      avgPricePerKg: totalEstimatedKg > 0 ? totalAmount / totalEstimatedKg : 0,
    },
  };
}

export function exportSettlementCSV(
  items: SettlementLineItem[],
  summary: SettlementSummary,
  requestNumber?: string
): void {
  const headers = [
    'Batch ID',
    'Region',
    'Grade',
    'Target Week',
    'Heads',
    'Avg Weight (kg)',
    'Est. Volume (kg)',
    'Base Price (₸/kg)',
    'Standard Premium (₸/kg)',
    'Predictability Premium (₸/kg)',
    'Volume Premium (₸/kg)',
    'Reliability Premium (₸/kg)',
    'Total Premium (₸/kg)',
    'Final Price (₸/kg)',
    'Total Amount (₸)',
    'Finalized Date',
  ];

  const rows = items.map(item => [
    item.batchNumber,
    item.farmerRegion,
    item.grade,
    item.targetWeek,
    item.headsMatched.toString(),
    item.avgWeight.toString(),
    item.estimatedKg.toFixed(0),
    item.basePricePerKg.toString(),
    item.standardPremium.toString(),
    item.predictabilityPremium.toString(),
    item.volumeConsistencyPremium.toString(),
    item.reliabilityPremium.toString(),
    item.totalPremium.toString(),
    item.totalPricePerKg.toString(),
    item.totalAmount.toFixed(0),
    item.finalizedAt ? new Date(item.finalizedAt).toLocaleDateString() : '',
  ]);

  // Add summary section
  rows.push([]);
  rows.push(['SETTLEMENT SUMMARY']);
  rows.push(['Total Matchings', summary.totalMatches.toString()]);
  rows.push(['Total Heads', summary.totalHeads.toString()]);
  rows.push(['Total Estimated Volume (kg)', summary.totalEstimatedKg.toFixed(0)]);
  rows.push(['Total Base Amount (₸)', summary.totalBaseAmount.toFixed(0)]);
  rows.push(['Total Premium Amount (₸)', summary.totalPremiumAmount.toFixed(0)]);
  rows.push(['Total Payable Amount (₸)', summary.totalAmount.toFixed(0)]);
  rows.push(['Average Price (₸/kg)', summary.avgPricePerKg.toFixed(2)]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const filename = requestNumber
    ? `settlement-${requestNumber}-${new Date().toISOString().split('T')[0]}.csv`
    : `settlement-${new Date().toISOString().split('T')[0]}.csv`;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function printSettlementPDF(
  items: SettlementLineItem[],
  summary: SettlementSummary,
  requestInfo?: { requestNumber: string; mpkName: string; targetWeek: string }
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const formatCurrency = (val: number) => `₸${val.toLocaleString()}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Settlement Report${requestInfo ? ` - ${requestInfo.requestNumber}` : ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1a1a1a;
          font-size: 12px;
        }
        .header {
          border-bottom: 2px solid #0f4c3a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 { 
          font-size: 22px;
          color: #0f4c3a;
        }
        .header-info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .header-info p {
          color: #666;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
        }
        .summary-card .label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-card .value {
          font-size: 18px;
          font-weight: 600;
          color: #0f4c3a;
          margin-top: 4px;
        }
        .highlight-card {
          background: #0f4c3a;
        }
        .highlight-card .label { color: rgba(255,255,255,0.7); }
        .highlight-card .value { color: white; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 11px;
        }
        th, td {
          padding: 8px 6px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #0f4c3a;
          color: white;
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
        }
        td { font-size: 11px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .text-right { text-align: right; }
        .totals-row {
          background: #e8f5e9 !important;
          font-weight: 600;
        }
        .totals-row td { border-top: 2px solid #0f4c3a; }
        .premium-cell {
          color: #166534;
          font-size: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }
        .signature-section {
          margin-top: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
        }
        .signature-line {
          border-top: 1px solid #333;
          padding-top: 8px;
          margin-top: 40px;
        }
        @media print {
          body { padding: 20px; font-size: 10px; }
          .summary-grid { grid-template-columns: repeat(4, 1fr); }
          table { font-size: 9px; }
          th, td { padding: 6px 4px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Settlement Report</h1>
        <div class="header-info">
          <div>
            ${requestInfo ? `
              <p><strong>Request:</strong> ${requestInfo.requestNumber}</p>
              <p><strong>MPK:</strong> ${requestInfo.mpkName}</p>
              <p><strong>Target Week:</strong> ${requestInfo.targetWeek}</p>
            ` : ''}
          </div>
          <div style="text-align: right;">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Status:</strong> Finalized & Locked</p>
          </div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Total Matchings</div>
          <div class="value">${summary.totalMatches}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Heads</div>
          <div class="value">${summary.totalHeads.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="label">Est. Volume</div>
          <div class="value">${summary.totalEstimatedKg.toLocaleString()} kg</div>
        </div>
        <div class="summary-card highlight-card">
          <div class="label">Total Payable</div>
          <div class="value">${formatCurrency(summary.totalAmount)}</div>
        </div>
      </div>

      <h2 style="font-size: 14px; margin-bottom: 10px;">Line Items</h2>
      <table>
        <thead>
          <tr>
            <th>Batch</th>
            <th>Region</th>
            <th>Grade</th>
            <th class="text-right">Heads</th>
            <th class="text-right">Est. kg</th>
            <th class="text-right">Base (₸/kg)</th>
            <th class="text-right">Premiums (₸/kg)</th>
            <th class="text-right">Final (₸/kg)</th>
            <th class="text-right">Amount (₸)</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><strong>${item.batchNumber}</strong></td>
              <td>${item.farmerRegion}</td>
              <td>${item.grade}</td>
              <td class="text-right">${item.headsMatched}</td>
              <td class="text-right">${item.estimatedKg.toLocaleString()}</td>
              <td class="text-right">${item.basePricePerKg}</td>
              <td class="text-right premium-cell">
                +${item.totalPremium}
                <br>
                <small style="color:#888">
                  S:${item.standardPremium} P:${item.predictabilityPremium} V:${item.volumeConsistencyPremium} R:${item.reliabilityPremium}
                </small>
              </td>
              <td class="text-right"><strong>${item.totalPricePerKg}</strong></td>
              <td class="text-right"><strong>${formatCurrency(item.totalAmount)}</strong></td>
            </tr>
          `).join('')}
          <tr class="totals-row">
            <td colspan="3"><strong>TOTAL</strong></td>
            <td class="text-right">${summary.totalHeads}</td>
            <td class="text-right">${summary.totalEstimatedKg.toLocaleString()}</td>
            <td class="text-right">-</td>
            <td class="text-right premium-cell">Avg +${(summary.avgPricePerKg - (summary.totalBaseAmount / summary.totalEstimatedKg)).toFixed(1)}</td>
            <td class="text-right">${summary.avgPricePerKg.toFixed(1)}</td>
            <td class="text-right">${formatCurrency(summary.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 16px; background: #f0f9f4; border-radius: 6px;">
        <h3 style="font-size: 12px; color: #0f4c3a; margin-bottom: 10px;">Payment Breakdown</h3>
        <table style="margin: 0; border: none;">
          <tr style="background: transparent;">
            <td style="border: none; padding: 4px 0;">Base Amount (${summary.totalEstimatedKg.toLocaleString()} kg)</td>
            <td style="border: none; padding: 4px 0; text-align: right;">${formatCurrency(summary.totalBaseAmount)}</td>
          </tr>
          <tr style="background: transparent;">
            <td style="border: none; padding: 4px 0; color: #166534;">+ Premium Amount</td>
            <td style="border: none; padding: 4px 0; text-align: right; color: #166534;">${formatCurrency(summary.totalPremiumAmount)}</td>
          </tr>
          <tr style="background: transparent; font-size: 14px; font-weight: 600;">
            <td style="border: none; border-top: 2px solid #0f4c3a; padding: 8px 0;">Total Payable Amount</td>
            <td style="border: none; border-top: 2px solid #0f4c3a; padding: 8px 0; text-align: right;">${formatCurrency(summary.totalAmount)}</td>
          </tr>
        </table>
      </div>

      <div class="signature-section">
        <div>
          <p><strong>Prepared By:</strong></p>
          <div class="signature-line">
            <p>Name: _______________________</p>
            <p style="margin-top: 8px;">Date: _______________________</p>
          </div>
        </div>
        <div>
          <p><strong>Approved By:</strong></p>
          <div class="signature-line">
            <p>Name: _______________________</p>
            <p style="margin-top: 8px;">Date: _______________________</p>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Turan Standard Pool — Settlement Report</p>
        <p>Document generated for internal settlement purposes only</p>
      </div>

      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
