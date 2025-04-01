from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS



#create object for the backend
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Super2314@localhost:5432/taskmanager'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#create object to communicate with db through back end
db = SQLAlchemy(app)


#task model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(200), nullable = False)
    completed = db.Column(db.Boolean, default = False)
    
    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
    
    

#create CRUD operations


#create endpoint
@app.route('/create', methods=['POST'])
def create_task():
    #store request data
    data = request.json
    
    #if data doesnt have title name
    if not data or 'title' not in data:
        return jsonify({'error': "Title is required"}), 400
    
    #create task
    new_task = Task(title = data['title'],
                    completed = data.get('completed', False)
                    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({
        'id': new_task.id,
        'title': new_task.title,
        'completed': new_task.completed
    }), 201
    

#remove endpoint
@app.route('/remove/<int:task_id>', methods=['DELETE'])
def remove_task(task_id):

    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'Message': f'Task {task.id} removed.'}),  200


#get endpoint
@app.route('/tasks', methods=['GET'])
def get_tasks():
    
    task = Task.query.all()
    
    return jsonify([{'id': t.id, 
                     'title': t.title, 
                     'completed': t.completed
                     } for t in task]), 200

#put endoint
@app.route('/tasks/<int:task_id>', methods = ['PUT'])
def update_task(task_id):
    
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'error': f'Task {task.id} not found.'}), 404
    
    data = request.json
    task.title = data.get('title', task.title)
    task.completed = data.get('completed', task.completed)
    db.session.commit()
    
    return jsonify({
        'message': f'Task {task_id} updated',
        'task': {
            'id': task.id,
            'title': task.title,
            'completed': task.completed
        }
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)