<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
/* ── Reset ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: DejaVu Sans, Arial, sans-serif;
    font-size: 11px;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.5;
}

/* ── Header ── */
.header {
    background: #1d4ed8;
    padding: 0;
    margin-bottom: 0;
}
.header-inner {
    padding: 22px 32px 18px 32px;
}
.header-top {
    display: table;
    width: 100%;
}
.header-left  { display: table-cell; vertical-align: middle; }
.header-right { display: table-cell; vertical-align: middle; text-align: right; width: 160px; }

.brand-name {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 2px;
}
.brand-tagline {
    font-size: 9px;
    color: #bfdbfe;
    margin-top: 2px;
    letter-spacing: 0.5px;
}
.doc-title {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    margin-top: 8px;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.badge-verified {
    display: inline-block;
    background: #ffffff;
    color: #1d4ed8;
    font-size: 9px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;
}
.report-id {
    font-size: 9px;
    color: #93c5fd;
    margin-top: 6px;
}

/* Biru strip bawah header */
.header-stripe {
    height: 4px;
    background: linear-gradient(to right, #06b6d4, #2563eb, #1d4ed8);
}

/* ── Body layout ── */
.body {
    padding: 24px 32px 0 32px;
}

/* ── Section title ── */
.section-title {
    font-size: 9px;
    font-weight: 700;
    color: #1d4ed8;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #1d4ed8;
    padding-bottom: 5px;
    margin-bottom: 12px;
}

/* ── Two-column layout ── */
.two-col { display: table; width: 100%; }
.col-main { display: table-cell; vertical-align: top; width: 66%; padding-right: 16px; }
.col-side { display: table-cell; vertical-align: top; width: 34%; }

/* ── Info card ── */
.info-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 14px;
    margin-bottom: 14px;
}

/* ── Info grid ── */
.info-grid { display: table; width: 100%; }
.info-row  { display: table-row; }
.info-cell {
    display: table-cell;
    width: 50%;
    padding: 4px 6px 4px 0;
    vertical-align: top;
}
.info-label {
    font-size: 8.5px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
}
.info-value {
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
    display: block;
    margin-top: 1px;
}

/* ── Score box ── */
.score-card {
    background: #eff6ff;
    border: 2px solid #1d4ed8;
    border-radius: 8px;
    text-align: center;
    padding: 16px 10px;
    margin-bottom: 12px;
}
.score-number {
    font-size: 42px;
    font-weight: 800;
    color: #1d4ed8;
    line-height: 1;
}
.score-denom {
    font-size: 14px;
    font-weight: 600;
    color: #93c5fd;
}
.score-label {
    font-size: 8.5px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

/* ── Validity card ── */
.validity-card {
    background: #fefce8;
    border: 1px solid #fde047;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 10px;
}
.validity-title {
    font-size: 8.5px;
    font-weight: 700;
    color: #854d0e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}
.validity-date {
    font-size: 11px;
    font-weight: 700;
    color: #713f12;
}
.validity-sep {
    font-size: 9px;
    color: #92400e;
    margin: 2px 0;
}

/* ── Component table ── */
.comp-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
}
.comp-table th {
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 7px 10px;
    text-align: left;
    border: 1px solid #dbeafe;
}
.comp-table td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    font-size: 10.5px;
    vertical-align: middle;
}
.comp-table tr:nth-child(even) td {
    background: #f8fafc;
}

/* ── Status badges ── */
.badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
}
.badge-good {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
}
.badge-needs {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}
.badge-faulty {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
}

