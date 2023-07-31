from email.mime import base
from django.urls import path
from rest_framework_nested import routers
from . import views

router = routers.DefaultRouter()
router.register('families', views.FamilyViewSet, basename='families')
router.register('members', views.MemberInfoViewSet, basename='members')

family_router = routers.NestedDefaultRouter(router, 'families', lookup='family')
family_router.register('members', views.MemberViewSet, basename='family-members')

urlpatterns = router.urls + family_router.urls
