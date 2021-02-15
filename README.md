# vicki-bot

## Installation

### Mit Ansible

#### Remote Host
Als Betriebssystem wird Debian 10 ‘buster’ empfohlen. Debian 9 ‘stretch’ wurde nicht mit dem finalen Build getestet, insbesondere nicht im Setup-Prozess mit Ansible, und sollte nicht mehr verwendet werden.

#### Host – Ansible Control Node
Als Host wurde in der Development-Phase Ubuntu 20.10 als Ansible-Control-Node genutzt.

#### /etc/ansible/hosts – Managed Nodes
In Ihrem Inventory müssen Sie die Nodes, die Sie managen wollen, über die IP-Adresse oder über den Domain Name identifizieren und können, je nachdem, ob die Konfiguration des Remote Hosts es erfordert, noch weitere Parameter übergeben. Sie können bspw. das Root-Passwort des Remote Hosts bereits in Ihrem Inventory angeben. 

    13   │ #green.example.com
    14   │ #blue.example.com
    15   │ #192.168.100.1
    16   │ #192.168.100.10
    17   │
    18   │ [vicki] #Sie können auch eigene Gruppen im Inventory definieren
    19   │ #vicki 1
    20   │ infochat-vw.hdm-stuttgart.de #oder..
    21   │ 123.12.3.123 ansible_ssh_user='root' ansible_ssh_password='***'
    22   │ #oder z.B. ansible_ssh_private_key_file='/path/to/key' etc.   

Weitere Informationen zu Inventories finden Sie hier: https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html

#### Durchführen eines Plays
Nachdem Sie das Inventory nun mit den zu bearbeitenden Remote Hosts befüllt haben, können Sie ein Play durchführen. Dafür wechseln Sie in das geklonte Git-Repository und führen das Playbook ‘vicki.yml’ aus. 

    [user@whatever ~/vicki-bot]$ ansible-playbook ansible/vicki.yml --ask-vault-pass    

Im Verzeichnis ‘vicki-bot’ befindet sich das Playbook im Unterverzeichnis ‘ansible’. Sie führen einfach den Befehl ‘ansible-playbook’ zusammen mit dem Pfad zum jeweiligen Playbook, in diesem Fall ‘ansible/vicki.yml’, und der Flag ‘--ask-vault-pass’, für die Entschlüsselung der Zugangsdaten zum Dialogflow-Agent, aus. Anschließend geben Sie das Vault-Passwort ein, und können die Ausführung der einzelnen Tasks verfolgen.  

Sofern alle Schritte des Plays erfolgreich abgelaufen sind, ist der Chatbot bereits in Betrieb und erwartet Benutzereingaben. 

### “Von Hand”

#### Login über SSH

    [user@whatever ~]$ ssh root@123.12.3.123 #IP-Adresse des App-Servers 

#### Das Git-Repository klonen

    (1)
    [root@whatever ~]# apt update && apt upgrade -y && apt install git curl
    (2)
    [root@whatever ~]# git clone https://github.com/pders01/vicki-bot
    (3)
    [root@whatever ~]# mkdir /vicki && mv vicki-bot /vicki
    (4)
    [root@whatever ~]# cd /vicki/vicki-bot


Zunächst refreshen wir die Package-Base und installieren die Pakete ‘git’ und ‘curl’.
Anschließend klonen wir das Repository, 
schaffen ein neues Verzeichnis unter /vicki und verschieben das geklonte Repository dorthin. 
Schließlich wechseln wir in das geklonte Repository.

#### Node installieren

    (5)
    [root@whatever ~]# curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
    (6)
    [root@whatever ~]# bash nodesource_setup.sh
    (7)
    [root@whatever ~]# apt install nodejs -y 
    (8)
    [root@whatever ~]# node -v 
    v12.20.2

Hier laden wir das Setup-Skript für Node herunter,
führen es mit bash aus,
installieren Node,
und überprüfen die Installation, indem wir die im PATH verankerte Node-Version ausgeben.

#### pm2, Typescript und weiter Abhängigkeiten installieren
    (9)
    [root@whatever ~]# npm install pm2 typescript 
    (10)
    [root@whatever ~]# rm nodesource_setup.sh && npm install 

Nun installieren wir pm2, den Process-Monitor, der die Node-Application im Produktionsbetrieb überwacht und bei Abstürzen neu startet. 
Schließlich entfernen wir noch das Setup-Skript für Node und installieren die Abhängigkeiten für das Projekt. 

#### Nginx installieren und konfigurieren

    (11)
    [root@whatever ~]# apt install nginx
    (12)
    [root@whatever ~]# rm /etc/nginx/sites-enabled/default
    (13)
    [root@whatever ~]# touch /etc/nginx/sites-available/reverse-proxy.conf
    (14)
    [root@whatever ~]# echo -e "server {\n\tlisten 80;\n\t\tlocation / {\n\t\t\tproxy_pass http://127.0.0.1:3000;\n\t\t}\n}" > /etc/nginx/sites-available/reverse-proxy.conf
    (15)
    [root@whatever ~]# ln -s /etc/nginx/sites-available/reverse-proxy.conf /etc/nginx/sites-enabled/reverse-proxy.conf
    (16)
    [root@whatever ~]# systemctl restart nginx

Wir installieren Nginx. 
Hier entfernen wir die Default-Seite des Webservers.
Hier erstellen wir eine Datei ‘reverse-proxy.conf’, die den Server-Block für die Reverse-Proxy-Funktion des Webservers beinhalten wird.
Hier schreiben wir die überschaubare Konfiguration in die eben angelegte Datei.
Wir erstellen einen symbolischen Link zu ‘sites-enabled’, damit die Konfiguration aktiv wird,
und starten Nginx neu, damit die Änderungen aktiv werden. 

#### Credentials entschlüsseln

    (17)
    [root@whatever ~]# apt install ansible
    (18)
    [root@whatever ~]# ansible-vault decrypt ansible/roles/vicki/files/credentials.json ansible/roles/vicki/files/.env
    Vault password: *********
    Decryption successful
    (19)
    [root@whatever ~]# mv ansible/roles/vicki/files/credentials.json ansible/roles/vicki/files/.env .

Für die Entschlüsselung der Dateien ‘credentials.json’ und ‘.env’ benötigen wir ansible-vault. Daher installieren wir ansible (was danach auch wieder entfernt werden kann)
Jetzt entschlüsseln wir die Dateien. Hierzu geben wir das Vault-Passwort ein.
Zuletzt verschieben wir die entschlüsselten Dateien in das ‘vicki-bot’-Verzeichnis. 

#### Backend-Service starten

    (20)
    [root@whatever ~]# npx pm2 
    (21)
    [root@whatever ~]# npx pm2 ping 
    (22)
    [root@whatever ~]# npx pm2 install typescript pm2.json
    (23)
    [root@whatever ~]# npx pm2 start pm2.json --watch

Nun starten wir die lokale Installation von pm2,
schauen noch einmal, ob alles normal funktioniert, 
und installieren TypeScript-Support für pm2.
Als Nächstes starten wir die Node-Application. Wenn alles funktioniert hat, sollte der Chatbot jetzt laufen. Der API-Dokumentation ist zu entnehmen, wie man den Endpunkt testen kann. 



