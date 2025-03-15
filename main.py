from app import app, db  # Import `app` and `db` from `app.py`

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)  # Run Flask with debugging enabled
