# Basqarıw programmaları — Robot oyını

9-klass oqıwshıları ushın LOGO buyrıqları menen robot basqarıwǵa arnalǵan standalone interaktiv veb-oyın.

## Jańa múmkinshilikler

- AI Future qara-kók/neon dizaynı hám mobil ekranǵa beyimlesken interfeys.
- 8 basqıshlı tapsırma hám erkin maydan.
- `FD`, `BK`, `RT`, `LT`, `REPEAT`, `PU`, `PD`, `CS` buyrıqları.
- Programmanı avtomat orınlaw hám qádemlep tekseriw.
- Tosıqlar, shegara, juldızshalar hám maqset bayraqshası.
- Oqıwshı atın kirgiziw.
- Tapsırma tamamlanǵanda ball esaplaw hám reyting.
- Muǵallim panelinde nátiyjelerdi kóriw hám CSV esabatın júklew.
- Kod, progress, oqıwshı atı hám nátiyjelerdi brauzerde `localStorage` arqalı saqlaw.

## Áhmiyetli sheklew

Bul — **standalone** nusqa. Oqıwshı atları hám nátiyjeler tek sol brauzer/qurılǵıda saqlanadı. Basqa kompyuterlerdegi oqıwshılardıń nátiyjeleri avtomat túrde birlestirilmeydi. Sınıplar boyınsha ortaq online reyting, muǵallimniń basqa qurılǵıdan nátiyjelerdi kóriwi hám qáwipsiz akkauntlar kerek bolsa, keyingi versiyada backend (mısalı, Supabase) qosıw kerek.

## Jergilikli iske qosıw

Talap: Node.js 20.19+ yamasa 22.12+.

```bash
npm install
npm run dev
```

Brauzerde Vite kórsetken lokal adressti ashıń.

## Build hám tekseriw

```bash
npm run typecheck
npm run build
npm run preview
```

Build nátiyjesi `dist/` papkasına túsedi.

## Internetke jaylastırıw — Netlify

1. ZIP arxivin ashıń.
2. `robot-work` papkasın GitHub repositoriyasına júkleń.
3. Netlify-da **Add new site → Import an existing project** tańlań.
4. GitHub repositoriyasın jalǵań.
5. Build command: `npm run build`.
6. Publish directory: `dist`.
7. **Deploy** túymesin basıń.

Bul joybada server secrets yamasa `.env` ózgeriwshileri talap etilmeydi. `netlify.toml` hám `public/_redirects` konfiguraciyası qosılǵan.

## Internetke jaylastırıw — Vercel

1. GitHub repositoriyasın Vercel-ge import etiń.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy etiń.

`vercel.json` SPA rewrite konfiguraciyasın óz ishine aladı.

## Nátiyjelerdi eksportlaw

Muǵallim panelin ashıp, **CSV esabatın júklew** túymesin basıń. Fayldı Excel menen ashıwǵa boladı.

## Qáwipsizlik hám qupiyalıq

Bul nusqada login/parol qorǵawı joq hám brauzer localStorage maǵlıwmatları qurılǵı iyesine kóriniwi múmkin. Oqıwshılardıń jeke maǵlıwmatların kiritkende mektep siyasatına sáykes minimal maǵlıwmat qollanıń. Ortalıqta saqlaw ushın autentifikaciya, bazanıń ruxsat siyasatları hám serverlik validaciya kerek.
