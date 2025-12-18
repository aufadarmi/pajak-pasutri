function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function calculatePPh(pkp) {
  let tax = 0;
  if (pkp <= 0) return 0;

  const layer1 = Math.min(pkp, 60000000);
  tax += layer1 * 0.05;
  pkp -= layer1;

  if (pkp > 0) {
    tax += pkp * 0.15;
  }

  return Math.round(tax);
}

function calculate() {
  const ih = Number(document.getElementById('incomeHusband').value || 0);
  const iw = Number(document.getElementById('incomeWife').value || 0);
  const ptkpH = Number(document.getElementById('ptkpHusband').value);
  const ptkpW = Number(document.getElementById('ptkpWife').value);

  const pkpH = Math.max(0, ih - ptkpH);
  const pkpW = Math.max(0, iw - ptkpW);

  const pphH = calculatePPh(pkpH);
  const pphW = calculatePPh(pkpW);

  const totalIncome = ih + iw;
  const ptkpCombined = ptkpH + ptkpW;
  const pkpCombined = Math.max(0, totalIncome - ptkpCombined);
  const pphCombined = calculatePPh(pkpCombined);

  const allocH = totalIncome ? Math.round((ih / totalIncome) * pphCombined) : 0;
  const allocW = totalIncome ? Math.round((iw / totalIncome) * pphCombined) : 0;

  const kurangH = allocH - pphH;
  const kurangW = allocW - pphW;

  const output = document.getElementById('output');
  output.style.display = 'block';
  output.innerHTML = `
    <h2>Hasil Perhitungan</h2>
    <table>
      <tr>
        <th></th>
        <th>Suami</th>
        <th>istri</th>
      </tr>
      <tr>
        <th>PPh jika NPWP Dipisah</th>
        <td>${formatRupiah(pphH)}</td>
        <td>${formatRupiah(pphW)}</td>
      </tr>
      <tr>
        <th>Alokasi PPh Gabungan (PH/MT)</th>
        <td>${formatRupiah(allocH)}</td>
        <td>${formatRupiah(allocW)}</td>
      </tr>
      <tr>
        <th>PPh Kurang / (Lebih) Bayar</th>
        <td>${formatRupiah(kurangH)}</td>
        <td>${formatRupiah(kurangW)}</td>
      </tr>
    </table>
    <div class="note">
      Catatan: Perhitungan ini adalah simulasi edukatif, bukan perhitungan pajak final.
    </div>
  `;
}
