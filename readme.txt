Struktura:
    environment.yml - Anaconda environment
    run.py - Vstupní bod programu
    spot_api - API interface pro komunikaci s robotem
    server - Http a websocket servery
    client - Webová aplikace v npm



Před použitím python scriptů (a celé aplikace) je potřeba nainstalovat potřebné anaconda prostředí ze souboru environment pomocí - conda env create -f environment.yml


Před vývojem npm aplikace je ve složce client nutné spustit - npm install
Následně pro live vývoj webové aplikace lze použít - npm run start
Pro aplikování změn do zbytku aplikace je nutné sestavení pomocí - npm run build  - výsledek sestavení bude ve složce client/dist, http server automaticky poskytuje soubory z této složky, takže není třeba nikam přesouvat


Z bezpečnostích důvodů bylo ze souboru spot.py odebráno heslo

Pro použítí Spota s Wi-Fi/Ethernetem/Payloadem je nutné odkomentovat příslunou IP adresu na začátku souboru spot.py

Pro vývoj bez přítomnosti Spota je připraven Mock objekt Spot API interface. Pro jeho použití stačí v run.py
 - zakomentovat  import spot_api.spot as spot
 - odkomentovat


Vytváření payload systému je popsáno v souboru setup_payload.txt

