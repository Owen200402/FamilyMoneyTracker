from django.urls import path
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register('families', views.FamilyViewSet, basename='families')
router.register('my-profile', views.MemberInfoViewSet, basename='my-profile')

family_router = routers.NestedDefaultRouter(
    router, 'families', lookup='family')
family_router.register('members', views.MemberViewSet, basename='member')

member_router = routers.NestedDefaultRouter(
    family_router, 'members', lookup='member')
member_router.register(
    'earnings', views.MemberEarningViewSet, basename='earning')
member_router.register(
    'expenses', views.MemberExpenseViewSet, basename='expense')
member_router.register(
    'net', views.MemberNetViewSet, basename='net')

urlpatterns = router.urls + family_router.urls + member_router.urls
