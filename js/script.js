/* =====================    FORMAT INPUT RUPIAH ===================== */
function formatInputRupiah(el) {
  let value = el.value.replace(/\D/g, '');
  el.value = new Intl.NumberFormat('id-ID').format(value);
}

/* =====================    FORMAT RUPIAH ===================== */
function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

/* =====================    HITUNG PPH PROGRESIF (UU HPP) ===================== */
function calculatePPh(pkp) {
  if (pkp <= 0) return 0;

  const layers = [
    { limit: 60000000, rate: 0.05 },
    { limit: 190000000, rate: 0.15 },
    { limit: 250000000, rate: 0.25 },
    { limit: 4500000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];

  let remaining = pkp;
  let tax = 0;

  for (const layer of layers) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, layer.limit);
    tax += taxable * layer.rate;
    remaining -= taxable;
  }

  return Math.round(tax);
}

/* =====================    BREAKDOWN DETAIL PPH ===================== */
function breakdownPPhDetailed(pkp) {
  if (pkp <= 0) {
    return {
      html: 'PKP ≤ 0 → Tidak ada PPh terutang<br>',
      sumText: '',
      total: 0
    };
  }

  const layers = [
    { limit: 60000000, rate: 0.05 },
    { limit: 190000000, rate: 0.15 },
    { limit: 250000000, rate: 0.25 },
    { limit: 4500000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];

  let remaining = pkp;
  let totalTax = 0;
  let html = '';
  let tierTaxes = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, layer.limit);
    const tax = Math.round(taxable * layer.rate);

    html += `
      ${layer.rate * 100}% × ${formatRupiah(taxable)}
      = <strong>${formatRupiah(tax)}</strong><br>
    `;

    tierTaxes.push(formatRupiah(tax));
    totalTax += tax;
    remaining -= taxable;
  }

  return {
    html,
    sumText: tierTaxes.join(' + '),
    total: totalTax
  };
}

