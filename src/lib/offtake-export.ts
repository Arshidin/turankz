import type { OfftakeEntry, OfftakeSummary } from '@/hooks/useOfftakeRegistry';

/**
 * Export offtake data as CSV
 */
export function exportOfftakeCSV(entries: OfftakeEntry[], summary: OfftakeSummary): void {
  const headers = [
    'MPK ID',
    'MPK Name',
    'Total Heads',
    'Standard Compliant Heads',
    'Non-Standard Heads',
    'Compliance Rate (%)',
    'Delivery Periods',
  ];

  const rows = entries.map(entry => [
    entry.mpk_id,
    `"${entry.mpk_name}"`,
    entry.total_heads.toString(),
    entry.standard_compliant_heads.toString(),
    entry.non_standard_heads.toString(),
    entry.compliance_rate.toString(),
    `"${entry.delivery_periods.join(', ')}"`,
  ]);

  // Add summary row
  rows.push([]);
  rows.push(['SUMMARY']);
  rows.push(['Total MPKs', summary.total_mpks.toString()]);
  rows.push(['Total Heads', summary.total_heads.toString()]);
  rows.push(['Total Standard Compliant', summary.total_standard_compliant.toString()]);
  rows.push(['Total Non-Standard', summary.total_non_standard.toString()]);
  rows.push(['Overall Compliance Rate', `${summary.overall_compliance_rate}%`]);
  if (summary.delivery_period_range.earliest && summary.delivery_period_range.latest) {
    rows.push([
      'Delivery Period Range',
      `${summary.delivery_period_range.earliest} - ${summary.delivery_period_range.latest}`,
    ]);
  }

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `offtake-registry-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export detailed offtake data as CSV (including all matchings)
 */
export function exportOfftakeDetailedCSV(entries: OfftakeEntry[]): void {
  const headers = [
    'MPK ID',
    'MPK Name',
    'Batch Number',
    'Heads Matched',
    'Target Week',
    'Grade',
    'Region',
    'Standard Status',
    'Finalized At',
  ];

  const rows: string[][] = [];

  for (const entry of entries) {
    for (const matching of entry.matchings) {
      rows.push([
        entry.mpk_id,
        `"${entry.mpk_name}"`,
        matching.batch_number,
        matching.heads_matched.toString(),
        matching.target_week,
        matching.grade,
        matching.region,
        matching.standard_status || 'non_standard',
        new Date(matching.finalized_at).toLocaleDateString(),
      ]);
    }
  }

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `offtake-registry-detailed-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate and print PDF summary
 */
export function printOfftakePDF(entries: OfftakeEntry[], summary: OfftakeSummary): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offtake Registry Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1a1a1a;
        }
        .header {
          border-bottom: 2px solid #0f4c3a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 { 
          font-size: 24px;
          color: #0f4c3a;
        }
        .header p {
          color: #666;
          margin-top: 5px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .summary-card {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-card .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: 600;
          color: #0f4c3a;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #0f4c3a;
          color: white;
          font-weight: 500;
          font-size: 12px;
          text-transform: uppercase;
        }
        td { font-size: 14px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .compliance-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .compliance-high { background: #dcfce7; color: #166534; }
        .compliance-medium { background: #fef9c3; color: #854d0e; }
        .compliance-low { background: #fee2e2; color: #991b1b; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { padding: 20px; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Offtake Registry Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Total MPKs</div>
          <div class="value">${summary.total_mpks}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Heads</div>
          <div class="value">${summary.total_heads.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="label">Standard Compliant</div>
          <div class="value">${summary.total_standard_compliant.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="label">Compliance Rate</div>
          <div class="value">${summary.overall_compliance_rate}%</div>
        </div>
      </div>

      ${summary.delivery_period_range.earliest ? `
        <p style="margin-bottom: 20px; color: #666;">
          <strong>Delivery Period:</strong> 
          ${summary.delivery_period_range.earliest} — ${summary.delivery_period_range.latest}
        </p>
      ` : ''}

      <h2 style="font-size: 18px; margin-bottom: 10px;">Offtake by MPK</h2>
      <table>
        <thead>
          <tr>
            <th>MPK</th>
            <th>Total Heads</th>
            <th>Standard</th>
            <th>Non-Standard</th>
            <th>Compliance</th>
            <th>Delivery Periods</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => `
            <tr>
              <td><strong>${entry.mpk_name}</strong><br><small style="color:#666">${entry.mpk_id}</small></td>
              <td>${entry.total_heads.toLocaleString()}</td>
              <td>${entry.standard_compliant_heads.toLocaleString()}</td>
              <td>${entry.non_standard_heads.toLocaleString()}</td>
              <td>
                <span class="compliance-badge ${
                  entry.compliance_rate >= 80 ? 'compliance-high' :
                  entry.compliance_rate >= 50 ? 'compliance-medium' : 'compliance-low'
                }">
                  ${entry.compliance_rate}%
                </span>
              </td>
              <td>${entry.delivery_periods.join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Turan Standard Pool — Offtake Registry</p>
      </div>

      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
