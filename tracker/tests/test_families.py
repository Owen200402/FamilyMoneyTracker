import pytest
from rest_framework import status
from core.models import User
from model_bakery import baker
from tracker.models import Family


@pytest.mark.django_db
class TestViewFamilies:
    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_if_annonymous_user_returns_405(self, api_client):
        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_no_family_id_accessing_other_family_profile_returns_200(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)
        family = baker.make(Family)

        response = api_client.get(f'/tracker/families/{family.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data == {}

    def test_if_diff_family_id_accessing_other_family_profile_returns_200(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)
        family = baker.make(Family)
        user.member.family_id = family.id

        response = api_client.get(f'/tracker/families/{family.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data == {}
