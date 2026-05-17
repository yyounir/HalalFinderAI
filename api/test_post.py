import requests
open('api/test_image.jpg','wb').write(b'\x89PNG\r\n\x1a\n')
files={'file':open('api/test_image.jpg','rb')}
try:
    r=requests.post('http://127.0.0.1:5000/detect_file', files=files, timeout=30)
    print('STATUS', r.status_code)
    print(r.text)
except Exception as e:
    print('ERR', e)
