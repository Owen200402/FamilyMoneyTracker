from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
import debug_toolbar
from . import views

admin.site.site_header = 'Money Tracker Services'
admin.site.index_title = 'Services'

urlpatterns = [
    path('', include('core.urls')),
    path('client/', include('client.urls')),
    path('admin/', admin.site.urls),
    path('tracker/', include('tracker.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('__debug__/', include(debug_toolbar.urls)),
    path('hello/', views.say_hello)
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]
