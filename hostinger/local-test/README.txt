TEST THE BACKEND ON YOUR OWN COMPUTER (no Hostinger needed)

1. Install PHP 8.1+ 
   Windows: install XAMPP (apachefriends.org) - it already includes PHP with sqlite and curl.
            PHP is then at C:\xampp\php\php.exe. Add C:\xampp\php to your PATH, or open "XAMPP Shell".
   Mac:     brew install php
   Linux:   sudo apt install php-cli php-sqlite3 php-curl php-mbstring

2. Make a folder, for example "rb-test", and put inside:
     - router.php and start-local.bat (from this folder)
     - a folder named "site" = the unzipped contents of raju-bepari-hostinger.zip
       (so rb-test\site\index.html and rb-test\site\api\lead.php exist)

3. Open site\api\config.php in Notepad and set:   'admin_key' => 'test-key-123456',

4. In a terminal inside "rb-test" run:   php -S localhost:8000 router.php
   (Windows: double-click start-local.bat). Leave the window open.

5. Open http://localhost:8000
   - /contact/       send a test enquiry (wait 3+ seconds before pressing send)
   - /dashboard/     log in with test-key-123456, your enquiry is under Enquiries
   - /tracking-checker/   scan a public site, then see it under "Site scans"
   - click around some pages, then see "Visitor activity" (use a normal browser window)

The test data is saved in a folder named rb-data next to "site". Delete that folder to start fresh.
Email will not be sent locally (that is normal). To stop the server press Ctrl+C.
