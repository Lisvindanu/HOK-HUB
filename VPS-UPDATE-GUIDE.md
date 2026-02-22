# HoK Hub - Data Update Guide

## Sumber Data

Semua data di-scrape dari **API resmi Honor of Kings**:

| Data | Sumber | Update Kapan |
|------|--------|--------------|
| Hero list, stats, skills, skins | `api-hok.honorofkings.com` | Ada hero baru |
| Patch notes / Balance changes | `camp.honorofkings.com` | Ada patch baru (tiap 2 minggu) |
| Win rate, pick rate, ban rate | `api-hok.honorofkings.com` | Otomatis dari API |

---

## Kapan Harus Update?

### 1. Ada Hero Baru
- Cek official: https://www.honorofkings.com/news
- Atau di game ada hero baru release
- **Action**: Jalankan scraper hero utama

### 2. Ada Patch Baru (Balance Update)
- Biasanya tiap **2 minggu** (Rabu/Kamis)
- Cek di: https://camp.honorofkings.com → Adjustment
- **Action**: Jalankan scraper adjustments

### 3. Ada Skin Baru
- Skin baru biasanya ikut ke-scrape bareng hero data
- **Action**: Jalankan scraper hero utama

---

## Cara Update Data

### Update Hero Data (Hero Baru / Skin Baru)

```bash
# SSH ke VPS
ssh root@167.253.158.192

# Jalankan scraper
cd /root/HonorOfKingsApi
node scripts/scrape.mjs

# Restart API
pm2 restart hok-api
```

**Apa yang di-scrape:**
- Semua hero (nama, icon, role, stats)
- Skills (nama, icon, description, cooldown, damage)
- Skins (nama, icon, rarity)
- Counter picks
- Win/pick/ban rate

---

### Update Patch Notes (Balance Changes)

**Dari komputer lokal** (lebih gampang karena ada Chrome):

```bash
# Di folder hok-hub
cd ~/Sites/hok-hub

# Jalankan scraper
node scripts/scrape-adjustments.mjs

# Tunggu selesai (sekitar 2-3 menit)
# Output: scripts/output/adjustments-data.json

# Upload ke VPS
scp scripts/output/adjustments-data.json root@167.253.158.192:/root/HonorOfKingsApi/output/

# Restart API di VPS
ssh root@167.253.158.192 "pm2 restart hok-api"
```

**Apa yang di-scrape:**
- Hero yang kena buff/nerf
- Skill changes (before → after)
- Skill icons
- Season info

---

## Verifikasi Data Terupdate

```bash
# Cek jumlah hero
curl -s https://hokapi.project-n.site/api/hok | jq '.main | keys | length'

# Cek patch notes season berapa
curl -s https://hokapi.project-n.site/api/adjustments | jq '.season'

# Cek hero yang kena adjust
curl -s https://hokapi.project-n.site/api/adjustments | jq '.adjustments[].heroName'
```

---

## Troubleshooting

### Scraper Error "Timeout"
Koneksi ke server HoK lagi lambat, coba lagi nanti.

### Scraper Error "No data"
Season baru mungkin belum ada data, tunggu beberapa hari setelah patch.

### Data Tidak Muncul di Website
```bash
# Cek API langsung
curl https://hokapi.project-n.site/api/adjustments

# Restart API
ssh root@167.253.158.192 "pm2 restart hok-api"

# Clear browser cache / hard refresh (Cmd+Shift+R)
```

---

## Quick Commands

```bash
# === ADD SPECIFIC HEROES (FAST) ===
ssh root@167.253.158.192 "cd /root/HonorOfKingsApi && node src/add-heroes.mjs 582 584 && pm2 restart hok-api"

# === UPDATE ALL HERO DATA (SLOW - 10-15 min) ===
ssh root@167.253.158.192 "cd /root/HonorOfKingsApi && node src/scrape-all-heroes.js && pm2 restart hok-api"

# === UPDATE PATCH NOTES (dari lokal) ===
cd ~/Sites/hok-hub && \
node scripts/scrape-adjustments.mjs && \
scp scripts/output/adjustments-data.json root@167.253.158.192:/root/HonorOfKingsApi/output/ && \
ssh root@167.253.158.192 "pm2 restart hok-api"

# === CEK STATUS ===
curl -s https://hokapi.project-n.site/health
```

---

## Server Info

| Item | Value |
|------|-------|
| VPS IP | `167.253.158.192` |
| API URL | `https://hokapi.project-n.site` |
| API Folder | `/root/HonorOfKingsApi` |
| PM2 Process | `hok-api` |
| Database | PostgreSQL `hokhub` |
