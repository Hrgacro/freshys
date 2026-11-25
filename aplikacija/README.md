# Freshy's za Google Play i App Store

Aplikacija iz trgovine je omotač (Capacitor 8) oko iste stranice **https://www.freshysfoods.com/?app=1**. Sve što se promijeni
na stranici vidi se i u aplikaciji odmah, bez novog slanja u trgovinu. Novo slanje treba samo kad se mijenja ova mapa
(ikona, dozvole, dodaci).

Što aplikacija radi drukčije od stranice (kod je u `src/FreshysSite.tsx`, traži `Capacitor`):

- **minutnica u načinu kuhanja** je prava obavijest mobitela (dodatak LocalNotifications): stigne i kad je mobitel zaključan ili je
  otvorena druga aplikacija. Za dopuštenje se pita jednom, kod prve minutnice. Android ima svoj kanal "Minutnica" (najjača važnost);
- **zaslon ostaje upaljen** dok se kuha (KeepAwake);
- **tipka Natrag** na Androidu vraća stranicu po stranicu, a na prvoj stranici makne aplikaciju u pozadinu;
- **datoteke** (kopija ljubimaca; uz Plus i podsjetnici za kalendar i karton za veterinara) idu u izbornik mobitela za dijeljenje
  (spremi u Datoteke, pošalji e-mailom, otvori u kalendaru), jer web-prikaz u aplikaciji ne zna preuzimati;
- **gumbi za ispis** (recept, popis za kupnju; uz Plus i karton za veterinara) se ne pokazuju: web-prikaz ne zna ispisivati (karton se i dalje
  šalje ili sprema kao datoteka);
- bez interneta pokaže kratku stranicu "Nema interneta" s gumbom "Pokušaj ponovno" (`www/index.html`).

| | |
|---|---|
| Oznaka aplikacije (trajna, ne mijenja se nikad) | `com.freshysfoods.app` |
| Ime ispod ikone | Freshy's |
| Uređaji | Android mobitel i tablet, iPhone i iPad |
| Ikone i uvodni zaslon | `node aplikacija/ikone.cjs` (iz `ikona-f.svg`, slovo F iz logotipa) |
| Tekstovi i odgovori za trgovine | `trgovine/opis.md` |

## 1. Računi (samo Vi)

Isti računi kao za Zonu (Google Play Console i Apple Developer Program): na jednom računu može biti više aplikacija.
Novi račun ne treba.

## 2. Android

### Ključ za potpis (jednom, čuvajte ga: bez njega nema novih verzija)
Svaka aplikacija ima svoj ključ. Ne koristite Zonin. Na računalu s Javom:

```
keytool -genkeypair -v -keystore freshys.jks -alias freshys -keyalg RSA -keysize 2048 -validity 10000
base64 -i freshys.jks | pbcopy        # Mac: kopira ključ kao tekst
```

GitHub → repozitorij **freshys** → Settings → Secrets and variables → Actions → New repository secret:

| Tajna | Vrijednost |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | zalijepljeni tekst ključa |
| `ANDROID_KEYSTORE_PASSWORD` | lozinka koju ste upisali |
| `ANDROID_KEY_ALIAS` | `freshys` |
| `ANDROID_KEY_PASSWORD` | ista lozinka (ili lozinka ključa, ako je druga) |

Datoteku `freshys.jks` i lozinku spremite i izvan GitHuba (npr. upravitelj lozinki). Nikad u repozitorij.

### Slaganje
GitHub → Actions → **Aplikacija Android** → Run workflow (u polje "verzija" upišite npr. `1.0`). Na dnu gotovog pokretanja je
`freshys-android`: `app-debug.apk` (proba na vlastitom mobitelu) i, kad su tajne upisane, `app-release.aab` (za Google Play).
Broj izdanja (versionCode) je broj pokretanja, pa svako novo slanje sam ima veći broj.

### Google Play
1. Create app → ime "Freshy's", jezik hrvatski, App, Free.
2. Testing → **Closed testing** → nova verzija → učitajte `.aab`. Osobni račun traži 12 testera kroz 14 dana (kao kod Zone).
3. Popunite: Privacy policy `https://www.freshysfoods.com/#/privatnost`, Data safety i brisanje računa (odgovori u `trgovine/opis.md`),
   Content rating, Target audience.
