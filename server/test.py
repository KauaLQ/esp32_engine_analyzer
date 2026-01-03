from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/measurements', methods=['POST'])
def receive_measurements():
    data = request.get_json()

    print("\n📥 Dados recebidos:")
    print(data)

    return jsonify({
        "status": "ok",
        "message": "Dados recebidos com sucesso"
    }), 200

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=3080,
        debug=False
    )