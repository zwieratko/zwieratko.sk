---
title: "PHP a SQLite3"
date: 2023-12-12T10:14:50+01:00
draft: false
description: Ako pomocou jazyka PHP použiť databázu SQLite3.
type: posts
tags:
  - PHP
  - Sqlite3
categories:
  - Poznámky
toc: true
---

## Cieľ

Chcem pomocou jazyka PHP použiť databázu SQLite3.

## Riešenie

SQLite je rýchla, malá a na údržbu veľmi jednoduchá databázová technológia napísaná v jazyku C. Nepoužíva klasickú DB architektúru klient / server, je to vlastne len knižnica implementujúca databázové vlastnosti. Samotná databáza môže byt uložená v bežnom súbore.

Na prístup ku SQLite databáze pomocou jazyka PHP potrebujem nainštalovať jeden PHP modul.

```sh
sudo apt update
sudo apt install php8.3-sqlite3
```

Ku DB celkovo (vrátane SQLite) je možné pristupovať ešte aj pomocou [PDO - The PHP Data Objects](https://www.php.net/manual/en/book.pdo.php), týmto sa nebudem teraz zaoberať.

### Otvorenie DB

Pripojenie k DB vytvorím nastavením cesty ku súboru s DB. V predvolenom nastavení bude databáza / súbor vytvorený ak ešte neexistuje a pripojenie bude v móde čítanie aj zápis.

Súbor bude vytvorený samozrejme len v tom prípade ak má užívateľ pod ktorým beží PHP-FPM právo zápisu pre daný adresár v ktorom sa má súbor vytvoriť.

```php
$db = new SQLite3('/cesta/ku/databaza.sqlite');

// SQLITE3_OPEN_CREATE:    vytvori DB ak este neexistuje (predvolene)
// SQLITE3_OPEN_READWRITE: otvori DB v mode citanie / zapis (predvolene)
// SQLITE3_OPEN_READONLY:  otvpri DB v mode len citanie
$db = new SQLite3('/cesta/ku/databaza.sqlite', SQLITE3_OPEN_CREATE | SQLITE3_OPEN_READWRITE);
```

DB môžem v prípade potreby vytvoriť v pamäti. DB existuje len počas behu skriptu.

```php
$db2 = new SQLite3(':memory:');
```

Na záver, ak už ďalej DB nepotrebujem môžem ju uzavrieť, udeje sa to aj automaticky po skončení skriptu.

```PHP
$db->close();
```

### Vytvorenie / odstránenie tabuľky

Tabuľka sa [vytvára](https://www.sqlite.org/lang_createtable.html) podobne ako v iných SQL, typy stĺpcov sa síce definujú, no [nemusia](https://www.sqlite.org/datatype3.html#affinity) byť pri vkladaní hodnôt dodržané (pokiaľ nebola tabuľka vytvorená ako "[STRICT](https://www.sqlite.org/stricttables.html)").

```php
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$db->exec("CREATE TABLE IF NOT EXISTS tabulka (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stlpec1 TEXT NOT NULL,
  stlpec2 INTEGER DEFAULT 0
)");
```

- dátový typ pri definovaní tabuľky [nie je povinný](https://www.sqlite.org/flextypegood.html)
- v akomkoľvek stĺpci s výnimkou [INTEGER PRIMARY KEY](https://www.sqlite.org/lang_createtable.html#rowid) môže byť uložená hodnota akéhokoľvek dátového typu
- dáta sú ukladane v DB ako jeden z nasledujúcich dátových typov:
  - NULL
  - INTEGER
  - REAL
  - TEXT
  - BLOB
- pri definovaní stĺpcov je možné použiť ďalšie klauzuly:
  - PRIMARY KEY [[AUTOINCREMENT](https://www.sqlite.org/autoinc.html)]
  - NOT NULL
  - UNIQUE
  - DEFAULT *\<hodnota>*
  - CHECK
  - COLLATE
  - GENERATED ALWAYS AS

Tabuľku je možné samozrejme aj [odstrániť](https://www.sqlite.org/lang_droptable.html).

```php
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

// ak "tabulka" nexistuje zahlasi upozornenie
$db->exec("DROP TABLE tabulka");

// volitelne "IF EXISTS" zabrani hlaseniu upozornenia ak "tabulka" neexistuje
$db->exec("DROP TABLE IF EXISTS tabulka");
```

### Vkladanie dát

Dáta vkladám do DB pomocou:
- ~~SQL dopytu bez výsledku (`->exec`)~~
- ~~SQL dopytu (`->query`)~~
- SQL pred pripraveného príkazu (`->prepare`)

Odporúčaný spôsob vkladanie dát do DB je pomocou pred [pripraveného príkazu](https://en.wikipedia.org/wiki/Prepared_statement). Je to jednoduchšie, bezpečnejšie a menej náročne na pamäť.

Takéto vkladanie dát je zložené z troch etáp:
- príprava príkazu ([->prepare](https://www.php.net/manual/en/sqlite3.prepare.php))
- priradenie hodnôt ([->bindValue](https://www.php.net/manual/en/sqlite3stmt.bindvalue.php) / [->bindParam](https://www.php.net/manual/en/sqlite3stmt.bindparam.php))
- vykonanie príkazu ([->execute](https://www.php.net/manual/en/sqlite3stmt.execute.php))

```php
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

// na priradenie hodnot je pouzity pomenovany parameter
$stmt = $db->prepare("INSERT INTO tabulka VALUES(NULL, :stlpec1_text, :stlpec2_int)");
$stmt->bindValue(':stlpec1_text', 'nejaky text');
$stmt->bindValue(':stlpec2_int', 42);
$stmt->execute();

// na priradenie hodnot je mozne pouzit aj pozicne parametre
// pozicne parametre su cislovane z lava od 1
$stmt = $db->prepare("INSERT INTO tabulka (stlpec1, stlpec2) VALUES(?, ?)");
$stmt->bindValue(1, 'nejaky text');
$stmt->bindValue(2, 42);
$stmt->execute();
```

Pri pred pripravenom príkaze môžem priradiť ako hodnotu premennú a až tej potom priradím skutočnú hodnotu.

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("INSERT INTO tabulka VALUES (NULL, ?, ?)");
$stmt->bindParam(1, $stlpec1_text, SQLITE3_TEXT);
$stmt->bindParam(2, $stlpec2_int, SQLITE3_INTEGER);

$stlpec1_text = "abc";
$stlpec2_int = 42;
$stmt->execute();

// dalej je mozne prikaz opakovane vykonat s novymi hodnotami
$stlpec1_text = "def";
$stlpec2_int = 0;
$stmt->execute();
```

### Čítanie dát

Na čítanie dát z DB je taktiež najvhodnejší spôsob pomocou pred pripraveného SQL príkazu.

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("SELECT * FROM tabulka WHERE id=:id");
$stmt->bindValue(':id', 1, SQLITE3_INTEGER);
$result = $stmt->execute();
var_dump($result->fetchArray(SQLITE3_ASSOC));
```

Okrem samotných dát viem z DB prečítať:
- počet stĺpcov danej tabuľky ([->numColumns](https://www.php.net/manual/en/sqlite3result.numcolumns.php))
- názvy stĺpcov ([->columnName](https://www.php.net/manual/en/sqlite3result.columnname.php))
- dátový typ v danom stĺpci a riadku ([->columnType](https://www.php.net/manual/en/sqlite3result.columntype.php))

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("SELECT * FROM tabulka LIMIT 1");
$result = $stmt->execute();

echo "<b>Nazov stlpca \t: typ \t: hodnota</b><br>";
echo "---------------------------------<br>";
while ($row = $result->fetchArray(SQLITE3_NUM)) {
    for ($colNr = 0; $colNr < $result->numColumns(); $colNr++) {
        echo $result->columnName($colNr) . " \t: " . $result->columnType($colNr) . " \t: " . $row[$colNr] . "<br>";
    }
}
```

Dátové typy sú identifikovane celočíselnou hodnotou:
1. SQLITE3_INTEGER
2. SQLITE3_FLOAT
3. SQLITE3_TEXT
4. SQLITE3_BLOB
5. SQLITE3_NULL

Výsledok môže vyzerať napríklad takto:

```
Nazov stlpca 	: typ 	: hodnota
---------------------------------
int_field 	: 1 	: 42
float_field 	: 2 	: 1702842288.3741
text_field 	: 3 	: nejaký text
blob_field 	: 4 	: ��c�
null_field 	: 5 	: 
```

### Aktualizácia dát

Pre [aktualizáciu, zmenu](https://www.sqlite.org/lang_update.html) údajov v DB je opäť najvhodnejšia metóda pomocou pred pripraveného SQL príkazu.

Pri aktualizácii dát nesmiem zabudnúť, že pokiaľ v príkaze nepoužijem klauzulu `WHERE`, tak budú zmenené všetky riadky v tabuľke!

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("UPDATE tabulka SET text_field=:new_value WHERE id=:id");
$stmt->bindValue(':id', 1, SQLITE3_INTEGER);
$stmt->bindValue(':new_value', 'nejaký text', SQLITE3_TEXT);
$result = $stmt->execute();
```

### Mazanie dát

[Mazanie](https://www.sqlite.org/lang_delete.html), tak ako všetky CRUD operácie je najvhodnejšie vykonávať pomocou pred pripraveného SQL príkazu.

A podobne ako pri aktualizácii, tak aj pri mazaní dát z DB, ak vynechám v SQL príkaze kľúčové slovo `WHERE`, všetky riadky / záznamy v danej tabuľke budú zmazané!

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("DELETE FROM tabulka WHERE id=:id");
$stmt->bindValue(':id', 1, SQLITE3_INTEGER);
$result = $stmt->execute();

# alebo mozem zamerne zmazat vsetky riadky v danej tabulke
$stmt = $db->prepare("DELETE FROM tabulka");
$result = $stmt->execute();

# ak dana tabulka obsahovala stlpec s AUTOINCREMENT
# musim este zmazat aj zaznam v dalsej pomocnej tabulke 'sqlite_sequence',
# lebo v nej je ulozena informacia o najvacsom pouzitom ROWID
$stmt = $db->prepare("DELETE FROM sqlite_sequence WHERE name=:table_name");
$stmt->bindValue(':table_name', 'tabulka', SQLITE3_TEXT);
$result = $stmt->execute();

# alebo mozem uplne odstranit celu tabulku
$db->exec("DROP TABLE IF EXISTS tabulka");
```

### Návratové hodnoty

O výsledkoch skončenej operácie môžem získať nejaké informácie:

- počet zmenených riadkov ([->changes](https://www.php.net/manual/en/sqlite3.changes.php))
- `rowID` posledného vloženého riadku ([->lastInsertRowID](https://www.php.net/manual/en/sqlite3.lastinsertrowid.php))
- návratová hodnota vrátená poslednou zlyhanou operáciou ([->lastErrorCode](https://www.php.net/manual/en/sqlite3.lasterrorcode.php))
- anglický text popisujúci posledné zlyhanie ([->lastErrorMsg](https://www.php.net/manual/en/sqlite3.lasterrormsg.php))

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$stmt = $db->prepare("INSERT INTO tabulka VALUES(NULL, ?, NULL)");
$stmt->bindValue(1, 42, SQLITE3_INTEGER);
$result = $stmt->execute();

echo '<br>Kod  navratovej hodnoty poslednej zlyhanej operacie: '.$db->lastErrorCode();
echo '<br>Text navratovej hodnoty poslednej zlyhanej operacie: '.$db->lastErrorMsg();
echo '<br>Pocet riadkov ktore boli zmenene (vlozene, zmazane): '.$db->changes();
echo '<br>Cislo posledneho vlozeneho riadku: '.$db->lastInsertRowID();
```

Všetky návratové hodnoty aj s popisom: [Result and Error Codes](https://www.sqlite.org/rescode.html).

### Spracovanie výnimiek

Málokedy viem vopred predvídať všetky možné chybové stavy a teda ani ich neviem vopred všetky ošetriť. Práve v takejto situácii môžem použiť takzvané výnimky ([Exceptions](https://www.php.net/manual/en/language.exceptions.php)), ktoré môžu zabrániť úplnému zrúteniu / zastaveniu skriptu.

Časť kódu pri ktorej predpokladám možnú chybu, ale je dôležitá pre ďalší chod programu, uzavriem do bloku `try` a v bloku `catch` zadefinujem ako sa má daná výnimočná situácia vyriešiť (veľmi zjednodušené).

```PHP
try {
    $db = new SQLite3('/neexistujuca/DB/db.sqlite');
}
catch (Exception $exception) {
    echo $exception->getMessage();
}

# v pripade ze DB neexistuje, odpovedou je hlaska:
# Unable to open database: unable to open database file
```

Vyššie je výnimka priamo v jazyku PHP (predvolene zapnutá), no na ďalšiu prácu s SQLite3 DB potrebujem použitie SQLite3 výnimiek zapnúť.

- zapnutie SQLite3 výnimiek ([->enableExceptions](https://www.php.net/manual/en/sqlite3.enableexceptions.php))

```PHP
try {
    $db = new SQLite3('/cesta/ku/DB/db.sqlite');
    // Povolenie / zapnutie SQLite3 vynimiek
    $db->enableExceptions(true);
}
catch (Exception $exception) {
    echo $exception->getMessage();
}

try {
    $db->exec('invalid query');
}
catch (Exception $exception) {
    echo $exception->getMessage();
}

# odpovedou na neexistujuci SQL pprikaz je hlaska:
# near "invalid": syntax error
```

Od PHP verzie 8.3 a vyššie, je možné použiť na odchytávanie výnimiek špeciálnu na to určenú triedu [\SQLite3Exception](https://php.watch/versions/8.3/SQLite3-exception-improvements) namiesto pôvodnej `\Exception`.

```PHP
...
}
catch (\SQLite3Exception $exception) {
...
```

### Transakcie

V skratke, [SQLite transakcia](https://www.sqlite.org/lang_transaction.html) je podobne ako v iných DB systémoch taký druh operácie ktorý sa buď skončí celý alebo vôbec, nič medzi tým. Takže aj keď dôjde ku zlyhaniu tesne pred dokončením transakcie, tak sa systém vráti do stavu ako pred začatím transakcie - zabezpečuje to teda integritu a konzistentnosť dát v DB (veľmi zjednodušené).

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');
$db->exec('BEGIN');
# viacero CRUD operacii
# dalsie CRUD operacie
$db->exec('COMMIT');
```
Ďalší dôvod na použitie SQLite transakcie môže byť potreba vkladať / importovať veľké množstvo záznamov naraz. Keďže SQLite každú jednotlivú operáciu, ako napríklad vkladanie, vykoná ako jednu transakciu, a transakcia sa skončí až keď budú dáta zapísané na disk, tak je možné ušetriť čas, keď všetky operácie vkladania vykonám ako jednu transakciu. No toto je na zváženie, lebo tým samozrejme zvyšujem riziko straty dát, ak nebude transakcia cela úspešne dokončená.

```PHP
$db = new SQLite3(':memory:');

$db->exec("CREATE TABLE IF NOT EXISTS tabulka (
    int_field    INTEGER,
    id           INTEGER PRIMARY KEY AUTOINCREMENT
)");

$db->exec('BEGIN');
$stmt = $db->prepare("INSERT INTO tabulka VALUES(?, NULL)");
for ($i = 0; $i < 100000; $i++) {
    $stmt->bindValue(1, $i, SQLITE3_INTEGER);
    $result = $stmt->execute();
}
$db->exec('COMMIT');
```

Vyššie uvedený príklad, vloženie 100 tisíc záznamov do DB, na `Raspberry Pi 3 Model B` ako jedna transakcia trvá 1,7 sekundy, no bez `BEGIN` / `COMMIT` trvá 4,5 sekundy.

### Zálohovanie a obnova

#### Príkazy s bodkou

Zálohovanie je možné vykonať viacerými spôsobmi. Najjednoduchší spôsob je využiť takzvané [príkazy s bodkou](https://sqlite.org/cli.html#special_commands_to_sqlite3_dot_commands_). Tento spôsob je vhodný skôr pre menšie a menej často používané DB.

Potom môžem takto vytvorenú zálohu premiestniť pomocou `scp` alebo `rsync`.

```PHP
exec('sqlite3 /cesta/ku/DB/db.sqlite ".backup /zaloha/db.backup"', $output, $retval);

# alebo s prikazom .clone
exec('sqlite3 /cesta/ku/DB/db.sqlite ".clone /zaloha/db.clone"', $output, $retval);

# alebo s prikazom .dump
exec('sqlite3 /cesta/ku/DB/db.sqlite .dump >/zaloha/db.dump', $output, $retval);
```

#### PHP metóda

Od verzie PHP 7.4.0 je možné použiť na zálohovanie aj PHP metódu [->backup](https://www.php.net/manual/en/sqlite3.backup.php), ktorá vytvorí zálohu DB tak, že skopíruje obsah jednej DB do inej DB. Okrem zálohovania je táto metóda vhodná aj na kopírovanie DB vytvorenej v pamäti do súboru a naopak.

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');
$backup = new SQLite3('/cesta/ku/DB/backup.sqlite');

$db->backup($backup);
```

#### SQL príkaz

Od verzie SQLite 3.27.0 je možné použiť na zálohovanie aj SQL príkaz [VACUUM INTO](https://www.sqlite.org/lang_vacuum.html#vacuuminto), ktorý vytvorí zálohu DB do nového súboru.

Výhodou tejto metódy je aj to, že záloha databázy je "zmenšená" na minimálnu potrebnú veľkosť a taktiež je z nej odstránený všetok skôr vymazaný obsah. Je to transakčne bezpečná metóda, vznikne konzistentná kópia pôvodnej databázy.

```PHP
$db = new SQLite3('/cesta/ku/DB/db.sqlite');

$db->exec("VACUUM INTO '/cesta/ku/DB/db11.vacuum'");
```

#### Nástroje tretej strany

Viac menej náhodou som objavil veľmi zaujímavý projekt [Litestream](https://litestream.io/), ktorý vcelku komplexne rieši zálohovanie DB, ako nepretržitý stream zmien v SQLite do súboru alebo cloudového úložiska.

Zatiaľ sa nenachádza v distribúciách ako Debian / Ubuntu, je potrebné z Gitu stiahnuť balíček a ten nainštalovať ručne, následne je možné Litestream spustiť ako systemd službu. Konfigurácia je uložená v súbore `/etc/litestream.yml`.

Zálohovať je možné do lokálneho súboru alebo do S3 kompatibilného úložiska.

```sh
# stiahnut balicek z Gitu
wget https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-arm7.deb

# nainstalovat
sudo dpkg -i litestream-v0.3.13-linux-arm7.deb

# spustit ako systemd sluzbu
sudo systemctl enable litestream
sudo systemctl start litestream

# overit stav sluzby
systemctl status litestream

litestream version
litestream databases

# obnovit zalohovanu DB na povodne miesto
litestream restore /cesta/ku/DB/db.sqlite

# alebo obnovit na ine miesto
litestream restore -o /tmp/db /cesta/ku/DB/db.sqlite
```

---

## Zdroj

- [SQLite](https://www.sqlite.org/index.html)
- [PHP SQLite3](https://www.php.net/manual/en/book.sqlite3.php)
