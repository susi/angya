import flask

import map

app = flask.Flask(__name__)

@app.route('/')
def index():
    return flask.redirect(flask.url_for('map_handler'))

@app.route('/map')
def map_handler():
    map_app = map.Map(app);
    return map_app.render()

if __name__ == '__main__':
    app.run(debug=True)
