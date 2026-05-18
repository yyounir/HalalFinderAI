import requests
base='http://127.0.0.1:5000'
print('POST /save_food')
r=requests.post(base+'/save_food', json={'productName':'Test after fix','verdict':'halal','reason':'local sqlite','confidence':0.6}, timeout=10)
print(r.status_code, r.text)
print('GET /saved_foods')
r2=requests.get(base+'/saved_foods', timeout=10)
print(r2.status_code, r2.text[:800])
