from rest_framework import status
import pytest
from core.models import User


@pytest.mark.django_db
class TestCreateMember:
    def test_if_member_is_created_returns_200(self, api_client):
        user = User.objects.create_user(
            username='John', password='123', is_staff=False)
        api_client.force_authenticate(user=user)

        member_response = api_client.get('/tracker/my-profile/me/')

        assert member_response.status_code == status.HTTP_200_OK

        assert member_response.data == {
            'family_id': None,
            'generation': 'P',
            'member_id': 1
        }


class TestViewMyProfile:
    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/my-profile/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
