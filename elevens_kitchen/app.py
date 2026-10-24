import os
from flask import Flask, render_template

app = Flask(__name__)

# ── helpers ──────────────────────────────────────────────
ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def get_gallery_images():
    """Return all image filenames from static/images, sorted."""
    img_dir = os.path.join(app.static_folder, 'images')
    if not os.path.isdir(img_dir):
        return []
    files = [
        f for f in os.listdir(img_dir)
        if os.path.splitext(f)[1].lower() in ALLOWED_EXT
    ]
    return sorted(files)

# ── routes ───────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/order')
def order():
    images = get_gallery_images()
    return render_template('order.html', gallery_images=images)

@app.route('/custom-cake')
def custom_cake():
    return render_template('custom_cake.html')

if __name__ == '__main__':
    app.run(debug=True)

