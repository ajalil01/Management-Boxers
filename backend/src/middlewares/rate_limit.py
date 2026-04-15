from slowapi.util import get_remote_address

def global_limit_key(request):
    return get_remote_address(request)

