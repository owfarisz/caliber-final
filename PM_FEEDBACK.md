# Umpan balik PM — lanjutkan MVP dengan batas bukti yang terlihat

Keputusan: PRD layak sebagai decision-support dua peran. Data sintetis mendukung normalisasi inventori dan forecast bersyarat; tidak mendukung klaim live failure prediction, actual supplier performance, atau realized savings.

## Temuan yang mengubah keputusan

- Dari 7.481 material: 504 di bawah Min, 1.376 di atas Max positif, 1.747 di dalam policy positif, 3.854 Min–Max nol. Jangan menyebut 3.063 raw above-Max sebagai overstock; termasuk 1.687 positive-stock zero-policy.
- 1.930 material punya issue; 5.551 tanpa histori tercatat tetap unknown, bukan dead stock. Pengadaan mencakup 1.250 material; 6.231 tidak tercakup.
- Dari 17.518 issue: 625 didukung order–lokasi–BoM, 2.106 lokasi unik mismatch BoM, 14.727 unmatched, 60 ambigu. Hanya porsi quantity attributable boleh berubah ketika satu aset disimulasikan.
- Enam Data sheets rekan sama dengan sumber. PR PO menghapus 5.420 salinan identik; BoM 230. Sebanyak 863 suspect issue copies tetap dipertahankan karena tidak ada transaction document/item ID.
- 877/1.250 kelompok material–unit–currency memiliki harga bervariasi; tidak ditemukan blanket averaging pada ekspor rekan. Raw history tetap harus dipertahankan.
- Q&A menetapkan A > B > C > S; 33 lokasi unknown tetap unknown. Urutan tidak mengukur probabilitas/biaya kegagalan.

## Price normalization

Jangan meratakan raw prices sebagai cleaning. Pilih acuan analitis secara terpisah: eligible latest, median, atau mean unit amount dengan currency, waktu, metode dan lineage; jika benar line total dan quantity sesuai, gunakan weighted estimate Σamount/Σquantity. PR quantity tidak terkonfirmasi sebagai PO quantity. Pisahkan IDR/USD/JPY/EUR/SGD; tidak ada FX otomatis. QC_DECISIONS rekan menyebut Q&A unit amount, sementara TRD masih ambigu: perlu selaraskan bukti Q&A primer. Sampai itu, explicit interpretation dan cost N/A default tetap defensible. Bukan actual spend.

## Koreksi implementasi/kontrak

Engine menjaga Min=ROP, Max>=Min, trigger IP<=Min, A/B policy floor sebagai asumsi, no-history N/A, attribution-only scaling dan unchanged pre-receipt risk. Runtime/cycling, service targets, 60-day missing lead fallback dan slow-moving threshold adalah asumsi. TRD menetapkan replay 2026-09-30, stock date unknown, read-only SQLite, ephemeral scenario, tanpa ERP write-back.

Prioritas: tinjau below-Min; tetapkan grain stock tunggal; review zero-policy; investigasi attribution mismatch; verifikasi price/receipt sebelum klaim finansial. Maintenance plan hanya memberi equipment context, bukan quantity spare-part otomatis.

## Rujukan dan batas audit

Lihat audit-report.html untuk grafik policy, coverage, monthly issue-event counts, join attribution, matrix kelayakan, prioritas dan sumber per sheet/kolom. Semua angka berasal dari profile.json, teammate_audit.json/.md, serta keputusan TRD. Monthly chart menghitung issue events, bukan unit campuran. Source fields dan cached formula outputs diverifikasi; native Excel recalculation tidak dijalankan. Fixed ranges dan formula Google Sheets/DUMMYFUNCTION perlu validasi engine saat refresh. Tidak ada klaim bahwa aplikasi selesai atau deployed.
