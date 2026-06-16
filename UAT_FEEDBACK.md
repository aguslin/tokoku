# UAT Feedback — Tokoku Marketplace

UAT round received in Bahasa Indonesia. English translation + engineering status below.
Goal: lightweight marketplace with Shopee-like usability.

## Original feedback (verbatim)

> Fitur menu yang kurang :
> 1. Tampilkan varian
> 2. Tampilkan berat dalam satuan Gram
> 3. Isi di bagian harga, tidak muncul titik di angka nya
> 4. Di bagian kategori tidak bisa di hapus
> 5. Internal server sering eror (saat upload tambah produk)
> 6. Aktifkan fitur pengiriman Reguler & bisa instant
> 7. Tambahkan fitur multi gudang untuk pengiriman nya. (Jadi mau di masukin kota kantor cabang) Kalo ada orderan Cust masuk. Sistem lgsg otomatis memilih dari gudang kota cabang terdekat mana untuk dikirim supaya ongkir murah

## English translation + status

| # | Feedback (English) | Root cause found | Status |
|---|--------------------|------------------|--------|
| 1 | **Show product variants** (e.g. color/size) | Backend already supports variants, but the admin product form had no variant editor and the product detail page never displayed them. | ✅ Implemented |
| 2 | **Show weight in Gram units** | `weightUom` (kg/gram) existed but display/format was inconsistent. | ✅ Fixed |
| 3 | **Price field: thousand-separator dots don't appear** when typing the price | Admin form input + list/detail used locale-inconsistent number formatting. | ✅ Fixed (forced `id-ID` grouping everywhere) |
| 4 | **Category cannot be deleted** | Backend 500: controller called `categoryService.remove()` but the service exported it as `delete`. Also a category referenced by products hit a foreign-key error, and the admin UI swallowed the error silently. | ✅ Fixed (rename + detach products + surface errors) |
| 5 | **Internal server error frequently when uploading / adding a product** | (a) `description` was wrongly **required** → empty description returned 422. (b) Large/HEIC phone photos bypassed canvas resize and were sent as multi-MB base64, exceeding the Vercel 4.5 MB serverless body limit. | ✅ Fixed (description optional, robust client-side compression + size guard + clearer errors) |
| 6 | **Enable Regular & Instant shipping** | `courier_services` data existed (each courier has Reguler & Instan) but checkout used hardcoded mock couriers. | ✅ Implemented (real services from API) |
| 7 | **Multi-warehouse shipping — auto-pick the nearest branch-city warehouse** so shipping is cheap | `warehouses` + `inventory` tables existed in the DB but had no models, API, admin UI, or selection logic. | ✅ Implemented (nearest-warehouse engine + admin CRUD) |

## Notes on #7 (multi-warehouse logic)

When an order is placed, the system:
1. Resolves the destination city/province from the chosen address.
2. Considers only **active warehouses that have stock** for the ordered items.
3. Picks the **nearest** warehouse by great-circle (haversine) distance using each warehouse's
   latitude/longitude vs. the destination city coordinates.
4. Computes shipping cost from a distance zone (same-city / same-province / inter-province /
   inter-island) combined with the chosen courier service (Reguler vs Instan) — closer origin = cheaper ongkir.
5. Shows the customer which branch warehouse the order ships from.

Seeded warehouses: Jakarta Pusat, Bandung, Surabaya, Medan, Makassar, Yogyakarta.

## Local development (no Docker)

See `DEV_LOCAL.md`. Backend (Express) on `:5000` + frontend (Next.js) on `:3001`,
both via `npm run dev`, connecting to the Neon cloud Postgres. Docker is only used for the
final production-style build.