4. Nakon 14 dana: Production → Apply for access → nova verzija.

## 3. iPhone i iPad

### Ključ App Store Connecta
Ako ste za Zonu već napravili ključ "GitHub" (Admin), isti ključ vrijedi i za ovu aplikaciju: upišite iste četiri vrijednosti kao
tajne u repozitorij **freshys**. Ako ga nemate: https://appstoreconnect.apple.com → Users and Access → Integrations →
App Store Connect API → **+** → ime "GitHub", pristup **Admin** → preuzmite `.p8` (može se preuzeti samo jednom).

| Tajna | Vrijednost |
|---|---|
| `ASC_KEY_ID` | Key ID (10 znakova) |
| `ASC_ISSUER_ID` | Issuer ID (iznad popisa ključeva) |
| `ASC_KEY_P8` | cijeli sadržaj `.p8` datoteke |
| `APPLE_TEAM_ID` | Team ID (developer.apple.com → Account → Membership details) |

### Aplikacija u App Store Connectu (jednom)
1. developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** → App IDs → App → Bundle ID `com.freshysfoods.app`.
2. appstoreconnect.apple.com → Apps → **+** New App → iOS, ime "Freshy's", jezik Croatian, Bundle ID gornji, SKU `freshys`.

### Slaganje i TestFlight
GitHub → Actions → **Aplikacija iPhone** → Run workflow. Bez tajni samo provjeri da se aplikacija slaže (za simulator); s tajnama
za 15–30 min verzija je u App Store Connect → TestFlight. Na iPhone instalirajte aplikaciju TestFlight i isprobajte Freshy's.

### Slanje na pregled
App Store Connect → aplikacija → popunite stranicu (tekstovi i odgovori u `trgovine/opis.md`). Aplikacija radi i na iPadu, pa Apple
traži snimke zaslona za iPhone (6,9") i za iPad (13"). Odaberite verziju iz TestFlighta → Add for Review.

## 4. Što isprobati na pravom mobitelu prije slanja

1. Otvaranje: uvodni zaslon (svijetli F na zelenom), pa Danas · Kuhaj · Plan · Ljubimci.
2. Recept → način kuhanja → minutnica 1 min → zaključajte mobitel: obavijest "Vrijeme je isteklo" mora stići (Android: i zvuk).
   Prvi put se pita za obavijesti; drugi put više ne.
3. Dok je način kuhanja otvoren, zaslon se ne gasi.
4. Android: tipka Natrag zatvori kuhanje, pa recept, pa na Danas makne aplikaciju u pozadinu (ne zatvori je).
5. Ljubimci → slika ljubimca: "Snimi fotografiju" i "Fototeka" (iPhone pita za kameru jednom).
6. Ljubimci → "Spremi kopiju": otvori se izbornik za dijeljenje (spremi u Datoteke, pošalji).
7. Prijava u račun, odjava, ponovna prijava: ljubimci su tu.
8. Zrakoplovni način → otvorite aplikaciju: "Nema interneta", pa "Pokušaj ponovno" kad se veza vrati.
9. Tamni izgled mobitela: tekst se čita, statusna traka nije bijelo na bijelom.

## 5. Što nije provjereno

- Ovdje se ne može pokrenuti ni Android ni iPhone. Provjereno je oponašanim mostom Capacitora u pregledniku (minutnica, dopuštenje
  jednom, kanal, Natrag, zaslon upaljen, dijeljenje datoteka, skriveni ispis) i slaganjem u GitHub Actions.
- Android: obavijest može kasniti par minuta dok točni alarmi nisu dopušteni (Android 14+ ih zadano ne daje); aplikacija tada ne
  otvara sama postavke alarma.
- Minutnica na Dynamic Islandu i na zaključanom zaslonu iPhonea (Live Activity) još nije napravljena: traži dodatak za iOS
  (Widget Extension) i probu na pravom iPhoneu. Do tada minutnica stiže kao obična obavijest.
- Opis dopuštenja za kameru je samo na hrvatskom (engleski prijevod traži `en.lproj/InfoPlist.strings` u Xcode projektu).
