from locust import HttpUser, task, between
from random import randint
import random
import string


class WebsiteUser(HttpUser):
    wait_time = between(1, 5)
    family_for_testing = "f25ec149-c0d4-4a52-81c0-a3c4738d7c66"

    @task(2)
    def view_profile(self):
        headers = {"Authorization": f"JWT {self.access_token}"}
        self.client.get('/tracker/my-profile/me/',
                        headers=headers,
                        name='/tracker/my-profile/me')

    @task(2)
    def view_family_members(self):
        headers = {"Authorization": f"JWT {self.access_token}"}
        self.client.get(f'/tracker/families/{self.family_for_testing}/members',
                        headers=headers,
                        name=f'/tracker/families/{self.family_for_testing}/members')

    @task(1)
    def link_family_members(self):
        self.on_start()
        headers = {"Authorization": f"JWT {self.access_token}"}
        response = self.client.get('/tracker/my-profile/me/',
                                   headers=headers)

        response_json = response.json()

        self.client.post(f'/tracker/families/{self.family_for_testing}/members/',
                         headers=headers,
                         json={
                             "member_id": response_json["member_id"]
                         })
    
    

    def on_start(self):
        username = generate_random_string(10)
        password = generate_random_string(10)
        self.client.post(
            '/auth/users/', json={"username": username,
                                  "password": password,
                                  "email": "",
                                  "first_name": "",
                                  "last_name": ""})
        jwt_response = self.client.post(
            "/auth/jwt/create/", json={'username': f"{username}", 'password': f"{password}"}).json()

        self.access_token = jwt_response['access']


def generate_random_string(length):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))