/* ── Dot indicators ── */
.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
}
.dot-good   { background: #10b981; }
.dot-needs  { background: #f59e0b; }
.dot-faulty { background: #ef4444; }

/* ── Recommendation ── */
.rec-box {
    padding: 12px 14px;
    border-radius: 6px;
    margin-bottom: 14px;
    display: table;
    width: 100%;
}
.rec-recommended { background: #d1fae5; border: 1.5px solid #34d399; }
.rec-fix         { background: #fef3c7; border: 1.5px solid #fbbf24; }
.rec-not         { background: #fee2e2; border: 1.5px solid #f87171; }

.rec-icon { display: table-cell; vertical-align: middle; width: 28px; font-size: 16px; }
.rec-text { display: table-cell; vertical-align: middle; }
.rec-title { font-size: 12px; font-weight: 700; }
.rec-recommended .rec-title { color: #065f46; }
.rec-fix .rec-title         { color: #92400e; }
.rec-not .rec-title         { color: #991b1b; }
.rec-desc  { font-size: 9.5px; margin-top: 2px; color: #475569; }

/* ── Summary bar ── */
.summary-bar {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 14px;
    display: table;
    width: 100%;
}
.summary-item {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    width: 33%;
}
.summary-count {
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
}
.summary-lbl {
    font-size: 8.5px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
}
.count-good   { color: #059669; }
.count-needs  { color: #d97706; }
.count-faulty { color: #dc2626; }

/* ── Notes ── */
.notes-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #1d4ed8;
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 10.5px;
    line-height: 1.7;
    color: #334155;
    margin-bottom: 14px;
}

/* ── Divider ── */
.divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 16px 0;
}

/* ── Footer ── */
.footer {
    background: #f8fafc;
    border-top: 2px solid #e2e8f0;
    padding: 14px 32px;
    display: table;
    width: 100%;
    margin-top: 20px;
}
.footer-left  { display: table-cell; vertical-align: middle; }
.footer-right { display: table-cell; vertical-align: middle; text-align: right; }
.footer-text  { font-size: 8.5px; color: #64748b; line-height: 1.6; }
.footer-brand { font-size: 10px; font-weight: 700; color: #1d4ed8; }

.page-break { page-break-after: always; }
</style>
</head>
<body>

{{-- ══════════════ HEADER ══════════════ --}}
<div class="header">
    <div class="header-inner">
        <div class="header-top">
            <div class="header-left">
                <div class="brand-name">LAPNESIA</div>
                <div class="brand-tagline">Platform Jual Beli Laptop Bekas Terpercaya</div>
                <div class="doc-title">Laporan Inspeksi Resmi</div>
            </div>
            <div class="header-right">
                <div class="badge-verified">&#10003; INSPEKSI TERVERIFIKASI</div>
                <div class="report-id">ID: {{ strtoupper(substr($report->id, 0, 8)) }}</div>
                <div class="report-id" style="margin-top:2px;">
                    {{ $report->published_at ? $report->published_at->format('d M Y') : '-' }}
                </div>
            </div>
        </div>
    </div>
    <div class="header-stripe"></div>
</div>

{{-- ══════════════ BODY ══════════════ --}}
<div class="body">

    {{-- Info Produk + Skor --}}
    <div class="two-col" style="margin-bottom:14px; margin-top:6px;">

        {{-- Kolom kiri: Produk + Teknisi --}}
        <div class="col-main">

            <div class="section-title">Informasi Produk</div>
            <div class="info-card" style="margin-bottom:12px;">
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">Model</span>
                            <span class="info-value">{{ $product->model ?? 'N/A' }}</span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">Brand</span>
                            <span class="info-value">{{ $product->brand->name ?? 'N/A' }}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">Processor</span>
                            <span class="info-value">{{ $product->cpu ?? 'N/A' }}</span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">RAM</span>
                            <span class="info-value">{{ $product->ram ? $product->ram . ' GB' : 'N/A' }}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">Storage</span>
                            <span class="info-value">
                                {{ $product->storage ? $product->storage . ' GB' : 'N/A' }}
                                {{ $product->storage_type ? '(' . $product->storage_type . ')' : '' }}
                            </span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">Kondisi Unit</span>
                            <span class="info-value">{{ ucwords(str_replace('_', ' ', $product->condition ?? 'N/A')) }}</span>
                        </div>
                    </div>
                    @if($product->gpu)
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">GPU</span>
                            <span class="info-value">{{ $product->gpu }}</span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">Layar</span>
                            <span class="info-value">{{ $product->screen_size ? $product->screen_size . '"' : 'N/A' }}</span>
                        </div>
                    </div>
                    @endif
                </div>
            </div>

            <div class="section-title">Teknisi Pemeriksa</div>
            <div class="info-card">
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">Nama Teknisi</span>
                            <span class="info-value">{{ $technician->name ?? 'N/A' }}</span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">Tanggal Inspeksi</span>
                            <span class="info-value">
                                {{ $report->published_at ? $report->published_at->format('d F Y') : 'N/A' }}
                            </span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-cell">
                            <span class="info-label">Berlaku Mulai</span>
                            <span class="info-value">
                                {{ $report->published_at ? $report->published_at->format('d M Y') : '-' }}
                            </span>
                        </div>
                        <div class="info-cell">
                            <span class="info-label">Berlaku Hingga</span>
                            <span class="info-value" style="color:#b45309;">
                                {{ $report->expires_at ? $report->expires_at->format('d M Y') : '-' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {{-- Kolom kanan: Skor + Validity --}}
        <div class="col-side">

            <div class="section-title">Skor Keseluruhan</div>
            @php
                $score = $report->overall_score ?? 0;
                $scoreColor = $score >= 70 ? '#059669' : ($score >= 50 ? '#d97706' : '#dc2626');
                $scoreBg    = $score >= 70 ? '#d1fae5' : ($score >= 50 ? '#fef3c7' : '#fee2e2');
                $scoreBorder= $score >= 70 ? '#34d399' : ($score >= 50 ? '#fbbf24' : '#f87171');
            @endphp
            <div class="score-card" style="background:{{ $scoreBg }}; border-color:{{ $scoreBorder }}; margin-bottom:12px;">
                <div class="score-number" style="color:{{ $scoreColor }};">{{ $score }}</div>
                <div class="score-denom" style="color:{{ $scoreColor }}; opacity:0.6;">/100</div>
                <div class="score-label">Nilai Kondisi Unit</div>
            </div>

            <div class="section-title">Masa Berlaku</div>
            <div class="validity-card">
                <div class="validity-title">&#128197; Periode Laporan</div>
                <div class="validity-date">
                    {{ $report->published_at ? $report->published_at->format('d M Y') : '-' }}
                </div>
                <div class="validity-sep">s/d</div>
                <div class="validity-date">
                    {{ $report->expires_at ? $report->expires_at->format('d M Y') : '-' }}
                </div>
            </div>

        </div>
    </div>

    {{-- Summary bar --}}
    @php
        $countGood  = collect($components)->filter(fn($v) => $v === 'good')->count();
        $countNeeds = collect($components)->filter(fn($v) => $v === 'needs_attention')->count();
        $countFault = collect($components)->filter(fn($v) => $v === 'faulty')->count();
    @endphp
    <div class="section-title">Hasil Pemeriksaan — Ringkasan</div>
    <div class="summary-bar" style="margin-bottom:10px;">
        <div class="summary-item">
            <div class="summary-count count-good">{{ $countGood }}</div>
            <div class="summary-lbl">&#9679; Komponen Baik</div>
        </div>
        <div class="summary-item">
            <div class="summary-count count-needs">{{ $countNeeds }}</div>
            <div class="summary-lbl">&#9650; Perlu Perhatian</div>
        </div>
        <div class="summary-item">
            <div class="summary-count count-faulty">{{ $countFault }}</div>
            <div class="summary-lbl">&#10005; Komponen Rusak</div>
        </div>
    </div>

    {{-- Tabel komponen --}}
    <table class="comp-table" style="margin-bottom:16px;">
        <thead>
            <tr>
                <th style="width:40%;">Komponen</th>
                <th style="width:30%;">Status</th>
                <th style="width:30%;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($components as $name => $status)
            @php
                $isGood  = $status === 'good';
                $isNeeds = $status === 'needs_attention';
                $isFault = $status === 'faulty';
                $badgeClass = $isGood ? 'badge-good' : ($isNeeds ? 'badge-needs' : 'badge-faulty');
                $dotClass   = $isGood ? 'dot-good'  : ($isNeeds ? 'dot-needs'  : 'dot-faulty');
                $statusLabel = $isGood ? 'Baik' : ($isNeeds ? 'Perlu Perhatian' : 'Rusak');
                $keterangan = $isGood ? 'Berfungsi normal' : ($isNeeds ? 'Butuh pemeriksaan lanjut' : 'Tidak berfungsi / rusak');
            @endphp
            <tr>
                <td>
                    <span class="dot {{ $dotClass }}"></span>
                    <strong>{{ $name }}</strong>
                </td>
                <td>
                    <span class="badge {{ $badgeClass }}">{{ $statusLabel }}</span>
                </td>
                <td style="color:#64748b; font-size:9.5px;">{{ $keterangan }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Rekomendasi --}}
    <div class="section-title">Rekomendasi Teknisi</div>
    @if($report->recommendation === 'recommended')
    <div class="rec-box rec-recommended">
        <div class="rec-icon" style="color:#059669;">&#10003;</div>
        <div class="rec-text">
            <div class="rec-title">Direkomendasikan untuk Dibeli</div>
            <div class="rec-desc">Unit dalam kondisi baik dan layak untuk diperjualbelikan. Semua komponen utama berfungsi normal.</div>
        </div>
    </div>
    @elseif($report->recommendation === 'fix_required')
    <div class="rec-box rec-fix">
        <div class="rec-icon" style="color:#d97706;">&#9888;</div>
        <div class="rec-text">
            <div class="rec-title">Perlu Perbaikan Sebelum Dijual</div>
            <div class="rec-desc">Terdapat komponen yang memerlukan perbaikan. Disarankan untuk melakukan servis sebelum transaksi.</div>
        </div>
    </div>
    @else
    <div class="rec-box rec-not">
        <div class="rec-icon" style="color:#dc2626;">&#10007;</div>
        <div class="rec-text">
            <div class="rec-title">Tidak Direkomendasikan</div>
            <div class="rec-desc">Kondisi unit tidak memenuhi standar kelayakan. Penjualan tidak disarankan hingga dilakukan perbaikan menyeluruh.</div>
        </div>
    </div>
    @endif

    {{-- Catatan Teknisi --}}
    @if($report->notes)
    <div class="section-title" style="margin-top:16px;">Catatan Teknisi</div>
    <div class="notes-box">{{ $report->notes }}</div>
    @endif

</div>

{{-- ══════════════ FOOTER ══════════════ --}}
<div class="footer">
    <div class="footer-left">
        <div class="footer-brand">LAPNESIA</div>
        <div class="footer-text">
            Dokumen ini digenerate otomatis oleh sistem LapNesia.<br>
            Laporan inspeksi bersifat resmi dan dapat dipertanggungjawabkan.
        </div>
    </div>
    <div class="footer-right">
        <div class="footer-text">
            Report ID: <strong>{{ $report->id }}</strong><br>
            Diterbitkan: {{ $report->published_at ? $report->published_at->format('d M Y, H:i') : '-' }} WIB<br>
            Berlaku hingga: <strong>{{ $report->expires_at ? $report->expires_at->format('d M Y') : '-' }}</strong>
        </div>
    </div>
</div>

</body>
</html>
