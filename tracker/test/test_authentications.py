from rest_framework import status
import pytest
from core.models import User


class TestAuthentication:
    def test_if_user_is_created_returns_200(self, api_client, authenticate):
        authenticate()

        current_user_response = api_client.get('/auth/users/me/')

        assert current_user_response.status_code == status.HTTP_200_OK

    def test_if_user_unauthorized_return_401(self, api_client):
        my_profile_response = api_client.get('/tracker/my-profile/')
        family_response = api_client.get('/tracker/families/')

        assert my_profile_response.status_code == status.HTTP_401_UNAUTHORIZED
        assert family_response.status_code == status.HTTP_401_UNAUTHORIZED
