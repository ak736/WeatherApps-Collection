from flask import Flask, render_template
from weather import get_weather
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('home.html')

@app.route('/weather', methods=['POST'])
def handle():
    return " "

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
