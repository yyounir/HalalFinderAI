import requests, json
base='http://127.0.0.1:5000'
print('POST /save_food')
r=requests.post(base+'/save_food', json={'productName':'Test Supa','verdict':'halal','reason':'supabase test','confidence':0.5})
print(r.status_code, r.text)
print('GET /saved_foods')
r2=requests.get(base+'/saved_foods')
print(r2.status_code, r2.text[:400])
