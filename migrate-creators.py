import requests
import json
import os
import getpass

# Get login token first
def get_token():
    login_url = "http://localhost:8000/token"
    
    # Ask for credentials
    username = input("Enter your admin username: ")
    password = getpass.getpass("Enter your password: ")
    
    credentials = {"username": username, "password": password}
    
    response = requests.post(login_url, data=credentials)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

# Run the migration
def migrate_creators():
    token = get_token()
    if not token:
        return
    
    url = "http://localhost:8000/videos/creators/migrate-from-videos"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(url, headers=headers)
    if response.status_code == 200:
        creators = response.json()
        print(f"Successfully migrated {len(creators)} creators:")
        for creator in creators:
            print(f"  - {creator['name']} (ID: {creator['id']})")
    else:
        print(f"Migration failed: {response.text}")

if __name__ == "__main__":
    print("Starting creator migration...")
    migrate_creators()
    print("Done!") 