/* =====================    SIDEBAR CONTROL ===================== */
function openSidebar(title, content) {
  document.getElementById('sidebarTitle').innerHTML = title;
  document.getElementById('sidebarContent').innerHTML = content;
  document.getElementById('sidebar').classList.add('active');
  document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

/* =====================    DETAIL – PPH TERPISAH ===================== */
function showDetailPPh(label, income, ptkp) {
  const pkp = Math.max(0, income - ptkp);
  const breakdown = breakdownPPhDetailed(pkp);

  openSidebar(
    `Detail PPh 21 ${label}`,
    `
      <strong>Step 1 – Penghasilan Neto</strong><br>
      ${formatRupiah(income)}<br><br>

      <strong>Step 2 – PTKP</strong><br>
      ${formatRupiah(ptkp)}<br><br>

      <strong>Step 3 – Penghitungan PKP</strong><br>
      PKP = Penghasilan Neto - PTKP<br>
      PKP = ${formatRupiah(income)} - ${formatRupiah(ptkp)}<br>
      <strong>PKP = ${formatRupiah(pkp)}</strong><br><br>

      <strong>Step 4 – Perhitungan Tarif Progresif</strong><br>
      ${pkp > 0 ? breakdown.html : 'PKP ≤ 0 → Tidak ada PPh terutang<br>'}<br>

      <strong>Total PPh 21 Setahun</strong><br>
      ${breakdown.sumText}<br>
      <strong>= ${formatRupiah(breakdown.total)}</strong>
    `
  );
}

/* =====================    DETAIL – PH/MT (GABUNG) ===================== */
function showDetailPHMT(data) {
  const totalIncome = (data.ih || 0) + (data.iw || 0);
  const totalPTKP = (data.ptkpHusband || 0) + (data.ptkpWife || 0);
  const pkpCombined = Math.max(totalIncome - totalPTKP, 0);

  const breakdown = pkpCombined > 0 ? breakdownPPhDetailed(pkpCombined) : {
    html: 'PKP ≤ 0 → Tidak ada PPh terutang<br>',
    sumText: '',
    total: 0
  };
  const totalPPh = breakdown.total;

  const pphHusband = totalIncome > 0 ? Math.round((data.ih / totalIncome) * totalPPh) : 0;
  const pphWife = totalIncome > 0 ? totalPPh - pphHusband : 0;

  const kurangBayarHusband = pphHusband - (data.pphHusbandPaid || 0);
  const kurangBayarWife = pphWife - (data.pphWifePaid || 0);

  const showProgresif = pkpCombined > 0;

  openSidebar(
    'Penggabungan Penghasilan (PH/MT)',
    `
      <strong>Step 1 – Penghasilan Digabung</strong><br>
      Suami: ${formatRupiah(data.ih || 0)}<br>
      Istri: ${formatRupiah(data.iw || 0)}<br>
      <strong>Total: ${formatRupiah(totalIncome)}</strong><br><br>

      <strong>Step 2 – PTKP</strong><br>
      Suami: ${formatRupiah(data.ptkpHusband || 0)}<br>
      Istri: ${formatRupiah(data.ptkpWife || 0)}<br>
      <strong>Total PTKP: ${formatRupiah(totalPTKP)}</strong><br><br>

      <strong>Step 3 – PKP Gabungan</strong><br>
      ${formatRupiah(pkpCombined)}<br><br>

      ${showProgresif ? `
        <strong>Step 4 – Perhitungan Tarif Progresif</strong><br>
        ${breakdown.html.replace(/<strong>/g,'').replace(/<\/strong>/g,'')}<br>

        <strong>Total PPh 21 Gabungan: ${formatRupiah(totalPPh)}</strong><br><br>

        <strong>Step 5 – Alokasi PPh ke Suami & Istri</strong><br>
        <span style="background-color: #B2F7EF; padding: 2px 4px; border-radius: 3px;" 
              title="PPh Gabungan: ${formatRupiah(totalPPh)}\nProporsi Suami: ${(data.ih/totalIncome*100).toFixed(2)}%\nAlokasi PPh Suami: ${formatRupiah(pphHusband)}">
          PPh Suami: ${formatRupiah(pphHusband)}
        </span><br>
        <span style="background-color: #B2F7EF; padding: 2px 4px; border-radius: 3px;" 
              title="PPh Gabungan: ${formatRupiah(totalPPh)}\nProporsi Istri: ${(data.iw/totalIncome*100).toFixed(2)}%\nAlokasi PPh Istri: ${formatRupiah(pphWife)}">
          PPh Istri: ${formatRupiah(pphWife)}
        </span><br><br>

        <strong>Step 6 – PPh Kurang / Lebih Bayar</strong><br>
        <span style="background-color: #FFF3B0; padding: 2px 4px; border-radius: 3px;" 
              title="PPh Suami: ${formatRupiah(pphHusband)}\nSudah dibayar: ${formatRupiah(data.pphHusbandPaid || 0)}\nKurang / Lebih Bayar: ${formatRupiah(kurangBayarHusband)}">
          ${formatRupiah(kurangBayarHusband)}
        </span><br>
        <span style="background-color: #FFF3B0; padding: 2px 4px; border-radius: 3px;" 
              title="PPh Istri: ${formatRupiah(pphWife)}\nSudah dibayar: ${formatRupiah(data.pphWifePaid || 0)}\nKurang / Lebih Bayar: ${formatRupiah(kurangBayarWife)}">
          ${formatRupiah(kurangBayarWife)}
        </span><br>
      ` : ''}
    `
  );
}


/* =====================    MAIN CALCULATION ===================== */
function calculate() {
  closeSidebar();

  const ih = Number(document.getElementById('incomeHusband').value.replace(/\./g, '') || 0);
  const iw = Number(document.getElementById('incomeWife').value.replace(/\./g, '') || 0);
  const ptkpH = Number(document.getElementById('ptkpHusband').value);
  const ptkpW = Number(document.getElementById('ptkpWife').value);

  const pkpH = Math.max(0, ih - ptkpH);
  const pkpW = Math.max(0, iw - ptkpW);

  const pphH = calculatePPh(pkpH);
  const pphW = calculatePPh(pkpW);

  const totalIncome = ih + iw;
  const totalPTKP = ptkpH + ptkpW;
  const pkpCombined = Math.max(0, totalIncome - totalPTKP);
  const pphCombined = calculatePPh(pkpCombined);

  const allocH = totalIncome ? Math.round((ih / totalIncome) * pphCombined) : 0;
  const allocW = pphCombined - allocH;

  const output = document.getElementById('output');
  output.style.display = 'block';
  output.innerHTML = `
    <table>
      <tr>
        <th></th>
        <th>Suami</th>
        <th>Istri</th>
      </tr>

      <tr>
        <th>PPh Terpisah</th>
        <td class="clickable"
            onclick="showDetailPPh('Suami', ${ih}, ${ptkpH})">
          ${formatRupiah(pphH)}
        </td>
        <td class="clickable"
            onclick="showDetailPPh('Istri', ${iw}, ${ptkpW})">
          ${formatRupiah(pphW)}
        </td>
      </tr>

      <tr>
        <th>Alokasi PH/MT</th>
        <td class="clickable"
            onclick='showDetailPHMT(${JSON.stringify({
              ih, iw, ptkpHusband: ptkpH, ptkpWife: ptkpW, totalIncome, totalPTKP, pkpCombined,
              pphHusbandPaid: pphH, pphWifePaid: pphW
            })})'>
          ${formatRupiah(allocH)}
        </td>
        <td class="clickable"
            onclick='showDetailPHMT(${JSON.stringify({
              ih, iw, ptkpHusband: ptkpH, ptkpWife: ptkpW, totalIncome, totalPTKP, pkpCombined,
              pphHusbandPaid: pphH, pphWifePaid: pphW
            })})'>
          ${formatRupiah(allocW)}
        </td>
      </tr>
    </table>
  `;
}
