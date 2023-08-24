from django.views.generic import TemplateView
from django.urls import path
from .import views
from core.views import email

urlpatterns = [
    path('', TemplateView.as_view(template_name='core/index.html'))
]
