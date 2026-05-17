import base64, io
from main import app

client = app.test_client()
# tiny 1x1 PNG
png_b64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
img = base64.b64decode(png_b64)

data = {'file': (io.BytesIO(img), 'tiny.png')}
resp = client.post('/detect_file', data=data, content_type='multipart/form-data')
print('status', resp.status_code)
print(resp.get_data(as_text=True))
