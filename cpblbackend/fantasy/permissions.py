from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Allow read-only access for any user
    - Allow write access only for admin users (is_staff=True)
    """
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests (safe methods)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Allow write operations only for admins
        return request.user and request.user.is_staff
    
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a fantasy team to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner
        # FantasyRoster is linked to FantasyTeam which has the owner field
        return obj.fantasy_team.owner == request.user