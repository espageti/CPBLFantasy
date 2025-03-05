import datetime
from django.db import models
from django.db.models import Sum, Avg
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _  # Optional for i18n support
from django.contrib.postgres.fields import ArrayField

# Global Enum for Role Choices
class RoleChoices(models.TextChoices):
    BATTER = 'batter', _('Batter')
    PITCHER = 'pitcher', _('Pitcher')

# Real-life baseball positions
class Position(models.TextChoices):
    PITCHER = "P", _("Pitcher")
    CATCHER = "C", _("Catcher")
    FIRST_BASE = "1B", _("First Base")
    SECOND_BASE = "2B", _("Second Base")
    THIRD_BASE = "3B", _("Third Base")
    SHORTSTOP = "SS", _("Shortstop")
    LEFT_FIELD = "LF", _("Left Field")
    CENTER_FIELD = "CF", _("Center Field")
    RIGHT_FIELD = "RF", _("Right Field")
    DESIGNATED_HITTER = "DH", _("Designated Hitter")
    UTILITY = "UT", _("Utility")  # Can play multiple positions

# Fantasy baseball roster positions
class FantasyPosition(models.TextChoices):
    FIRST_BASE = "1B", "First Base"
    SECOND_BASE = "2B", "Second Base"
    THIRD_BASE = "3B", "Third Base"
    SHORTSTOP = "SS", "Shortstop"
    CATCHER = "C", "Catcher"
    CORNER_INFIELD = "CI", "Corner Infield"
    MIDDLE_INFIELD = "MI", "Middle Infield"
    INFIELD = "IF", "Infield"
    LEFT_FIELD = "LF", "Left Field"
    CENTER_FIELD = "CF", "Center Field"
    RIGHT_FIELD = "RF", "Right Field"
    OUTFIELD = "OF", "Outfield"
    UTILITY = "UTIL", "Utility"
    STARTING_PITCHER = "SP", "Starting Pitcher"
    RELIEF_PITCHER = "RP", "Relief Pitcher"
    PITCHER = "P", "Pitcher"
    INJURED_LIST = "IL", "Injured List"

