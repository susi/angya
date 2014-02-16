Angya
=====

Angya is a travel router project for the T-111.4360 Design of WWW Services- course

installation
------------
Angya is desgned to run in Google Appengine. Please follow these instructions to create your own Angya.

### Run Locally
1. Install the [App Engine Python SDK](https://developers.google.com/appengine/downloads).
See the README file for directions. You'll need python 2.7 and [pip 1.4 or later](http://www.pip-installer.org/en/latest/installing.html) installed too.

2. Clone this repo

3. Install dependencies in the project's lib directory.
   Note: App Engine can only import libraries from inside your project directory.

   ```
   cd angya
   pip install -r requirements.txt -t lib
   ```
4. Run this project locally from the command line:

   ```
   dev_appserver.py .
   ```

Visit the application [http://localhost:8080](http://localhost:8080)

See [the development server documentation](https://developers.google.com/appengine/docs/python/tools/devserver)
for options when running dev_appserver.

### Deploy
To deploy the application:

1. Use the [Admin Console](https://appengine.google.com) to create a
   project/app id. (App id and project id are identical)
2. [Deploy the
   application](https://developers.google.com/appengine/docs/python/tools/uploadinganapp) with
   ```
   appcfg.py -A angya-travel --oauth2 update .
   ```
3. Congratulations!  Your application is now live at angya-travel.appspot.com

Change angya-travel to your own app id for your own instance. The above commands are there
for the Angya team mambers.

Dependencies
------------

Depends on flask, and it's dependencies. Installing Flask will bring in those dependancies
too.

Refer to flask documentation for more on Flask: http://flask.pocoo.org/
Site structure
--------------

The main app is in angya.py. This app is responsible for dispatching the request to the proper handlers.

For example the /map url is handle by the Map class defined in map.py.

Under static we have the css and js files and html templates are under templates.

Licensing
---------

See [LICENSE](LICENSE)
