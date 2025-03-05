from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Team, FantasyTeam, Player, FantasyRoster, Game, GameStats, FantasyLeague

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()  # Add this line
    
    class Meta:
        model = Player
        fields = '__all__'
        
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class GameStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameStats
        fields = '__all__'

class FantasyLeagueSerializer(serializers.ModelSerializer):
    class Meta:
        model = FantasyLeague
        fields = '__all__'

class FantasyTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = FantasyTeam
        fields = '__all__'

class FantasyRosterSerializer(serializers.ModelSerializer):
    class Meta:
        model = FantasyRoster
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']  # Include any fields you need