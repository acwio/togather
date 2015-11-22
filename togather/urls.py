from django.conf.urls import patterns, include, url
from django.contrib import admin

from GameSystem.views import *

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'togather.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'GameSystem.views.home', name='home'),
    url(r'^login-register-user/', 'GameSystem.views.get_user', name='get_user'),
    url(r'^(?P<availablegame_id>\d*)/', 'GameSystem.views.load_game_session', name='load_game_session')
)
