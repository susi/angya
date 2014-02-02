angya
=====

Angya is a travel router project for the T-111.4360 Design of WWW Services- course

installation
------------

Depends on flask, so you need to install that. Install it on an ubuntu machine with:

sudo apt-get install python-flask

Refer to flask documentation for other platforms: http://flask.pocoo.org/

site structure
--------------

The main app is in angya.py. map.py defines the Map class which implements the /map URL.

Under static we have the css and js files and html templates are under templates.