class Team(models.Model):
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'cpbl_teams'

    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=255)
    indigenous_name = models.CharField(max_length=255, null=True, blank=True)
    number = models.IntegerField(null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    position = models.CharField(max_length=100, null=True, blank=True)
    eligible_positions = ArrayField(
        models.CharField(max_length=10, choices=FantasyPosition.choices),
        blank=True,
        null=True
    )
    bats = models.CharField(max_length=1, choices=[('L', 'Left'), ('R', 'Right'), ('S', 'Switch')])
    throws = models.CharField(max_length=1, choices=[('L', 'Left'), ('R', 'Right')])
    height = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    debut_date = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    acnt = models.CharField(max_length=10, unique=True)
    profile_image = models.ImageField(upload_to='player_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.team.name})"

    def update_eligible_positions(self, season_year=None):
        """
        Updates player's position eligibility based on previous season stats:
        
        1. For hitters: 20+ games at position OR 25%+ of games (min 5)
        2. For starting pitchers: 5+ starts
        3. For relief pitchers: 8+ relief appearances
        
        Args:
            season_year: Year to check for eligibility (defaults to previous year)
        """
        from datetime import date
        
        # Determine season year (default to previous year)
        if not season_year:
            current_year = date.today().year
            season_year = current_year - 1
        
        # Find start/end dates for the specified season
        season_start = date(season_year, 1, 1)
        season_end = date(season_year, 12, 31)
        
        # Get all game stats for this player in the previous season
        all_games = GameStats.objects.filter(
            player=self,
            game__date__gte=season_start,
            game__date__lte=season_end
        )
        
        # Count total games played
        total_games = all_games.values('game').distinct().count()
        if total_games == 0:
            return  # No games played, no eligibility to update
        
        # Initialize counters
        position_counts = {}
        starts = 0
        relief_apps = 0
        
        # Count positions played, starts, and relief appearances
        for gs in all_games:
            # Handle pitching appearances
            if gs.role == 'pitcher':
                # Check if it was a start or relief appearance
                pos_lower = gs.position.lower()
                if 'start' in pos_lower or 'sp' in pos_lower:
                    starts += 1
                else:
                    relief_apps += 1
            
            # Process position strings for all roles
            # Split and clean position strings like "RF (LF)" -> ["RF", "LF"]
            raw_position = gs.position
            positions = []
            
            # Handle parentheses format: "RF (LF)"
            if '(' in raw_position:
                main_pos = raw_position.split('(')[0].strip()
                if main_pos:
                    positions.append(main_pos)
                    
                # Extract positions in parentheses
                import re
                paren_positions = re.findall(r'\(([^)]+)\)', raw_position)
                for pos_group in paren_positions:
                    for pos in pos_group.split(','):
                        clean_pos = pos.strip()
                        if clean_pos:
                            positions.append(clean_pos)
            else:
                # Simple position string
                positions.append(raw_position.strip())
            
            # Count each position
            for pos in positions:
                clean_pos = pos.strip().upper()
                if clean_pos:
                    position_counts[clean_pos] = position_counts.get(clean_pos, 0) + 1
        
        # Determine eligible positions
        eligible_positions = []
        
        # Check hitter positions
        for pos, count in position_counts.items():
            # Only consider standard positions
            if pos and pos in ['1B', '2B', '3B', 'SS', 'C', 'LF', 'CF', 'RF', 'OF', 'DH']:
                # Rule 1: 20+ games at position
                if count >= 20:
                    if pos not in eligible_positions:
                        eligible_positions.append(pos)
                
                # Rule 2: 25%+ of games (min 5)
                elif count >= 5 and (count / total_games) >= 0.25:
                    if pos not in eligible_positions:
                        eligible_positions.append(pos)
        
        # Check pitcher eligibility
        if starts >= 5:  # Rule 3: 5+ starts for SP
            eligible_positions.append('SP')
            eligible_positions.append('P')  # Always add general P if SP eligible
            
        if relief_apps >= 8:  # Rule 4: 8+ relief appearances for RP
            eligible_positions.append('RP')
            eligible_positions.append('P')  # Always add general P if RP eligible
        
        # Add derived positions
        if '1B' in eligible_positions or '3B' in eligible_positions:
            eligible_positions.append('CI')  # Corner infield
            
        if '2B' in eligible_positions or 'SS' in eligible_positions:
            eligible_positions.append('MI')  # Middle infield
            
        if any(pos in eligible_positions for pos in ['1B', '2B', '3B', 'SS']):
            eligible_positions.append('IF')  # Infield
            
        if any(pos in eligible_positions for pos in ['LF', 'CF', 'RF']):
            eligible_positions.append('OF')  # Outfield
        
        # Everyone is utility eligible
        eligible_positions.append('UTIL')

        if(self.position and self.position not in eligible_positions):
            eligible_positions.append(self.position)
        
        # Update the player record
        self.eligible_positions = eligible_positions
        self.save()
        
        return eligible_positions

    

class Game(models.Model):
    date = models.DateField()
    game_number = models.IntegerField()
    home_team = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="home_games")
    away_team = models.ForeignKey("Team", on_delete=models.CASCADE, related_name="away_games")

    class Meta:
        unique_together = ('game_number', 'date')

    def __str__(self):
        return f"{self.date}: {self.home_team.name} vs {self.away_team.name} (Game {self.game_number})"

class GameStats(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=RoleChoices.choices)  # Use global Enum here
    position = models.CharField(blank=True) #the input won't be standardized. 
    stats = models.JSONField()

    class Meta:
        unique_together = ('game', 'player', 'role')

    def __str__(self):
        return f"{self.player.name} - {self.get_role_display()} - Game {self.game.id}"

class FantasyLeague(models.Model):
    name = models.CharField(max_length=255)
    commissioner = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField(default=datetime.date.today)
    end_date = models.DateField(default=datetime.date.today)
    def __str__(self):
        return self.name

class FantasyTeam(models.Model):
    name = models.CharField(max_length=255)
    league = models.ForeignKey(FantasyLeague, on_delete=models.CASCADE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    total_stats = models.JSONField(default=dict)

    def update_total_stats(self):
        """Aggregates stats across all players to ever be in the team."""
        team_stats = {}

        roster_spots = self.fantasyroster_set.filter(
        ).exclude(
            position__in=['BN', 'IL']
        )
        
        # First pass: accumulate raw stats
        for roster_spot in roster_spots:
            roster_spot.update_stats()  # Ensure each roster entry updates first
            for stat, value in roster_spot.stats.items():
                # Skip calculated averages in the first pass
                if stat not in ['AVG', 'ERA', 'WHIP']:
                    team_stats[stat] = team_stats.get(stat, 0) + value

        # Second pass: calculate averages
        team_stats["AVG"] = team_stats.get("H", 0) / team_stats.get("AB", 1) if team_stats.get("AB", 0) > 0 else 0
        team_stats["ERA"] = (team_stats.get("ER", 0) * 9) / team_stats.get("IP", 1) if team_stats.get("IP", 0) > 0 else 0
        team_stats["WHIP"] = (team_stats.get("H", 0) + team_stats.get("BB", 0)) / team_stats.get("IP", 1) if team_stats.get("IP", 0) > 0 else 0

        # Store updated stats
        self.total_stats = team_stats
        self.save()

    def __str__(self):
        return f"{self.name} ({self.league.name})"



class FantasyRoster(models.Model):
    fantasy_team = models.ForeignKey(FantasyTeam, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Non-inclusive
    position = models.CharField(max_length=4, choices=FantasyPosition.choices)
    stats = models.JSONField(default=dict)
    
    def update_stats(self):
        """Calculates and stores total stats for this player's fantasy stint."""
        games = GameStats.objects.filter(
            player=self.player,
            game__date__gte=self.start_date,
            game__date__lt=(self.end_date if self.end_date else datetime.date.today()),
        )

        # Aggregate stats
        aggregated_stats = {}
        for game in games:
            for stat, value in game.stats.items():
                #skip averages for now
                if(type(stat) == float):
                    continue
                aggregated_stats[stat] = aggregated_stats.get(stat, 0) + value
        # Calculate averages for certain stats  
        aggregated_stats["AVG"] = aggregated_stats.get("H", 0) / aggregated_stats.get("AB", 1) if aggregated_stats.get("AB", 0) > 0 else 0
        aggregated_stats["ERA"] = (aggregated_stats.get("ER", 0) * 9) / aggregated_stats.get("IP", 1) if aggregated_stats.get("IP", 0) > 0 else 0
        aggregated_stats["WHIP"] = (aggregated_stats.get("H", 0) + aggregated_stats.get("BB", 0)) / aggregated_stats.get("IP", 1) if aggregated_stats.get("IP", 0) > 0 else 0

        # Store aggregated stats
        self.stats = aggregated_stats
        self.save()

    def __str__(self):
        return f"{self.fantasy_team.name if self.fantasy_team else 'Free Agent'} - {self.player.name}"
