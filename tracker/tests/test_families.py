from rest_framework import status
import pytest
from core.models import User
from model_bakery import baker


class TestViewFamilies:
    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_if_annonymous_user_returns_405(self, api_client):
        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_accessing_wrong_family_return_403(self, api_client, authenticate):
        pass

    def test_accessing_right_family_return_200(slef, api_client, authenticate):
        pass
