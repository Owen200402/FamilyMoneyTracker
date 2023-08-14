import pytest
from rest_framework import status
from core.models import User
from model_bakery import baker
from tracker.models import Family, Member


@pytest.mark.django_db
class TestViewFamilies:
    def test_if_user_unauthorized_return_401(self, api_client):
        family_response = api_client.get('/tracker/families/')

        assert family_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_method_not_allowed_returns_405(self, api_client, authenticate):
        authenticate()

        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_if_annonymous_user_returns_405(self, api_client):
        response = api_client.get('/tracker/families/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_no_family_id_accessing_other_family_profile(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)
        family = baker.make(Family)

        retrieving_response = api_client.get(f'/tracker/families/{family.id}/')
        posting_response = api_client.patch(
            f'/tracker/families/{family.id}/', {})

        assert retrieving_response.status_code == status.HTTP_200_OK
        assert posting_response.status_code == status.HTTP_400_BAD_REQUEST
        assert retrieving_response.data != None

    def test_if_diff_family_id_accessing_other_family_profile(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)
        family1 = baker.make(Family)
        family2 = baker.make(Family)
        user.member.family_id = family2.id

        retrieving_response = api_client.get(
            f'/tracker/families/{family1.id}/')
        posting_response = api_client.patch(
            f'/tracker/families/{family1.id}/', {})

        assert retrieving_response.status_code == status.HTTP_200_OK
        assert posting_response.status_code == status.HTTP_400_BAD_REQUEST
        assert retrieving_response.data != None

    def test_if_correct_family_id_accessing_their_family_profile(self, api_client):
        user = baker.make(User)
        api_client.force_authenticate(user=user)
        family = baker.make(Family)
        user.member.family_id = family.id

        retrieving_response = api_client.get(
            f'/tracker/families/{family.id}/')
        posting_response = api_client.patch(
            f'/tracker/families/{family.id}/', {})

        assert retrieving_response.status_code == status.HTTP_200_OK
        assert posting_response.status_code == status.HTTP_200_OK
        assert retrieving_response.data != None


@pytest.mark.django_db
class TestMemberLinkage:
    def test_if_member_linked_returns_201(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        response = api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        assert response.status_code == status.HTTP_201_CREATED

    def test_if_member_linked_does_not_exist_returns_400(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        response = api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': 100})

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_if_member_already_linked_returns_400(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        response = api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_if_member_unlinked_returns_200(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        response = api_client.put(
            f'/tracker/families/{family.id}/members/{user.member.id}/unlink-member/')

        assert response.status_code == status.HTTP_200_OK

    def test_if_member_unlinked_does_not_exist_returns_404(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        response = api_client.put(
            f'/tracker/families/{family.id}/members/100/unlink-member/')

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestMemberAccess:
    def test_authenticated_member_accessing_member_returns_200(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})
        response = api_client.get(
            f'/tracker/families/{family.id}/members/{user.member.id}/')

        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_member_accessing_member_returns_401(self, api_client):
        user = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        api_client.force_authenticate(user=None)
        response = api_client.get(
            f'/tracker/families/{family.id}/members/{user.member.id}/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_member_registered_but_in_other_family_accessing_member_returns_200(self, api_client):
        user = baker.make(User)
        user2 = baker.make(User)
        family = baker.make(Family)
        api_client.force_authenticate(user=user)

        api_client.post(
            f'/tracker/families/{family.id}/members/', {'member_id': user.member.id})

        api_client.force_authenticate(user=user2)
        response = api_client.get(
            f'/tracker/families/{family.id}/members/{user.member.id}/')

        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestIndividualEarnings:
    def test_authenticated_member_accessing_member_earnings(self, api_client, authenticate):
        pass

    def test_authenticated_member_posting_member_earnings(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_putting_member_earnings(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_member_earnings(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_posting_member_earnings(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_putting_member_earnings(self, api_client, authenticate):
        pass

    def test_authenticated_member_accessing_member_expenses(self, api_client, authenticate):
        pass


@pytest.mark.django_db
class TestIndividualExpenses:
    def test_authenticated_member_posting_member_expenses(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_putting_member_expenses(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_member_expenses(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_posting_member_expenses(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_putting_member_expenses(self, api_client, authenticate):
        pass


@pytest.mark.django_db
class TestIndividualRecords:
    def test_authenticated_member_accessing_member_records(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_member_records(self, api_client, authenticate):
        pass


@pytest.mark.django_db
class TestFamilyEarnings:
    def test_authenticated_member_accessing_family_earnings(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_family_earnings(self, api_client, authenticate):
        pass


@pytest.mark.django_db
class TestFamilyExpenses:
    def test_authenticated_member_accessing_family_expenses(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_family_expenses(self, api_client, authenticate):
        pass


@pytest.mark.django_db
class TestFamilyRecords:
    def test_authenticated_member_accessing_family_records(self, api_client, authenticate):
        pass

    def test_unauthenticated_member_accessing_family_records(self, api_client, authenticate):
        pass
