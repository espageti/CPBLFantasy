from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import (
    TeamViewSet, PlayerViewSet, GameViewSet, GameStatsViewSet,
    FantasyLeagueViewSet, FantasyTeamViewSet, FantasyRosterViewSet,
    FantasyRosterListView, UserListView
)

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='team')  # FIXED: Should be TeamViewSet
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'games', GameViewSet, basename='game')
router.register(r'game-stats', GameStatsViewSet, basename='game-stats')
router.register(r'fantasy-leagues', FantasyLeagueViewSet, basename='fantasy-league')
router.register(r'fantasy-teams', FantasyTeamViewSet, basename='fantasy-team')
router.register(r'fantasy-rosters', FantasyRosterViewSet, basename='fantasy-roster')
router.register(r'users', UserListView, basename='user') 

# Include router URLs
urlpatterns = [
    path('', include(router.urls)),
    path("api/fantasy-rosters/", FantasyRosterListView.as_view(), name="fantasy-rosters"),  # Custom view
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)