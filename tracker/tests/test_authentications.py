from rest_framework import status
import pytest
from model_bakery import baker
from core.models import User


@pytest.mark.django_db
class TestAuthentication:
    def test_if_user_is_created_returns_200(self, api_client, authenticate):
        authenticate()

        current_user_response = api_client.get('/auth/users/me/')

        assert current_user_response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestCreateMember:
    def test_if_member_is_created_returns_200(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)

        member_response = api_client.get('/tracker/my-profile/me/')

        assert member_response.status_code == status.HTTP_200_OK

        assert member_response.data == {
            'family_id': None,
            'generation': 'P',
            'member_id': user.member.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }
