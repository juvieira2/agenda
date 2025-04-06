
from flask import Flask, render_template, send_from_directory, request, jsonify
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime

app = Flask(__name__, static_folder=".")

def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS records (
            id SERIAL PRIMARY KEY,
            host VARCHAR(100),
            apartment VARCHAR(20),
            block VARCHAR(10),
            receipt_date DATE,
            delivery_date DATE,
            status VARCHAR(20)
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/records', methods=['GET'])
def get_records():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM records ORDER BY receipt_date DESC')
    records = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(records)

@app.route('/api/records', methods=['POST'])
def add_record():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        INSERT INTO records (host, apartment, block, receipt_date, delivery_date, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
    ''', (
        data['host'],
        data['apartment'],
        data['block'],
        data['receiptDate'],
        data['deliveryDate'] if data['deliveryDate'] else None,
        data['status']
    ))
    new_record = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(new_record)

@app.route('/api/records/<int:id>', methods=['PUT'])
def update_record(id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute('''
        UPDATE records 
        SET host = %s, apartment = %s, block = %s, 
            receipt_date = %s, delivery_date = %s, status = %s
        WHERE id = %s
        RETURNING *
    ''', (
        data['host'],
        data['apartment'],
        data['block'],
        data['receiptDate'],
        data['deliveryDate'] if data['deliveryDate'] else None,
        data['status'],
        id
    ))
    updated_record = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(updated_record)

@app.route('/api/records/<int:id>', methods=['DELETE'])
def delete_record(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM records WHERE id = %s', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return '', 204

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
