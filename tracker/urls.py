from django.urls import path
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register('families', views.FamilyViewSet, basename='families')
router.register('my-profile', views.MemberInfoViewSet, basename='my-profile')

family_router = routers.NestedDefaultRouter(
    router, 'families', lookup='family')
family_router.register('members', views.MemberViewSet, basename='member')
family_router.register(
    'earnings', views.FamilyEarningViewSet, basename='earning')
family_router.register(
    'expenses', views.FamilyExpenseViewSet, basename='expense')
family_router.register(
    'records', views.FamilyRecordsViewset, basename='record')

member_router = routers.NestedDefaultRouter(
    family_router, 'members', lookup='member')
member_router.register(
    'earnings', views.MemberEarningViewSet, basename='earning')
member_router.register(
    'expenses', views.MemberExpenseViewSet, basename='expense')
member_router.register(
    'records', views.MemberRecordsViewSet, basename='record')
member_router.register('images', views.MemberImageViewSet,
                       basename='member-images')

urlpatterns = router.urls + family_router.urls + member_router.urls
