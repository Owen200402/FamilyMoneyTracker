from rest_framework import status
import pytest


@pytest.mark.django_db
class TestViewMyProfile:
    def test_if_user_unauthorized_return_401(self, api_client):
        my_profile_response = api_client.get('/tracker/my-profile/')

        assert my_profile_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/my-profile/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
