# ses-arac — kurulum dosyalari

Yereldeki `ses-arac/` klasoru 416 MB idi; bunun neredeyse tamami `node_modules`.
Sadece bu iki manifest dosyasi saklandi. Araci yeniden kurmak icin:

```bash
mkdir ses-arac && cd ses-arac
# package.json + package-lock.json bu klasorden kopyala
npm install
```

Aracin uretttigi **nihai ses dosyalari zaten oyunda**: `client/public/ses/`
