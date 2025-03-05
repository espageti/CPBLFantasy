from rest_framework import viewsets, generics
from .models import Team, Player, FantasyTeam, FantasyLeague, Game, GameStats, FantasyRoster
from .serializers import (
    TeamSerializer, PlayerSerializer, FantasyTeamSerializer, GameSerializer,
    GameStatsSerializer, FantasyLeagueSerializer, FantasyRosterSerializer
    , UserSerializer
)
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly
from .permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

class UserListView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image']  # Only expose non-sensitive fields
    # permission_classes = [IsAuthenticated]  # Require authentication to access


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAdminOrReadOnly]

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    
    permission_classes = [IsAdminOrReadOnly]
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAdminOrReadOnly]

class GameStatsViewSet(viewsets.ModelViewSet):
    queryset = GameStats.objects.all()
    serializer_class = GameStatsSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['player', 'game', 'role']

class FantasyLeagueViewSet(viewsets.ModelViewSet):
    queryset = FantasyLeague.objects.all()
    serializer_class = FantasyLeagueSerializer
    permission_classes = [IsAdminOrReadOnly]

class FantasyTeamViewSet(viewsets.ModelViewSet):
    queryset = FantasyTeam.objects.all()
    serializer_class = FantasyTeamSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class FantasyRosterViewSet(viewsets.ModelViewSet):
    queryset = FantasyRoster.objects.all()
    serializer_class = FantasyRosterSerializer
    permission_classes = [IsOwnerOrReadOnly]

class FantasyRosterListView(generics.ListAPIView):
    serializer_class = FantasyRosterSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        """Filter rosters by fantasy team if 'fantasy_team_id' is provided"""
        fantasy_team_id = self.request.query_params.get("fantasy_team_id")
        if fantasy_team_id:
            return FantasyRoster.objects.filter(fantasy_team_id=fantasy_team_id)
        return FantasyRoster.objects.all()