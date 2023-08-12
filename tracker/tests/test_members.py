import pytest
from rest_framework import status
from model_bakery import baker
from core.models import User


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
            'member_id': user.member.id
        }


class TestViewMyProfile:
    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/my-profile/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
