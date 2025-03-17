# In your Django views.py
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
import json
from django.contrib.auth import authenticate, login
from django.views.decorators.http import require_POST

@ensure_csrf_cookie
def get_csrf_token(request):
    """Get a CSRF token - sets it in the cookie and also returns the value."""
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@ensure_csrf_cookie
@require_POST
def api_login(request):
    """Custom login endpoint for the API, because the actual one don't works"""
    try:
        # Try to parse as JSON
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            # If not JSON, try form data
            username = request.POST.get('login') or request.POST.get('username')
            password = request.POST.get('password')
        
        # Debug
        print(f"Login attempt for user: {username}")
        
        if not username or not password:
            return JsonResponse({'error': 'Please provide both username and password'}, status=400)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'username': user.username})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
            
    except Exception as e:
        print(f"Login error: {e}")
        return JsonResponse({'error': str(e)}, status=400)

def current_user(request):
    """Return information about the current user"""
    if request.user.is_authenticated:
        return JsonResponse({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'is_staff': request.user.is_staff,
            'is_superuser': request.user.is_superuser
        })
    else:
        return JsonResponse({'authenticated': False}, status=401)
